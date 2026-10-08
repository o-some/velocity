"use strict";
// A bounded studio environment and planar reflection for the live vehicle presentation.
// GPU work is confined to menu/garage; the sparse mode retains normal physical shading.
function studioEnvironment3(renderer){
  if(typeof renderer.getRenderTarget!=='function')return {texture:vehicleEnvironment3(),target:null,state:'renderer-unavailable'};
  const room=new THREE.Scene();room.background=new THREE.Color(.022,.027,.035);
  const geometries=[],materials=[];
  const panel=(x,y,z,w,h,power,rx=0,ry=0)=>{const geo=new THREE.PlaneGeometry(w,h),material=new THREE.MeshBasicMaterial({color:new THREE.Color(power,power*.97,power*.93),side:THREE.DoubleSide});geometries.push(geo);materials.push(material);const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,0);room.add(mesh)};
  panel(0,110,0,130,65,5,Math.PI/2);panel(-90,42,0,40,115,3.5,0,Math.PI/2);panel(75,42,-60,100,20,4,0,-Math.PI/4);panel(0,30,100,90,70,1.4);
  const previousTarget=renderer.getRenderTarget(),toneMapping=renderer.toneMapping,outputEncoding=renderer.outputEncoding,autoClear=renderer.autoClear;let generator,target;
  try{generator=new THREE.PMREMGenerator(renderer);target=generator.fromScene(room,.025,1,400);target.texture.name='studio-prefiltered-lightcards';return{texture:target.texture,target,state:'prefiltered'}}catch(error){if(target)target.dispose();return{texture:vehicleEnvironment3(),target:null,state:'environment-fallback'}}finally{renderer.setRenderTarget(previousTarget);renderer.toneMapping=toneMapping;renderer.outputEncoding=outputEncoding;renderer.autoClear=autoClear;if(generator)generator.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}
}
function presentationVehicle3(vehicle,environment){
  vehicle.g.traverse(o=>{if(o.isMesh){o.castShadow=!!o.material&&!o.material.transparent;o.receiveShadow=false}if(o.material?.isMeshStandardMaterial){o.material.envMap=environment;o.material.envMapIntensity=.9;o.material.needsUpdate=true}});
  vehicle.mB.roughness=.115;vehicle.mB.metalness=.12;vehicle.mB.clearcoat=.98;vehicle.mB.clearcoatRoughness=.07;
}
function createStageMirror3(renderer,top,height){
  const target=new THREE.WebGLRenderTarget(512,512,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true});target.texture.name='live-stage-reflection';target.texture.encoding=THREE.LinearEncoding;
  const mirror={target,camera:new THREE.PerspectiveCamera(),height,frames:0,size:512,textureMatrix:new THREE.Matrix4(),state:'disabled',uniforms:{stageReflection:{value:target.texture},stageMatrix:{value:new THREE.Matrix4()},stageMirrorStrength:{value:0}}};
  top.material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,mirror.uniforms);
    shader.vertexShader='uniform mat4 stageMatrix; varying vec4 vStageReflection;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStageReflection = stageMatrix * modelMatrix * vec4( transformed, 1.0 );');
    shader.fragmentShader='uniform sampler2D stageReflection; uniform float stageMirrorStrength; varying vec4 vStageReflection;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>',`vec2 stageUV = vStageReflection.xy / max(vStageReflection.w, 0.0001);
      if (stageMirrorStrength > 0.0 && vStageReflection.w > 0.0 && all(greaterThanEqual(stageUV, vec2(0.0))) && all(lessThanEqual(stageUV, vec2(1.0)))) {
        vec3 stageLight = texture2D(stageReflection, stageUV).rgb;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, stageLight * vec3(0.76, 0.8, 0.85), stageMirrorStrength);
      }
      #include <tonemapping_fragment>`);
  };
  top.material.customProgramCacheKey=()=> 'velocity-live-stage-v1';return mirror;
}
function stageMirrorCamera3(mirror,camera){
  camera.updateMatrixWorld();const y=mirror.height,virtual=mirror.camera;
  const position=new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld),rotation=new THREE.Matrix4().extractRotation(camera.matrixWorld),target=new THREE.Vector3(0,0,-1).applyMatrix4(rotation).add(position),up=new THREE.Vector3(0,1,0).applyMatrix4(rotation);
  position.y=2*y-position.y;target.y=2*y-target.y;up.y=-up.y;
  virtual.position.copy(position);virtual.up.copy(up);virtual.lookAt(target);virtual.near=camera.near;virtual.far=camera.far;virtual.projectionMatrix.copy(camera.projectionMatrix);virtual.updateMatrixWorld();
  // Project world positions before the oblique clipping transform is applied.
  mirror.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(virtual.projectionMatrix).multiply(virtual.matrixWorldInverse);
  mirror.uniforms.stageMatrix.value.copy(mirror.textureMatrix);
  const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-y).applyMatrix4(virtual.matrixWorldInverse),clip=new THREE.Vector4(plane.normal.x,plane.normal.y,plane.normal.z,plane.constant),elements=virtual.projectionMatrix.elements;
  const q=new THREE.Vector4((Math.sign(clip.x)+elements[8])/elements[0],(Math.sign(clip.y)+elements[9])/elements[5],-1,(1+elements[10])/elements[14]);
  const denominator=clip.dot(q);if(Math.abs(denominator)<1e-7)return false;clip.multiplyScalar(2/denominator);
  elements[2]=clip.x;elements[6]=clip.y;elements[10]=clip.z+1-.001;elements[14]=clip.w;virtual.projectionMatrixInverse.copy(virtual.projectionMatrix).invert();return true;
}
function updateStageMirror3(renderer,showroom,quality){
  const mirror=showroom.mirror;mirror.frames++;mirror.uniforms.stageMirrorStrength.value=0;
  if(mirror.state==='failed')return;
  if(quality===0||typeof renderer.getRenderTarget!=='function'||showroom.cam.position.y<=mirror.height+.1){mirror.state='disabled';return}
  if(quality===1&&mirror.frames%2===0&&mirror.state==='ready'){mirror.uniforms.stageMirrorStrength.value=.62;return}
  const size=quality===2?1024:512;if(size!==mirror.size){mirror.target.setSize(size,size);mirror.size=size}
  if(!stageMirrorCamera3(mirror,showroom.cam))return;
  const previousTarget=renderer.getRenderTarget(),toneMapping=renderer.toneMapping,autoClear=renderer.autoClear,xr=renderer.xr?.enabled,shadows=renderer.shadowMap?.autoUpdate,visible=showroom.stage.visible;
  try{
    showroom.stage.visible=false;if(renderer.xr)renderer.xr.enabled=false;if(renderer.shadowMap)renderer.shadowMap.autoUpdate=false;
    renderer.toneMapping=THREE.NoToneMapping;renderer.autoClear=true;renderer.setRenderTarget(mirror.target);renderer.render(showroom.sc,mirror.camera);mirror.state='ready';mirror.uniforms.stageMirrorStrength.value=.62;
  }catch(error){mirror.state='failed';mirror.uniforms.stageMirrorStrength.value=0;}finally{
    showroom.stage.visible=visible;renderer.setRenderTarget(previousTarget);renderer.toneMapping=toneMapping;renderer.autoClear=autoClear;if(renderer.xr)renderer.xr.enabled=xr;if(renderer.shadowMap)renderer.shadowMap.autoUpdate=shadows;
  }
}
