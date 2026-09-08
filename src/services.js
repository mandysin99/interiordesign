import * as THREE from 'three';
import {servicePoints} from './services-data.js';
export function buildServices(root){
 const group=new THREE.Group();group.name='水电三维点位核对（位置高度待复核）';root.add(group);group.visible=false;
 const names={electric:'电气插座符号',switch:'开关符号',water:'给水点位',drain:'排水符号',smart:'智能面板保护位置'};
 const colors={electric:0xdca02b,switch:0x8b5cb8,water:0x168dc1,drain:0x38a276,smart:0xe15b48};
 const items=[];let filter='all';let enabled=false;
 for(const [i,p] of servicePoints.entries()){
 const material=new THREE.MeshBasicMaterial({color:colors[p.kind],depthTest:false,depthWrite:false});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(.065,12,8),material);mesh.position.fromArray(p.position);mesh.name=p.id;mesh.renderOrder=999;
 mesh.userData={...p,service:true,name:`${i+1}. ${names[p.kind]}`,dimensions:[.13,.13,.13],evidence:p.source,status:p.status};group.add(mesh);items.push(mesh);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.09,.009,4,20),material);ring.rotation.x=-Math.PI/2;mesh.add(ring);
 }
 function apply(){group.visible=enabled;items.forEach(m=>m.visible=filter==='all'||m.userData.kind===filter);}
 function set(on,kind=filter){enabled=on;filter=kind;apply();}
 return {group,items,set,get enabled(){return enabled;}};
}
