import {buildServices} from './services.js';
import * as THREE from 'three';
import {OrbitControls} from '../assets/OrbitControls.js';
import {GLTFExporter} from '../assets/GLTFExporter.js';
import {spatial} from './spatial-data.js';
import {createModel} from './model.js';
import {addExisting} from './existing.js';
const $=id=>document.getElementById(id);
const queryMode=new URLSearchParams(location.search);
const isPublicMode=new Set(['neighbor','share','public','preview']).has(queryMode.get('mode')||queryMode.get('view')||'');
const scene=new THREE.Scene();scene.background=new THREE.Color(0xedf0ec);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.localClippingEnabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;$('canvas-wrap').appendChild(renderer.domElement);
let previewValues={};let model=createModel(spatial);let existing=addExisting(model,spatial,previewValues);scene.add(model.root);
const perspective=new THREE.PerspectiveCamera(38,1,.04,180),ortho=new THREE.OrthographicCamera(-8,8,8,-8,.05,180);let camera=ortho;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=1.1;controls.maxDistance=50;controls.maxPolarAngle=Math.PI/2-.035;controls.target.set(5,.1,4.8);
const hemi=new THREE.HemisphereLight(0xffffff,0xb4beb2,2);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfffdf5,2.8);sun.position.set(-4,16,7);sun.target.position.set(5,0,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:.5,far:50});sun.shadow.bias=-.00035;sun.shadow.normalBias=.035;sun.shadow.radius=4;sun.shadow.blurSamples=8;scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight(0xecf4ff,.7);fill.position.set(15,10,-8);scene.add(fill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xedf0ec,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.28;ground.receiveShadow=true;scene.add(ground);
const edges=new THREE.Group();edges.name='presentation-only-edges';scene.add(edges);
const edgeMat=new THREE.LineBasicMaterial({color:0x758579,transparent:true,opacity:.18});
function rebuildEdges(){while(edges.children.length){const e=edges.children[0];edges.remove(e);e.geometry.dispose();}model.masonry.children.filter(m=>m.visible).forEach(m=>{const g=new THREE.EdgesGeometry(m.geometry,25);const e=new THREE.LineSegments(g,edgeMat);e.position.copy(m.position);e.scale.copy(m.scale);edges.add(e);});}
rebuildEdges();

function hideForPublicMode(){
 if(!isPublicMode){return;}
 const hiddenIds=['snapshot-btn','download-btn','measure-btn','levels-toggle','height-audit-toggle','study-bed-toggle','vanity-toggle','entry-interior','kitchen-services','hvac-toggle'];
 for(const id of hiddenIds){
  const control=document.getElementById(id);
  if(!control) continue;
  const block=control.closest('label,details,button,section,div,p') || control;
  if(block instanceof HTMLElement){
   block.style.display='none';
  }
 }
 const softFurniturePattern=/\u8f6f\u88c5|\u5bb6\u5177|\u8bbe\u8ba1\u7248|\u6d74\u623f|\u7a7a\u95f4|\u6761\u7ebf|\u8863\u67dc|\u5361\u53f6|\u6905\u6750|\u6905\u4f53|\u684c\u9762|\u6905\u5b50|\u5929\u95f4|\u67dc\u9762|\u6d4b\u91cf|\u62bd\u5c4f|\u8f7b\u5c04/;
 for(const input of document.querySelectorAll('input[id^="layer-"]')){
  const label=input.closest('label');
  const text=label?.textContent?.trim()||'';
  if(!softFurniturePattern.test(text)){
   continue;
  }
  if(label) label.style.display='none';
  input.checked=false;
  if(typeof existing.setLayer==='function'){
   existing.setLayer(input.id.slice(6), false);
  }
 }
 for(const sourceBtn of document.querySelectorAll('#sources button[data-source]')){
  const src=sourceBtn.dataset.source||'';
  if(/mym-/i.test(src)){
   sourceBtn.hidden=true;
  }
 }
 const dialog=document.getElementById('measure-dialog');
 if(dialog instanceof HTMLElement){dialog.style.display='none';}
 const status=document.querySelector('.status');
 if(status) status.textContent='公开展示版（含精装核对资料 + 开发商核对资料 + 水电点位）';
}
const plane=new THREE.Plane(new THREE.Vector3(0,-1,0),1.2);const caps=new THREE.Group();scene.add(caps);const capMat=new THREE.MeshBasicMaterial({color:0x161b18,side:THREE.DoubleSide});const capGeo=new THREE.PlaneGeometry(1,1);let capMeshes=model.solids.map(s=>{const m=new THREE.Mesh(capGeo,capMat);m.rotation.x=-Math.PI/2;caps.add(m);return {m,s};});
let entryHidden=[];
let view='axon',selected='all',showNames=true,walking=false,cut=false,cutY=1.2,wallH=spatial.wall_height;
function updateCut(){cut=$('cut-toggle').checked;cutY=+$('cut-height').value;plane.constant=cutY;for(const m of model.materials){m.clippingPlanes=cut?[plane]:[];m.clipShadows=true;}edgeMat.clippingPlanes=cut?[plane]:[];caps.visible=cut;for(const {m,s} of capMeshes){const min=s.min,max=s.max;const top=s.mesh.position.y+s.mesh.scale.y/2;let shown=true;for(let n=s.mesh;n;n=n.parent)if(!n.visible)shown=false;m.visible=cut&&shown&&cutY>min[1]+.002&&cutY<top-.002;m.position.set((min[0]+max[0])/2,cutY+.001,(min[2]+max[2])/2);m.scale.set(max[0]-min[0],max[2]-min[2],1);}$('cut-height').disabled=!cut;$('cut-value').value=cutY.toFixed(2)+' m';}
$('cut-toggle').onchange=updateCut;$('cut-height').oninput=updateCut;
$('roof-toggle').onchange=()=>model.roof.visible=$('roof-toggle').checked;
$('names-toggle').onchange=()=>showNames=$('names-toggle').checked;
$('doors-toggle').onchange=()=>model.setDoors($('doors-toggle').checked);
const routes=new THREE.Group();scene.add(routes);routes.visible=false;const routeMat=new THREE.LineDashedMaterial({color:0x5b9680,dashSize:.12,gapSize:.07});
const paths=[[[226,616],[285,616],[330,616]],[[414,399],[414,458],[425,491]],[[226,667],[226,487],[289,396],[574,396],[640,396],[720,396],[746,316]],[[475,396],[478,335],[440,278]],[[566,396],[566,330],[597,280]],[[289,396],[273,280],[272,107]]];
for(const path of paths){const pts=path.map(([x,z])=>new THREE.Vector3((x-158)/64,.055,(z-48)/64));const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),routeMat);l.computeLineDistances();routes.add(l);}
$('routes-toggle').onchange=()=>routes.visible=$('routes-toggle').checked;
const labels=spatial.rooms.map(r=>{const el=document.createElement('div');el.className='room-label';el.innerHTML=r.name+(r.area_label?`<small>${r.area_label.toFixed(2)} m² · 原图</small>`:'');$('labels').appendChild(el);return {r,el};});
for(const r of spatial.rooms){const b=document.createElement('button');b.className='room';b.dataset.room=r.id;b.innerHTML=`<span>${r.name}</span><span class="area">${r.area_label?r.area_label.toFixed(2)+' m²':''}</span>`;$('room-list').appendChild(b);}
function roomSelect(id){if(entryHidden.length){clearEntryIsolation();$('labels').hidden=false;}selected=id;document.querySelectorAll('[data-room]').forEach(b=>b.classList.toggle('selected',b.dataset.room===id));const r=spatial.rooms.find(r=>r.id===id);$('selected-name').textContent=r?.name||'测量范围';$('selected-note').textContent=r?.note||'点击房间查看标高，点击固定设施查看尺寸与依据。';if(r)showRoomLevels(r);else $('object-info').hidden=true;if(walking){enterWalk(r||spatial.rooms.find(r=>r.id==='living'));}else if(view!=='plan'){if(r){controls.target.set(r.center[0],.5,r.center[1]);camera.position.set(r.center[0]+(view==='top'?0:5),view==='top'?20:8,r.center[1]+(view==='top'?.001:7));if(camera===ortho)ortho.zoom=view==='top'?1.6:1.8;ortho.updateProjectionMatrix();controls.update();$('view-name').textContent=r.name+' / '+(view==='top'?'俯视':'空间浏览');}else setView(view);}}
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>roomSelect(b.dataset.room));
function resize(){const w=$('stage').clientWidth,h=$('stage').clientHeight;renderer.setSize(w,h);perspective.aspect=w/h;perspective.updateProjectionMatrix();const size=Math.max(7.1,6.4/(w/h));ortho.left=-size*w/h;ortho.right=size*w/h;ortho.top=size;ortho.bottom=-size;ortho.updateProjectionMatrix();}
new ResizeObserver(resize).observe($('stage'));
let yaw=0,pitch=0,walkDrag=null;const keys=new Set();
function orientWalk(){perspective.rotation.order='YXZ';perspective.rotation.set(pitch,yaw,0);}
function enterWalk(r){$('object-info').hidden=true;perspective.fov=68;perspective.updateProjectionMatrix();walking=true;document.body.classList.add('walking');camera=perspective;controls.object=camera;controls.enabled=false;$('walk-pad').hidden=false;$('cut-toggle').checked=false;updateCut();model.roof.visible=!$('hide-ceilings').checked;$('roof-toggle').checked=model.roof.visible;existing.setPanels(true);existing.setHideCeilings($('hide-ceilings').checked);$('ceiling-toggle').checked=true;camera.position.set(r.camera[0],1.6+existing.lv(r.id,'finished'),r.camera[1]);camera.up.set(0,1,0);camera.rotation.reorder('YXZ');camera.lookAt(r.target[0],1.2,r.target[1]);yaw=camera.rotation.y;pitch=camera.rotation.x;$('view-name').textContent=r.name+' / 室内';$('help').textContent='拖动环视 · W/A/S/D 或方向键移动 · 空格退出';}
function setView(next){clearEntryIsolation();perspective.fov=38;perspective.updateProjectionMatrix();view=next;walking=false;keys.clear();walkDrag=null;document.body.classList.remove('walking');$('walk-pad').hidden=true;controls.enabled=true;controls.enableRotate=next!=='top';$('plan-view').hidden=next!=='plan';$('canvas-wrap').hidden=next==='plan';$('labels').hidden=next==='plan';document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===next));$('help').textContent='拖动旋转 · 右键平移 · 滚轮缩放';model.roof.visible=false;$('roof-toggle').checked=false;existing.setPanels(false);$('ceiling-toggle').checked=false;
 if(next==='walk'){enterWalk(spatial.rooms.find(r=>r.id===selected)||spatial.rooms[0]);return;}
 camera=next==='perspective'?perspective:ortho;controls.object=camera;camera.up.set(0,1,0);controls.target.set(5,.2,4.9);ortho.zoom=next==='top'?.92:1;resize();if(next==='top'){camera.position.set(5,22,4.901);camera.up.set(0,0,-1);camera.lookAt(controls.target);}else{camera.position.set(12,23,21);camera.lookAt(controls.target);}controls.update();$('view-name').textContent=({axon:'整体轴测',perspective:'整体透视',top:'正交俯视',plan:'原图叠加核对'})[next];$('mode-note').textContent=next==='plan'?'深色墙线为模型 / 原图仅作背景':'白模 / 门窗真实留洞';}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('fit-btn').onclick=()=>{selected='all';roomSelect('all');setView('axon');};
renderer.domElement.addEventListener('pointerdown',e=>{if(walking){walkDrag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',e=>{if(walking&&walkDrag){yaw-=(e.clientX-walkDrag.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-walkDrag.y)*.004,-1.15,1.15);walkDrag={x:e.clientX,y:e.clientY};orientWalk();}});
renderer.domElement.addEventListener('pointerup',()=>walkDrag=null);renderer.domElement.addEventListener('pointercancel',()=>walkDrag=null);
window.addEventListener('keydown',e=>{if(!walking||$('sources').open||/INPUT|SELECT/.test(document.activeElement.tagName))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);}if(e.code==='Space')setView('axon');});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();walkDrag=null;});
function walkMove(dx,dz){const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const delta=forward.multiplyScalar(dz).add(right.multiplyScalar(dx));const next=camera.position.clone().add(delta);let blocked=false;for(const s of model.solids){let shown=true;for(let n=s.mesh;n;n=n.parent)if(!n.visible)shown=false;if(!shown||s.min[1]>camera.position.y||s.max[1]<.25)continue;const mn=s.min,mx=s.max;if(next.x>mn[0]-.13&&next.x<mx[0]+.13&&next.z>mn[2]-.13&&next.z<mx[2]+.13){blocked=true;break;}}if(!blocked){camera.position.x=THREE.MathUtils.clamp(next.x,-.4,11);camera.position.z=THREE.MathUtils.clamp(next.z,0,10.3);}}
for(const b of document.querySelectorAll('[data-step]'))b.onclick=()=>{const dir=b.dataset.step;walkMove(dir==='left'?-.25:dir==='right'?.25:0,dir==='forward'?.25:dir==='backward'?-.25:0);};
function lightPosition(){const az=THREE.MathUtils.degToRad(+$('light-angle').value),el=THREE.MathUtils.degToRad(+$('light-elevation').value);sun.position.set(5+18*Math.cos(el)*Math.sin(az),18*Math.sin(el),5+18*Math.cos(el)*Math.cos(az));}
$('light-angle').oninput=lightPosition;$('light-elevation').oninput=lightPosition;$('ambient').oninput=()=>hemi.intensity=+$('ambient').value;$('shadow-toggle').onchange=()=>{renderer.shadowMap.enabled=$('shadow-toggle').checked;renderer.shadowMap.needsUpdate=true;};$('outline-toggle').onchange=()=>edges.visible=$('outline-toggle').checked&&existing.groups.architecture.visible;
$('lighting').onchange=()=>{const v=$('lighting').value;hemi.intensity=v==='flat'?3:v==='sun'?.85:2;sun.intensity=v==='flat'?0:v==='sun'?4:v==='studio'?1.6:2.8;fill.intensity=v==='studio'?1.2:.7;sun.color.set(v==='sun'?0xffe8c6:0xfffdf5);renderer.shadowMap.enabled=v!=='flat';$('shadow-toggle').checked=v!=='flat';$('ambient').value=hemi.intensity;renderer.shadowMap.needsUpdate=true;};
function makePlan(){const ns='http://www.w3.org/2000/svg';const g=$('plan-geometry');const poly=document.createElementNS(ns,'polygon');poly.setAttribute('points',spatial.footprint_px.map(p=>p.join(',')).join(' '));poly.setAttribute('fill','#f8faf8');poly.setAttribute('stroke','#698477');poly.setAttribute('stroke-width','1');g.appendChild(poly);for(const b of spatial.boxes){if(b.layer!=='architecture')continue;if(!(b.min[1]<=1.2&&b.max[1]>1.2))continue;const r=document.createElementNS(ns,'rect');r.setAttribute('x',b.source_rect[0]);r.setAttribute('y',b.source_rect[1]);r.setAttribute('width',b.source_rect[2]-b.source_rect[0]);r.setAttribute('height',b.source_rect[3]-b.source_rect[1]);r.setAttribute('fill','#284e40');g.appendChild(r);}for(const o of spatial.openings){if(o.kind==='bay-aperture')continue;const l=document.createElementNS(ns,'line');l.setAttribute('x1',o.axis==='x'?o.from_px:o.plane);l.setAttribute('x2',o.axis==='x'?o.to_px:o.plane);l.setAttribute('y1',o.axis==='x'?o.plane:o.from_px);l.setAttribute('y2',o.axis==='x'?o.plane:o.to_px);l.setAttribute('stroke',o.kind==='door'?'#b48a47':'#72969b');l.setAttribute('stroke-width','1.8');l.setAttribute('stroke-dasharray',o.kind==='door'?'4 3':'1 0');g.appendChild(l);}}
makePlan();function updateUnderlay(){
 const full=$('plan-source').value==='full';const a=spatial.source.full_plan_alignment;const img=$('source-underlay');$('plan-svg').setAttribute('viewBox',full?'-30 -100 1080 910':'110 20 780 700');
 img.setAttribute('href',full?'assets/full-plan.jpg':'assets/source-plan.png');img.setAttribute('width',full?'1164':'1013');img.setAttribute('height',full?'972':'724');
 if(full){img.setAttribute('transform',`translate(${a.anchor_model_px[0]-a.scale*a.anchor_full[0]},${a.anchor_model_px[1]-a.scale*a.anchor_full[1]}) scale(${a.scale})`);}else img.removeAttribute('transform');
 img.setAttribute('opacity',$('overlay-toggle').checked?'.62':'0');
 }$('overlay-toggle').onchange=updateUnderlay;$('plan-source').onchange=updateUnderlay;updateUnderlay();$('plan-opacity').oninput=()=>$('plan-geometry').style.opacity=$('plan-opacity').value;
$('sources-btn').onclick=()=>{$('sources').showModal();keys.clear();};$('sources-close').onclick=()=>$('sources').close();$('assumptions').innerHTML=spatial.assumptions.map(t=>`<li>${t}</li>`).join('');document.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{$('source-image').src='assets/'+b.dataset.source;document.querySelectorAll('[data-source]').forEach(x=>x.classList.toggle('active',x===b));});
function toast(t){$('toast').textContent=t;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,3500);}
async function exportGLB(){const em=createModel(spatial);const ee=addExisting(em,spatial,previewValues);ee.setPhase(existing.phase);const es=buildServices(em.root);es.set($('mep-toggle').checked,$('mep-filter').value);ee.custom.setBed($('study-bed-toggle').checked);ee.custom.setVanity($('vanity-toggle').checked);ee.setPanels(true);ee.setZones(false);em.roof.visible=false;em.setDoors(false);em.root.userData={version:spatial.version,units:'metres',phase:existing.phase,baseline_locked:true,parameters:previewValues,limitations:spatial.assumptions};em.root.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(em.root,{binary:true,onlyVisible:true});}
$('download-btn').onclick=async()=>{try{toast('正在导出当前阶段模型…');const buffer=await exportGLB();const response=await fetch('/__save__/model',{method:'POST',headers:{'Content-Type':'model/gltf-binary'},body:buffer});if(!response.ok)throw new Error('模型文件保存失败');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'}));a.download='宜家建筑白模.glb';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('已导出当前阶段；完整四层数据保存在项目文件中。');}catch(e){toast('导出失败：'+e.message);console.error(e);}};
let services=buildServices(model.root);
function showService(mesh){const d=mesh.userData;const panel=$('object-info');panel.hidden=false;panel.replaceChildren();
 for(const text of [d.name,d.status,d.source,'原图层：'+d.layer+(d.block?' · 符号：'+d.block:''),d.cad?'原DWG坐标（mm）：'+d.cad.join(', '):'无DWG坐标；用户现场描述','显示高度 '+Math.round(d.position[1]*1000)+'mm（示意，非原图安装高度）','能否改位：待核对回路、暗管路径或排水条件；本点不作可改结论。']){const p=document.createElement('p');p.textContent=text;panel.appendChild(p);}}
function roomName(id){return spatial.rooms.find(r=>r.id===id)?.name||id;}
if($('mep-room-filter')){for(const r of spatial.rooms)$('mep-room-filter').add(new Option(r.name,r.id));}
function filteredServiceItems(){return services.items.filter(m=>($('mep-filter').value==='all'||m.userData.kind===$('mep-filter').value)&&(!$('mep-room-filter')||$('mep-room-filter').value==='all'||m.userData.room===$('mep-room-filter').value));}
function updateServiceUI(){services.set($('mep-toggle').checked,$('mep-filter').value);const selected=$('mep-point').value,items=filteredServiceItems();$('mep-point').replaceChildren(new Option('选择点位查看依据',''));for(const m of items)$('mep-point').add(new Option(m.userData.name+' · '+roomName(m.userData.room),m.name));$('mep-point').value=[...$('mep-point').options].some(o=>o.value===selected)?selected:'';renderServiceList(items);}
function renderServiceList(items){const list=$('mep-point-list'),summary=$('mep-point-summary');if(!list||!summary)return;list.replaceChildren();summary.textContent=items.length?`当前筛选 ${items.length} 个点位，点选后查看依据。`:'当前筛选无点位。';if(!items.length){const empty=document.createElement('div');empty.className='mep-empty';empty.textContent='换一个类别或空间试试。';list.appendChild(empty);return;}if(items.length>24&&$('mep-room-filter')?.value==='all'){summary.textContent=`当前共 ${items.length} 个点位，先选一个空间会清楚很多。`;const counts=new Map();for(const m of items)counts.set(m.userData.room,(counts.get(m.userData.room)||0)+1);for(const r of spatial.rooms.filter(r=>counts.has(r.id))){const b=document.createElement('button');b.type='button';b.className='mep-point mep-room-pick';b.innerHTML=`<span>${r.name}</span><small>${counts.get(r.id)} 个</small>`;b.onclick=()=>{$('mep-room-filter').value=r.id;updateServiceUI();};list.appendChild(b);}return;}for(const m of items){const b=document.createElement('button');b.type='button';b.className='mep-point';b.classList.toggle('selected',$('mep-point').value===m.name);b.innerHTML=`<span>${m.userData.name}</span><small>${roomName(m.userData.room)}</small>`;b.onclick=()=>{$('mep-point').value=m.name;$('mep-point').dispatchEvent(new Event('change'));renderServiceList(items);};list.appendChild(b);}}
$('mep-toggle').onchange=updateServiceUI;$('mep-filter').onchange=updateServiceUI;if($('mep-room-filter'))$('mep-room-filter').onchange=updateServiceUI;
$('mep-point').onchange=()=>{const m=services.items.find(m=>m.name===$('mep-point').value);if(m){$('mep-toggle').checked=true;services.set(true,$('mep-filter').value);showService(m);}};
$('mep-room').onclick=()=>{const m=services.items.find(m=>m.name===$('mep-point').value);if(m){document.querySelector('[data-room="'+m.userData.room+'"]').click();showService(m);}};
if(new URLSearchParams(location.search).get('v')==='mep3d')$('mep-toggle').checked=true;
updateServiceUI();
const phaseSelect=$('phase-select');for(const ph of spatial.phases){const opt=document.createElement('option');opt.value=ph.id;opt.textContent=ph.name;phaseSelect.appendChild(opt);}phaseSelect.value='furnished';
function applyPhase(){existing.setPhase(phaseSelect.value);$('phase-note').textContent=spatial.phases.find(p=>p.id===phaseSelect.value).note;rebuildEdges();edges.visible=$('outline-toggle').checked&&existing.groups.architecture.visible;updateCut();$('mode-note').textContent=spatial.phases.find(p=>p.id===phaseSelect.value).name+' / 点击设施查看依据';}
phaseSelect.onchange=applyPhase;
for(const layer of spatial.layers){const label=document.createElement('label');label.className='check';const input=document.createElement('input');input.type='checkbox';input.id='layer-'+layer.id;input.checked=layer.id!=='demolition';label.append(input,document.createTextNode(layer.name+(layer.locked?' · 锁定':'')));$('layer-list').appendChild(label);input.onchange=()=>{existing.setLayer(layer.id,input.checked);rebuildEdges();edges.visible=$('outline-toggle').checked&&existing.groups.architecture.visible;updateCut();};}
$('ceiling-toggle').onchange=()=>existing.setPanels($('ceiling-toggle').checked);$('service-toggle').onchange=()=>existing.setZones($('service-toggle').checked);
function levelText(r){const l=spatial.levels[r.id];const n=(key)=>{const v=existing.lv(r.id,key),pending=l[key].value===null||previewValues[r.id+'_'+key]!==undefined&&previewValues[r.id+'_'+key]!==l[key].value;return (pending?'待测（预览 ':'')+(v>=0?'+':'')+v.toFixed(3)+'m'+(pending?'）':'');};return '结构面 '+n('structural')+' / 完成面 '+n('finished')+' / 天花净高 '+n('ceiling')+' / 原板底待测';}
function showRoomLevels(r){$('object-info').hidden=false;$('object-info').replaceChildren();const title=document.createElement('b');title.textContent=r.name;const line=document.createElement('p');line.textContent=levelText(r);$('object-info').append(title,line);}
$('levels-toggle').onchange=()=>{for(const {r,el} of labels)el.innerHTML=r.name+($('levels-toggle').checked?'<small>'+levelText(r).replaceAll(' / ','<br>')+'</small>':r.area_label?'<small>'+r.area_label.toFixed(2)+' m² · 原图</small>':'');};
const raycaster=new THREE.Raycaster();let pickStart=null;renderer.domElement.addEventListener('pointerdown',e=>pickStart=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(walking||!pickStart||Math.hypot(e.clientX-pickStart[0],e.clientY-pickStart[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const visible=m=>{for(let n=m;n;n=n.parent)if(!n.visible)return false;return true;};const serviceHit=services.enabled?raycaster.intersectObjects(services.items,false).find(h=>visible(h.object)):null;const hit=serviceHit||raycaster.intersectObjects(existing.inventory,false).find(h=>visible(h.object)&&(!cut||h.point.y<=cutY));if(!hit){$('object-info').hidden=true;return;}if(hit.object.userData.service){showService(hit.object);return;}const d=hit.object.userData;$('object-info').hidden=false;$('object-info').replaceChildren();for(const t of [d.name,d.status,'宽 × 高 × 深：'+d.dimensions.map(n=>Math.round(n*1000)).join(' × ')+' mm',d.evidence]){const el=document.createElement('p');el.textContent=t;$('object-info').appendChild(el);}});
const fields=[];function field(id,name,value,min,max){const lab=document.createElement('label');lab.className='measure-field';lab.textContent=name;const input=document.createElement('input');input.type='number';input.step='any';input.min=min;input.max=max;input.value=previewValues[id]??+value.toFixed(3);input.dataset.param=id;lab.appendChild(input);$('measure-fields').appendChild(lab);fields.push(input);}
for(const r of spatial.rooms){const h=document.createElement('h3');h.textContent=r.name;$('measure-fields').appendChild(h);const l=spatial.levels[r.id];const note=document.createElement('p');note.className='small-note';note.textContent='结构面：'+(l.structural.value===null?'待测':l.structural.value+'m')+'；原始楼板底待测。'+l.ceiling.evidence;$('measure-fields').appendChild(note);if(r.id!=='living')field(r.id+'_finished','完成面相对客厅（待测）',l.finished.preview,r.id==='balcony'?-.11:-.04,.12);field(r.id+'_ceiling','天花净高'+(l.ceiling.value===null?'（待测预览）':'（照片2790）'),l.ceiling.preview,2.1,3.3);if(!['kitchen','bathroom','entry','corridor'].includes(r.id))field(r.id+'_soffit','梁底 / 边吊净高'+(r.id==='balcony'?'（照片2420）':'（待测预览）'),l.soffit.preview,2.05,3.1);}
for(const p of spatial.parameters)field(p.id,p.name+'（待测预览）',p.preview,p.min,p.max);
$('measure-btn').onclick=()=>$('measure-dialog').showModal();$('measure-close').onclick=()=>$('measure-dialog').close();
$('apply-measures').onclick=()=>{const next={};for(const input of fields){if(!input.checkValidity()||!Number.isFinite(+input.value)||!input.value){$('measure-feedback').textContent='请填写有效的范围内数值。';return;}next[input.dataset.param]=+input.value;}
if(next.upper_top>next.kitchen_ceiling-.03){$('measure-feedback').textContent='吊柜顶已超过厨房吊顶，请核对高度。';return;}if(next.upper_top<=next.upper_bottom+.2){$('measure-feedback').textContent='吊柜顶需高于柜底至少200mm。';return;}for(const r of spatial.rooms){if(next[r.id+'_ceiling']+(next[r.id+'_finished']||0)>2.95){$('measure-feedback').textContent=r.name+'：高度超出当前建筑显示包络，需据实测修订建筑版本。';return;}if(next[r.id+'_soffit']>next[r.id+'_ceiling']){$('measure-feedback').textContent=r.name+'：边吊底不能高于中央天花。';return;}}
previewValues=next;scene.remove(model.root);for(const mesh of caps.children)mesh.geometry===capGeo||mesh.geometry.dispose();caps.clear();model=createModel(spatial);existing=addExisting(model,spatial,previewValues);scene.add(model.root);services=buildServices(model.root);updateServiceUI();capMeshes=model.solids.map(s=>{const m=new THREE.Mesh(capGeo,capMat);m.rotation.x=-Math.PI/2;caps.add(m);return {m,s};});for(const l of spatial.layers)existing.setLayer(l.id,$('layer-'+l.id).checked);existing.setPanels($('ceiling-toggle').checked);existing.setZones($('service-toggle').checked);model.setDoors($('doors-toggle').checked);applyPhase();$('levels-toggle').onchange();$('measure-feedback').textContent='已应用本次预览。厨房柜间净宽约 '+Math.round(existing.clearWidth*1000)+'mm；是否满足实际开启与通行需现场核对。请导出记录保存。';};
$('export-measures').onclick=()=>{const payload={version:'BASE-v3',status:'用户输入预览值，未自动视为实测确认',date:new Date().toISOString(),values:previewValues,sourceLevels:spatial.levels,remaining:['冰箱位置','燃气检修净距','检修口位置','边吊宽度','窗帘盒宽深','湿区结构降板','全部原板底']};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='BASE-v3-本次尺寸记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);};
applyPhase();
hideForPublicMode();
const clock=new THREE.Clock();let frames=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);if(!walking)controls.update();else{let dx=0,dz=0;if(keys.has('KeyW')||keys.has('ArrowUp'))dz+=dt*1.6;if(keys.has('KeyS')||keys.has('ArrowDown'))dz-=dt*1.6;if(keys.has('KeyA')||keys.has('ArrowLeft'))dx-=dt*1.6;if(keys.has('KeyD')||keys.has('ArrowRight'))dx+=dt*1.6;if(dx||dz)walkMove(dx,dz);}renderer.render(scene,camera);for(const {r,el} of labels){const v=new THREE.Vector3(r.center[0],.13,r.center[1]).project(camera);el.hidden=!showNames||walking||v.z>1||v.z<-1||Math.abs(v.x)>1||Math.abs(v.y)>1;el.style.left=((v.x+1)/2*$('stage').clientWidth)+'px';el.style.top=((-v.y+1)/2*$('stage').clientHeight)+'px';}frames++;}
setView('axon');lightPosition();updateCut();$('loading').hidden=true;applyPhase();animate();
window.whiteModel={data:spatial,model,scene,renderer,controls,get camera(){return camera;},setView,roomSelect,exportGLB,get state(){return {view,selected,walking,cut,cutY,wallH,frames,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,caps:capMeshes.filter(c=>c.m.visible).length};},screenshot:()=>renderer.domElement.toDataURL('image/png')};

$('snapshot-btn').onclick=async()=>{try{const originalWidth=$('stage').clientWidth,originalHeight=$('stage').clientHeight,pixelRatio=renderer.getPixelRatio();const exportCamera=camera.clone();
const exportWidth=2000,exportHeight=1400,aspect=exportWidth/exportHeight;
if(exportCamera.isPerspectiveCamera)exportCamera.aspect=aspect;else{const half=(exportCamera.top-exportCamera.bottom)/2;exportCamera.left=-half*aspect;exportCamera.right=half*aspect;}exportCamera.updateProjectionMatrix();
renderer.setPixelRatio(1);renderer.setSize(exportWidth,exportHeight,false);renderer.render(scene,exportCamera);const dataUrl=renderer.domElement.toDataURL('image/png');renderer.setPixelRatio(pixelRatio);renderer.setSize(originalWidth,originalHeight,false);renderer.render(scene,camera);
const bytes=Uint8Array.from(atob(dataUrl.split(',')[1]),c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:'image/png'});const response=await fetch('/__save__/preview',{method:'POST',headers:{'Content-Type':'image/png'},body:blob});if(!response.ok)throw new Error('本地保存服务未响应');toast('当前视图已保存到 previews/白模视图.png');}catch(e){toast(e.message);}};

function clearEntryIsolation(){for(const [m,v] of entryHidden)m.visible=v;entryHidden=[];}
function entryElevation(){
 clearEntryIsolation();setView('axon');
 const chosen=new Set(existing.custom.retainedItems);
 existing.custom.entryRenovation.traverse(m=>{if(m.isMesh)chosen.add(m);});
 for(const p of existing.custom.items)if(p.name.startsWith('MYM-fridge-'))chosen.add(p);
 model.root.traverse(m=>{if(m.isMesh&&!chosen.has(m)){entryHidden.push([m,m.visible]);m.visible=false;}});
 entryHidden.push([edges,edges.visible],[caps,caps.visible]);edges.visible=false;caps.visible=false;camera=ortho;controls.object=camera;controls.enabled=true;
 const g=existing.custom.entryGeometry,z=(g.entrySouth+(410.4-48)/64)/2;
 controls.target.set(g.front,1.2,z);camera.up.set(0,1,0);camera.position.set(g.front+8,1.7,z+.55);camera.lookAt(controls.target);ortho.zoom=2.7;ortho.updateProjectionMatrix();controls.update();
 $('labels').hidden=true;$('view-name').textContent='入户一体立面 · DWG核对';$('mode-note').textContent='鞋柜 / 玄关 → 冰箱凹位 → 护墙板；前方厨房隐藏以便核对';
}
const entryButton=document.createElement('button');entryButton.textContent='入户立面';entryButton.id='entry-elevation-btn';entryButton.onclick=entryElevation;$('fit-btn').before(entryButton);
if(isPublicMode){entryButton.style.display='none';}

$('study-bed-toggle').onchange=()=>{existing.custom.setBed($('study-bed-toggle').checked);if($('study-bed-toggle').checked)toast('整面书柜与1800展开床有重叠；橙色床仅用于冲突检查。');rebuildEdges();updateCut();};

$('hvac-toggle').onchange=()=>{existing.setHVAC($('hvac-toggle').checked);};

$('kitchen-services').onchange=()=>existing.setKitchenServices($('kitchen-services').checked);
$('entry-interior').onchange=()=>existing.custom.setEntryInterior($('entry-interior').checked);
$('vanity-toggle').onchange=()=>existing.custom.setVanity($('vanity-toggle').checked);

$('hide-ceilings').onchange=()=>{existing.setHideCeilings($('hide-ceilings').checked);if($('hide-ceilings').checked){model.roof.visible=false;$('roof-toggle').checked=false;}};

$('height-audit-toggle').onchange=()=>{existing.setHeightAudit($('height-audit-toggle').checked);if($('height-audit-toggle').checked)toast('红：模型重叠；橙：检修待核。点击框体查看原因；隐藏吊顶仅改变显示。');};
