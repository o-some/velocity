// Simulation and real Three.js geometry checks. Renderer/DOM doubles are explicit;
// this is not a browser, shader, audio, visual or physical-device playtest.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const source=['studio.js','world.js','evolution.js','game.js'].map(f=>fs.readFileSync(path.join(root,'dist/js',f),'utf8')).join('\n');
const THREE=require('../dist/vendor/three-r128.min.js');
const crypto=require('crypto'),manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/textures/manifest.json')));
for(const a of manifest.assets){const data=fs.readFileSync(path.join(root,'dist/assets/textures',a.file));assert.strictEqual(crypto.createHash('sha256').update(data).digest('hex'),a.sha256);assert.strictEqual(data.toString('ascii',0,4),'RIFF');assert.strictEqual(data.toString('ascii',8,12),'WEBP')}
const horizons=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/horizons/manifest.json')));
for(const a of horizons.assets){const data=fs.readFileSync(path.join(root,'dist/assets/horizons',a.file));assert.strictEqual(crypto.createHash('sha256').update(data).digest('hex'),a.sha256);assert.strictEqual(data.toString('ascii',8,12),'WEBP')}
const liveries=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/liveries/manifest.json')));
for(const a of liveries.assets){const data=fs.readFileSync(path.join(root,'dist/assets/liveries',a.file));assert.strictEqual(crypto.createHash('sha256').update(data).digest('hex'),a.sha256);assert.strictEqual(data.toString('ascii',8,12),'WEBP')}
const selection=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/selection/manifest.json')));
for(const a of selection.assets){const data=fs.readFileSync(path.join(root,'dist/assets/selection',a.file));assert.strictEqual(crypto.createHash('sha256').update(data).digest('hex'),a.sha256);assert.strictEqual(data.toString('ascii',8,12),'WEBP')}
const portraits=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/portraits/manifest.json')));
for(const a of portraits.assets){const data=fs.readFileSync(path.join(root,'dist/assets/portraits',a.file));assert.strictEqual(crypto.createHash('sha256').update(data).digest('hex'),a.sha256);assert.strictEqual(data.toString('ascii',8,12),'WEBP')}
const draw=new Proxy({}, {get(o,k){return o[k]??(k==='createPattern'?()=>({}):k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{})}});
function harness(useThree=true){
  // Reproducible AI reactions and collisions, rather than random test outcomes.
  let randomSeed=333;const deterministicMath=Object.create(Math);deterministicMath.random=()=>((randomSeed=randomSeed*16807%2147483647)/2147483647);
  const nodes=new Map(),storage=new Map(),timers=new Map(),events=new Map(),errors=[],imageRequests=[];let id=0;
  const listen=(key,f)=>{const previous=events.get(key);events.set(key,(...args)=>{if(previous)previous(...args);f(...args)})};
  const translations=[],draw=new Proxy({}, {get(o,k){return o[k]??(k==='translate'?(...a)=>translations.push(a):k==='createPattern'?()=>({}):k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{})}});
  // Old saves must survive the evolution upgrade.
  storage.set('vgptok','7');storage.set('vgpups',JSON.stringify({0:[1,2,0,0,0]}));storage.set('vgppts','18');storage.set('vgprnd','1');storage.set('vgpb0','55.25');storage.set('vgpcfg',JSON.stringify({car:0,track:0,laps:1,snd:false,diff:0,rain:false}));
  function node(key){if(!nodes.has(key)){const cls=new Set(),listeners=new Map();nodes.set(key,{id:key.replace(/^#/,''),tagName:'DIV',style:{setProperty(k,v){this[k]=v}},dataset:{},textContent:'',innerHTML:'',value:'',offsetWidth:100,
    classList:{add(...a){a.forEach(k=>cls.add(k))},remove(...a){a.forEach(k=>cls.delete(k))},contains:k=>cls.has(k),toggle(k,on){on=on??!cls.has(k);on?cls.add(k):cls.delete(k);return on}},
    addEventListener(k,f){if(!listeners.has(k))listeners.set(k,[]);listeners.get(k).push(f)},emit(k,e={}){for(const f of listeners.get(k)||[])f({preventDefault(){},pointerId:1,...e})},
    setAttribute(k,v){this[k]=v},getContext(){return draw},appendChild(){},insertAdjacentHTML(){},setPointerCapture(){},releasePointerCapture(){},parentNode:{appendChild(){}}})}return nodes.get(key)}
  const buttons=['l','r','o','b','t'].map(k=>{const b=node('button'+k);b.dataset.k=k;return b});
  const settings=[...html.matchAll(/data-o="([^"]+)"/g)].map((m,i)=>{const b=node('option'+i);b.dataset.o=m[1];return b});
  const screens=['menu','garage','tracks','settings','qres','pause','res'].map(k=>node('#'+k));
  const selectors=s=>s==='#tc button'?buttons:s==='.scr'?screens:s==='.ch[data-o]'?settings:[];
  class MathOnlyRenderer{
    setPixelRatio(v){this.dpr=v}setSize(w,h){this.width=w;this.height=h}
    render(sc,cam){sc.updateMatrixWorld();cam.updateMatrixWorld();assert(cam.projectionMatrix.elements.every(Number.isFinite));this.frames=(this.frames||0)+1}
  }
  class AssetLoaderDouble{load(url,onLoad,onProgress,onError){imageRequests.push({url,onLoad,onError});return new THREE.Texture()}}
  const box={Math:deterministicMath,console:{log(){},warn(){},error(e){errors.push(String(e))}},devicePixelRatio:2,innerWidth:1440,innerHeight:900,
    Path2D:class{moveTo(){}lineTo(){}closePath(){}arc(){}},
    document:{querySelector:node,querySelectorAll:selectors,createElement:()=>node('new'+(++id)),addEventListener(k,f){listen('doc:'+k,f)},body:node('body'),documentElement:node('html')},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},navigator:{getGamepads:()=>[]},
    addEventListener(k,f){listen(k,f)},matchMedia:q=>({matches:q.includes('coarse')}),requestAnimationFrame(){},
    setTimeout:f=>{timers.set(++id,f);return id},clearTimeout:k=>timers.delete(k),location:{reload(){}},performance:{now:()=>0}};
  if(useThree)box.THREE={...THREE,WebGLRenderer:MathOnlyRenderer,TextureLoader:AssetLoaderDouble};box.window=box;
  vm.createContext(box);new vm.Script(source).runInContext(box,{timeout:20000});
  const run=s=>vm.runInContext(s,box,{timeout:30000});
  return{run,node,storage,events,errors,timers,box,buttons,settings,translations,imageRequests};
}
const h=harness(true),run=h.run;
assert(run('G3.ok&&R.demo&&R.cars.length===8'));
assert.strictEqual(h.storage.get('vgptok'),'7');assert.strictEqual(h.storage.get('vgppts'),'18');assert.strictEqual(h.storage.get('vgprnd'),'1');assert.deepStrictEqual(JSON.parse(h.storage.get('vgpups')),{0:[1,2,0,0,0]});
run('render(.016)');assert(run('G3.showroom.car.style===0'));
// Every new vehicle must have finite real geometry and the retained damage ports.
for(let i=0;i<4;i++){
  assert(run(`(()=>{const o=buildCar(CARS[${i}].c,CARS[${i}].d,false,${i});let good=true;o.g.traverse(n=>{if(n.geometry){const a=n.geometry.attributes.position.array;if(!a.every(Number.isFinite))good=false}});const ports=o.wl.length===4&&o.pS.length===2&&o.scr.length===4;disposeVehicle3(o);return good&&ports})()`));
}
const combinations=[];
for(let track=0;track<3;track++)for(let car=0;car<4;car++){
  run(`cfg.track=${track};cfg.car=${car};start('time');for(let k=0;k<600;k++)sim(1/60);KY.KeyW=1;for(let k=0;k<150;k++){sim(1/60);upd(1/60)}render(.016);hud();KY.KeyW=0;`);
  assert(run('G3.ok&&G3.cur.world.theme===R.T.i&&R.pl.v>0'));
  assert(run('R.cars.every(c=>Number.isFinite(c.x)&&Number.isFinite(c.y))'));
  run('cfg.rain=true;render(.016);cfg.line=true;render(.016)');assert(run('G3.cur.asph.material.roughness===.35&&G3.cur.world.guide.visible'));run('cfg.rain=false;cfg.line=false;render(.016)');
  run('R.pl.dz=[.8,.7,.7,.6];R.pl.dmg=.6;render(.016)');assert(run('G3.ok'));
  run('pause(true);loop(16);loop(32)');const paused=run('R.t');run('loop(48)');assert.strictEqual(run('R.t'),paused);run('pause(false)');
  run('respawn(R.pl)');assert.strictEqual(run('R.pl.vx'),0);
  run('results();start("time");toMenu();render(.016)');assert(run('R.demo&&G3.ok'));
  combinations.push({track,car,status:'PASS'});
}
// Merged tree UVs and material ranges survive into every instancing chunk.
assert(run(`(()=>{const kit=treeKit();return Object.values(kit).every(g=>g.attributes.uv.count===g.attributes.position.count&&g.attributes.uv.array.every(Number.isFinite)&&g.groups.length>=1&&g.groups.length<=2&&g.groups.reduce((n,x)=>n+x.count,0)===g.index.count)})()`));
assert(run(`(()=>{let n=0,ok=true;TRK[0].g3.grp.traverse(o=>{if(o.isInstancedMesh&&Array.isArray(o.material)){n++;if(!o.geometry.attributes.uv||!o.geometry.groups.length||o.material[0].map.name!=='surface:bark'||o.material[1].map.name!=='surface:foliage')ok=false}});return n>0&&ok})()`));
assert(run(`palmFrond3().attributes.position.array.every(Number.isFinite)`));
assert.strictEqual(h.imageRequests.length,12);assert.strictEqual(new Set(h.imageRequests.map(r=>r.url)).size,12);
assert(run('assetTexture3("grass")===assetTexture3("grass")&&SURFACE_TEXTURES.size===5'));
assert(run('G3.cur.asph.material.map.name==="surface:asphalt"'));
assert(run('SURFACE_TEXTURES.get("grass").encoding===THREE.sRGBEncoding&&SURFACE_TEXTURES.get("grass").wrapS===THREE.RepeatWrapping'));
for(const request of h.imageRequests)request.onLoad(new THREE.Texture({width:request.url.includes('/horizons/')?2048:1024,height:1024,src:request.url}));
assert(run('Array.from(SURFACE_TEXTURES.values()).every(t=>t.userData.state==="loaded"&&t.image.width===1024)'));
assert(run('PANORAMA_TEXTURES.size===3&&Array.from(PANORAMA_TEXTURES.values()).every(t=>t.userData.state==="loaded"&&t.image.width===2048&&t.wrapT===THREE.ClampToEdgeWrapping)'));
const failedImages=harness(true);failedImages.run('render(.016);cfg.track=0;start("time");render(.016)');for(const request of failedImages.imageRequests)request.onError(new Error('simulated unavailable asset'));failedImages.run('render(.016)');assert(failedImages.run('G3.ok&&Array.from(SURFACE_TEXTURES.values()).every(t=>t.userData.state==="fallback"&&t.image.width===32)'));assert.strictEqual(failedImages.errors.length,0);
// Actual pointer handlers, including cancel, multi-touch and release on pause.
run("cfg.touch=0;cfg.sens=1;start('time');R.ph='run'");h.node('#steerpad').emit('pointerdown',{pointerId:11,clientX:100});h.node('#steerpad').emit('pointermove',{pointerId:11,clientX:121});
assert.strictEqual(run('input().s'),.5);h.buttons[4].emit('pointerdown',{pointerId:12});assert.strictEqual(run('input().t'),1);
h.node('#steerpad').emit('pointerdown',{pointerId:13,clientX:200});assert.strictEqual(run('ACTIVE_STEER_POINTER'),11);
h.node('#steerpad').emit('pointercancel',{pointerId:11});assert.strictEqual(run('input().s'),0);assert.strictEqual(run('input().t'),1);
run('pause(true)');assert.strictEqual(run('input().t'),0);assert.strictEqual(run('ACTIVE_STEER_POINTER'),null);run('pause(false)');
run('KY.KeyW=1;TC.axis=-.8');h.events.get('blur')();assert.strictEqual(run('input().t'),0);assert.strictEqual(run('input().s'),0);
// Recovering an AI car must not release the player's held controls.
run("newRace(false,'race','g');R.ph='run';KY.KeyW=1;TC.axis=.4;respawn(R.cars.find(c=>!c.isP))");assert.strictEqual(run('input().t'),1);assert.strictEqual(run('input().s'),.4);run('clearControls()');
// The sidepod, wheels and scratches must all reflect damage on the same side.
run('R.pl.dz=[0,1,0,0];render(.016)');assert(run('G3.cars[R.cars.indexOf(R.pl)].pS.find(p=>p.position.z>0).visible===false'));assert(run('G3.cars[R.cars.indexOf(R.pl)].pS.find(p=>p.position.z<0).visible===true'));
// Real settings click handlers persist preferences and update resolution.
h.settings.find(n=>n.dataset.o==='quality:0').onclick();assert(run('cfg.quality===0&&G3.r.dpr===.85'));
h.settings.find(n=>n.dataset.o==='touch:1').onclick();assert.strictEqual(run('cfg.touch'),1);
h.node('#camcycle').onclick();assert.strictEqual(run('+CAMF'),1);
run('R.pl.vx=120');h.node('#recover').onclick();assert.strictEqual(run('R.pl.vx'),0);
// Run the existing AI around the complete circuit to exercise genuine lap transitions.
run("cfg.track=0;cfg.car=0;cfg.laps=1;start('race');R.ph='run';R.pl.auto=true;for(let k=0;k<30000&&R.ph==='run';k++){sim(1/60);upd(1/60)}");
assert(run("R.ph==='fin'&&R.pl.fin>0&&R.pl.lap===2"));run('qualiEnd()');assert(run('QL.g.length===8'));
run("newRace(false,'race','g');show('');E.hud.classList.add('on');R.ph='run';R.pl.auto=true;for(let k=0;k<30000&&R.ph==='run';k++){sim(1/60);upd(1/60)};render(.016)");
assert(run("G3.ok&&R.ph==='fin'&&R.pl.fin>0&&R.pl.fo>0"));run('results()');const tokens=h.storage.get('vgptok'),races=JSON.parse(h.storage.get('vgpevolution')).races;run('results()');assert.strictEqual(h.storage.get('vgptok'),tokens);assert.strictEqual(JSON.parse(h.storage.get('vgpevolution')).races,races);
assert(run('ST.g("tok",0)>7'));
// Direct result display, retirement or quitting never earns completion points.
run("start('time');results();start('race');R.pl.dnf=1;results()");assert.strictEqual(h.storage.get('vgptok'),tokens);
// The whole race loop also initializes and runs without the Three.js dependency.
const fallback=harness(false);fallback.run("start('time');R.ph='run';KY.KeyW=1;for(let k=0;k<120;k++)sim(1/60);render(.016);hud();toMenu()");assert(fallback.run('R.demo&&G3===null'));assert.strictEqual(fallback.errors.length,0);
fallback.translations.length=0;fallback.run("cfg.shake=false;start('time');R.ph='run';CM.sh=22;render(.016)");assert.deepStrictEqual(fallback.translations[0],[720,594]);
assert.strictEqual(h.errors.length,0,h.errors.join('\n'));
// User-driven venue view: drag, separate pointers, keyboard, reset and navigation.
run('toMenu();render(.016)');const viewer=h.node('#horizonview');
viewer.emit('pointerdown',{pointerId:71,button:0,clientX:100,clientY:100});viewer.emit('pointermove',{pointerId:71,clientX:200,clientY:1000});
assert(Math.abs(run('VENUE_VIEW.yaw')-.7)<1e-9);assert.strictEqual(run('VENUE_VIEW.pitch'),.4);
viewer.emit('pointerdown',{pointerId:72,button:0,clientX:0,clientY:0});assert.strictEqual(run('VENUE_VIEW.pointer'),71);
viewer.emit('pointercancel',{pointerId:71});assert.strictEqual(run('VENUE_VIEW.pointer'),null);
viewer.emit('keydown',{code:'ArrowRight'});assert(Math.abs(run('VENUE_VIEW.yaw')-.85)<1e-9);assert.strictEqual(viewer['aria-valuenow'],'49');
run('render(.1)');assert(run('G3.showroom.yaw>0&&G3.showroom.cam.position.toArray().every(Number.isFinite)'));
h.node('#horizonreset').onclick();assert(run('VENUE_VIEW.yaw===0&&VENUE_VIEW.pitch===0'));
viewer.emit('pointerdown',{pointerId:73,button:0,clientX:0,clientY:0});run('show("settings")');assert.strictEqual(run('VENUE_VIEW.pointer'),null);
run('toMenu()');viewer.emit('pointerdown',{pointerId:74,button:0,clientX:0,clientY:0});h.events.get('blur')();assert.strictEqual(run('VENUE_VIEW.pointer'),null);
run('cfg.track=2;render(.016)');assert(run('G3.showroom.sky.material.map.name==="panorama:desert"&&G3.showroom.theme===2'));
run('cfg.quality=0;render(.016)');assert(run('G3.showroom.atmosphere.group.visible===false'));run('cfg.quality=1;render(.016)');assert(run('G3.showroom.atmosphere.group.visible===true'));
const phase=run('G3.showroom.atmosphere.phase');run('render(.016)');assert(run('G3.showroom.atmosphere.phase')>phase);
h.box.matchMedia=q=>({matches:q.includes('reduced-motion')});const stopped=run('G3.showroom.atmosphere.phase');run('render(.1)');assert.strictEqual(run('G3.showroom.atmosphere.phase'),stopped);
for(let i=0;i<3;i++)assert(run(`(()=>{const t=TRK[${i}].g3;let ok=true;t.grp.traverse(o=>{if(o.geometry)for(const a of Object.values(o.geometry.attributes))if(!a.array.every(Number.isFinite))ok=false});return ok&&t.world.grandPrix.spectators>0&&t.world.grandPrix.rails===4&&t.world.grandPrix.paddock.children.length>20})()`));
assert(run(`(()=>{const t=TRK[2].g3;t.grp.updateMatrixWorld(true);const pit=new THREE.Box3().setFromObject(t.world.grandPrix.paddock);let tents=0,ok=true;t.grp.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&['ccbca1','e9ddc5'].includes(o.material.color.getHexString())){tents++;if(pit.intersectsBox(new THREE.Box3().setFromObject(o)))ok=false}});return tents===8&&ok})()`));
failedImages.run('toMenu();render(.016)');assert(failedImages.run('PANORAMA_TEXTURES.get(0).userData.state==="fallback"&&G3.showroom.sky.material.map.image.width===512'));
fallback.node('#horizonview').emit('pointerdown',{pointerId:80,button:0,clientX:10,clientY:10});assert.strictEqual(fallback.run('VENUE_VIEW.pointer'),null);
// Every painted surface has actual UV coordinates and its team's cached physical paint map.
for(let style=0;style<4;style++)assert(run(`(()=>{const o=buildCar(CARS[${style}].c,CARS[${style}].d,false,${style});let ok=o.mB.isMeshPhysicalMaterial&&o.mB.map===CAR_LIVERIES.get(${style})&&o.mB.clearcoat===.98&&o.base.getHexString()==='ffffff';o.g.traverse(n=>{if(n.material===o.mB){const uv=n.geometry.attributes.uv;if(!uv||uv.count!==n.geometry.attributes.position.count||!uv.array.every(v=>Number.isFinite(v)&&v>=0&&v<=1))ok=false}});ok=ok&&o.pS.every(p=>p.children.some(c=>c.name==='team-side-label'));disposeVehicle3(o);return ok})()`));
assert(run('CAR_LIVERIES.size===4&&Array.from(CAR_LIVERIES.values()).every(t=>t.userData.state==="loaded")'));
assert(run('(()=>{const g=buildCar("#fff","#fff",true,0);const ok=!g.mB.map&&g.mB.transparent&&g.mB.opacity===.32;disposeVehicle3(g);return ok})()'));
run('cfg.track=0;toMenu();render(.016)');assert(run('G3.showroom.sc.fog===null&&G3.showroom.floor.geometry.type==="CircleGeometry"&&G3.showroom.floor.geometry.parameters.radius===78'));
assert(run('G3.showroom.sc.background===G3.showroom.backdrop&&G3.showroom.backdrop.image===PANORAMA_TEXTURES.get(0).image&&G3.showroom.backdrop!==PANORAMA_TEXTURES.get(0)'));
run('VENUE_VIEW.yaw=.9;render(.1)');assert(run('G3.showroom.backdrop.offset.x!==0&&PANORAMA_TEXTURES.get(0).repeat.x===1&&PANORAMA_TEXTURES.get(0).offset.x===0'));
for(const [w,hh]of[[1440,900],[390,844],[500,375]]){h.box.innerWidth=w;h.box.innerHeight=hh;h.events.get('resize')();run('render(.016)');assert(run('G3.showroom.backdrop.repeat.x>0&&G3.showroom.backdrop.repeat.x<=1&&G3.showroom.backdrop.repeat.y>0&&G3.showroom.backdrop.repeat.y<=1'));assert(Math.abs(run('G3.showroom.backdrop.repeat.x*2/G3.showroom.backdrop.repeat.y')-w/hh)<1e-9)}
const failures=harness(true);failures.run('render(.016)');for(const request of failures.imageRequests)request.onError(new Error('simulated unavailable image'));failures.run('render(.016)');assert(failures.run('G3.ok&&CAR_LIVERIES.get(0).userData.state==="fallback"&&G3.showroom.backdrop.image.width===512'));
assert.strictEqual(h.errors.length,0,h.errors.join('\n'));
// Rounded surfaces must face outwards, and unit bevels must retain damage dimensions.
assert(run(`(()=>{const parent=new THREE.Group(),g=loftVehicle3([[0,2,3,1],[10,2,3,1]],new THREE.MeshStandardMaterial(),parent).geometry,n=g.attributes.normal,p=g.attributes.position;return p.count===66&&new THREE.Vector3().fromBufferAttribute(n,0).distanceTo(new THREE.Vector3().fromBufferAttribute(n,16))<1e-6&&new THREE.Vector3().fromBufferAttribute(n,17).distanceTo(new THREE.Vector3().fromBufferAttribute(n,33))<1e-6&&Array.from({length:16},(_,k)=>n.getX(34+k)).every(x=>x<-.99)&&Array.from({length:16},(_,k)=>n.getX(50+k)).every(x=>x>.99)})()`));
assert(run(`(()=>{const g=bevelBox3();g.computeBoundingBox();const size=g.boundingBox.getSize(new THREE.Vector3());return size.toArray().every(x=>Math.abs(x-1)<1e-6)&&g.attributes.normal.array.every(Number.isFinite)})()`));
for(let i=0;i<4;i++)assert(run(`(()=>{const v=buildCar(CARS[${i}].c,CARS[${i}].d,false,${i});const ok=v.wl.every(w=>w.sp.children.some(o=>o.name==='rounded-slick-tyre')&&w.sp.children.some(o=>o.name==='forged-wheel-spokes'&&o.count===8));disposeVehicle3(v);return ok})()`));
assert(run(`(()=>{const v=buildCar(CARS[0].c,CARS[0].d,false,0);let found=0,released=0;v.g.traverse(o=>{if(o.isInstancedMesh){found++;o.addEventListener('dispose',()=>released++)}});disposeVehicle3(v);return found===5&&released===5})()`));
// Test actual geometry footprints against every track segment, independently of the placement helper.
for(let i=0;i<3;i++){
  const clearances=run(`(()=>{const T=TRK[${i}],world=T.g3.world.premium;T.g3.grp.updateMatrixWorld(true);return world.structures.map(s=>({kind:s.kind,box:new THREE.Box3().setFromObject(s.object).min.toArray().concat(new THREE.Box3().setFromObject(s.object).max.toArray()),points:T.P.map(p=>[p.x,p.y]),width:TW}))})()`);
  assert(clearances.some(s=>s.kind==='canopy'),`Track ${i} must retain covered stands`);
  for(const s of clearances){const [minX,,minZ,maxX,,maxZ]=s.box,margin=s.width/2+82;
    // Segment/AABB slab test, with conservative collision-corridor expansion.
    for(let k=0;k<s.points.length;k++){const a=s.points[k],b=s.points[(k+1)%s.points.length];let lo=0,hi=1;for(const [v,d,low,high]of[[a[0],b[0]-a[0],minX-margin,maxX+margin],[a[1],b[1]-a[1],minZ-margin,maxZ+margin]]){if(Math.abs(d)<1e-9){if(v<low||v>high){lo=2;break}}else{const t1=(low-v)/d,t2=(high-v)/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2))}}assert(lo>hi,`Track ${i} ${s.kind} intersects fenced corridor`)}
  }
  assert(run(`TRK[${i}].g3.world.premium.seats>0`));
}
run('cfg.track=0;start("time");cfg.quality=0;render(.016)');assert(run('!G3.cur.world.premium.detail.visible&&!G3.cars[0].detail.visible'));run('cfg.quality=1;render(.016)');assert(run('G3.cur.world.premium.detail.visible&&G3.cars[0].detail.visible'));
assert(run('(()=>{let count=0,ok=true;G3.cur.grp.traverse(o=>{if(o.name==="woven-catch-fence"){count++;if(o.material.alphaTest!==.35||o.geometry.attributes.uv.count!==o.geometry.attributes.position.count)ok=false}});return count===2&&ok})()'));
run('toMenu();render(.016)');assert(run('G3.showroom.stage.children.some(o=>o.name==="beveled-metal-plinth")&&G3.showroom.stage.children.some(o=>o.name==="polished-mirror-stage")&&G3.showroom.stage.children.some(o=>o.name==="stage-machined-inlays"&&o.children.length===12)'));
assert(run('circuitArtwork(0).includes("assets/selection/rosso.webp")&&circuitArtwork(1).includes("assets/selection/harbor.webp")&&circuitArtwork(2).includes("assets/selection/desert.webp")'));
assert.strictEqual(h.errors.length,0,h.errors.join('\n'));
// The live mirror has real reflected camera/oblique clip math. GPU drawing is doubled.
// Exercise the bundled PMREM implementation, including its temporary renderer mutations.
assert(run(`(()=>{const original={id:'studio-original'},r={target:original,toneMapping:THREE.ACESFilmicToneMapping,outputEncoding:THREE.sRGBEncoding,autoClear:true,calls:0,getRenderTarget(){return this.target},setRenderTarget(t){this.target=t},getClearColor(c){return c.set(0)},compile(){},render(){this.calls++;throw Error('simulated PMREM GPU failure')}};const env=studioEnvironment3(r);return r.calls===1&&env.state==='environment-fallback'&&env.target===null&&r.target===original&&r.toneMapping===THREE.ACESFilmicToneMapping&&r.outputEncoding===THREE.sRGBEncoding&&r.autoClear})()`));
assert(run(`(()=>{const original={id:'compile-original'},r={target:original,toneMapping:4,outputEncoding:3001,autoClear:true,getRenderTarget(){return this.target},setRenderTarget(t){this.target=t},compile(){this.target=null;this.toneMapping=0;this.outputEncoding=3000;this.autoClear=false;throw Error('simulated PMREM constructor failure')}};const env=studioEnvironment3(r);return env.state==='environment-fallback'&&r.target===original&&r.toneMapping===4&&r.outputEncoding===3001&&r.autoClear})()`));
run('toMenu();cfg.quality=2;render(.016)');
assert(run(`(()=>{const s=G3.showroom;return stageMirrorCamera3(s.mirror,s.cam)&&Math.abs(s.mirror.camera.position.y-(2*s.mirror.height-s.cam.position.y))<1e-8&&new THREE.Vector3(0,20,0).project(s.mirror.camera).z>-1&&new THREE.Vector3(0,-5,0).project(s.mirror.camera).z<-1&&s.mirror.camera.projectionMatrix.elements.every(Number.isFinite)})()`));
assert(run(`(()=>{const s=G3.showroom,original={id:'original-target'},r={target:original,toneMapping:THREE.ACESFilmicToneMapping,autoClear:false,xr:{enabled:true},shadowMap:{autoUpdate:true},calls:0,getRenderTarget(){return this.target},setRenderTarget(t){this.target=t},render(sc,cam){if(s.stage.visible||this.xr.enabled||this.shadowMap.autoUpdate||this.toneMapping!==THREE.NoToneMapping)throw Error('render state');this.calls++;sc.updateMatrixWorld();cam.updateMatrixWorld()}};updateStageMirror3(r,s,2);const ready=s.mirror.state==='ready'&&s.mirror.size===1024&&s.mirror.uniforms.stageMirrorStrength.value===.62&&r.calls===1&&r.target===original&&r.xr.enabled&&r.shadowMap.autoUpdate&&r.autoClear===false&&r.toneMapping===THREE.ACESFilmicToneMapping&&s.stage.visible;updateStageMirror3(r,s,0);return ready&&s.mirror.uniforms.stageMirrorStrength.value===0&&r.calls===1})()`));
assert(run(`(()=>{const s=G3.showroom,r={target:null,toneMapping:4,autoClear:false,xr:{enabled:true},shadowMap:{autoUpdate:true},calls:0,getRenderTarget(){return this.target},setRenderTarget(t){this.target=t},render(){this.calls++;throw Error('simulated unavailable GPU')}};updateStageMirror3(r,s,2);updateStageMirror3(r,s,2);const ok=r.calls===1&&s.mirror.state==='failed'&&s.stage.visible&&r.target===null&&r.toneMapping===4&&!r.autoClear&&r.xr.enabled&&r.shadowMap.autoUpdate&&s.mirror.uniforms.stageMirrorStrength.value===0;s.mirror.state='disabled';return ok})()`));
assert(run(`(()=>{const s=G3.showroom,shader={uniforms:{},vertexShader:THREE.ShaderLib.physical.vertexShader,fragmentShader:THREE.ShaderLib.physical.fragmentShader};s.top.material.onBeforeCompile(shader);return shader.vertexShader.includes('vStageReflection = stageMatrix * modelMatrix')&&shader.fragmentShader.includes('texture2D(stageReflection, stageUV)')&&shader.fragmentShader.includes('#include <tonemapping_fragment>')&&shader.fragmentShader.includes('#include <encodings_fragment>')&&shader.uniforms.stageMirrorStrength===s.mirror.uniforms.stageMirrorStrength})()`));
// Smooth panels stay finite and within the unchanged footplate envelope.
for(let i=0;i<4;i++)assert(run(`(()=>{const v=buildCar(CARS[${i}].c,CARS[${i}].d,false,${i});let panels=0,ok=true;v.g.updateMatrixWorld();v.g.traverse(o=>{if(o.name==='smooth-sculpted-panel'){panels++;if(!o.geometry.attributes.normal.array.every(Number.isFinite))ok=false}if(o.name==='sidepod-intake'&&!o.parent.parent)ok=false});const b=new THREE.Box3().setFromObject(v.g);disposeVehicle3(v);return ok&&panels===7&&b.min.x>=-55&&b.max.x<=56})()`));
const previousRotation=run('G3.showroom.stage.rotation.y');h.box.matchMedia=()=>({matches:false});run('render(.1)');assert(run('G3.showroom.stage.rotation.y')>previousRotation);assert(run('G3.showroom.stage.rotation.y===G3.showroom.pedestal.rotation.y'));
h.box.matchMedia=q=>({matches:q.includes('reduced-motion')});const stillRotation=run('G3.showroom.stage.rotation.y');run('render(.1)');assert.strictEqual(run('G3.showroom.stage.rotation.y'),stillRotation);
assert.strictEqual(h.errors.length,0,h.errors.join('\n'));
const report={version:'2.5.0',status:'AUTOMATED RUNTIME TESTED',scope:'Node VM, DOM/canvas/renderer/image-loader doubles; actual Three.js r128 geometry and camera math. Asset hashes and WebP signatures verified. No GPU rasterization or browser image decode.',
  studio_pmrem_failure_restoration:'PASS: bundled Three.js PMREM constructor and render failure restore target, tone mapping, encoding and autoClear with renderer double',live_stage_reflection_camera_clip_and_renderer_state:'PASS with GPU render double; simulated failure restores state and preserves physical fallback',mirror_shader_injection:'PASS against bundled Three.js r128 shader source; no actual GPU compile',smooth_sculpted_panels_and_unchanged_damage_envelope:'PASS',studio_rotation_reduced_motion:'PASS',photorealistic_portrait_assets:'PASS: four hashed WebP team artworks; not actual game screenshots',
  rounded_car_geometry_cap_normals_bevel_dimensions_wheel_spokes:'PASS; matching seam normals and five instanced-buffer disposal events',premium_circuit_structure_corridor_clearance:'PASS: actual world-space Box3 and independent centerline segment checks',quality_detail_visibility:'PASS',woven_fence_material_uvs:'PASS',machined_showroom_stage_geometry:'PASS',selection_assets_hashes_and_local_references:'PASS: three 1280x640 WebP mood artworks; real layout remains separate SVG',
  four_team_liveries_uv_physical_paint_labels:'PASS',ghost_material_and_texture_failure:'PASS',showroom_photo_background_aspect_shared_map_isolation:'PASS at 1440x900, 390x844, 500x375',showroom_fog_and_floor_repair:'PASS: no fog and radius78 stage',
  panorama_assets_async_cache_fallback:'PASS: three bundled panorama hashes and simulated loader paths',venue_drag_keyboard_reset_cancel_navigation:'PASS',atmosphere_quality_and_reduced_motion:'PASS',grand_prix_world_geometry:'PASS: finite geometry, instanced spectators and trackside structures',
  desert_paddock_tent_bounds:'PASS: real Three.js Box3 intersection check',simulation_random_seed:333,
  bundled_texture_files:'PASS: five manifest hashes and WebP signatures',tree_uvs_material_groups_instancing:'PASS',texture_cache_async_success_failure_fallback:'PASS',palm_frond_geometry:'PASS',
  all_car_track_combinations:combinations,old_save_compatibility:'PASS',geometry_and_material_lifecycle:'PASS',rain_racing_line_damage:'PASS',analog_multitouch_cancel_pause_blur:'PASS',settings_quality_camera_reset:'PASS',complete_qualifying_and_one_lap_race_with_AI:'PASS',reward_idempotency_and_completion_requirement:'PASS',missing_three_2d_fallback:'PASS',browser_visual_playtest:'NOT AVAILABLE',gpu_shader_compile:'NOT TESTED',physical_device:'NOT TESTED',measured_fps:'NOT TESTED'};
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
