import {masterLayout as ml} from './master-bedroom-layout.js';
// Independent loose-furniture stage. Sizes fit the current baseline; not product specifications.
export function buildFurnishings({THREE,groups,box,px,pz,lv}){
 const group=new THREE.Group();group.name='SOFT-02 床与沙发软装';groups.design.add(group);const items=[];
 function piece(id,name,room,r,y1,y2,mat='fabric',soft=false){let [a,b,c,d]=r;if(id.startsWith('dining-table-')){a+=12.8;b+=12.8;}if(id.startsWith('dining-chair-')){a+=32;b+=32;}if(id.startsWith('master-bed-')){c-=23;d-=23;}if(id.startsWith('sofa-')||id==='rug'){c-=40;d-=40;}const f=lv(room,'finished');const m=box('SOFT-'+id,name,px(a),px(b),pz(c),pz(d),y1+f,y2+f,mat,group,'按当前净空放置；尺寸为方案适配值，非已确认品牌型号。','软装预览 · 待选型');m.userData.room=room;m.userData.scheme='SOFT-02';m.userData.assetId=id;items.push(m);
 if(soft){const w=m.scale.x,h=m.scale.y,d=m.scale.z,t=Math.min(.035,w/6,h/6,d/6),sh=new THREE.Shape();sh.moveTo(-w/2+t,-h/2+t);sh.lineTo(w/2-t,-h/2+t);sh.lineTo(w/2-t,h/2-t);sh.lineTo(-w/2+t,h/2-t);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:d-2*t,bevelEnabled:true,bevelThickness:t,bevelSize:t,bevelSegments:3,steps:1});g.translate(0,0,-d/2+t);g.scale(1/w,1/h,1/d);m.geometry=g;}return m;}
 function bed(id,room,a,b,c,d){piece(id+'-frame','床架',room,[a,b,c,d],.12,.29,'customWood',true);piece(id+'-mattress','床垫',room,[a+1,b-1,c+2,d-1],.29,.50,'linen',true);piece(id+'-head','软包床头',room,[a,b,c-4,c+2],.12,.97,'fabric',true);piece(id+'-duvet','床品被褥',room,[a+1,b-1,c+35,d-1],.50,.58,'linen',true);piece(id+'-throw','床尾织物',room,[a+1,b-1,d-28,d-5],.58,.61,'accent',true);const count=b-a>75?2:1;for(let i=0;i<count;i++){const w=(b-a-10)/count;piece(id+'-pillow'+i,'枕头',room,[a+5+i*w,a+3+(i+1)*w,c+7,c+28],.5,.63,'fabric',true);}}
 // Main bed: head EAST against the solid wall between two windows, foot WEST.
 piece('master-bed-frame','横向床架','master',[699,829,ml.frameNorth+23,ml.frameSouth+23],.12,.29,'customWood',true);
 piece('master-bed-mattress','主卧床垫 · 1800×2000mm','master',[700,828,ml.mattressNorth+23,ml.mattressNorth+ml.mattressWidth+23],.29,.50,'linen',true);
 piece('master-bed-head','东侧实墙床头','master',[829,833,230,347.2],.12,.97,'fabric',true);
 piece('master-bed-duvet','主卧被褥','master',[700,793,231,346.2],.50,.58,'linen',true);
 piece('master-bed-throw','主卧床尾织物','master',[705,728,231,346.2],.58,.61,'accent',true);
 for(let i=0;i<2;i++)piece('master-bed-pillow'+i,'主卧枕头','master',[805,824,239+i*57.6,277+i*57.6],.50,.63,'fabric',true);
 const masterMattress=items.find(m=>m.userData.assetId==='master-bed-mattress');
 Object.assign(masterMattress.userData,{evidence:'用户确认床宽1800mm；床长暂按2000mm。保留靠北侧飘窗位置。',status:'床宽已纠正；床边柜按床架外沿留20mm，柜体分段为方案暂值'});
 // Raised transverse bay bed: platform rests ABOVE the retained 425mm sill.
 piece('child-platform','飘窗连续床台上板','bedroom2',[537,667,167,265],.425,.46,'customWood');
 piece('child-storage','飘窗床前沿储物基座','bedroom2',[537,667,208,265],.035,.425,'customWood');
 for(let i=1;i<4;i++)piece('child-front-joint'+i,'床台柜门分缝','bedroom2',[529+i*34,529+i*34+.3,264.8,265.1],.07,.405,'metal');
 piece('child-bed-mattress','小次卧床垫 · 1500×2000mm','bedroom2',[538,666,168,264],.46,.61,'linen',true);
 piece('child-bed-head','飘窗床东端靠垫','bedroom2',[661,666,175,260],.61,.86,'fabric',true);
 piece('child-bed-pillow','飘窗床枕头','bedroom2',[643,661,183,223],.61,.73,'accent',true);
 piece('child-bed-throw','飘窗床织物','bedroom2',[539,558,169,263],.61,.635,'fabric',true);
 piece('child-rug','小次卧中部地毯','bedroom2',[545,614,263,323],.005,.018,'rug');
 // Ordered Ye Xian sofa, 2500mm long. Depth 950 and height 860 remain provisional.
 const sofa=(id,name,r,y1,y2,mat='dark')=>piece('sofa-'+id,name,'living',r,y1,y2,mat,true);
 sofa('base','夜弦2500沙发 · 黑色皮',[289.2,350,220,380],.10,.30);
 // Two broad seat/back divisions as in the purchased sofa, no placeholder throw pillows.
 sofa('back','沙发低背支架',[337,347,226,374],.27,.66);
 for(let i=0;i<2;i++){const z=228+i*72;
  sofa('seat'+i,'夜弦双分区皮坐垫',[291,337,z,z+70],.30,.48);
  const back=sofa('backpad'+i,'夜弦宽幅蓬松靠背',[331,348,z,z+70],.49,.89);back.rotation.z=-.13;
  sofa('lumbar'+i,'一体横向腰托',[326,338,z+2,z+68],.43,.55);
  for(let j=1;j<4;j++){const seam=sofa('tuft'+i+'-'+j,'靠背压褶',[330.7,331.1,z+j*17,z+j*17+.35],.60,.78);seam.material=seam.material.clone();seam.material.color.set(0x131313);}
 }
 for(const z of [220,372])sofa('arm'+z,'包覆皮革低扶手',[289.2,347,z,z+8],.22,.62);
 for(const z of [222,375]){const m=sofa('rail'+z,'前端纤细金属支脚',[291,293,z,z+1.5],.035,.39,'metal');m.userData.keepMaterial=true;}
 // Owen lounge chair: user places it on the enclosed balcony beside the sofa.
 // Order has no dimensions: footprint 850 x 780mm, height 850mm are provisional.
 const lounge=(id,name,r,y1,y2,mat='fabric')=>{const m=piece('lounge-'+id,name,'balcony',r,y1,y2,mat,true);m.userData.evidence='木陌家具-8.29坚果.pdf：欧文休闲椅，复古油蜡皮全皮；用户确认放封窗阳台、沙发旁。订单未写尺寸，暂用850深×780宽×850高，非产品实测。';if(mat==='fabric'){m.material=m.material.clone();m.material.color.set(0x9a6745);m.material.roughness=.65;}return m;};
 // Open sculpted timber sides, armless tufted leather seat and reclined back.
 for(const z of [98,140]){
  const frame=lounge('frame-'+z,'欧文弧形镂空实木侧架',[294,345,z,z+3.5],.025,.79,'customWood');
  const sh=new THREE.Shape();sh.moveTo(-.5,-.5);sh.lineTo(.5,-.5);sh.lineTo(.44,.50);sh.quadraticCurveTo(.27,.48,.23,.23);sh.lineTo(.16,-.01);sh.quadraticCurveTo(-.12,-.26,-.40,-.02);sh.lineTo(-.5,-.04);sh.closePath();
  const hole=new THREE.Path();hole.moveTo(-.34,-.27);hole.quadraticCurveTo(.03,-.43,.24,-.14);hole.lineTo(.30,-.40);hole.lineTo(-.34,-.40);hole.closePath();sh.holes.push(hole);
  const g=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false,curveSegments:20});g.translate(0,0,-.5);frame.geometry=g;
 }
 lounge('seat','欧文宽厚油蜡皮坐垫',[292,332,96,145.92],.31,.47);
 const back=lounge('back','欧文后倾拉扣靠背',[330,341,96,145.92],.46,.91);back.rotation.z=-.17;
 // Six softly rounded upholstery fields with recessed buttons at their junctions.
 for(let row=0;row<3;row++)for(let col=0;col<2;col++){
  const pad=lounge('quilt-'+row+'-'+col,'拉扣靠背软包分区',[328+row*1.4,334+row*1.4,98+col*23,120+col*23],.48+row*.135,.608+row*.135);pad.rotation.z=-.17;
 }
 for(let row=1;row<3;row++){const button=lounge('button-'+row,'皮革内陷拉扣',[328+row*1.4,328.5+row*1.4,120.5,121.5],.477+row*.135,.492+row*.135);button.material=button.material.clone();button.material.color.set(0x745134);}
 piece('rug','客厅地毯','living',[222,330,222,378],.005,.018,'rug');
 const side=piece('side-table','过道端小圆边几 · 直径450','living',[306,334.8,354,382.8],.46,.49,'customWood');side.geometry=new THREE.CylinderGeometry(.5,.5,1,40);
 const stem=piece('side-table-base','圆边几底座','living',[314,326.8,362,374.8],.02,.46,'customWood');stem.geometry=new THREE.CylinderGeometry(.5,.5,1,32);
 // 1100mm round hourglass table beside the banquette. Order specifies width only; H750 provisional.
 const table=piece('dining-table-top','沙漏餐桌 · 直径1100 · 岩板','living',[256.6,327,458.8,529.2],.725,.75,'sill');table.geometry=new THREE.CylinderGeometry(.5,.5,1,64);
 const lower=piece('dining-table-lower','沙漏桌黑色圆盘底座','living',[273,311,475,513],.025,.065,'dark');lower.geometry=new THREE.CylinderGeometry(.5,.5,1,64);
 const upper=piece('dining-table-upper','沙漏桌收腰木柱','living',[281,303,483,505],.065,.725,'customWood');
 const profile=[new THREE.Vector2(.5,-.5),new THREE.Vector2(.46,-.46),new THREE.Vector2(.31,.25),new THREE.Vector2(.32,.40),new THREE.Vector2(.39,.5)];upper.geometry=new THREE.LatheGeometry(profile,64);
 for(let i=0;i<2;i++){const z=467+i*32;
 const seat=piece('dining-chair-seat'+i,'星木餐椅 · 棕色皮坐垫','living',[224,253,z,z+28],.43,.49,'fabric',true);seat.material=seat.material.clone();seat.material.color.set(0x9f7046);
 for(const zz of [z,z+26])piece('dining-chair-backpost'+i+'-'+zz,'星木餐椅靠背木柱','living',[223,225,zz,zz+2],.43,.85,'customWood');
 for(let j=0;j<6;j++)piece('dining-chair-weave-v'+i+'-'+j,'浅色编织靠背竖带','living',[223.8,224.5,z+2+j*4,z+5.6+j*4],.56,.83,'linen');
 for(let j=0;j<4;j++)piece('dining-chair-weave-h'+i+'-'+j,'浅色编织靠背横带','living',[224.4,224.8,z+2,z+26],.56+j*.067,.617+j*.067,'fabric');
 for(const x of [225,250])for(const zz of [z+2,z+25])piece('dining-chair-leg'+i+'-'+x+'-'+zz,'餐椅木腿','living',[x,x+2,zz,zz+2],.02,.43,'customWood');}
 items.filter(m=>m.name.startsWith('SOFT-sofa')||m.name.startsWith('SOFT-dining')).forEach(m=>{if(m.name.startsWith('SOFT-sofa')&&!m.userData.keepMaterial){m.material=m.material.clone();m.material.color.set(0x242321);m.material.roughness=.62;}m.userData.evidence='木陌家具-8.29坚果.pdf：夜弦沙发2.5m、黑色半青皮；沙漏餐桌1.1m、白蜡木+岩板；星木餐椅2把。未注明深高暂定；款式按订单缩略图概括。';});
 // Cushions have a softly inflated surface instead of bevelled rectangular slabs.
 for(const m of items){if(/SOFT-(sofa-(seat|backpad|lumbar|arm)|lounge-(seat|quilt))/.test(m.name)){
  const g=new THREE.SphereGeometry(1,40,24),v=g.attributes.position;
  for(let i=0;i<v.count;i++){const round=q=>Math.sign(q)*Math.pow(Math.abs(q),.34)*.5;v.setXYZ(i,round(v.getX(i)),round(v.getY(i)),round(v.getZ(i)));}
  g.computeVertexNormals();m.geometry=g;
 }}
 // Window cushion stays below the glass, preserves sill and window opening.
 // piece('study-window-cushion','书房窗台坐垫','bedroom1',[379,499,179,200],.45,.50,'fabric',true);
 return {group,items};
}
