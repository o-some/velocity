"use strict";
// Original procedural geometry with bundled AI-generated surface assets.
const WORLD_THEMES=[
  {label:'GOLDEN HOUR',subtitle:'Schnelle Kurven. Warmes Licht.',accent:'#f3b667',sky:['#487db0','#9dc3dc','#ffe0ae'],fog:0xc7bdad,ground:'#667448',sun:0xffd9a3,hemi:0xd5e5ff},
  {label:'NEON HARBOR',subtitle:'Zwischen Skyline und Hafen.',accent:'#4de0ea',sky:['#11162e','#323750','#b3749c'],fog:0x55556d,ground:'#293843',sun:0xffc7a2,hemi:0xb5cee3},
  {label:'DESERT SUNSET',subtitle:'Weite Geraden. Wüstensonne.',accent:'#f3a16b',sky:['#696ca3','#d5a18e','#f9cea0'],fog:0xdcb59a,ground:'#b79b73',sun:0xffcf9a,hemi:0xe4d3c4}
];
const WORLD_TEXTURES=new Map(),CAR_DECALS=new Map();
const CAR_LIVERIES=new Map(),CAR_SIDE_LABELS=new Map(),LIVERY_NAMES=['aurora','nova','helix','titan'];
function liveryTexture3(style){
  if(CAR_LIVERIES.has(style))return CAR_LIVERIES.get(style);
  const colors=['#ff2a36','#22d3ee','#ffd60a','#9bf03a'],t=canvasTexture3(64,64,q=>{q.fillStyle=colors[style];q.fillRect(0,0,64,64);q.strokeStyle=style===0?'#fff':'#141d28';q.lineWidth=8;q.beginPath();q.moveTo(0,55);q.lineTo(64,9);q.stroke()});
  t.name='livery:'+LIVERY_NAMES[style];t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=G3?.r?.capabilities?Math.min(4,G3.r.capabilities.getMaxAnisotropy()):1;
  t.userData={asset:'assets/liveries/'+LIVERY_NAMES[style]+'.webp',state:'loading'};CAR_LIVERIES.set(style,t);
  new THREE.TextureLoader().load(t.userData.asset,loaded=>{t.image=loaded.image;t.needsUpdate=true;t.userData.state='loaded';loaded.dispose()},undefined,()=>{t.userData.state='fallback'});return t;
}
function sideLabelTexture3(style){
  if(!CAR_SIDE_LABELS.has(style))CAR_SIDE_LABELS.set(style,canvasTexture3(512,128,q=>{q.clearRect(0,0,512,128);q.fillStyle='rgba(9,17,28,.9)';q.fillRect(0,0,512,128);q.fillStyle='#fff';q.font='italic 800 87px sans-serif';q.fillText(['01','07','03','04'][style],14,96);q.font='700 45px sans-serif';q.fillText(LIVERY_NAMES[style].toUpperCase(),143,65);q.font='500 20px sans-serif';q.fillText('VELOCITY MOTORSPORT',145,98)}));return CAR_SIDE_LABELS.get(style);
}
const PANORAMA_TEXTURES=new Map(),PANORAMA_NAMES=['mediterranean','harbor','desert'];
function panoramaTexture3(i){
  if(PANORAMA_TEXTURES.has(i))return PANORAMA_TEXTURES.get(i);
  const theme=WORLD_THEMES[i],t=canvasTexture3(512,256,q=>{const g=q.createLinearGradient(0,0,0,256);g.addColorStop(0,theme.sky[0]);g.addColorStop(.5,theme.sky[2]);g.addColorStop(.51,theme.ground);g.addColorStop(1,theme.ground);q.fillStyle=g;q.fillRect(0,0,512,256)});
  t.name='panorama:'+PANORAMA_NAMES[i];t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
  t.userData={asset:'assets/horizons/'+PANORAMA_NAMES[i]+'.webp',state:'loading'};PANORAMA_TEXTURES.set(i,t);
  new THREE.TextureLoader().load(t.userData.asset,loaded=>{t.image=loaded.image;t.needsUpdate=true;t.userData.state='loaded';loaded.dispose()},undefined,()=>{t.userData.state='fallback'});return t;
}
function createAtmosphere3(scene,radius=24000){
  const group=new THREE.Group(),rng=seeded3(83),texture=canvasTexture3(128,64,q=>{q.clearRect(0,0,128,64);for(let i=0;i<12;i++){const x=20+rng()*88,y=25+rng()*16,r=12+rng()*15,g=q.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=g;q.fillRect(x-r,y-r,r*2,r*2)}});
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.45,depthWrite:false,fog:false,side:THREE.DoubleSide});
  for(let i=0;i<8;i++){const a=i*Math.PI/4+.3,r=radius*.75,p=new THREE.Mesh(new THREE.PlaneGeometry(radius*.28,radius*.055),material);p.position.set(Math.cos(a)*r,radius*(.11+rng()*.09),Math.sin(a)*r);p.lookAt(0,p.position.y,0);group.add(p)}
  group.renderOrder=-.5;scene.add(group);return{group,material,phase:0};
}
function animateAtmosphere3(a,dt,theme,rain,enabled,position){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  a.group.visible=enabled;if(!enabled)return;
  if(!reduced)a.phase+=Math.min(.05,Math.max(0,dt))*.003;
  a.group.rotation.y=a.phase;a.material.color.set(theme===1?'#beb7d8':theme===2?'#f6c49d':'#fff0dd');a.material.opacity=rain?.5:theme===1?.17:.3;
  if(position)a.group.position.copy(position);
}
let CAR_ENV=null,CARBON_MAP=null,ROAD_MAP=null;
const SURFACE_TEXTURES=new Map();
function assetTexture3(name){
  if(SURFACE_TEXTURES.has(name))return SURFACE_TEXTURES.get(name);
  const colors={asphalt:'#67686b',grass:'#697d3f',sand:'#bc9f72',bark:'#817260',foliage:'#608339','harbor-facade-v1':'#283d50'};
  const t=canvasTexture3(32,32,q=>{q.fillStyle=colors[name]||'#888';q.fillRect(0,0,32,32)});
  t.name='surface:'+name;t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.anisotropy=typeof G3!=='undefined'&&G3?.r?.capabilities?Math.min(4,G3.r.capabilities.getMaxAnisotropy()):1;
  t.userData={asset:'assets/textures/'+name+'.webp',state:'loading'};SURFACE_TEXTURES.set(name,t);
  // A valid small fallback is renderable immediately, including file:// or a failed image request.
  new THREE.TextureLoader().load(t.userData.asset,loaded=>{t.image=loaded.image;t.needsUpdate=true;t.userData.state='loaded';loaded.dispose()},undefined,()=>{t.userData.state='fallback'});
  return t;
}
function surfaceUV3(geometry,tileSize){
  const p=geometry.attributes.position,uv=[];
  for(let i=0;i<p.count;i++)uv.push(p.getX(i)/tileSize,p.getZ(i)/tileSize);
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
}
function applySurface3(mesh,name,tileSize=170,brightness=.95){
  surfaceUV3(mesh.geometry,tileSize);
  const colors=mesh.geometry.attributes.color;
  if(colors)for(let i=0;i<colors.count;i++)colors.setXYZ(i,brightness,brightness,brightness);
  mesh.material.dispose();mesh.material=new THREE.MeshStandardMaterial({map:assetTexture3(name),vertexColors:!!colors,roughness:.9,metalness:0,side:THREE.DoubleSide});
}
function treeMaterials3(){return[
  new THREE.MeshLambertMaterial({map:assetTexture3('bark'),vertexColors:true}),
  new THREE.MeshLambertMaterial({map:assetTexture3('foliage'),vertexColors:true})
]}
function palmFrond3(){
  const p=[],uv=[],ix=[];for(let i=0;i<=10;i++){const u=i/10,width=Math.sin(Math.PI*u)*9+.25,y=14*Math.sin(Math.PI*u)-26*u*u;
    p.push(u*68,y,-width,u*68,y,width);uv.push(u*2,0,u*2,1);if(i<10){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function canvasTexture3(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}
function seeded3(seed){let s=seed;return()=>((s=(s*16807)%2147483647)/2147483647)}
function vehicleEnvironment3(){
  if(CAR_ENV)return CAR_ENV;
  const imgs=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d'),g=q.createLinearGradient(0,0,0,64);g.addColorStop(0,i===2?'#ffffff':'#cbd7e6');g.addColorStop(.42,'#71879d');g.addColorStop(.52,'#1a2431');g.addColorStop(1,'#080d14');q.fillStyle=g;q.fillRect(0,0,64,64);q.fillStyle='rgba(255,255,255,.55)';q.fillRect(4,8,8,24);return c});
  CAR_ENV=new THREE.CubeTexture(imgs);CAR_ENV.encoding=THREE.sRGBEncoding;CAR_ENV.needsUpdate=true;return CAR_ENV;
}
function carbonTexture3(){if(!CARBON_MAP){CARBON_MAP=canvasTexture3(256,256,q=>{q.fillStyle='#11151a';q.fillRect(0,0,256,256);for(let y=0;y<256;y+=8)for(let x=0;x<256;x+=8){q.fillStyle=(x+y)%16===0?'#282d34':'#1b2027';q.fillRect(x,y,7,7);q.fillStyle='#343a42';for(let k=1;k<7;k+=2)if((x+y)%16===0)q.fillRect(x+k,y,1,6);else q.fillRect(x,y+k,6,1)}});CARBON_MAP.wrapS=CARBON_MAP.wrapT=THREE.RepeatWrapping;CARBON_MAP.repeat.set(3,2)}return CARBON_MAP}
function decalTexture3(style){if(!CAR_DECALS.has(style))CAR_DECALS.set(style,canvasTexture3(512,512,q=>{q.clearRect(0,0,512,512);q.fillStyle='#fff';q.font='italic 800 300px sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText(['01','07','03','04'][style],256,220);q.font='700 56px sans-serif';q.fillText(['AURORA','NOVA','HELIX','TITAN'][style],256,420)}));return CAR_DECALS.get(style)}
function loftVehicle3(sections,material,parent){
  // Rounded cross-sections, with a duplicated UV seam and separate flat end caps.
  const p=[],ix=[],uv=[],ring=17,x0=sections[0][0],length=sections[sections.length-1][0]-x0;
  sections.forEach(([x,w,h,y])=>{const r=Math.min(w*.25,h*.25,1.4),points=[];
    for(const [z,yy,a]of[[-w+r,y+r,Math.PI],[w-r,y+r,Math.PI*1.5],[w-r,y+h-r,0],[-w+r,y+h-r,Math.PI*.5]])for(let k=0;k<4;k++){const angle=a+k*Math.PI/6;points.push([z+Math.cos(angle)*r,yy+Math.sin(angle)*r])}
    points.push(points[0]);points.forEach(([z,yy],k)=>{p.push(x,yy,z);uv.push((x-x0)/length,k/16)});
  });
  for(let i=0;i<sections.length-1;i++)for(let k=0;k<16;k++){const a=i*ring+k,b=a+1,c=a+ring,d=c+1;ix.push(a,c,b,b,c,d)}
  for(const [section,reverse]of[[0,false],[sections.length-1,true]]){const start=p.length/3,offset=section*ring;for(let k=0;k<16;k++){p.push(...p.slice((offset+k)*3,(offset+k)*3+3));uv.push(.5+p[(offset+k)*3+2]/(sections[section][1]*2),.5+(p[(offset+k)*3+1]-sections[section][3]-sections[section][2]/2)/sections[section][2])}for(let k=1;k<15;k++)ix.push(...(reverse?[start,start+k+1,start+k]:[start,start+k,start+k+1]))}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
  const normals=g.attributes.normal;for(let i=0;i<sections.length;i++){const a=i*ring,b=a+16,n=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z)}
  const m=new THREE.Mesh(g,material);parent.add(m);return m;
}
function sculptVehicle3(control,material,parent){
  const sections=[],smooth=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
  for(let i=0;i<control.length-1;i++)for(let j=0;j<4;j++){const t=j/4,a=control[Math.max(0,i-1)],b=control[i],c=control[i+1],d=control[Math.min(control.length-1,i+2)];sections.push([b[0]+(c[0]-b[0])*t,Math.max(.3,smooth(a[1],b[1],c[1],d[1],t)),Math.max(.25,smooth(a[2],b[2],c[2],d[2],t)),smooth(a[3],b[3],c[3],d[3],t)])}sections.push(control[control.length-1]);
  const position=[],uv=[],index=[],ring=33,x0=sections[0][0],length=sections[sections.length-1][0]-x0;
  sections.forEach(([x,w,h,y])=>{for(let k=0;k<=32;k++){const a=-Math.PI/2+k*Math.PI/16,s=Math.sin(a),c=Math.cos(a);position.push(x,y+h*.42+Math.sign(s)*Math.pow(Math.abs(s),.88)*h*(s>0?.58:.42),Math.sign(c)*Math.pow(Math.abs(c),.88)*w);uv.push((x-x0)/length,k/32)}});
  for(let i=0;i<sections.length-1;i++)for(let k=0;k<32;k++){const a=i*ring+k;index.push(a,a+ring,a+1,a+1,a+ring,a+ring+1)}
  for(const [s,reverse]of[[0,false],[sections.length-1,true]]){const start=position.length/3,offset=s*ring,[x,w,h,y]=sections[s];for(let k=0;k<32;k++){const n=(offset+k)*3;position.push(position[n],position[n+1],position[n+2]);uv.push((position[n+2]/w+1)/2,(position[n+1]-y)/h)}for(let k=1;k<31;k++)index.push(...(reverse?[start,start+k+1,start+k]:[start,start+k,start+k+1]))}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv.map(v=>Math.max(0,Math.min(1,v))),2));geometry.setIndex(index);geometry.computeVertexNormals();const normals=geometry.attributes.normal;
  for(let i=0;i<sections.length;i++){const a=i*ring,b=a+32,n=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z)}const mesh=new THREE.Mesh(geometry,material);mesh.name='smooth-sculpted-panel';parent.add(mesh);return mesh;
}
function bevelBox3(){
  const s=new THREE.Shape(),a=.44,r=.06;s.moveTo(-a,-.5);s.lineTo(a,-.5);s.quadraticCurveTo(.5,-.5,.5,-a);s.lineTo(.5,a);s.quadraticCurveTo(.5,.5,a,.5);s.lineTo(-a,.5);s.quadraticCurveTo(-.5,.5,-.5,a);s.lineTo(-.5,-a);s.quadraticCurveTo(-.5,-.5,-a,-.5);
  const g=new THREE.ExtrudeGeometry(s,{depth:.88,steps:1,curveSegments:2,bevelEnabled:true,bevelThickness:r,bevelSize:.035,bevelSegments:2});g.translate(0,0,-.44);const b=new THREE.Box3().setFromBufferAttribute(g.attributes.position),size=b.getSize(new THREE.Vector3());g.scale(1/size.x,1/size.y,1/size.z);const p=g.attributes.position,n=g.attributes.normal,uv=[];for(let k=0;k<p.count;k++){const axis=Math.abs(n.getX(k))>Math.abs(n.getY(k))&&Math.abs(n.getX(k))>Math.abs(n.getZ(k))?'x':Math.abs(n.getY(k))>Math.abs(n.getZ(k))?'y':'z';uv.push((axis==='x'?p.getZ(k):p.getX(k))+.5,(axis==='y'?p.getZ(k):p.getY(k))+.5)}g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;
}
const TYRE_LABELS=new Map();
function tyreLabel3(style){if(!TYRE_LABELS.has(style))TYRE_LABELS.set(style,canvasTexture3(256,256,q=>{q.clearRect(0,0,256,256);q.strokeStyle=['#f35159','#58d9e7','#efcc50','#a7db55'][style];q.lineWidth=3;q.beginPath();q.arc(128,128,109,0,Math.PI*2);q.stroke();q.fillStyle='#b1b7bc';q.font='700 17px sans-serif';q.textAlign='center';q.fillText('VELOCITY',128,44);q.font='600 12px sans-serif';q.fillText('RACING SLICK',128,218)}));return TYRE_LABELS.get(style)}
function buildCar(col,col2,ghost=false,style=0){
  style=Math.max(0,Math.min(3,style));
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const environment=G3?.showroom?.environment||vehicleEnvironment3();
  const standard=(color,metalness=.45,roughness=.3)=>new THREE.MeshStandardMaterial({color,metalness,roughness,envMap:environment,envMapIntensity:.8,transparent:!!ghost,opacity:ghost?.32:1});
  const mB=ghost?standard('#9be7ff'):new THREE.MeshPhysicalMaterial({color:'#fff',map:liveryTexture3(style),metalness:.16,roughness:.18,clearcoat:.98,clearcoatRoughness:.09,envMap:environment,envMapIntensity:.75}),m2=standard(ghost?'#fff':col2,.08,.2),carbon=new THREE.MeshPhysicalMaterial({color:'#fff',map:carbonTexture3(),metalness:.14,roughness:.36,clearcoat:.35,clearcoatRoughness:.22,envMap:environment,envMapIntensity:.65,transparent:!!ghost,opacity:ghost?.32:1}),rubber=standard('#0c0d10',0,.86),rim=standard('#626b77',.9,.18),helmet=standard('#f0f2f4',.1,.16);
  const BG=bevelBox3(),bx=(w,h,d,m,x,y,z,par=body)=>{const q=new THREE.Mesh(BG,m);q.scale.set(w,h,d);q.position.set(x,y,z);par.add(q);return q};
  const shapes=[
    [[-34,3,4,6],[-22,6,11,6],[-6,7,6,7],[10,4.8,5,7],[35,2.6,3,6],[46,1.8,2,6]],
    [[-33,3.6,4,6],[-20,5.2,8,6],[-6,6.4,6,7],[12,4.4,5,7],[38,2.2,2.8,6],[46,1.5,2,6]],
    [[-34,2.8,4,6],[-21,5,12,6],[-6,6,6,7],[15,3.5,4.4,7],[40,1.8,2.2,6],[46,1.4,2,6]],
    [[-34,4.5,5,6],[-22,7,9,6],[-6,8,7,7],[12,5.8,5,7],[34,3.2,3,6],[46,2.3,2,6]]
  ];
  sculptVehicle3(shapes[style],mB,body);
  // Sculpted engine cover and floor; the collision footprint stays unchanged.
  sculptVehicle3([[-34,2.8,1,12],[-24,4.4,7+style%2,12],[-15,3.3,9,12],[-9,2.2,5,12]],mB,body);
  bx(69,1.8,30,carbon,-2,3.5,0);const nose=bx(10,2.5,3.3,mB,46,6.5,0);
  const pS=[];
  for(const s of[1,-1]){
    const pod=new THREE.Group();pod.position.set(-4,9,s*11);body.add(pod);
    const podGeo=sculptVehicle3([[-13,2.1,2,-3],[-9,4.7,5,-3],[4,4.5,5,-3],[13,2.5,3,-3]],mB,pod);
    // Damage contract uses the same dimensions as the retained animation code.
    pod.scale.set(26,8,9);podGeo.scale.set(1/26,1/8,1/9);pS.push(pod);
    const openingGeometry=new THREE.CircleGeometry(1,24);openingGeometry.rotateY(Math.PI/2);const opening=new THREE.Mesh(openingGeometry,standard('#06090d',.05,.62));opening.scale.set(1/26,.75/8,1.75/9);opening.position.set(13.03/26,-1.65/8,0);opening.name='sidepod-intake';pod.add(opening);
    if(!ghost){const badge=new THREE.Mesh(new THREE.PlaneGeometry(19,4.7),new THREE.MeshBasicMaterial({map:sideLabelTexture3(style),transparent:true,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1}));badge.name='team-side-label';badge.scale.set(1/26,1/8,1/9);badge.position.set(0,-.5/8,s*4.8/9);badge.rotation.y=s<0?Math.PI:0;pod.add(badge)}
    bx(7.5,3.2,.7,carbon,7,10,s*15.1);bx(25,.8,1.2,m2,-6,13.7,s*14.7);
    bx(3,2,3,m2,5,17.7,s*7.5);bx(29,.6,1.3,m2,-3,4.2,s*16);
  }
  // Cockpit recess, driver, halo and mirrors.
  const pit=new THREE.Mesh(new THREE.SphereGeometry(5.8,16,10),carbon);pit.scale.set(1.45,.38,.76);pit.position.set(-2,13.6,0);body.add(pit);
  const hm=new THREE.Mesh(new THREE.SphereGeometry(3.3,32,20),helmet);hm.position.set(-2.5,16.3,0);body.add(hm);
  const visor=new THREE.Mesh(new THREE.SphereGeometry(3.38,32,16,0,Math.PI*2,Math.PI*.36,Math.PI*.22),standard('#111a26',.7,.1));visor.position.copy(hm.position);body.add(visor);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(5.2,.55,12,48,Math.PI*1.4),carbon);halo.rotation.x=Math.PI/2;halo.rotation.z=-Math.PI*.2;halo.position.set(-1,20.1,0);halo.scale.set(1.25,1,1);body.add(halo);bx(.75,6,.75,carbon,5,17.5,0);
  const intakeGeometry=new THREE.SphereGeometry(3.1,24,16);for(let k=0;k<intakeGeometry.attributes.uv.count;k++){const u=intakeGeometry.attributes.uv;u.setXY(k,Math.max(0,Math.min(1,u.getX(k))),Math.max(0,Math.min(1,u.getY(k))))}const intake=new THREE.Mesh(intakeGeometry,mB);intake.scale.set(1.6,.9,.75);intake.position.set(-10.5,22,0);body.add(intake);const airGeo=new THREE.CircleGeometry(1,24);airGeo.rotateY(Math.PI/2);const air=new THREE.Mesh(airGeo,standard('#04070a',0,.8));air.position.set(-5.5,22,0);air.scale.set(1,1.6,1.25);body.add(air);
  const fin=bx(style===2?21:15,style===0?6:style===2?8:3,1,m2,-24,22,0);fin.rotation.z=-.12;
  if(style===1){for(const s of[-1,1])bx(21,2,1,m2,-22,19,s*4.3)}
  if(style===3){for(const s of[-1,1])bx(14,1.4,4,carbon,-13,14.4,s*12)}
  const fw=new THREE.Group();fw.position.set(50,3.5,0);body.add(fw);
  for(const [x,y,w]of[[-2,0,40],[1,2,36],[3,3.7,30]]){const f=sculptVehicle3([[-2,w*.47,.15,-.1],[-1.1,w*.5,.7,-.1],[1.2,w*.5,.45,-.1],[2,w*.46,.12,-.1]],m2,fw);f.position.set(x,y,0);f.rotation.z=-.1}
  for(const s of[-1,1])bx(9,5,1,mB,0,1.8,s*19.5,fw);
  const rw=new THREE.Group();rw.position.set(-40,20,0);body.add(rw);
  bx(8,1.4,31,m2,0,0,0,rw);bx(5,.9,29,mB,0,5,0,rw);for(const s of[-1,1])bx(11,12,.8,mB,0,1,s*15.7,rw);bx(2,11,2,carbon,1,-5,0,rw);
  const wl=[];
  for(const [x,y,z,r,w]of[[-26,8,17,8,9],[-26,8,-17,8,9],[26,7,16.5,7,7],[26,7,-16.5,7,7]]){
    const st=new THREE.Group(),sp=new THREE.Group();st.position.set(x,y,z);st.add(sp);g.add(st);
    const profile=[[.53,-.5],[.84,-.5],[.96,-.39],[1,-.22],[1,.22],[.96,.39],[.84,.5],[.53,.5]].map(([rr,zz])=>new THREE.Vector2(rr*r,zz*w));
    const tyre=new THREE.Mesh(new THREE.LatheGeometry(profile,40),rubber);tyre.name='rounded-slick-tyre';tyre.rotation.x=Math.PI/2;sp.add(tyre);
    const sign=Math.sign(z),face=sign*(w/2+.12),disc=new THREE.Mesh(new THREE.CylinderGeometry(r*.55,r*.55,.22,32),standard('#30343b',.65,.48));disc.rotation.x=Math.PI/2;disc.position.z=face-sign*.28;sp.add(disc);
    const inner=new THREE.Mesh(new THREE.CylinderGeometry(r*.54,r*.54,.3,32),standard('#20252e',.65,.4));inner.rotation.x=Math.PI/2;inner.position.z=-sign*(w/2-.15);sp.add(inner);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(r*.17,r*.17,.6,16),rim);hub.rotation.x=Math.PI/2;hub.position.z=face;sp.add(hub);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(r*.55,.23,5,32),rim);edge.position.z=face;sp.add(edge);
    const spokes=new THREE.InstancedMesh(BG,rim,8),matrix=new THREE.Object3D();spokes.name='forged-wheel-spokes';for(let k=0;k<8;k++){const a=k*Math.PI/4;matrix.position.set(Math.cos(a)*r*.36,Math.sin(a)*r*.36,face);matrix.rotation.z=a;matrix.scale.set(r*.38,.42,.35);matrix.updateMatrix();spokes.setMatrixAt(k,matrix.matrix)}spokes.instanceMatrix.needsUpdate=true;sp.add(spokes);
    if(!ghost){const wall=new THREE.Mesh(new THREE.RingGeometry(r*.6,r*.91,40),new THREE.MeshBasicMaterial({map:tyreLabel3(style),transparent:true,depthWrite:false,toneMapped:false}));wall.position.z=sign*(w/2+.15);if(sign<0)wall.rotation.y=Math.PI;sp.add(wall)}
    bx(1.5,r*.55,1.2,m2,r*.42,0,face-sign*.35,st);wl.push({st,sp,r,f:x>0});
  }
  const detail=new THREE.Group();detail.name='aero-detail';body.add(detail);
  const links=[];for(const side of[-1,1])for(const x of[-26,26])for(const y of[5.5,10])for(const end of[-1,1])links.push([new THREE.Vector3(x+end*(x>0?9:11),y,side*5.5),new THREE.Vector3(x,x>0?7.5:8.5,side*(x>0?16.5:17))]);
  const suspension=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,10),carbon,links.length),rodMatrix=new THREE.Object3D();suspension.name='sculpted-wishbones';links.forEach(([a,b],k)=>{const vector=b.clone().sub(a);rodMatrix.position.copy(a).add(b).multiplyScalar(.5);rodMatrix.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector.clone().normalize());rodMatrix.scale.set(.3,vector.length(),.3);rodMatrix.updateMatrix();suspension.setMatrixAt(k,rodMatrix.matrix)});suspension.instanceMatrix.needsUpdate=true;detail.add(suspension);
  for(const s of[-1,1]){for(let k=0;k<4;k++){const l=bx(4,.35,2.5,carbon,-7+k*3.5,14.5,s*11,detail);l.rotation.z=-.12}for(let k=0;k<3;k++)bx(13,.5,.5,carbon,18,3.8+k*.75,s*(8+k*2.5),detail)}
  for(let k=-2;k<=2;k++)bx(14,4,.5,carbon,-33,4,k*4.5,detail);
  const scr=[bx(5,4.2,6,carbon,49,6.6,0),bx(24,5,.6,carbon,-4,9,15.8),bx(2,5,14,carbon,-44.5,6,0),bx(24,5,.6,carbon,-4,9,-15.8)];scr.forEach(m=>m.visible=false);
  const bl=bx(1.5,3,6,new THREE.MeshBasicMaterial({color:0x5a0f0f}),-27,15,0);
  if(!ghost){
    const decal=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshBasicMaterial({map:decalTexture3(style),transparent:true,depthWrite:false}));decal.rotation.x=-Math.PI/2;decal.position.set(22,11,0);body.add(decal);
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(108,50),new THREE.MeshBasicMaterial({map:softShadowTexture3(),transparent:true,opacity:.7,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=2.1;g.add(sh);
  }
  return{g,body,fw,rw,wl,bl,mB,nose,pS,scr,detail,base:new THREE.Color(ghost?'#9be7ff':'#fff'),teamColor:new THREE.Color(col),style};
}
let SOFT_SHADOW=null;
function softShadowTexture3(){if(!SOFT_SHADOW)SOFT_SHADOW=canvasTexture3(64,64,q=>{const gr=q.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(.5,'rgba(0,0,0,.65)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(0,0,64,64)});return SOFT_SHADOW}
function disposeVehicle3(v){const geos=new Set(),mats=new Set();v.g.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m))});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose())}
function applyRoadMaterial3(mesh,T){
  ROAD_MAP=assetTexture3('asphalt');applySurface3(mesh,'asphalt',32,.76);mesh.material.roughness=.88;mesh.material.metalness=.02;mesh.material.bumpMap=ROAD_MAP;mesh.material.bumpScale=.08;
}
const HARBOR_FACADE_MATERIALS=[];
let TRACK_PAINT_MAP=null;
function paintCircuitSurface3(mesh,vertical=false){
  if(!TRACK_PAINT_MAP)TRACK_PAINT_MAP=canvasTexture3(128,128,q=>{const rng=seeded3(956);q.fillStyle='#f1f1f1';q.fillRect(0,0,128,128);for(let k=0;k<1300;k++){q.fillStyle=rng()>.5?'#dedede':'#fafafa';q.fillRect(Math.floor(rng()*128),Math.floor(rng()*128),1+rng()*2,1)}});
  TRACK_PAINT_MAP.wrapS=TRACK_PAINT_MAP.wrapT=THREE.RepeatWrapping;
  const p=mesh.geometry.attributes.position,uv=[];for(let k=0;k<p.count;k++)uv.push(vertical?(p.getX(k)+p.getZ(k))/48:p.getX(k)/32,vertical?p.getY(k)/32:p.getZ(k)/32);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  mesh.material.dispose();mesh.material=new THREE.MeshStandardMaterial({map:TRACK_PAINT_MAP,vertexColors:true,roughness:vertical?.76:.68,metalness:0,side:THREE.DoubleSide});mesh.name=vertical?'painted-concrete-barrier':'painted-racing-kerb';
}
function harborFacadeMaterial3(style){
  if(!HARBOR_FACADE_MATERIALS[style])HARBOR_FACADE_MATERIALS[style]=new THREE.MeshPhysicalMaterial({map:assetTexture3('harbor-facade-v1'),color:['#d6e1ed','#b3ced5','#c5c3d3'][style],metalness:.12,roughness:.24,clearcoat:.55,clearcoatRoughness:.14,envMap:vehicleEnvironment3(),envMapIntensity:.65,emissive:'#866444',emissiveMap:assetTexture3('harbor-facade-v1'),emissiveIntensity:.055});
  return HARBOR_FACADE_MATERIALS[style];
}
function harborTower3(x,z,w,height,d,angle,style,parent){
  const tower=new THREE.Group();tower.name='realistic-harbor-tower';tower.position.set(x,0,z);tower.rotation.y=angle;
  const concrete=new THREE.MeshStandardMaterial({color:'#555e69',roughness:.78}),metal=new THREE.MeshStandardMaterial({color:'#7e8991',metalness:.75,roughness:.32,envMap:vehicleEnvironment3(),envMapIntensity:.35}),glass=harborFacadeMaterial3(style);
  const block=(bw,bh,bd,y,m,name)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),m);o.position.y=y;o.name=name;tower.add(o);return o};
  block(w+8,24,d+8,12,concrete,'tower-stone-plinth');
  const h=height-24,g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;
  // Each of the FOUR walls has world-scale UVs; roofs never get window graphics.
  for(const face of[0,1,4,5])for(let j=0;j<4;j++){const k=face*4+j;uv.setXY(k,uv.getX(k)*(face<2?d:w)/128+style*.25,uv.getY(k)*h/256)}
  const shaft=new THREE.Mesh(g,[glass,glass,metal,concrete,glass,glass]);shaft.position.y=24+h/2;shaft.name='four-sided-curtain-wall';tower.add(shaft);
  block(w+3,3,d+3,height+1.5,metal,'tower-roof-cap');
  const details=new THREE.Group();details.name='tower-rooftop-detail';tower.add(details);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.45,12,d*.4),concrete);roof.position.set(-w*.15,height+9,-d*.1);details.add(roof);
  const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.65,.9,24,6),metal);antenna.position.set(w*.28,height+16,d*.22);details.add(antenna);
  // Recessed corners visually break the monolithic blocks without glass transparency.
  const posts=new THREE.InstancedMesh(new THREE.BoxGeometry(2,h,2),metal,4),dummy=new THREE.Object3D();let n=0;
  for(const a of[-1,1])for(const b of[-1,1]){dummy.position.set(a*w/2,24+h/2,b*d/2);dummy.updateMatrix();posts.setMatrixAt(n++,dummy.matrix)}posts.instanceMatrix.needsUpdate=true;posts.name='tower-corner-mullions';details.add(posts);
  parent.add(tower);return tower;
}
let FENCE_MAP=null;
function applyFence3(mesh,T){
  if(!FENCE_MAP){FENCE_MAP=canvasTexture3(128,128,q=>{q.clearRect(0,0,128,128);q.strokeStyle='#87939e';q.lineWidth=2;for(let k=-128;k<=256;k+=16){q.beginPath();q.moveTo(k,0);q.lineTo(k+128,128);q.stroke();q.beginPath();q.moveTo(k,0);q.lineTo(k-128,128);q.stroke()}q.fillStyle='#a4adb6';q.fillRect(0,0,128,3);q.fillRect(0,124,128,4)});FENCE_MAP.wrapS=FENCE_MAP.wrapT=THREE.RepeatWrapping}
  const uv=[];for(let k=0;k<=T.N;k++)uv.push(k*T.ds/32,0,k*T.ds/32,1);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mesh.material.dispose();mesh.material=new THREE.MeshStandardMaterial({map:FENCE_MAP,alphaTest:.35,side:THREE.DoubleSide,metalness:.4,roughness:.62});mesh.name='woven-catch-fence';
}
function worldTexture3(i,kind){return kind==='sky'?panoramaTexture3(i):assetTexture3(['grass','asphalt','sand'][i])}
function setWorldTheme3(g,T,rain){
  const t=WORLD_THEMES[T.i];g.fog.color.setHex(rain?0x6b7482:t.fog);g.fog.near=T.i===1?1900:3300;g.fog.far=T.i===1?10500:16000;
  g.sky.material.map=worldTexture3(T.i,'sky');g.sky.material.color.setHex(rain?0x8895a4:0xffffff);g.sky.material.needsUpdate=true;
  g.sky.material.toneMapped=false;
  g.gm.material.map=worldTexture3(T.i,'ground');g.gm.material.needsUpdate=true;g.hemi.color.setHex(t.hemi);g.hemi.groundColor.set(T.i===2?'#806449':'#314135');g.hemi.intensity=rain?.72:T.i===1?.85:1.05;
  g.sun.color.setHex(t.sun);g.sun.intensity=rain?.35:T.i===1?.65:1.5;g.sun.position.set(-1700,1700,1200);
  if(g.cur){g.cur.asph.material.color.setHex(rain?0x8992a3:0xffffff);g.cur.asph.material.roughness=rain?.35:.88;if(g.cur.shade)g.cur.shade.opacity=rain?.25:.6}
}
function decorateCircuit3(T,grp){
  const i=T.i,t=WORLD_THEMES[i],rn=seeded3(71+i),BG=new THREE.BoxGeometry(1,1,1),mats=new Map(),towerDetails=[];
  const mat=(c,light=false)=>{const k=c+light;if(!mats.has(k))mats.set(k,light?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}));return mats.get(k)};
  const box=(x,y,z,w,h,d,c,rot=0,light=false)=>{const m=new THREE.Mesh(BG,mat(c,light));m.scale.set(w,h,d);m.position.set(x,y,z);m.rotation.y=rot;grp.add(m);return m};
  const safe=(x,z,margin)=>T.P.every(p=>(p.x-x)**2+(p.y-z)**2>margin*margin);
  const local=(p,side,d)=>({x:p.x+p.nx*side*d,z:p.y+p.ny*side*d});
  // Trackside brake markers, painted starting grid, branded panels.
  const labelCache=new Map(),label=(text,color='#fff')=>{const k=text+color;if(!labelCache.has(k))labelCache.set(k,canvasTexture3(256,64,q=>{q.fillStyle='#101620';q.fillRect(0,0,256,64);q.fillStyle=color;q.font='italic 800 37px sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText(text,128,33)}));return labelCache.get(k)};
  for(let k=0;k<T.N;k+=Math.floor(T.N/18)){
    const p=T.P[k],a=local(p,1,TW/2+92),panel=new THREE.Mesh(new THREE.PlaneGeometry(150,22),new THREE.MeshBasicMaterial({map:label(k%2?'VELOCITY':'EVOLUTION',t.accent),side:THREE.DoubleSide}));panel.position.set(a.x,27,a.z);panel.rotation.y=-p.t-Math.PI/2;grp.add(panel);
  }
  for(let k=0;k<8;k++){const p=T.P[(T.N-2-k*3+T.N)%T.N],a=local(p,k%2?1:-1,38);box(a.x,1.65,a.z,28,.1,18,'#dde1df',-p.t)}
  const turns=[];for(let k=35;k<T.N;k+=35)if(T.vl[k]<850)turns.push(k);
  for(const k of turns.slice(0,5))for(const [n,ds]of[[150,5],[100,3],[50,1]]){const p=T.P[(k-ds+T.N)%T.N],a=local(p,-1,TW/2+70),m=new THREE.Mesh(new THREE.PlaneGeometry(18,22),new THREE.MeshBasicMaterial({map:label(String(n)),side:THREE.DoubleSide}));m.position.set(a.x,28,a.z);m.rotation.y=-p.t+Math.PI/2;grp.add(m)}
  // A light racing guide uses per-point colors to show braking sections.
  const linePos=[],lineCol=[];T.P.forEach((p,k)=>{linePos.push(p.x,2.7,p.y);const c=new THREE.Color(T.vl[k]<750?'#ff735b':T.vl[k]<1000?'#f5d061':'#75d8b1');lineCol.push(c.r,c.g,c.b)});linePos.push(...linePos.slice(0,3));lineCol.push(...lineCol.slice(0,3));const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(linePos,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lineCol,3));const guide=new THREE.Line(lg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.66}));grp.add(guide);
  if(i===0){
    // Terracotta villas and cypress trees complement the retained woodland.
    for(let k=0;k<T.N;k+=38){const p=T.P[k],a=local(p,-1,750+rn()*300);if(!safe(a.x,a.z,420))continue;const h=70+rn()*60;box(a.x,h/2,a.z,115,h,85,'#cbbba0',-p.t);box(a.x,h+7,a.z,126,15,98,'#80564a',-p.t);box(a.x+Math.cos(p.t)*30,32,a.z+Math.sin(p.t)*30,14,28,88,'#756b54',-p.t);}
    const cone=new THREE.ConeGeometry(25,185,9),cm=new THREE.MeshLambertMaterial({map:assetTexture3('foliage'),color:'#c5d5ba'});for(let k=0;k<T.N;k+=12){const p=T.P[k],a=local(p,1,280+rn()*90);if(!safe(a.x,a.z,235))continue;const tree=new THREE.Mesh(cone,cm);tree.position.set(a.x,102,a.z);grp.add(tree);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(4,6,24,7),new THREE.MeshLambertMaterial({map:assetTexture3('bark')}));trunk.position.set(a.x,12,a.z);grp.add(trunk)}
  }else if(i===1){
    // Harbor skyline, container yards and unmistakable cyan/magenta edges.
    for(let k=0;k<T.N;k+=16){const p=T.P[k],a=local(p,k%32?1:-1,650+rn()*500);if(!safe(a.x,a.z,390))continue;const hh=180+rn()*530,w=90+rn()*130,d=100+rn()*100;
      const tower=harborTower3(a.x,a.z,w,hh,d,-p.t,k%3,grp);towerDetails.push(tower.children.find(o=>o.name==='tower-rooftop-detail'));
    }
    for(let k=0;k<T.N;k+=23){const p=T.P[k],a=local(p,1,300);if(!safe(a.x,a.z,240))continue;box(a.x,65,a.z,3,130,3,'#728399');box(a.x,131,a.z,18,3,6,'#8de8ef',-p.t,true)}
    for(let k=70;k<T.N;k+=80){const p=T.P[k],a=local(p,-1,530);if(!safe(a.x,a.z,430))continue;for(let j=0;j<3;j++)box(a.x+j*100,20,a.z,94,40,38,['#825746','#356976','#625478'][j],-p.t)}
    for(const s of[-1,1]){const neon=strip(T,p=>{const a=s*(TW/2+2),b=s*(TW/2+4);return[p.x+p.nx*a,2,p.y+p.ny*a,p.x+p.nx*b,2,p.y+p.ny*b]},()=>new THREE.Color(s<0?'#6dcddc':'#d78ba9'));neon.material.dispose();neon.material=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});grp.add(neon)}
  }else{
    // Distant low-poly dunes, palms, hospitality tents and a desert tower.
    const duneG=new THREE.SphereGeometry(1,18,9),duneM=new THREE.MeshLambertMaterial({map:assetTexture3('sand'),color:'#d2c6ae'});for(let k=0;k<duneG.attributes.uv.count;k++){const a=duneG.attributes.uv;a.setXY(k,a.getX(k)*8,a.getY(k)*4)}for(let k=0;k<T.N;k+=38){const p=T.P[k],a=local(p,k%76?-1:1,1500+rn()*800);if(!safe(a.x,a.z,1000))continue;const d=new THREE.Mesh(duneG,duneM);d.position.set(a.x,-50,a.z);d.scale.set(600+rn()*550,160+rn()*150,500+rn()*450);grp.add(d)}
    const palmG=palmFrond3(),palmM=new THREE.MeshLambertMaterial({map:assetTexture3('foliage'),side:THREE.DoubleSide,color:'#bdcfa9'}),trunkG=new THREE.CylinderGeometry(3,5,95,7),trunkM=new THREE.MeshLambertMaterial({map:assetTexture3('bark')});for(let k=0;k<T.N;k+=18){const p=T.P[k],a=local(p,1,300+rn()*180);if(!safe(a.x,a.z,250))continue;const trunk=new THREE.Mesh(trunkG,trunkM);trunk.position.set(a.x,47,a.z);grp.add(trunk);for(let j=0;j<7;j++){const leaf=new THREE.Mesh(palmG,palmM);leaf.position.set(a.x,95,a.z);leaf.rotation.y=j*Math.PI*2/7;grp.add(leaf)}}
    const p=T.P[0],a=local(p,-1,680);for(let j=0;j<4;j++){const xx=a.x+Math.cos(p.t)*j*140,zz=a.z+Math.sin(p.t)*j*140;box(xx,32,zz,100,64,85,'#ccbca1',-p.t);const roof=new THREE.Mesh(new THREE.ConeGeometry(78,45,4),mat('#e9ddc5'));roof.position.set(xx,87,zz);roof.rotation.y=-p.t+Math.PI/4;grp.add(roof)}
    const b=local(T.P[Math.floor(T.N*.32)],1,850);if(safe(b.x,b.z,450)){for(let j=0;j<6;j++){const m=new THREE.Mesh(new THREE.CylinderGeometry(90-j*8,98-j*8,45,18),mat(j%2?'#c3ab8c':'#dec9a7'));m.position.set(b.x,22+j*48,b.z);grp.add(m)}box(b.x,320,b.z,3,65,3,'#f6c4a3')}
  }
  const grandPrix=grandPrixDetails3(T,grp);
  const premium=premiumCircuit3(T,grp);
  return{guide,theme:i,grandPrix,premium,towerDetails};
}
function premiumCircuit3(T,grp){
  const root=new THREE.Group();root.name='premium-circuit-details';grp.add(root);
  const geometry=new THREE.BoxGeometry(1,1,1),base=new THREE.MeshStandardMaterial({color:'#24323e',metalness:.45,roughness:.58}),roofMat=new THREE.MeshStandardMaterial({color:T.i===1?'#526779':'#b7c3c7',metalness:.55,roughness:.38}),accent=new THREE.MeshBasicMaterial({color:WORLD_THEMES[T.i].accent}),glass=new THREE.MeshStandardMaterial({color:'#547885',metalness:.5,roughness:.25,envMap:vehicleEnvironment3()});
  const place=(p,x,z)=>({x:p.x+Math.cos(p.t)*x+p.nx*z,z:p.y+Math.sin(p.t)*x+p.ny*z});
  // Clearance against every actual centerline segment, including nearby return sections.
  const clear=(p,x,z,w,d)=>{const at=place(p,x,z),ca=Math.cos(p.t),sa=Math.sin(p.t),hx=w/2+TW/2+92,hz=d/2+TW/2+92;for(let k=0;k<T.N;k++){const a=T.P[k],b=T.P[(k+1)%T.N],ax=(a.x-at.x)*ca+(a.y-at.z)*sa,az=-(a.x-at.x)*sa+(a.y-at.z)*ca,bx=(b.x-at.x)*ca+(b.y-at.z)*sa,bz=-(b.x-at.x)*sa+(b.y-at.z)*ca;let lo=0,hi=1;for(const [v,delta,half]of[[ax,bx-ax,hx],[az,bz-az,hz]]){if(Math.abs(delta)<1e-9){if(Math.abs(v)>half){lo=2;break}}else{const t1=(-half-v)/delta,t2=(half-v)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))}}if(lo<=hi)return false}return true};
  const block=(p,x,y,z,w,h,d,m,parent=root)=>{const at=place(p,x,z),o=new THREE.Mesh(geometry,m);o.scale.set(w,h,d);o.position.set(at.x,y,at.z);o.rotation.y=-p.t;parent.add(o);return o};
  const detail=new THREE.Group();detail.name='circuit-fine-details';root.add(detail);const structures=[];
  // Covered tribune modules, paired pillars, angled steel braces and fascia light.
  for(let k=-21;k<=21;k+=7)for(const side of[-1,1]){const p=T.P[(k+T.N)%T.N],z=side*(TW/2+168);if(!clear(p,0,z,96,90))continue;const canopy=new THREE.Group();canopy.name='covered-grandstand';root.add(canopy);block(p,0,78,z,96,3,90,roofMat,canopy);block(p,0,74,z-side*44,96,5,2,base,canopy);block(p,0,74,z-side*45.2,93,1.4,.6,accent,canopy);for(const x of[-40,40]){block(p,x,37,z+side*33,3.5,74,3.5,base,canopy);const strut=block(p,x,65,z,2,3,69,base,canopy);strut.rotation.x=side*-.22}structures.push({kind:'canopy',p,x:0,z,w:96,d:90,object:canopy})}
  // Team-colored seats are instanced, with no per-seat draw call.
  const seats=[];for(let k=-24;k<=24;k+=3)for(const side of[-1,1])for(let row=0;row<3;row++)for(let j=0;j<4;j++){const p=T.P[(k+T.N)%T.N],at=place(p,(j-1.5)*13,side*(TW/2+128+row*15));seats.push({x:at.x,y:36+row*6,z:at.z,t:p.t})}
  const seating=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:'#fff',roughness:.78}),seats.length),matrix=new THREE.Object3D();seating.name='grandstand-seats';seats.forEach((p,k)=>{matrix.position.set(p.x,p.y,p.z);matrix.rotation.y=-p.t;matrix.scale.set(9,2.7,9);matrix.updateMatrix();seating.setMatrixAt(k,matrix.matrix);seating.setColorAt(k,new THREE.Color(['#a53841','#768da2','#c7b47b'][Math.floor(k/12)%3]))});seating.instanceMatrix.needsUpdate=true;seating.instanceColor.needsUpdate=true;detail.add(seating);
  // A glazed race-control pavilion beyond the starting-area fence.
  const p=T.P[0],z=TW/2+380;if(clear(p,-80,z,200,100)){const tower=new THREE.Group();tower.name='race-control-pavilion';root.add(tower);block(p,-80,40,z,200,80,100,base,tower);block(p,-80,64,z-51,186,21,2,glass,tower);block(p,-80,84,z,218,6,118,roofMat,tower);block(p,-80,48,z-53,190,2,1,accent,tower);for(let j=0;j<9;j++)block(p,-168+j*22,64,z-53,1.4,24,1.4,base,tower);structures.push({kind:'pavilion',p,x:-80,z,w:218,d:118,object:tower})}
  const green=T.i===2?'#6c8980':T.i===1?'#42656d':'#397d65';for(const side of[-1,1]){const runoff=strip(T,p=>{const a=side*(TW/2+13),b=side*(TW/2+29);return[p.x+p.nx*a,.35,p.y+p.ny*a,p.x+p.nx*b,.35,p.y+p.ny*b]},()=>new THREE.Color(green));runoff.name='painted-runoff';root.add(runoff)}
  // Subtle rubber on the racing surface follows the real circuit rather than a baked photo.
  for(const side of[-1,1]){const worn=strip(T,p=>{const a=side*TW*.17-3.2,b=side*TW*.17+3.2;return[p.x+p.nx*a,.72,p.y+p.ny*a,p.x+p.nx*b,.72,p.y+p.ny*b]},()=>new THREE.Color('#171b20'));worn.name='racing-rubber';worn.material.transparent=true;worn.material.opacity=.17;worn.material.depthWrite=false;detail.add(worn)}
  return{root,detail,structures,seats:seats.length,canopies:structures.filter(s=>s.kind==='canopy').length,clear};
}
function grandPrixDetails3(T,grp){
  const geom=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Object3D(),rng=seeded3(419+T.i),base=T.P[0];
  const place=(x,z)=>({x:base.x+Math.cos(base.t)*x+base.nx*z,z:base.y+Math.sin(base.t)*x+base.ny*z});
  const colorMaterial=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.65,metalness:.15});
  const structure=new THREE.Group();structure.name='grand-prix-paddock';grp.add(structure);
  const block=(x,y,z,w,h,d,m)=>{const at=place(x,z),o=new THREE.Mesh(geom,m);o.position.set(at.x,y,at.z);o.scale.set(w,h,d);o.rotation.y=-base.t;structure.add(o);return o};
  const concrete=colorMaterial('#9aa1a8'),dark=colorMaterial('#222f3c'),roof=colorMaterial('#c4cdd3'),accent=colorMaterial(WORLD_THEMES[T.i].accent),glass=new THREE.MeshStandardMaterial({color:'#5d8094',metalness:.6,roughness:.22,envMap:vehicleEnvironment3()});
  // Visual paddock sits behind the protected fence and outside the collision footprint.
  block(-160,31,-TW/2-350,720,62,100,concrete);block(-160,77,-TW/2-350,742,13,118,roof);block(-160,59,-TW/2-294,712,4,3,accent);
  for(let j=0;j<10;j++){const x=-475+j*70;block(x,23,-TW/2-298,58,36,3,dark);block(x,62,-TW/2-297,55,14,2,glass);block(x,23,-TW/2-296,2,35,1,roof)}
  for(let j=0;j<4;j++){const at=place(-450+j*210,TW/2+225),post=new THREE.Mesh(geom,dark);post.position.set(at.x,57,at.z);post.scale.set(3,115,3);grp.add(post);const light=new THREE.Mesh(geom,new THREE.MeshBasicMaterial({color:'#f6e8ca'}));light.position.set(at.x,115,at.z);light.scale.set(32,3,9);grp.add(light)}
  // Instanced spectators use one low-detail geometry and one shared material.
  const spectators=[];for(let k=-24;k<=24;k+=3)for(const side of[-1,1])for(let row=0;row<3;row++)for(let j=0;j<4;j++){const p=T.P[(k+T.N)%T.N],off=side*(TW/2+128+row*15),along=(j-1.5)*13;spectators.push({x:p.x+p.nx*off+Math.cos(p.t)*along,z:p.y+p.ny*off+Math.sin(p.t)*along,y:42+row*6})}
  const crowd=new THREE.InstancedMesh(new THREE.SphereGeometry(2.8,5,4),new THREE.MeshLambertMaterial({color:'#fff'}),spectators.length);
  crowd.name='grand-prix-spectators';spectators.forEach((p,i)=>{matrix.position.set(p.x,p.y,p.z);matrix.scale.set(1,1.6,1);matrix.updateMatrix();crowd.setMatrixAt(i,matrix.matrix);crowd.setColorAt(i,new THREE.Color(['#d95853','#d2d9dd','#e1b65b','#4972a0'][Math.floor(rng()*4)]))});crowd.instanceMatrix.needsUpdate=true;crowd.instanceColor.needsUpdate=true;grp.add(crowd);
  const railMat=colorMaterial('#87939e');let rails=0;for(const side of[-1,1])for(const y of[8,13]){const rail=strip(T,p=>{const a=side*(TW/2+87),b=side*(TW/2+91);return[p.x+p.nx*a,y,p.y+p.ny*a,p.x+p.nx*b,y,p.y+p.ny*b]},()=>new THREE.Color('#fff'));rail.material.dispose();rail.material=railMat;grp.add(rail);rails++}
  return{spectators:spectators.length,rails,paddock:structure};
}
let HARBOR_WINDOWS=[];
function harborWindowTexture3(i){if(!HARBOR_WINDOWS[i])HARBOR_WINDOWS[i]=canvasTexture3(128,256,q=>{const rn=seeded3(125+i);q.clearRect(0,0,128,256);for(let y=8;y<250;y+=12)for(let x=6;x<128;x+=12)if(rn()>.4){q.fillStyle=rn()>.3?'rgba(171,226,235,.52)':'rgba(244,170,214,.65)';q.fillRect(x,y,4,6)}});return HARBOR_WINDOWS[i]}
function updateCircuit3(g){if(g.cur?.world){g.cur.world.guide.visible=!!cfg.line&&!R.demo;g.cur.world.premium.detail.visible=cfg.quality>0;g.cur.world.towerDetails.forEach(o=>o.visible=cfg.quality>0)}}
function initShowroom3(g){
  const sc=new THREE.Scene(),environment=studioEnvironment3(g.r);sc.background=new THREE.Color('#080d15');sc.fog=null;sc.environment=environment.texture;sc.add(new THREE.HemisphereLight('#e5edf4','#090c12',.28));
  const key=new THREE.DirectionalLight('#f4f6ff',1.1);key.position.set(65,135,70);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-82,right:82,top:82,bottom:-82,near:1,far:320});key.shadow.bias=-.0002;key.shadow.normalBias=.15;sc.add(key);
  const rim=new THREE.DirectionalLight('#c9d9ee',.8);rim.position.set(-100,45,-70);sc.add(rim);const fill=new THREE.DirectionalLight('#e0e8f1',.25);fill.position.set(80,30,-50);sc.add(fill);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(78,96),new THREE.MeshStandardMaterial({color:'#080b11',roughness:.35,metalness:.6,envMap:environment.texture,envMapIntensity:.5}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.1;sc.add(floor);
  const stage=new THREE.Group();stage.name='precision-showroom-stage';sc.add(stage);
  const edgeMat=new THREE.MeshStandardMaterial({color:'#64707e',metalness:.95,roughness:.1,envMap:environment.texture,envMapIntensity:1}),topMat=new THREE.MeshPhysicalMaterial({color:'#070a10',metalness:.82,roughness:.095,clearcoat:1,clearcoatRoughness:.055,envMap:environment.texture,envMapIntensity:.9});
  const profile=[[0,-2],[65,-2],[72,-1.5],[74,-.2],[74,.7],[72,1.65],[69,1.8],[0,1.8]].map(([r,y])=>new THREE.Vector2(r,y));const plinth=new THREE.Mesh(new THREE.LatheGeometry(profile,128),edgeMat);plinth.name='beveled-metal-plinth';stage.add(plinth);
  const top=new THREE.Mesh(new THREE.CircleGeometry(69,128),topMat);top.name='polished-mirror-stage';top.rotation.x=-Math.PI/2;top.position.y=1.82;top.receiveShadow=true;stage.add(top);const mirror=createStageMirror3(g.r,top,1.82);
  const rimTop=new THREE.Mesh(new THREE.RingGeometry(69,71,128),edgeMat);rimTop.rotation.x=-Math.PI/2;rimTop.position.y=1.84;stage.add(rimTop);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(73,.15,8,128),new THREE.MeshBasicMaterial({color:'#ff394b'}));ring.rotation.x=Math.PI/2;ring.position.y=.7;stage.add(ring);
  const halo=new THREE.Mesh(new THREE.RingGeometry(73,78,128),new THREE.MeshBasicMaterial({color:'#ff394b',transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;halo.position.y=-1.9;stage.add(halo);
  const markings=new THREE.Group();markings.name='stage-machined-inlays';stage.add(markings);const metal=new THREE.MeshStandardMaterial({color:'#66717e',metalness:.95,roughness:.12,envMap:environment.texture});for(let k=0;k<12;k++){const a=k*Math.PI/6,mark=new THREE.Mesh(new THREE.BoxGeometry(1.4,.035,.12),metal);mark.position.set(Math.cos(a)*70,1.87,Math.sin(a)*70);mark.rotation.y=-a;markings.add(mark)}
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(178,178),new THREE.MeshBasicMaterial({map:softShadowTexture3(),transparent:true,opacity:.68,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.05;sc.add(shadow);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(4500,48,24),new THREE.MeshBasicMaterial({map:panoramaTexture3(cfg.track),side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));sky.visible=false;sky.renderOrder=-1;sc.add(sky);
  const atmosphere=createAtmosphere3(sc,4000),pedestal=new THREE.Group();sc.add(pedestal);g.showroom={sc,cam:new THREE.PerspectiveCamera(34,W/H,1,6000),pedestal,stage,top,mirror,environment:environment.texture,environmentTarget:environment.target,environmentState:environment.state,halo,ring,sky,atmosphere,key,rim,floor,backdrop:null,car:null,index:-1,theme:-1,time:0,yaw:0,pitch:0};
}

function updateShowroomBackdrop3(s){
  const source=panoramaTexture3(cfg.track);
  if(!s.backdrop||s.backdrop.userData.theme!==cfg.track){if(s.backdrop)s.backdrop.dispose();s.backdrop=source.clone();s.backdrop.name='showroom-background:'+PANORAMA_NAMES[cfg.track];s.backdrop.userData={theme:cfg.track};s.sc.background=s.backdrop}
  if(s.backdrop.image!==source.image){s.backdrop.image=source.image;s.backdrop.needsUpdate=true}
  // A sharp photographic window uses more image pixels than a full 360 sphere.
  const ratio=s.backdrop.image.width/s.backdrop.image.height,aspect=W/H;
  const v=Math.min(.92,ratio/aspect),u=Math.min(1,aspect/ratio*v);
  s.backdrop.repeat.set(u,v);s.backdrop.offset.set((1-u)/2-s.yaw/(Math.PI*2),(1-v)/2+s.pitch*.04);s.backdrop.updateMatrix();
}
function renderShowroom3(g,dt){
  const s=g.showroom;if(s.index!==cfg.car){if(s.car){s.pedestal.remove(s.car.g);disposeVehicle3(s.car)}const c=CARS[cfg.car];s.car=buildCar(c.c,c.d,false,cfg.car);presentationVehicle3(s.car,s.environment);s.car.g.position.y=1.82;s.car.g.children.filter(o=>o.geometry?.type==='PlaneGeometry').forEach(o=>o.position.y=.07);s.pedestal.add(s.car.g);s.index=cfg.car;s.ring.material.color.set(c.c);s.halo.material.color.set(c.c)}
  s.car.detail.visible=cfg.quality>0;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)s.time+=dt;
  if(s.theme!==cfg.track){const theme=WORLD_THEMES[cfg.track];s.sky.material.map=panoramaTexture3(cfg.track);s.sky.material.needsUpdate=true;s.rim.color.setHex(theme.sun);s.theme=cfg.track}
  s.sky.material.color.setHex(cfg.rain?0x8994a6:0xffffff);
  s.pedestal.rotation.y=-.48+s.time*.1;s.stage.rotation.y=s.pedestal.rotation.y;s.key.castShadow=cfg.quality>0;const mobile=W<760;
  s.cam.aspect=W/H;s.cam.setViewOffset(W,H,mobile?-W*.06:-W*.22,mobile?H*.2:0,W,H);s.cam.updateProjectionMatrix();
  const smoothing=1-Math.exp(-Math.min(.1,Math.max(0,dt))*8);s.yaw+=(VENUE_VIEW.yaw-s.yaw)*smoothing;s.pitch+=(VENUE_VIEW.pitch-s.pitch)*smoothing;
  const angle=.65+s.yaw;s.cam.position.set(Math.sin(angle)*196,Math.max(32,65+s.pitch*65),Math.cos(angle)*196);s.cam.lookAt(0,12,0);s.sky.position.copy(s.cam.position);updateShowroomBackdrop3(s);animateAtmosphere3(s.atmosphere,dt,cfg.track,cfg.rain,cfg.quality>0,s.cam.position);updateStageMirror3(g.r,s,cfg.quality);g.r.render(s.sc,s.cam);cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);if(cfg.rain){cx.fillStyle='rgba(15,25,43,.2)';cx.fillRect(0,0,W,H)}
}
