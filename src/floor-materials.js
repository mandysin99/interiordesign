// Code-native floor patterns matched to user references; not factory scan textures.
export function floorMaterials(THREE){
 const size=768,period=2.4,frac=x=>x-Math.floor(x),hash=(a,b)=>frac(Math.sin(a*127.1+b*311.7)*43758.5453);
 function material(kind,base){const pixels=new Uint8Array(size*size*4);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=i/size*period,z=j/size*period;let along,across,variation=0,seam=false;
  if(kind==='chevron'){
   const lane=Math.floor(x/.4),u=x-lane*.4,dir=lane%2?1:-1,q=z+dir*u,k=Math.floor(q/.15);
   along=(u-dir*z)*.707;across=q*.707;variation=(hash(lane,k)-.5)*9;
   seam=frac(q/.15)<.008||frac(x/.4)<.002;
  }else if(kind==='spc'){
   const a=frac(x/.6)-.5,b=frac(z/.6)-.5,angle=Math.atan2(b,a),sector=Math.floor((angle+Math.PI)/(Math.PI/4)),axis=sector*Math.PI/4+Math.PI/8;
   along=a*Math.cos(axis)+b*Math.sin(axis);across=-a*Math.sin(axis)+b*Math.cos(axis);
   variation=[-17,9,-7,18,-14,11,-3,20][sector];seam=Math.abs(Math.abs(a)-Math.abs(b))<.002||Math.abs(a)<.002||Math.abs(b)<.002;
  }else{
   const lane=Math.floor(x/.15),u=x-lane*.15,k=Math.floor((z+(lane%3)*.4)/1.2);
   along=z;across=u;variation=(hash(lane,k)-.5)*7;seam=u<.0015||frac((z+(lane%3)*.4)/1.2)<.001;
  }
  const wave=across*230+Math.sin(along*4+across*9)*.8+Math.sin(along*13)*.13;
  const grain=Math.sin(wave*6)*1.6+Math.sin(wave*1.9)*2.2+Math.sin(wave*.48)*2.7+(hash(i,j)-.5)*3;
  const v=grain+variation-(seam?13:0);const n=(j*size+i)*4;
  for(let k=0;k<3;k++)pixels[n+k]=Math.max(0,Math.min(255,base[k]+v));pixels[n+3]=255;
 }
 const map=new THREE.DataTexture(pixels,size,size);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(1/period,1/period);map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=8;map.needsUpdate=true;
 return new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.86,metalness:0});
 }
 return {timber:material('straight',[188,163,128]),tile:material('chevron',[173,140,102]),spc:material('spc',[101,78,56])};
}
