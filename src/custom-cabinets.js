import {masterLayout as ml} from './master-bedroom-layout.js';
// MYM-14: checked by dragging the supplied Kujiale panoramas, 2026-09-07.
// Geometry follows visible relationships; numeric dimensions remain fit-to-base proxies.
export function buildCustom({THREE,groups,box,px,pz,lv}){
 const group=new THREE.Group();group.name='MYM-14 木与梦全景校正（尺寸待核）';groups.design.add(group);
 const items=[],assemblies=[];
 // Procedural cane surface: crossed flat strands and dark woven recesses, at physical repeat scale.
 const size=128,pixels=new Uint8Array(size*size*4);
 const dist=(x)=>Math.min(((x%1)+1)%1,1-((x%1)+1)%1);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,h=dist(v)<.115,vert=dist(u)<.115,diag=dist(u+v)<.052||dist(u-v)<.052;let color=[85,63,39];if(h||vert){const shade=10*Math.sin((h?v:u)*Math.PI*26)+5*Math.sin((u+v)*Math.PI*42);color=[179+shade,139+shade,86+shade];}const i=(y*size+x)*4;pixels.set([...color,255],i);}
 const cane=new THREE.DataTexture(pixels,size,size);cane.wrapS=cane.wrapT=THREE.RepeatWrapping;cane.colorSpace=THREE.SRGBColorSpace;cane.magFilter=THREE.LinearFilter;cane.minFilter=THREE.LinearMipmapLinearFilter;cane.generateMipmaps=true;cane.needsUpdate=true;
 function canePanel(mesh,width,height,face){const tex=cane.clone();tex.repeat.set(width/.018,height/.018);tex.needsUpdate=true;mesh.material=mesh.material.clone();mesh.material.color.set(0xffffff);mesh.material.map=tex;mesh.material.roughness=.9;mesh.material.side=THREE.DoubleSide;
 const radius=Math.min(.5,width/(2*height)),shape=new THREE.Shape();shape.moveTo(-.5,-.5);shape.lineTo(.5,-.5);shape.lineTo(.5,.5-radius);shape.bezierCurveTo(.5,.5-radius*.448,.276,.5,0,.5);shape.bezierCurveTo(-.276,.5,-.5,.5-radius*.448,-.5,.5-radius);shape.closePath();const geo=new THREE.ShapeGeometry(shape,24);if(face==='east'||face==='west')geo.rotateY(Math.PI/2);mesh.geometry=geo;mesh.userData.finish='木框拱形藤编门芯；程序化编织材质，非原厂贴图';
 }

 const source='https://www.kujiale.cn/design/3FO3EC7CJORS/airoaming?fromqrcode=true';
 const roomIds={living:'living',study:'bedroom1',small:'bedroom2',master:'master',balcony:'balcony',bathroom:'bathroom'};
 function part(id,name,b,mat,room){let [x1,x2,z1,z2,y1,y2]=b;if(room==='study'){const sum=px(365)+px(512);[x1,x2]=[sum-x2,sum-x1];}const floor=lv(roomIds[room],'finished');const m=box('MYM-'+id,name,x1,x2,z1,z2,y1+floor,y2+floor,mat,group,'酷家乐改2全景环视：'+room+'；位置关系已比对，长度/深度/高度为白模适配暂值。'+source,'全景位置校正 · 尺寸待核');if(room==='study')m.userData.evidence='用户本轮调整：面向窗左书柜右书桌；原柜体分段参考酷家乐，数值仍待测。';m.userData.room=roomIds[room];m.userData.scheme='MYM-14';items.push(m);return m;}
 // Panel carcass: no opaque solid behind glass, openings remain genuinely open.
 function cabinet(id,name,rect,height,face,room,{bottom=0,doors='customWood',count=2,shelves=0}={}){
  const [x1,x2,z1,z2]=rect,w=['east','west'].includes(face)?z2-z1:x2-x1,d=['east','west'].includes(face)?x2-x1:z2-z1,t=.018;
  assemblies.push({id:'MYM-'+id,name,room:roomIds[room],min:[x1,bottom,z1],max:[x2,bottom+height,z2],face,status:'全景关系核对，尺寸待核'});
  function local(suffix,u1,u2,v1,v2,y1,y2,mat){let r;if(face==='east')r=[x2-v2,x2-v1,z1+u1,z1+u2];if(face==='west')r=[x1+v1,x1+v2,z1+u1,z1+u2];if(face==='north')r=[x1+u1,x1+u2,z1+v1,z1+v2];if(face==='south')r=[x1+u1,x1+u2,z2-v2,z2-v1];return part(id+'-'+suffix,name+' · '+suffix,[...r,bottom+y1,bottom+y2],mat,room);}
  for(const [n,a,b,c,e,f,g] of [['侧板A',0,t,0,d,0,height],['侧板B',w-t,w,0,d,0,height],['背板',t,w-t,d-t,d,t,height-t],['顶板',t,w-t,0,d,height-t,height],['底板',t,w-t,0,d,.04,.04+t]])local(n,a,b,c,e,f,g,'customWood');
  for(let i=1;i<=shelves;i++){const h=.07+(height-.10)*i/(shelves+1);local('层板'+i,t,w-t,.012,d-t,h,h+t,'customWood');}
  if(doors){for(let i=0;i<count;i++){const a=w*i/count+.004,b=w*(i+1)/count-.004;
    if(doors==='cane'){
     local('木框门'+i,a,b,-.022,.002,.075,height-.012,'customWood');
     const lo=id==='master-wardrobe'?.65:.11,hi=height-.065;const panel=local('拱形藤编门芯'+i,a+.045,b-.045,-.026,-.025,lo,hi,'customWood');canePanel(panel,b-a-.09,hi-lo,face);
    }else if(doors==='glass'){
     local('玻璃门'+i,a+.027,b-.027,-.014,.003,.11,height-.03,'glass');
     for(const [n,u1,u2,y1,y2] of [['门边A',a,a+.028,.075,height-.012],['门边B',b-.028,b,.075,height-.012],['门上边',a,b,height-.04,height-.012],['门下边',a,b,.075,.11]])local(n+i,u1,u2,-.022,.004,y1,y2,'customWood');
    }else local('门板'+i,a,b,-.022,.002,.075,height-.012,doors);
    const hu=count>1&&i%2===0?b-.065:a+.04;
    local('把手'+i,hu,hu+.025,-.045,-.022,Math.min(height-.12,height*.43),Math.min(height-.12,height*.43)+.025,'customWood');
  }}return {local,w,d};
 }
 const r=(a,b,c,d)=>[px(a),px(b),pz(c),pz(d)];
 const entryFace=.897;
 const entrySouth=pz(671), shoeStart=entrySouth-1.5899367, fridgeNorth=shoeStart-.960;
 const front=entryFace, rear=front-.700, cabinetRear=front-.325;
 // One continuous delivered elevation. User clear niche: 900 W x 680 D.
 // 30 mm side envelopes / 20 mm rear envelope are modelling allowances, not fabrication specs.
 part('living-fridge-side-n','冰箱凹位北包边',[rear,front,fridgeNorth,fridgeNorth+.030,0,2.40],'customWood','living');
 part('living-fridge-side-s','冰箱凹位南包边',[rear,front,shoeStart-.030,shoeStart,0,2.40],'customWood','living');
 part('living-fridge-back','冰箱凹位后饰面',[rear,rear+.020,fridgeNorth+.030,shoeStart-.030,0,2.40],'customWood','living');
 cabinet('fridge-overhead-cabinet','冰箱上方双门柜',[rear,front-.022,fridgeNorth+.030,shoeStart-.030],.37,'east','living',{bottom:2.03,count:2});
 // User confirmed refrigerator: W800 D657 H1930, right side of the 900 clear niche.
 const fridgeStart=fridgeNorth+.030,fridgeEnd=fridgeStart+.800;
 part('fridge-appliance','冰箱 · 宽800×深657×高1930mm 用户确认',[front-.657,front,fridgeStart,fridgeEnd,0,1.930],'porcelain','living');
 part('fridge-seam','冰箱门缝示意 · 门型待定',[front,front+.003,fridgeStart,fridgeEnd,.80,.804],'metal','living');
 const confirmedFridge=items.find(m=>m.name==='MYM-fridge-appliance');confirmedFridge.userData.evidence='用户确认外形：宽800×深657×高1930mm；高193按193cm理解。安装散热及开门间隙待型号说明书。';confirmedFridge.userData.status='外形尺寸用户确认';
 // South is left when facing the cabinetry; 100mm is a provisional envelope before appliance clearances.
 cabinet('new-entry-slim','冰箱左侧薄抽 · 外宽100mm预留',[front-.600,front-.022,shoeStart-.130,shoeStart-.030],1.930,'east','living',{count:1,shelves:5});
 part('new-entry-fridge-top-infill','冰箱顶柜下接收口 · 通风构造待型号确认',[front-.025,front,fridgeNorth+.030,shoeStart-.030,1.930,2.026],'customWood','living');
 // Replace the 1100mm tall shoe cupboard with two equal zones; retain the 490mm console footprint.
 cabinet('new-entry-household','右半家政柜 · 分格存放厨电',[cabinetRear,front-.022,shoeStart,shoeStart+.550],2.40,'east','living',{count:1,shelves:5});
 cabinet('new-entry-shoe','左半鞋柜',[cabinetRear,front-.022,shoeStart+.550,shoeStart+1.100],2.40,'east','living',{count:1,shelves:7});
 // Directly adjacent: 500 / 600 / 490, matching CAD plan divisions.
 cabinet('entry-shoes-near','近冰箱500段原柜',[cabinetRear,front-.022,shoeStart,shoeStart+.500],2.40,'east','living',{count:1,shelves:4});
 cabinet('entry-shoes','600段原鞋柜',[cabinetRear,front-.022,shoeStart+.500,shoeStart+1.100],2.40,'east','living',{count:1,shelves:4});
 const consoleStart=shoeStart+1.100;
 cabinet('entry-console-base','玄关490段下柜',[cabinetRear,front-.022,consoleStart,entrySouth],.85,'east','living',{count:1});
 part('entry-console-counter','玄关落物台',[cabinetRear,front,consoleStart,entrySouth,.85,.88],'sill','living');
 part('entry-console-back','玄关开放格背板',[cabinetRear,cabinetRear+.018,consoleStart,entrySouth,.88,1.65],'customWood','living');
 cabinet('entry-console-upper','玄关490段上柜',[cabinetRear,front-.022,consoleStart,entrySouth],.75,'east','living',{bottom:1.65,count:1});
 part('fridge-right-backdrop','连续护墙板 · 后为原墙非储物',[front-.020,front,pz(410.4),fridgeNorth,0,2.40],'customWood','living');
 part('entry-backdrop-return','护墙板客厅端收边',[px(193),front,pz(410.4),pz(410.4)+.02,0,2.40],'customWood','living');
 // Physical common top band gives the niche and entry cabinetry one continuous datum.
 part('entry-console-common-header','整组连续顶收口',[front-.018,front+.001,fridgeNorth,entrySouth,2.38,2.40],'customWood','living');
 assemblies.push({id:'MYM-living-fridge',name:'冰箱区外包960×700',room:'entry',min:[rear,0,fridgeNorth],max:[front,2.40,shoeStart],face:'east',layer:'retained',clear:[.900,.680],status:'外包DWG；净空间用户提供；高度待测'});
 // User-approved elevation: right TV 2.0m → coffee 1.6m → backdrop → fridge → entry storage.
 // 64px/m: TV 180..308 = 128px; coffee 308..410.4 = 102.4px.
 cabinet('coffee-base-north','餐边地柜右半 · 对开双门',r(171,209,308,359.2),.85,'east','living',{count:2});
 const coffeeDrawers=cabinet('coffee-base-drawers','餐边地柜左半 · 三抽屉',r(171,209,359.2,410.4),.85,'east','living',{doors:false});
 for(let i=0;i<3;i++){const lo=.07+i*.256,hi=lo+.25;coffeeDrawers.local('抽屉面'+i,.004,.796,-.022,.002,lo,hi,'customWood');coffeeDrawers.local('抽屉把手'+i,.388,.412,-.045,-.022,(lo+hi)/2,(lo+hi)/2+.025,'customWood');}
 part('coffee-counter-north','餐边台面 · 1600mm暂定',[px(171),px(210),pz(308),pz(410.4),.85,.88],'sill','living');
 part('coffee-back-north','餐边柜操作区背板',[px(171),px(173),pz(308),pz(410.4),.88,1.58],'customWood','living');
 // Right half arched cane; left half open shelf with solid upper doors, matching the supplied elevation.
 cabinet('coffee-upper-north','餐边上柜右半 · 拱形藤编',r(171,193,308,359.2),.80,'east','living',{bottom:1.58,doors:'cane',count:2,shelves:1});
 cabinet('coffee-upper-left','餐边上柜左半 · 木门',r(171,193,359.2,410.4),.50,'east','living',{bottom:1.88,count:2});
 cabinet('coffee-open-left','餐边左侧开放格',r(171,193,359.2,410.4),.30,'east','living',{bottom:1.58,doors:false});
 cabinet('tv-base','电视低柜 · 用户确认长2000mm',r(171,194,180,308),.38,'east','living',{count:4});
 part('tv-location','55英寸电视 · 16:9屏幕1218×685',[px(173),px(175),pz(205.03),pz(282.97),.92,1.605],'dark','living');
 // Opposite wall, beside the bathroom/room passage and L-shaped kitchen partition.
 // Full wall length: corridor corner z435 through kitchen glass inside face z545.52.
 cabinet('dining-bench','满墙卡座下柜 · 收至过道墙边',r(327,354.6,435,545.52),.43,'west','living',{count:3});
 part('bench-seat','满墙卡座坐面',[px(325),px(354.6),pz(435),pz(545.52),.43,.49],'cabinet','living');
 part('bench-back','满墙软包靠背',[px(351),px(354.6),pz(435),pz(545.52),.49,.95],'cabinet','living');
 cabinet('bench-upper','满墙餐边吊柜 · 过道端编织双门',r(336,354.6,435,490.26),lv('living','soffit')-1.87,'west','living',{bottom:1.87,doors:'cane',count:2,shelves:1});
 cabinet('bench-upper-wood','满墙餐边吊柜 · 靠厨房木门',r(336,354.6,490.26,545.52),lv('living','soffit')-1.87,'west','living',{bottom:1.87,count:2,shelves:1});
 // Study: facing north window, user override mirrors below: bookcase left/west, desk right/east.
 // Reference 1: paired arched reeded glass doors, central open niche and drawers.
 for(const [id,z1,z2] of [['a',208,272],['b',299,359]]){
 cabinet('study-base-'+id,'书柜下部木门',r(491,511,z1,z2),.76,'west','study',{count:2});
 const c=cabinet('study-glazed-'+id,'双扇拱形长虹玻璃书柜',r(491,511,z1,z2),lv('bedroom1','soffit')-.80,'west','study',{bottom:.76,doors:'glass',count:2,shelves:4});
 const ht=lv('bedroom1','soffit')-.80;
 for(let leaf=0;leaf<2;leaf++){const lo=c.w*leaf/2+.035,hi=c.w*(leaf+1)/2-.035,radius=(hi-lo)/2;
 for(let j=0;j<12;j++){const u=lo+(hi-lo)*j/12,mid=u+(hi-lo)/24;const y=ht-.035-radius+Math.sqrt(Math.max(0,radius*radius-(mid-(lo+hi)/2)**2));c.local('拱顶木饰片'+leaf+'-'+j,u,u+(hi-lo)/12,-.024,-.020,y,ht-.012,'customWood');}
 for(let u=lo;u<hi;u+=.022)c.local('长虹纹'+leaf+'-'+u.toFixed(3),u,u+.004,-.025,-.021,.11,ht-.055,'glass');}
 }
 cabinet('study-niche','书柜中央开放格',r(491,511,272,299),lv('bedroom1','soffit')-.80,'west','study',{bottom:.76,doors:false,shelves:4});
 cabinet('study-niche-base','中央抽屉组',r(491,511,272,299),.76,'west','study',{count:1});
 for(const h of [.25,.49])part('study-center-drawer-'+h,'中央抽屉分缝',[px(491)-.024,px(491)-.021,pz(272),pz(299),h,h+.006],'metal','study');
 part('study-desk','书房固定长桌段',[px(366),px(397),pz(275),pz(358),.73,.765],'customWood','study');
 cabinet('study-drawers','书桌抽屉柜',r(366,397,327,358),.73,'east','study',{count:1,doors:'cabinet'});
 const folding=part('study-folding','靠窗翻折桌面 · 展床时上翻',[px(366),px(397),pz(208),pz(274),.73,.765],'customWood','study');
 cabinet('study-bay-end','书柜延伸至飘窗上的独立木门柜',r(491,511,158,201),lv('bedroom1','soffit')-.465,'west','study',{bottom:.425,count:1});
 part('study-board','书桌洞洞板底板',[px(365),px(367),pz(208),pz(358),.79,1.93],'cabinet','study');
 // Sparse dark recess markers describe pegboard, not hardware fabrication.
 for(let z=206;z<358;z+=9)for(let y=.85;y<1.9;y+=.12)part('peg-'+z+'-'+y.toFixed(2),'洞洞板孔位示意',[px(367),px(367)+.002,pz(z),pz(z)+.009,y,y+.009],'dark','study');
 part('study-upper','书桌上方长层板',[px(366),px(380),pz(208),pz(358),2.02,2.045],'customWood','study');
 part('study-window-top','窗下坐台饰面',[px(368),px(509),pz(177),pz(201),.425,.45],'customWood','study');
 part('study-window-front','窗下柜式饰面（保留飘窗结构）',[px(372),px(505),pz(206.8),pz(208),.04,.425],'cabinet','study');
 // Children's side-wall wardrobe: retain side orientation, reconstruct upper white doors + open/drawer base.
 const child=r(632,669,266,353);
 cabinet('small-upper','儿童房白色上柜',child,lv('bedroom2','soffit')-.72,'west','small',{bottom:.66,doors:'cabinet',count:4});
 cabinet('small-open','儿童房下部开放格',r(632,669,266,309),.66,'west','small',{doors:false,shelves:1});
 cabinet('small-drawers','儿童房下部木色抽屉柜',r(632,669,309,353),.66,'west','small',{count:2});
 part('small-drawerline','儿童房抽屉分缝',[px(632)-.024,px(632)-.022,pz(309),pz(353),.33,.336],'metal','small');
 part('small-cubby-divider','儿童柜下部开放格中竖板',[px(633),px(668),pz(287),pz(288),.02,.66],'customWood','small');
 for(const z of [287.75,331.25]){
 const handle=part('small-round-handle-'+z,'儿童柜圆形分体把手',[px(632)-.045,px(632)-.021,pz(z)-.07,pz(z)+.07,1.13,1.27],'customWood','small');handle.geometry=new THREE.CylinderGeometry(.5,.5,1,32);handle.geometry.rotateZ(Math.PI/2);
 part('small-round-split-'+z,'圆形把手分缝',[px(632)-.046,px(632)-.044,pz(z)-.0015,pz(z)+.0015,1.13,1.27],'dark','small');}
 items.filter(m=>m.name.startsWith('MYM-small-upper-把手')).forEach(m=>m.visible=false);
 const cy=lv('bedroom2','soffit');
 part('small-vent-crown-back','儿童柜顶通风收口 · 协调方案',[px(633),px(669),pz(266),pz(353),cy,cy+.025],'cabinet','small');
 part('small-vent-crown','儿童柜顶正面风口 · 转接待核',[px(631.8),px(632),pz(269),pz(350),cy+.045,cy+.155],'dark','small');
 for(const y of [cy,cy+.17])part('small-crown-edge-'+y,'儿童柜顶白色收口边',[px(631.7),px(633),pz(266),pz(353),y,y+.025],'cabinet','small');
 // Main bedroom: high cupboard at the SOUTH window corner, joined to dressing desk.
 // Reference: three real drawer fronts below the two cane doors.
 const masterCaneTop=lv('master','soffit');
 cabinet('master-bedside-cane','床边双扇藤编上柜',r(ml.wardrobeFront,ml.wardrobeBack,ml.bedsideStart,ml.bedsideEnd),masterCaneTop-.78,'west','master',{bottom:.78,count:2,doors:'cane'});
 const drawerFrame=cabinet('master-lower-drawers','藤编柜下三抽',r(ml.wardrobeFront,ml.wardrobeBack,ml.bedsideStart,ml.bedsideEnd),.78,'west','master',{doors:false});
 for(let i=0;i<3;i++){const y=.05+i*.24;drawerFrame.local('抽屉正面'+i,.004,drawerFrame.w-.004,-.022,.002,y,y+.232,'customWood');drawerFrame.local('抽屉把手'+i,drawerFrame.w/2-.012,drawerFrame.w/2+.012,-.047,-.022,y+.11,y+.134,'customWood');}
 part('master-cane-top-fill','藤编柜顶部高低收口',[px(795),px(832),pz(ml.bedsideStart),pz(Math.min(ml.bedsideEnd,361)),masterCaneTop,lv('master','ceiling')],'customWood','master');
 cabinet('master-solid','深吊顶下木门衣柜 · 与飘窗柜同面',r(ml.wardrobeFront,ml.wardrobeBack,ml.bedsideEnd,ml.bayFront),lv('master','soffit'),'west','master',{count:2});
 cabinet('master-bay-cab','飘窗上柜 · 与落地衣柜同面',r(795,832,429.24,473),lv('master','soffit')-.425,'west','master',{bottom:.425,count:1});
 // Facing the south bay: wardrobe is on the left (east). All three drawers extend from the visible sill front to the bay back.
 // The visible sill front is the room-side wall face, not its centreline (435px).
 const bayFront=429.24,bayBack=473,drawerBottom=.445,lowTop=.745,highTop=.825;
 for(const [id,a,b,top] of [['left',759,795,lowTop],['middle',723,759,lowTop],['right',687,723,highTop]]){
  const x1=px(a),x2=px(b),z1=pz(bayFront),z2=pz(bayBack),t=.018;
  for(const [suffix,c,d,e,f,y1,y2] of [
   ['侧板A',x1,x1+t,z1,z2,drawerBottom,top],['侧板B',x2-t,x2,z1,z2,drawerBottom,top],
   ['后板',x1+t,x2-t,z2-t,z2,drawerBottom,top],['底板',x1+t,x2-t,z1,z2-t,drawerBottom,drawerBottom+t],
   ['顶板',x1+t,x2-t,z1,z2-t,top-t,top],['抽屉面',x1+.003,x2-.003,z1,z1+t,drawerBottom+.004,top-.004]])
   part('master-bay-drawer-'+id+'-'+suffix,(id==='left'?'左':id==='middle'?'中':'右')+'段飘窗抽屉 · '+suffix,[c,d,e,f,y1,y2],'customWood','master');
 }
 // Flat wood cladding, no invented knee arch or floor-standing supports.
 part('master-bay-flat-front','飘窗下方平直木饰面',[px(687),px(795),pz(bayFront-.3),pz(bayFront),.03,.445],'customWood','master');
 const vanityParts=[];
 vanityParts.push(part('master-vanity-pull','左中两段共用抽出台板',[px(723),px(795),pz(bayFront),pz(bayBack),.79,.825],'customWood','master'));
 for(const x of [725,793])part('master-vanity-guide-'+x,'台板抽拉轨道示意',[px(x),px(x+1),pz(bayFront+1),pz(bayBack-1),.755,.775],'metal','master');
 const vanityStarts=vanityParts.map(m=>m.position.clone());function setVanity(on){vanityParts.forEach((m,i)=>{m.position.copy(vanityStarts[i]);if(on)m.position.z-=.42;});}
 // Replacement vanity only; existing toilet, shower, windows and finishes retain ownership.
 cabinet('bath-vanity','木与梦重做悬空浴室柜',r(369,420,500,530),.43,'north','bathroom',{bottom:.36,count:2});
 part('bath-counter','浴室白色台盆台面',[px(369),px(420),pz(499),pz(530),.79,.83],'porcelain','bathroom');
 part('bath-basin','浴室台盆示意',[px(378),px(411),pz(504),pz(523),.83,.87],'porcelain','bathroom');
 part('bath-mirror','浴室镜柜',[px(369),px(420),pz(524),pz(530),1.12,2.03],'glass','bathroom');
 // Balcony WEST end (same side as TV), storage to the room side, machines toward outer window.
 cabinet('balcony-storage','阳台家政下部高柜',r(171,212,111,162),1.84,'east','balcony',{count:2});
 cabinet('balcony-storage-upper','家政柜顶部双门柜',r(171,212,111,162),lv('balcony','soffit')-1.86,'east','balcony',{bottom:1.84,count:2});
 cabinet('laundry-frame','阳台洗烘围柜',r(171,212,64,110),1.84,'east','balcony',{doors:false});
 cabinet('laundry-top','洗烘上方储物柜',r(171,212,64,110),lv('balcony','soffit')-1.86,'east','balcony',{bottom:1.84,count:2});
 for(let i=0;i<2;i++){
  part('laundry-machine-'+i,i?'烘干机占位':'洗衣机占位',[px(172),px(211),pz(66),pz(108),.07+i*.86,.90+i*.86],'porcelain','balcony');
  part('laundry-door-'+i,'洗烘机门位置',[px(211),px(211)+.012,pz(75),pz(99),.25+i*.86,.68+i*.86],'dark','balcony');
 }
 // Top closures follow local beam/soffit, with a removable access shelf below the child grille.
 part('balcony-top-filler','阳台柜顶封板 · 收至梁底',[px(171),px(212),pz(64),pz(162),lv('balcony','soffit')-.02,lv('balcony','soffit')],'customWood','balcony');
 part('small-service-shelf','儿童房可拆检修层板 · 不封风口',[px(632),px(668),pz(266),pz(353),lv('bedroom2','soffit')-.055,lv('bedroom2','soffit')-.037],'customWood','small');
 // Bay-side pegboard occupies only the solid half of the balcony side wall.
 part('balcony-pegboard','阳台右侧实墙洞洞板',[px(359),px(361),pz(111),pz(163),.55,2.25],'customWood','balcony');
 for(let z=115;z<160;z+=5)for(let y=.63;y<2.2;y+=.09)part('balcony-hole-'+z+'-'+y.toFixed(2),'洞洞板孔',[px(358.8),px(359),pz(z),pz(z)+.009,y,y+.009],'dark','balcony');
 for(const y of [.85,1.25,1.75])part('balcony-shelf-'+y,'洞洞板活动层板',[px(349),px(359),pz(117),pz(155),y,y+.025],'customWood','balcony');
 // Pull-out bed has two explicitly separate states, not overlapping fixed furniture.
 const bedClosed=new THREE.Group(),bedOpen=new THREE.Group();group.add(bedClosed,bedOpen);
 function slat(id,z1,z2,parent){for(let x=374;x<502;x+=7){const m=part(id+'-'+x,'抽拉排骨架',[px(x),px(x+3),pz(z1),pz(z2),.445,.47],'customWood','study');parent.add(m);}}
 slat('study-slats-closed',158,201,bedClosed);slat('study-slats-open',158,273.2,bedOpen);
 const bm=part('study-bed-expanded','展开床占位 · 与整面固定书柜冲突',[px(374),px(502),pz(158),pz(273.2),.47,.58],'remove','study');bedOpen.add(bm);
 const cm=part('study-bed-closed','收起坐垫',[px(374),px(502),pz(158),pz(201),.47,.52],'fabric','study');bedClosed.add(cm);
 const moving=items.filter(m=>m.name.startsWith('MYM-study-mobile-'));const originals=moving.map(m=>m.position.clone());const foldPos=folding.position.clone(),foldScale=folding.scale.clone();
 function setBed(open){bedOpen.visible=open;bedClosed.visible=!open;folding.position.copy(foldPos);folding.scale.copy(foldScale);if(open){folding.position.x=px(510);folding.position.y=1.02;folding.scale.x=.035;folding.scale.y=foldScale.x;}
 moving.forEach((m,i)=>{m.position.copy(originals[i]);if(open){m.position.x+=.55;m.position.z+=1.06;}});}
 setBed(false);
 for(const a of assemblies.filter(a=>a.room==='bedroom1')){const sum=px(365)+px(512),lo=a.min[0];a.min[0]=sum-a.max[0];a.max[0]=sum-lo;a.face=a.face==='east'?'west':a.face==='west'?'east':a.face;a.status='用户调整：面向窗左书柜右书桌，尺寸待核';}
 items.filter(m=>m.name.startsWith('MYM-tv-base')).forEach(m=>{m.userData.evidence='用户确认电视柜长2000mm；柜深柜高待核。';});
 const entryGroup=new THREE.Group();entryGroup.name='交付现状 · 入户鞋柜玄关及冰箱凹位饰面';groups.retained.add(entryGroup);
 const retainedPrefixes=['MYM-living-fridge-','MYM-fridge-overhead-','MYM-entry-shoes-','MYM-entry-console-','MYM-fridge-right-backdrop','MYM-entry-backdrop-return'];
 const retainedItems=items.filter(m=>retainedPrefixes.some(p=>m.name.startsWith(p)));
 for(const m of retainedItems){entryGroup.add(m);m.userData.layer='retained';m.userData.scheme='DELIVERY-entry';m.userData.evidence='本轮现场照片与视频截图可见：原入户柜及冰箱凹位饰面；平面按DWG局部重校；凹位净900×680来自用户；高度和内部构造待核。';}
 // Open niche top is the single shared divider with the closed cupboard above.
 const duplicateShelf=items.find(m=>m.name==='MYM-coffee-upper-left-底板');if(duplicateShelf){duplicateShelf.visible=false;duplicateShelf.userData.omitted='开放格与上柜共用一块层板';}
 // Replacement finishes are a separate first-renovation group. Preserve the delivered objects.
 const entryRenovation=new THREE.Group();entryRenovation.name='第一阶段装修 · 入户柜及护墙板重做';groups.design.add(entryRenovation);
 for(const m of retainedItems){
  const ghost=m.clone();ghost.name='REMOVE-ref-'+m.name;ghost.material=m.material.clone();ghost.material.color.set(0xdb7350);ghost.material.wireframe=true;ghost.userData={...m.userData,layer:'demolition',reference:m.name};groups.demolition.add(ghost);
  if(m.name.startsWith('MYM-entry-shoes'))continue;
  const replacement=m.clone();replacement.name=m.name.replace('MYM-','MYM-new-');replacement.userData={...m.userData,id:replacement.name,layer:'design',scheme:'MYM-14',evidence:'用户要求第一阶段拆除并按木与梦木色重做；尺寸沿用现有占位。'};entryRenovation.add(replacement);
  if(replacement.name.startsWith('MYM-new-fridge-overhead-')){const oldBottom=2.03,oldH=.37,newBottom=1.930,newH=2.40-newBottom;replacement.position.y=newBottom+(replacement.position.y-oldBottom)*newH/oldH;replacement.scale.y*=newH/oldH;replacement.userData.evidence='顶柜视觉下接1930mm冰箱，散热收口依最终型号复核。';}

 }
 items.filter(m=>m.name.startsWith('MYM-new-entry-')).forEach(m=>entryRenovation.add(m));
 // Existing entry finish follows the site photo, independent of new walnut cabinetry.
 for(const m of retainedItems){if(m.material.map){m.material=m.material.clone();m.material.map=null;m.material.color.set(m.name.endsWith('-back')?0x686056:0x998a78);m.material.needsUpdate=true;}}
 for(const a of assemblies)if(retainedPrefixes.some(p=>(a.id+'-').startsWith(p)))a.layer='retained';
 const designItems=items.filter(m=>!retainedItems.includes(m));
 function setService(on){items.filter(m=>m.name.startsWith('MYM-small-upper-顶板')||m.name.startsWith('MYM-small-upper-门板')||m.name==='MYM-small-service-shelf').forEach(m=>m.visible=!on);}
 function setEntryInterior(on){items.filter(m=>/^MYM-new-entry-(shoe|household)-(门板|把手)/.test(m.name)).forEach(m=>m.visible=!on);}
 return {group,setBed,setVanity,setService,setEntryInterior,items:designItems,retainedItems,entryGroup,entryRenovation,assemblies,entryFace,entryGeometry:{fridgeNorth,shoeStart,entrySouth,rear,front},sources:{primary:source}};
}
