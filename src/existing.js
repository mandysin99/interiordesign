import {floorMaterials} from './floor-materials.js';
import * as THREE from 'three';
import {buildFurnishings} from './furnishings.js';
import {buildCustom} from './custom-cabinets.js';
// All dimensions in metres. Parameter values are visual proxies until measured.
export function addExisting(model,data,values={}){
 const groups={};for(const [id,name] of [['architecture','01 建筑底模'],['retained','02 开发商保留现状'],['demolition','03 拆改引用'],['design','04 新设计示意']]){groups[id]=new THREE.Group();groups[id].name=name;model.root.add(groups[id]);}
 groups.architecture.add(model.masonry,model.floors,model.roof);groups.retained.add(model.glazing);
 const fixtures=new THREE.Group(),ceilings=new THREE.Group(),panels=new THREE.Group(),zones=new THREE.Group();fixtures.name='固定设施';ceilings.name='边吊及风口';panels.name='中央天花面板';zones.name='开门与检修占位';groups.retained.add(fixtures,ceilings,panels,zones);
 const px=x=>(x-158)/64,pz=z=>(z-48)/64;
 const p=id=>values[id]??data.parameters.find(p=>p.id===id).preview;
 const lv=(id,key)=>values[id+'_'+key]??data.levels[id][key].value??data.levels[id][key].preview;
 const mats={fabric:0xd8cbb7,linen:0xf5efe3,accent:0x798879,rug:0xbeb19e,customWood:0x927153,cabinet:0xd6d2c6,counter:0x676a66,porcelain:0xf4f4ef,metal:0x687574,wood:0xb7afa0,tile:0xc9cbc5,ceiling:0xf1f0e9,dark:0x394543,sill:0xe0ded2};
 for(const k in mats){mats[k]=new THREE.MeshStandardMaterial({color:mats[k],roughness:.8});model.materials.push(mats[k]);}
 // Fine walnut-like directional grain for design joinery; no downloaded texture dependency.
 const woodPixels=new Uint8Array(64*256*4);for(let y=0;y<256;y++)for(let x=0;x<64;x++){const wave=Math.sin(x*1.9+Math.sin(y*.045)*.7)*6+Math.sin(x*.34+Math.sin(y*.018)) *9;woodPixels.set([143+wave,105+wave,70+wave,255],(y*64+x)*4);}const grain=new THREE.DataTexture(woodPixels,64,256);grain.colorSpace=THREE.SRGBColorSpace;grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.magFilter=THREE.LinearFilter;grain.minFilter=THREE.LinearMipmapLinearFilter;grain.generateMipmaps=true;grain.needsUpdate=true;mats.customWood.color.set(0xffffff);mats.customWood.map=grain;
 mats.glass=new THREE.MeshStandardMaterial({color:0xb8d8d4,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide});mats.zone=new THREE.MeshBasicMaterial({color:0xdfa852,wireframe:true,transparent:true,opacity:.7});mats.remove=new THREE.MeshBasicMaterial({color:0xc47766,wireframe:true,transparent:true,opacity:.75});model.materials.push(mats.glass,mats.zone,mats.remove);
 const inventory=[];const unit=new THREE.BoxGeometry();
 function box(id,name,x1,x2,z1,z2,y1,y2,mat='cabinet',parent=fixtures,evidence='照片定位；尺寸待测',status='待测体块'){
  if(x2<=x1||z2<=z1||y2<=y1)throw new Error('Invalid box '+id);
  const m=new THREE.Mesh(unit,mats[mat]);m.name=id;m.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);m.scale.set(x2-x1,y2-y1,z2-z1);m.castShadow=!['glass','zone','remove'].includes(mat);m.receiveShadow=true;m.userData={id,name,evidence,status,dimensions:[x2-x1,y2-y1,z2-z1],layer:parent===groups.design?'design':parent===groups.demolition?'demolition':'retained'};parent.add(m);for(let n=parent;n;n=n.parent){if(n===groups.design)m.userData.layer='design';if(n===groups.demolition)m.userData.layer='demolition';}inventory.push(m);if(!['glass','zone','remove'].includes(mat))model.solids.push({mesh:m,min:[x1,y1,z1],max:[x2,y2,z2]});return m;
 }
 function bpx(id,name,x1,x2,z1,z2,y1,y2,mat,parent,evidence,status){return box(id,name,px(x1),px(x2),pz(z1),pz(z2),y1,y2,mat,parent,evidence,status);}
 // Replace only the floor representation in this baseline revision; phases never change its vertices.
 while(model.floors.children.length)model.floors.remove(model.floors.children[0]);
 const finish=new THREE.Group();finish.name='交付地面：卧室木地板／其余原面层（构造厚度待测）';groups.retained.add(finish);
 function slabPoly(points,top,id,parent,thick,mat){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));const g=new THREE.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false});g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,mats[mat]);m.position.y=top-thick;m.name=id;parent.add(m);m.receiveShadow=true;const pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i),pos.getZ(i));uv.needsUpdate=true;return m;}
 function clip(poly,edge,keepLess){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=keepLess?a[1]<=edge:a[1]>=edge,ib=keepLess?b[1]<=edge:b[1]>=edge;if(ia)out.push(a);if(ia!==ib){const t=(edge-a[1])/(b[1]-a[1]);out.push([a[0]+t*(b[0]-a[0]),edge]);}}return out;}
 const boundary=pz(173),main=clip(data.footprint,boundary,false),bal=clip(data.footprint,boundary,true);
 slabPoly(main,-.05,'SLAB-main-structure-minus050',model.floors,.12,'sill');slabPoly(bal,-.13,'SLAB-balcony-structure-minus130',model.floors,.12,'sill');
 const finishRegions={bedroom1:[365,512,201,359],bedroom2:[527,669,201,359],master:[606,839,201,435],entry:[182,268,550,693],corridor:[361,606,359,435],kitchen:[268,404.8,550,693],bathroom:[361,541.8,435,550]};
 const xx=[...new Set([137,845,...Object.values(finishRegions).flatMap(r=>r.slice(0,2))])].sort((a,b)=>a-b),zz=[...new Set([173,693,...Object.values(finishRegions).flatMap(r=>r.slice(2))])].sort((a,b)=>a-b);
 function clipAxis(poly,axis,edge,less){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=less?a[axis]<=edge:a[axis]>=edge,ib=less?b[axis]<=edge:b[axis]>=edge;if(ia)out.push(a);if(ia!==ib){const t=(edge-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}return out;}
 for(let i=0;i<xx.length-1;i++)for(let j=0;j<zz.length-1;j++){let poly=main;for(const [axis,edge,less] of [[0,px(xx[i]),false],[0,px(xx[i+1]),true],[1,pz(zz[j]),false],[1,pz(zz[j+1]),true]])poly=clipAxis(poly,axis,edge,less);if(poly.length<3)continue;const area=Math.abs(poly.reduce((a,v,k)=>a+v[0]*poly[(k+1)%poly.length][1]-v[1]*poly[(k+1)%poly.length][0],0))/2;if(area<.00001)continue;const cx=(xx[i]+xx[i+1])/2,cz=(zz[j]+zz[j+1])/2,rid=Object.keys(finishRegions).reverse().find(id=>{const [a,b,c,d]=finishRegions[id];return cx>=a&&cx<=b&&cz>=c&&cz<=d;})||'living';const top=lv(rid,'finished');const floor=slabPoly(poly,top,'FIN-'+rid+'-'+i+'-'+j,finish,Math.max(.01,top+.05),'tile');floor.userData={room:rid,floorScope:true};}
 const balconyFinish=slabPoly(bal,lv('balcony','finished'),'FIN-balcony-pending',finish,Math.max(.015,lv('balcony','finished')+.13),'tile');balconyFinish.userData={room:'balcony',floorScope:true};
 for(const bay of data.bays){const pts=bay.footprint_px.map(([x,z])=>[px(x),pz(z)]);slabPoly(pts,-.05,'SLAB-'+bay.id,model.floors,.12,'sill');const xx=bay.footprint_px.map(p=>p[0]),zz=bay.footprint_px.map(p=>p[1]);bpx('SILL-'+bay.id,'保留飘窗台',Math.min(...xx),Math.max(...xx),Math.min(...zz),Math.max(...zz),bay.sill-.02,bay.sill,'sill',fixtures,'宜家图窗台标高；面层厚度暂取20mm','图纸标高');}
 // Separate retained timber, tile demolition, replacement tile and SPC finish representations.
 const floorMats=floorMaterials(THREE),timberFloor=floorMats.timber,woodTile=floorMats.tile,spcFloor=floorMats.spc;model.materials.push(timberFloor,woodTile,spcFloor);
 const newFloors=new THREE.Group();newFloors.name='第一阶段地面：客厅入户过道阳台木纹砖／厨房深色SPC';groups.design.add(newFloors);
 const changedFloors=[];
 for(const m of finish.children){const room=m.userData.room;
  if(['bedroom1','bedroom2','master'].includes(room)){m.material=timberFloor;m.userData.name='保留原木地板';m.userData.action='保留，不拆';}
  if(['living','entry','corridor','balcony','kitchen'].includes(room)){
   const n=m.clone();n.name='NEW-FLOOR-'+m.name;n.material=room==='kitchen'?spcFloor:woodTile;n.userData={...m.userData,name:room==='kitchen'?'厨房SPC地板（铺法与厚度待定）':'筑木风尚 R1206510 · 暖棕鱼骨木纹砖',action:room==='kitchen'?'原砖不列入拆除，新增SPC面层示意':(['entry','balcony'].includes(room)?'新木纹砖；原砖拆留做法待定':'拆原砖后换铺'),evidence:'用户确认拆改范围；沿用现有完成面显示，不据此推断找平或铺装厚度'};newFloors.add(n);changedFloors.push(m);
  }
 }
 // Compact U kitchen: west is the existing L-shaped sliding partition.
 const x1=px(269.76),x2=px(392),z1=pz(551.76),z2=pz(681.24),depth=p('kitchen_depth'),h=p('counter_height'),ff=lv('kitchen','finished'),ub=p('upper_bottom'),ut=p('upper_top');
 for(const [side,za,zb] of [['north',z1,z1+depth],['south',z2-depth,z2]]){
 box('K-base-'+side,'厨房地柜 · '+side,x1+.06,x2-depth,za,zb,ff+.09,ff+h-.04);box('K-counter-'+side,'厨房台面',x1+.04,x2-depth+.015,za,zb,ff+h-.04,ff+h,'counter');
 const uz1=side==='north'?z1:z2-.35,uz2=side==='north'?z1+.35:z2;
 
 for(let xx=x1+.1;side==='north'&&xx<x2-depth;xx+=.45)box('K-seam-'+side+'-'+xx.toFixed(2),'柜门分缝示意',xx,xx+.007,side==='north'?zb-.009:za,side==='north'?zb:za+.009,ff+.12,ff+h-.07,'metal');
 box('K-open-'+side,'柜门开启包络（待测）',x1+.1,x2-depth,side==='north'?zb:za-.42,side==='north'?zb+.42:za,ff+.1,ff+h-.1,'zone',zones);
 }
 // Photo-based doors: front elevation reads from east (left) toward west (right).
 function kitchenDoor(id,a,b,front,bottom,top,side,hinge,louver=false){
  const back=side==='north'?front-.018:front,face=side==='north'?front:front+.018;
  const out=[];const put=(suffix,c,d,y1,y2)=>out.push(box(id+'-'+suffix,louver?'双开百叶门':'厨房柜门',c,d,back,face,ff+y1,ff+y2,'cabinet'));
  if(louver){put('left-stile',a,a+.025,bottom,top);put('right-stile',b-.025,b,bottom,top);put('top',a+.025,b-.025,top-.03,top);put('bottom',a+.025,b-.025,bottom,bottom+.03);for(let y=bottom+.045;y<top-.04;y+=.04)put('slat-'+y.toFixed(3),a+.025,b-.025,y,Math.min(y+.028,top-.035));}
  else put('panel',a,b,bottom,top);
  const hx=hinge==='left'?b-.035:a+.035;
  out.push(box(id+'-pull-edge','开门自由边示意',hx-.009,hx+.009,side==='north'?back-.008:face,side==='north'?back:face+.008,ff+bottom+.04,ff+bottom+.10,'metal'));
  out.forEach(m=>{m.userData.hinge=hinge;m.userData.evidence='IMG_3459与正面视频截图：门数、百叶及开向；分格尺寸为当前框架适配值。';});return out;
 }
 const baseA=x1+.06,baseB=x2-depth,dwA=(baseA+baseB)/2-.30,dwB=dwA+.60,baseFront=z2-depth-.019;
 kitchenDoor('K-base-south-left',dwB+.003,baseB,baseFront,.10,h-.045,'north','right');
 kitchenDoor('K-base-south-right',baseA,dwA-.003,baseFront,.10,h-.045,'north','left');
 box('K-dishwasher-front','中间洗碗机面板',dwA+.003,dwB-.003,baseFront-.002,baseFront+.016,ff+.10,ff+h-.05,'cabinet');
 box('K-dishwasher-controls','洗碗机黑色控制条',dwA+.003,dwB-.003,baseFront-.008,baseFront-.002,ff+h-.18,ff+h-.07,'dark');
 box('K-dishwasher-handle','洗碗机中央拉手',dwA+.20,dwB-.20,baseFront-.027,baseFront-.008,ff+h-.19,ff+h-.15,'metal');
 const upperA=x1+.06,upperB=x2-.03,ventA=upperB-.52,upperFront=z2-.35;
 // Opaque storage carcass stops at the louvered equipment cupboard.
 box('K-upper-south-shell','灶上三门吊柜柜体',upperA,ventA,upperFront+.02,z2,ff+ub,ff+ut);
 const leaf=(ventA-upperA)/3;
 for(let i=0;i<3;i++)kitchenDoor('K-upper-solid-'+i,upperA+i*leaf+.003,upperA+(i+1)*leaf-.003,upperFront,ub+.003,ut-.003,'north',i===1?'left':'right');
 for(const [id,a,b] of [['left',ventA,ventA+.018],['right',upperB-.018,upperB]])box('K-heatercab-'+id,'窗右设备百叶柜侧板',a,b,upperFront,z2,ff+ub,ff+ut);
 for(const y of [ub,ut-.018])box('K-heatercab-horizontal-'+y,'窗右设备柜顶底板',ventA,upperB,upperFront,z2,ff+y,ff+y+.018);
 for(let i=0;i<2;i++)kitchenDoor('K-heatercab-door-'+i,ventA+i*.26+.003,ventA+(i+1)*.26-.003,upperFront,ub+.003,ut-.003,'north',i===0?'left':'right',true);
 box('K-base-east','水槽地柜',x2-depth,x2,z1,z2,ff+.09,ff+h-.04);
 const sinkDoorA=z1+depth,sinkDoorB=z2-depth,sinkMid=(sinkDoorA+sinkDoorB)/2;
 for(let i=0;i<2;i++){const a=i?sinkMid+.003:sinkDoorA+.003,b=i?sinkDoorB-.003:sinkMid-.003;const m=box('K-sink-door-'+i,'水槽下对开柜门',x2-depth-.020,x2-depth-.002,a,b,ff+.10,ff+h-.045);m.userData.hinge=i?'south':'north';box('K-sink-pull-'+i,'水槽柜中央开门边',x2-depth-.027,x2-depth-.020,i?sinkMid+.02:sinkMid-.035,i?sinkMid+.035:sinkMid-.02,ff+h-.15,ff+h-.08,'metal');}
 const sinkCenter=pz(621.7),sz1=sinkCenter-.32,sz2=sinkCenter+.32,sx1=x2-.50,sx2=x2-.08;
 for(const [id,a,b,c,d] of [['n',x2-depth,x2,z1,sz1],['s',x2-depth,x2,sz2,z2],['w',x2-depth,sx1,sz1,sz2],['e',sx2,x2,sz1,sz2]])box('K-worktop-'+id,'水槽台面',a,b,c,d,ff+h-.04,ff+h,'counter');
 box('K-sink-bottom','水槽内底',sx1,sx2,sz1,sz2,ff+h-.17,ff+h-.15,'metal');
 box('K-sink-edge-a','水槽内壁',sx1,sx1+.018,sz1,sz2,ff+h-.15,ff+h,'metal');box('K-sink-edge-b','水槽内壁',sx2-.018,sx2,sz1,sz2,ff+h-.15,ff+h,'metal');
 box('K-sink-edge-c','水槽内壁',sx1,sx2,sz1,sz1+.018,ff+h-.15,ff+h,'metal');box('K-sink-edge-d','水槽内壁',sx1,sx2,sz2-.018,sz2,ff+h-.15,ff+h,'metal');
 box('K-tap','水龙头体块',x2-.10,x2-.07,sinkCenter-.018,sinkCenter+.018,ff+h,ff+h+.28,'metal');
 box('K-hob','灶台',x1+.20,x1+.95,z2-.49,z2-.06,ff+h,ff+h+.025,'dark');
 box('K-hood','烟机体块',x1+.12,x1+1.03,z2-.46,z2-.04,ff+ub-.06,ff+ub+.18,'metal');
 box('K-recess-sill','厨房窗台凹位',x2,x2+p('kitchen_recess'),pz(594.18),pz(649.22),ff+p('kitchen_sill')-.04,ff+p('kitchen_sill'),'sill',fixtures,'IMG_3459与厨房视频：凹位存在；高度及凹深待测');
 // Video: left of window is a louvered gas-meter cupboard; meter is inside, facing the aisle.
 const gx1=x2-.55,gx2=x2-.03,gfront=z1+.35;
 for(const [id,a,b,c,d,y1,y2] of [['side-a',gx1,gx1+.018,z1,gfront,ub,ut],['side-b',gx2-.018,gx2,z1,gfront,ub,ut],['top',gx1,gx2,z1,gfront,ut-.018,ut],['bottom',gx1,gx2,z1,gfront,ub,ub+.018]])box('K-gascab-'+id,'窗左燃气表百叶柜',a,b,c,d,ff+y1,ff+y2,'cabinet',fixtures,'厨房视频0.1秒及15.8秒：左上百叶柜内为燃气表；几何尺寸待测');
 const gasDoors=[];
 for(let i=0;i<2;i++)gasDoors.push(...kitchenDoor('K-gascab-door-'+i,gx1+i*(gx2-gx1)/2+.003,gx1+(i+1)*(gx2-gx1)/2-.003,gfront,ub+.003,ut-.003,'south',i===0?'left':'right',true));
 box('K-gas-meter','燃气表 · 窗左百叶柜内',gx1+.12,gx2-.10,z1+.09,z1+.22,ff+ub+.06,ff+ub+.36,'dark',fixtures,'15.8秒可见管道连接与表体：燃气表，不是电表；高度待测');
 box('K-gas-pipe','燃气表下接明管',gx2-.07,gx2-.05,z1+.07,z1+.09,ff+h,ff+ub+.40,'metal');
 box('K-gas-meter-link','燃气表上方横向连接管',gx1+.10,gx2-.05,z1+.07,z1+.09,ff+ub+.41,ff+ub+.43,'metal');
 box('K-gas-valve','燃气阀门位置示意',gx1+.29,gx1+.33,z1+.065,z1+.105,ff+ub+.39,ff+ub+.46,'metal');
 box('K-gas-service','燃气表柜前检修范围 · 非规范净距',gx1,gx2,gfront,gfront+.50,ff+ub,ff+ut,'zone',zones,'按视频柜门前方示意，净距待核');
 // Visible right-window wall fittings, without inventing concealed pipe routing.
 box('K-right-pipe','热水器位置下方明管 · DWG已标注',x2-.17,x2-.145,z2-.08,z2-.055,ff+h+.04,ff+ub+.08,'metal',fixtures,'视频2.9秒及8.6秒可见明管；DWG标注热水器位置；暗管路径未表达');
 for(let i=0;i<2;i++)box('K-right-water-fitting-'+i,'热水器墙出接头 · 对应DWG热水器位',x2-.43+i*.14,x2-.39+i*.14,z2-.075,z2-.025,ff+h+.24,ff+h+.28,'metal',fixtures,'视频可见两个墙出接头，冷热标识及用途待现场核对');
 box('K-window-left-outlet','窗左墙插座面板 · 非电表',x2-.012,x2+.006,pz(583),pz(590),ff+1.15,ff+1.24,'dark',fixtures,'视频1.5秒窗左可见墙面插座，中心坐标/高度为示意');
 box('K-heater-dwg-location','热水器位置 · 开发商DWG明确标注',x2-.53,x2-.03,z2-.35,z2-.03,ff+ub,ff+ut,'zone',zones,'DWG厨房平面热水器引线位于窗右侧／灶侧转角，与视频接头相符；此为位置范围，非设备实物尺寸');
 box('K-heater-outlet-dwg','热水器插座 · DWG H1800',x2-.24,x2-.154,z2-.024,z2-.006,ff+1.757,ff+1.843,'dark',fixtures,'开发商电气图：热水器插座H1800（三孔）；平面位置按设备区域示意，H标注基准待电气图例确认');
 // Appliance and exposed controls are retained; no independent electricity meter is identified in this clip.
 function setKitchenServices(on){gasDoors.forEach(m=>m.visible=!on);}
 // Bath vanity / toilet on south wall, shower at east side, consistent with plan and IMG_3416.
 const bf=lv('bathroom','finished'),by=pz(530.8);
 box('B-vanity','保留洗手台柜',px(369),px(420),by-.48,by,bf+.18,bf+.79,'wood');box('B-vanity-top','洗手台',px(369),px(420),by-.5,by,bf+.79,bf+.83,'porcelain');
 box('B-basin','台盆体块',px(378),px(410),by-.43,by-.09,bf+.83,bf+.89,'porcelain');box('B-mirror','保留镜柜',px(369),px(420),by-.12,by,bf+1.12,bf+2.02,'glass');
 const wc=new THREE.Mesh(new THREE.CylinderGeometry(.21,.17,.38,24),mats.porcelain);wc.scale.z=1.45;wc.position.set(px(447),bf+.21,by-.42);wc.name='B-toilet-bowl';wc.userData={id:wc.name,name:'马桶体块',status:'待测体块',evidence:'IMG_3416照片与平面关系推定',dimensions:[.42,.38,.61]};fixtures.add(wc);inventory.push(wc);
 box('B-toilet-tank','马桶水箱',px(435),px(459),by-.19,by-.04,bf+.32,bf+.77,'porcelain');
 box('B-shower-tray','淋浴区地面（高差待测）',px(480),px(526.44),pz(440.12),by,bf,bf+.012,'tile');box('B-shower-head','淋浴花洒体块',px(522),px(526),pz(481),pz(485),bf+1.1,bf+2.0,'metal');
 // Ceiling rectangles are evidence envelopes, not inferred millimetre measurements.
 const rooms={living:[171,350,180,419],bedroom1:[365,512,207,353],bedroom2:[527,669,207,353],master:[684,832,207,429],entry:[193,260,556,680],corridor:[366,600,368,429],kitchen:[270,392,552,681],bathroom:[368,526,441,530],balcony:[171,361,61,166]};
 for(const [id,[a,b,c,d]] of Object.entries(rooms)){
  const f=lv(id,'finished'),ch=lv(id,'ceiling')+f,sh=lv(id,'soffit')+f;
  bpx('C-panel-'+id,'中央天花 · '+id,a,b,c,d,ch,ch+.05,'ceiling',panels,data.levels[id].ceiling.evidence,data.levels[id].ceiling.value===null?'净高待测':'照片标注');
  // Unlocated service hatches are deliberately not presented as measured fixtures.
 }
 function strip(id,room,a,b,c,d,evidence){const sh=lv(room,'soffit')+lv(room,'finished'),ch=lv(room,'ceiling')+lv(room,'finished');return bpx('C-'+id,'保留边吊 · '+room,a,b,c,d,sh,ch+.045,'ceiling',ceilings,evidence,'形态按照片；宽度/底高待测');}
 function grille(id,room,a,b,c,d,evidence){const sh=lv(room,'soffit')+lv(room,'finished');bpx('C-'+id,'空调侧送风格栅',a,b,c,d,sh+.055,sh+.145,'dark',ceilings,evidence,'侧出；端点及净高待测');}
 const ev='宜家现场照片：';
 // Bedrooms show paired side strips. Room association follows the photo sequence, pending on-site confirmation.
 for(const [room,a,b,photo] of [['bedroom1',365,512,'165228_833—165242_397'],['bedroom2',527,669,'165247_749—165254_377']]){
  for(const [side,x1,x2] of [['west',a,a+19],['east',b-19,b]])strip(room+'-'+side,room,x1,x2,207,353,ev+photo+'：双侧条带；房间对应据拍摄序列推定');
  const sh=lv(room,'soffit'),ch=lv(room,'ceiling');
  for(const [side,x1,x2,func] of [['west',a+1,a+8,room==='bedroom1'?'底回':'底出'],['east',b-8,b-1,room==='bedroom1'?'底出':'底回']]){
   bpx('C-'+room+'-'+side+'-vent','空调 '+func+' · '+room,x1,x2,213,346,sh-.009,sh+.001,'dark',ceilings,'DWG C-3空调、消防：'+func+'；条形实体约2180×120mm；按房间边界映射，现场端点/净高待测','DWG功能明确；模型位置映射');
  }
  bpx('C-curtain-'+room,'原窗帘盒 · 窗侧',a+19,b-19,207,215,ch-.13,ch,'ceiling',ceilings,ev+photo,'窗侧关系推定，尺寸待测');
 }
 // Living room end grille is over the kitchen partition, not repeated down the west wall.
 strip('living-west','living',194,212,180,520,ev+'165322_634、165325_909：长边跌级');
 strip('living-east','living',334,350,180,520,ev+'165318_481：对侧边缘');
 strip('living-south','living',194,354,520,543,ev+'165316_985、165324_213：厨房隔断上方横向边吊');
 grille('living-grille','living',236,342,519.7,520.1,'DWG标侧出；照片165316_985、165324_213确认厨房隔断上方横向格栅');
 bpx('C-slot-living','客厅长向黑色窄缝 · 性质待核',213,213.4,200,497,lv('living','ceiling')-.03,lv('living','ceiling'),'dark',ceilings,ev+'165320_721、165331_073','照片可见窄缝；不等同已确认回风口');
 bpx('C-curtain-living','阳台门上方原窗帘盒',212,334,180,190,lv('living','ceiling')-.15,lv('living','ceiling'),'ceiling',ceilings,ev+'165320_721','尺寸待测');
 // Master RCP: south deep AC band, room-facing side supply, window-side bottom return.
 for(const [side,a,b,c,d] of [['w',684,696,207,429],['e',824,832,207,429],['n',696,824,207,225],['s',696,824,361,429]])strip('master-'+side,'master',a,b,c,d,'DWG天花局部：南带北边约Y5796，南边约Y4756；宽约1040；映射至现模型，净高待测');
 grille('master-grille','master',699,829,360.8,361.2,'DWG侧出箭头指向主卧中央；深吊顶带北边Y5796，非南窗边；风口实长尚待核');
 bpx('C-master-hatch','主卧天花检修口 · DWG位置',700,720,383,405,lv('master','soffit')-.009,lv('master','soffit')+.001,'metal',ceilings,'DWG检修符号在底回风北侧、西端；平面约350×350，模型映射；底高待测','DWG平面符号；现场尺寸待核');
 strip('balcony-beam','balcony',171,188.28,61,166,'量房照片2790/2420/270；端部映射待核');

 // Bottom returns are horizontal on the soffit underside, unlike the side supply face.
 for(const [id,room,a,b,c,d,func] of [['master-return','master',699,829,414,422,'底回'],['entry-return','entry',196,257,558,565,'底回'],['kitchen-return','kitchen',272,280,559,673,'底回'],['kitchen-supply','kitchen',382,390,559,673,'底出']]){
 const y=lv(room,'soffit')+lv(room,'finished');bpx('C-'+id,'空调 '+func+' · '+room,a,b,c,d,y-.008,y+.001,'dark',ceilings,'DWG '+func+'实体及说明；平面按房间映射，尺寸/高度待复核','DWG功能已识别');}
 bpx('C-child-service-zone','儿童房回风口下方检修避让范围',632,668,266,342,1.8,lv('bedroom2','soffit'),'zone',zones,'方案检修包络；实际滤网抽出尺寸与检修口待空调单位确认','非实测检修口');
 const pipe=box('BAL-pipe','阳台保留立管 · 介质待确认',px(181),px(190),pz(144),pz(153),.15,2.42,'metal',fixtures,'用户量房照片：梁下可见立管及管箍；位置近客厅门侧，管径/介质未标；包柜须保留检修','照片可见管段');pipe.geometry=new THREE.CylinderGeometry(.5,.5,1,24);
 box('BAL-pipe-service','立管检修区 · 包柜避让',px(176),px(198),pz(138),pz(160),.15,2.42,'zone',zones,'照片确认立管，柜内须避让并留可拆检修；净距待核');
 for(const y of [.3,.75,1.55,2.35]){const ring=box('BAL-pipe-ring-'+y,'立管管箍',px(180.5),px(190.5),pz(143.5),pz(153.5),y,y+.05,'metal',fixtures,'照片可见；高度为形态示意');ring.geometry=new THREE.CylinderGeometry(.5,.5,1,24);}
 // Demolition is a separate reference overlay, not duplicated source ownership.
 const studySources=[];model.masonry.children.forEach(m=>{if(m.name.startsWith('W-bedroom1-south-'))studySources.push(m);});model.glazing.children.forEach(m=>{if(m.name.startsWith('D-bedroom1-'))studySources.push(m);});
 const balconySources=model.glazing.children.filter(m=>m.name.startsWith('D-balcony-'));
 for(const m of [...studySources,...balconySources]){const ghost=m.clone(true);ghost.traverse(n=>{if(n.isMesh)n.material=mats.remove;});ghost.name='REMOVE-ref-'+m.name;ghost.userData={reference:m.name};groups.demolition.add(ghost);}
 const tileGhost=new THREE.Group();tileGhost.name='REMOVE-ref-客厅走廊原砖';
 for(const m of finish.children)if(['living','corridor'].includes(m.userData.room)){const g=m.clone();g.material=mats.remove;g.userData={...m.userData,reference:m.name,action:'仅拆原砖；不代表拆结构板或可开槽'};tileGhost.add(g);}
 tileGhost.position.y=.006;groups.demolition.add(tileGhost);
 const sg=new THREE.Group();sg.name='书房宽幅玻璃门（未定）';groups.design.add(sg);const width=p('study_width'),zs=pz(359),left=px(350.96),right=px(519),b=right-.18,a=b-width,center=(a+b)/2;
 box('NEW-study-left','书房保留墙垛示意',left,a,zs-.08,zs+.08,0,2.95,'ceiling',sg);box('NEW-study-right','书房保留墙垛示意',b,right,zs-.08,zs+.08,0,2.95,'ceiling',sg);box('NEW-study-head','书房过门顶示意',a,b,zs-.08,zs+.08,2.28,2.95,'ceiling',sg);
 box('NEW-study-glass-a','书房宽幅玻璃门 · 暂定',a,center,zs-.025,zs-.01,.035,2.25,'glass',sg);box('NEW-study-glass-b','书房宽幅玻璃门 · 暂定',center,b,zs+.01,zs+.025,.035,2.25,'glass',sg);box('NEW-study-rail','书房轨道示意',a,b,zs-.05,zs+.05,2.25,2.28,'metal',sg);
 bpx('NEW-study-smart-panel','保留智能面板 · 位置据用户描述',361,368,363,364,1.2,1.31,'dark',sg,'用户确认左侧过道有全屋智能面板；此为位置示意，安装高度/走线待现场确认','保护墙段；禁止据此推定线槽');
 box('NEW-study-wire-zone','面板墙段保护范围 · 暗线未定位',left,a,zs-.12,zs+.15,.05,2.28,'zone',zones,'保留左墙段；约1.9m为门洞总宽，双轨双扇净通行约0.9m，待选门系统','方案预留');
 const enclosure=new THREE.Group();enclosure.name='第一阶段封窗 · 系统待选';groups.design.add(enclosure);
 bpx('NEW-balcony-glass','第一阶段封窗玻璃',170,362,53,55,.16,2.45,'glass',enclosure,'用户要求第一阶段封窗；分格为示意');
 for(const x of [170,266,362])bpx('NEW-balcony-frame-'+x,'封窗竖框',x,x+1.8,52,56,.16,2.45,'metal',enclosure);
 for(const y of [.16,2.43])bpx('NEW-balcony-rail-'+y,'封窗横框',170,364,52,56,y,y+.02,'metal',enclosure);
 const outerWindows=model.glazing.children.filter(m=>m.name.startsWith('WIN-balcony-'));
 const custom=buildCustom({THREE,groups,box,px,pz,lv});
 const originalSetBed=custom.setBed;custom.setBed=on=>{originalSetBed(on);model.root.updateMatrixWorld(true);for(const solid of model.solids){if(solid.mesh.name.startsWith('MYM-study-')){const bounds=new THREE.Box3().setFromObject(solid.mesh);solid.min=bounds.min.toArray();solid.max=bounds.max.toArray();}}};
 for(const item of custom.items)if(!model.materials.includes(item.material))model.materials.push(item.material);
 const furnishings=buildFurnishings({THREE,groups,box,px,pz,lv});
 let hideAllCeilings=false;let phase='delivery',showPanels=false,showZones=false,layerState={architecture:true,retained:true,demolition:false,design:true};
 function apply(){const renovated=['phase1','custom','furnished','final'].includes(phase);newFloors.visible=renovated;changedFloors.forEach(m=>m.visible=!renovated||!layerState.design);custom.entryGroup.visible=phase==='delivery';custom.entryRenovation.visible=['phase1','custom','furnished'].includes(phase);groups.architecture.visible=layerState.architecture;groups.retained.visible=layerState.retained&&phase!=='original';groups.demolition.visible=layerState.demolition;groups.design.visible=layerState.design&&['phase1','custom','furnished','final'].includes(phase);studySources.forEach(m=>m.visible=!['phase1','custom','furnished','final'].includes(phase));balconySources.forEach(m=>m.visible=!['phase1','custom','furnished'].includes(phase));outerWindows.forEach(m=>m.visible=!['phase1','custom','furnished'].includes(phase));sg.visible=['phase1','custom','furnished','final'].includes(phase);enclosure.visible=['phase1','custom','furnished'].includes(phase);custom.group.visible=['custom','furnished','final'].includes(phase);furnishings.group.visible=['furnished','final'].includes(phase);panels.visible=showPanels&&!hideAllCeilings;ceilings.visible=!hideAllCeilings;zones.visible=showZones;inventory.filter(m=>['B-vanity','B-vanity-top','B-basin','B-mirror'].includes(m.name)).forEach(m=>m.visible=!['custom','furnished'].includes(phase));}
 function setPhase(id){phase=id;apply();}
 function setLayer(id,on){layerState[id]=on;apply();}
 function setPanels(on){showPanels=on;panels.visible=on&&!hideAllCeilings;}
 function setHideCeilings(on){hideAllCeilings=on;ceilings.visible=!on;panels.visible=showPanels&&!on;}
 function setZones(on){showZones=on;zones.visible=on;custom.setService(on);}
 function setHVAC(on){for(const m of ceilings.children){const vent=m.userData.name?.includes('空调');m.visible=!on||vent;if(vent){if(!m.userData.originalMaterial)m.userData.originalMaterial=m.material; if(on){m.material=m.material.clone();m.material.color.set(m.userData.name.includes('回')?0x287caf:0xd17835);}else m.material=m.userData.originalMaterial;}}panels.visible=on?false:showPanels&&!hideAllCeilings;}
 const heightAudit=new THREE.Group();heightAudit.name='层高与柜体冲突核对（非施工定位）';model.root.add(heightAudit);heightAudit.visible=false;
 const auditAreas=[
 ['entry','入户柜顶与天花／回风口重叠',[193,215,553,671],2.27,2.42,'柜顶2.40与预览天花2.36相撞40mm，冰箱上柜覆盖回风范围；先核真实标高和风口端点，不能自动移风口。'],
 ['master','主卧衣柜覆盖底回风范围',[795,829,414,429.24],2.40,2.55,'模型衣柜与底回风水平覆盖约531×125mm。DWG确认底回，但模型端点尚未完成坐标校准；建议回风区保留独立空腔和可拆封板，由空调与柜体单位联审。'],
 ['child','儿童房回风检修避让',[632,668,266,342],1.80,2.33,'上柜进入模型预留检修包络；该包络不是实测。上部应按滤网拆出路径设计可拆层板／独立检修区，底部开放格不能解决顶部检修。'],
 ['study','书房柜顶靠近底回风',[365,385,208,353],2.26,2.33,'柜顶2.28、边吊底预览2.32，仅约40mm。无直接实体碰撞，但不足以证明通风和检修可行；不可盲目加封板到顶。'],
 ['balcony','阳台柜内立管检修',[176,198,138,160],.15,2.42,'照片确认立管，当前柜体包络包入管道。需核柜内层板开孔、可拆背板及管箍检修，不能整板封死。']
 ];
 for(const [id,name,r,y1,y2,evidence] of auditAreas){const q=bpx('AUDIT-height-'+id,name,...r,y1,y2,'zone',heightAudit,evidence,'模型风险定位；待实测');q.material=q.material.clone();q.material.color.set(id==='entry'||id==='master'?0xd64238:0xe8a126);q.material.depthTest=false;q.renderOrder=999;}
 function setHeightAudit(on){heightAudit.visible=on;}
 apply();return {groups,custom,furnishings,inventory,fixtures,ceilings,panels,zones,finish,setPhase,setLayer,setPanels,setZones,setHVAC,setHideCeilings,setKitchenServices,setHeightAudit,lv,clearWidth:z2-z1-2*depth,get phase(){return phase;}};
}
