import * as THREE from 'three';
export function createModel(data) {
  const root = new THREE.Group(); root.name = data.version + ' | fixed architecture';
  const masonry = new THREE.Group(); masonry.name = '01_Walls_and_bays'; root.add(masonry);
  const glazing = new THREE.Group(); glazing.name = '02_Doors_and_windows'; root.add(glazing);
  const floors = new THREE.Group(); floors.name = '03_Floor_slab'; root.add(floors);
  const roof = new THREE.Group(); roof.name = '04_Top_slab'; root.add(roof);
  const white = new THREE.MeshStandardMaterial({color:0xf4f4f1,roughness:.94});
  const frame = new THREE.MeshStandardMaterial({color:0xd4d9d9,roughness:.8});
  const glass = new THREE.MeshStandardMaterial({color:0xe8f0ef,roughness:.2,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
  const doorMat = new THREE.MeshStandardMaterial({color:0xe8eae7,roughness:.87});
  const floorMat = new THREE.MeshStandardMaterial({color:0xe6e8e5,roughness:1});
  const materials=[white,frame,glass,doorMat,floorMat];
  const solids=[];const doorPivots=[];
  const unit=new THREE.BoxGeometry(1,1,1);
  for(const b of data.boxes){
    const min=new THREE.Vector3(...b.min),max=new THREE.Vector3(...b.max),size=max.clone().sub(min);
    const mesh=new THREE.Mesh(unit,b.kind==='glass'?glass:b.kind==='frame'?frame:white);
    mesh.name=b.id;mesh.position.copy(min.clone().add(max).multiplyScalar(.5));mesh.scale.copy(size);
    mesh.castShadow=b.kind!=='glass';mesh.receiveShadow=true;mesh.userData={...b};
    (b.layer==='architecture'?masonry:glazing).add(mesh);
    if(b.layer==='architecture')solids.push({mesh,min:min.toArray(),max:max.toArray()});
  }
  function slab(points,y,name,mat,target){
    const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p[0],-p[1])));
    const g=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);
    const m=new THREE.Mesh(g,mat);m.position.y=y;m.name=name;m.castShadow=true;m.receiveShadow=true;target.add(m);
  }
  slab(data.footprint,-.12,'Floor-main',floorMat,floors);
  slab(data.footprint,data.wall_height,'Roof-main',white,roof);
  for(const b of data.bays){
    const pts=b.footprint_px.map(p=>[(p[0]-data.source.pixel_origin[0])/data.source.pixels_per_metre,(p[1]-data.source.pixel_origin[1])/data.source.pixels_per_metre]);
    slab(pts,-.12,'Floor-'+b.id,floorMat,floors);slab(pts,data.wall_height,'Roof-'+b.id,white,roof);
  }
  for(const d of data.doors){
    const pivot=new THREE.Group();pivot.name=d.id+'-pivot';pivot.position.set(d.hinge[0],0,d.hinge[1]);
    let closed=d.axis==='x'?(d.hinge_end==='start'?0:Math.PI):(d.hinge_end==='start'?-Math.PI/2:Math.PI/2);
    const leaf=new THREE.Mesh(new THREE.BoxGeometry(d.width,d.height,.038),doorMat);leaf.name=d.id+'-leaf';leaf.position.set(d.width/2,d.height/2,0);leaf.castShadow=true;leaf.receiveShadow=true;pivot.add(leaf);
    pivot.userData={id:d.id,closed,swing:d.swing};glazing.add(pivot);doorPivots.push(pivot);
  }
  const slidingParts=[];
  for(const o of data.openings.filter(o=>['sliding','shower-sliding'].includes(o.kind))){
    for(const suffix of ['glass-a','mullion']){
      const mesh=glazing.getObjectByName(o.id+'-'+suffix);
      if(mesh)slidingParts.push({mesh,axis:o.axis==='x'?'x':'z',origin:mesh.position.clone(),travel:o.width*.47});
    }
  }
  function setDoors(open){for(const part of slidingParts){part.mesh.position.copy(part.origin);if(open)part.mesh.position[part.axis]+=part.travel;}for(const pivot of doorPivots)pivot.rotation.y=pivot.userData.closed-(open?pivot.userData.swing*Math.PI/2:0);}
  setDoors(true);roof.visible=false;
  return {root,masonry,glazing,floors,roof,materials,solids,doorPivots,setDoors};
}
