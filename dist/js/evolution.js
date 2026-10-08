"use strict";
// UI and input enhancements use the existing simulation and vgp save namespace.
let ACTIVE_STEER_POINTER=null,STEER_ORIGIN=0,COACH_LAST='';
const VENUE_VIEW={yaw:0,pitch:0,pointer:null,lastX:0,lastY:0};
function releaseVenuePointer(){const v=$('#horizonview');if(VENUE_VIEW.pointer!==null){const id=VENUE_VIEW.pointer;VENUE_VIEW.pointer=null;try{v.releasePointerCapture(id)}catch(e){}}v?.classList.remove('dragging')}
function updateVenueView(){const degrees=((Math.round(VENUE_VIEW.yaw*180/Math.PI)%360)+360)%360;$('#horizonview').setAttribute('aria-valuenow',String(degrees));$('#horizonview').setAttribute('aria-valuetext',degrees+' Grad');}
function initVenueView(){
  const view=$('#horizonview');
  view.addEventListener('pointerdown',e=>{if(!G3?.ok||UI_SCREEN!=='menu'||VENUE_VIEW.pointer!==null||e.button>0)return;e.preventDefault();VENUE_VIEW.pointer=e.pointerId;VENUE_VIEW.lastX=e.clientX;VENUE_VIEW.lastY=e.clientY;view.setPointerCapture(e.pointerId);view.classList.add('dragging')});
  view.addEventListener('pointermove',e=>{if(e.pointerId!==VENUE_VIEW.pointer)return;e.preventDefault();VENUE_VIEW.yaw+=(e.clientX-VENUE_VIEW.lastX)*.007;VENUE_VIEW.pitch=Math.max(-.35,Math.min(.4,VENUE_VIEW.pitch+(e.clientY-VENUE_VIEW.lastY)*.003));VENUE_VIEW.lastX=e.clientX;VENUE_VIEW.lastY=e.clientY;updateVenueView()});
  for(const type of['pointerup','pointercancel','lostpointercapture'])view.addEventListener(type,e=>{if(e.pointerId===VENUE_VIEW.pointer)releaseVenuePointer()});
  view.addEventListener('keydown',e=>{if(!G3?.ok||UI_SCREEN!=='menu')return;const action={ArrowLeft:-.15,ArrowRight:.15,PageDown:-.5,PageUp:.5}[e.code];if(action!==undefined){e.preventDefault();VENUE_VIEW.yaw+=action}else if(e.code==='Home'){e.preventDefault();VENUE_VIEW.yaw=0;VENUE_VIEW.pitch=0}updateVenueView()});
  $('#horizonreset').onclick=()=>{VENUE_VIEW.yaw=0;VENUE_VIEW.pitch=0;releaseVenuePointer();updateVenueView()};
  addEventListener('blur',releaseVenuePointer);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseVenuePointer()});updateVenueView();
}
function clearControls(){
  for(const k in KY)KY[k]=0;for(const k in TC)TC[k]=0;
  const pad=$('#steerpad');if(ACTIVE_STEER_POINTER!==null){try{pad.releasePointerCapture(ACTIVE_STEER_POINTER)}catch(e){}}ACTIVE_STEER_POINTER=null;
  $('#steerknob')?.style.setProperty('--steer','0px');pad?.classList.remove('active');$$('#tc button').forEach(b=>b.classList.remove('d'));
}
function applyEvolutionPreferences(){
  document.body.dataset.touch=String(cfg.touch);document.body.dataset.quality=String(cfg.quality);document.body.dataset.shake=String(cfg.shake);
  if(G3?.cur?.world)G3.cur.world.guide.visible=cfg.line&&!R.demo;
}
function setAnalogSteer(clientX){
  const dx=Math.max(-42,Math.min(42,clientX-STEER_ORIGIN));TC.axis=dx/42;$('#steerknob').style.setProperty('--steer',dx+'px');
}
function initEvolution(){
  applyEvolutionPreferences();
  initVenueView();
  const pad=$('#steerpad');
  pad.addEventListener('pointerdown',e=>{if(ACTIVE_STEER_POINTER!==null||!R||R.demo||R.paused||!['form','count','run'].includes(R.ph))return;e.preventDefault();initAudio();ACTIVE_STEER_POINTER=e.pointerId;STEER_ORIGIN=e.clientX;pad.setPointerCapture(e.pointerId);pad.classList.add('active');setAnalogSteer(e.clientX)});
  pad.addEventListener('pointermove',e=>{if(e.pointerId===ACTIVE_STEER_POINTER){e.preventDefault();setAnalogSteer(e.clientX)}});
  for(const type of['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(e.pointerId===ACTIVE_STEER_POINTER){ACTIVE_STEER_POINTER=null;TC.axis=0;pad.classList.remove('active');$('#steerknob').style.setProperty('--steer','0px')}});
  $('#camcycle').onclick=()=>{if(!R||R.demo||R.paused)return;CAMF=((+CAMF)+1)%3;toast(['CHASE-KAMERA','HOHE KAMERA','COCKPIT-KAMERA'][CAMF],'#72cbdd')};
  $('#recover').onclick=()=>{if(R?.pl&&R.ph==='run'&&!R.paused&&!R.pl.auto){respawn(R.pl);toast('ZURÜCK AUF DER STRECKE')}};
  // A live showroom label and quick-select world cards share existing choices.
  $('#worldsel').innerHTML=TRK.map((t,i)=>`<button class="world-card" data-track="${i}" aria-label="${t.n} auswählen"><div class="world-thumb">${circuitArtwork(i)}</div><span><small>${t.c.toUpperCase()}</small><b>${['ROSSO','HARBOR','DESERT ARC'][i]}</b></span></button>`).join('');
  $$('#worldsel button').forEach(b=>b.onclick=()=>{cfg.track=+b.dataset.track;sv();newRace(true);updateMenuEvolution()});
  const badge=document.createElement('div');badge.className='showroom-caption';badge.id='showroomcaption';$('#menu').appendChild(badge);
  const garageNote=document.createElement('div');garageNote.className='garage-spec';garageNote.id='garagespec';$('#garage').appendChild(garageNote);
  $('#pzb').setAttribute('aria-label','Spiel pausieren');
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearControls()});
}
function updateMenuEvolution(){
  const c=CARS[cfg.car],t=TRK[cfg.track],log=ST.g('evolution',{});
  $$('#worldsel button').forEach(b=>{const selected=+b.dataset.track===cfg.track;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected))});
  $('#showroomcaption').innerHTML=`<small>${c.t.toUpperCase()}</small><b>${c.n}</b><span>${['BALANCE / PRÄZISION','AGILITÄT / ANTRITT','TEMPO / ANGRIFF','GRIP / KONTROLLE'][cfg.car]}</span>`;
  $('#session').innerHTML=`<span>${log.races||0} <small>RENNEN</small></span><span>${log.wins||0} <small>SIEGE</small></span><span>${fmt(ST.g('b'+cfg.track,0))} <small>BESTZEIT · ${t.c.toUpperCase()}</small></span>`;
  $('#venuecaption').textContent=WORLD_THEMES[cfg.track].label;document.body.dataset.webgl=G3?.ok?'true':'false';
}
function updateGarageEvolution(){
  const c=CARS[cfg.car];$('#garagespec').innerHTML=`<small>${c.t.toUpperCase()}</small><b>${['BALANCE / PRÄZISION','AGILITÄT / ANTRITT','TEMPO / ANGRIFF','GRIP / KONTROLLE'][cfg.car]}</b><span>Wähle dein Team. Entwickle dein Fahrzeug.</span>`;
}
function recordSessionEvolution(r,pos,earned){
  if(r.mode==='time'||!r.pl.fo||r.pl.dnf)return;
  const e=ST.g('evolution',{});e.races=(e.races||0)+1;e.wins=(e.wins||0)+(pos===1?1:0);e.podiums=(e.podiums||0)+(pos<=3?1:0);e.lastTrack=r.T.i;e.earned=(e.earned||0)+earned;ST.s('evolution',e);
}
function updateRaceEvolution(){
  const r=R,c=r.pl;if(!c)return;const context=r.q?'QUALIFYING':r.mode==='time'?'TIME ATTACK':r.mode==='career'?'CHAMPIONSHIP':'GRAND PRIX';
  const ctxt=context+' / '+r.T.n;if($('#racecontext').textContent!==ctxt)$('#racecontext').textContent=ctxt;
  let msg='',kind='';
  if(r.ph==='run'&&!c.fin&&!r.paused){
    if(c.dnf){msg='TOTALSCHADEN';kind='brake'}
    else if(c.bo){msg='BOOST AKTIV';kind='boost'}
    else if(c.sl){msg='WINDSCHATTEN';kind='boost'}
    else if(c.sf[0]<.8){msg='ZURÜCK AUF DEN ASPHALT';kind='brake'}
    else if(cfg.line){const tv=Math.min(...Array.from({length:10},(_,i)=>r.T.vl[(c.i+i)%r.T.N]));if(c.v>tv*1.12){msg='BREMSPUNKT';kind='brake'}}
  }
  const sig=kind+msg;if(sig!==COACH_LAST){COACH_LAST=sig;const e=$('#coach');e.textContent=msg;e.dataset.kind=kind;e.classList.toggle('visible',!!msg)}
}
function circuitArtwork(i){return `<div class="circuit-photo"><div class="art-fallback">${circuitFallbackArtwork(i)}</div><img src="assets/selection/${['rosso','harbor','desert'][i]}.webp" width="1280" height="640" loading="lazy" decoding="async" alt=""></div>`}
function circuitFallbackArtwork(i){
  const common='viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"';
  const road='<path d="M-30 178 Q95 90 202 138 T445 99" fill="none" stroke="#1a2330" stroke-width="38"/><path d="M-30 164 Q95 78 202 124 T445 85" fill="none" stroke="#f0f2ee" stroke-width="2" opacity=".55"/>';
  if(i===0)return `<svg ${common}><defs><linearGradient id="artgold" x2="0" y2="1"><stop stop-color="#8da8b1"/><stop offset="1" stop-color="#efd0a1"/></linearGradient></defs><path fill="url(#artgold)" d="M0 0H400V190H0z"/><circle cx="306" cy="44" r="23" fill="#fbe4b6"/><path d="M0 101 Q70 35 139 94 T300 76 T400 110 V190H0" fill="#65775a"/><path d="M0 122 Q96 59 198 112 T400 90V190H0" fill="#435d46"/><path d="M240 72h53v34h-53z" fill="#c1a989"/><path d="m232 73 35-23 34 23" fill="#875b48"/><path d="M54 122 67 57 80 122M98 118l10-63 12 63" fill="#264533"/>${road}</svg>`;
  if(i===1)return `<svg ${common}><defs><linearGradient id="artneon" x2="0" y2="1"><stop stop-color="#20253d"/><stop offset="1" stop-color="#a0698b"/></linearGradient></defs><path fill="url(#artneon)" d="M0 0H400V190H0z"/><path d="M0 89h28V41h37v53h17V16h35v69h20V56h47v39h34V28h44v54h23V48h52v50h20V21h31v77h12v92H0" fill="#263b4f"/><path d="M34 50h23m30-24h24m112 12h33m104-6h22M90 42h20m-21 15h20m115 2h27m-80 7h16m-14 12h16" stroke="#67d6df" stroke-width="3" opacity=".7"/><path d="M0 116h400v74H0" fill="#213644"/>${road}<path d="M-30 165Q95 78 202 125T445 86" fill="none" stroke="#5ce5ec" stroke-width="3"/><path d="M-30 187Q95 103 202 148T445 110" fill="none" stroke="#d37bbd" stroke-width="2"/></svg>`;
  return `<svg ${common}><defs><linearGradient id="artdesert" x2="0" y2="1"><stop stop-color="#85809d"/><stop offset="1" stop-color="#ecc49a"/></linearGradient></defs><path fill="url(#artdesert)" d="M0 0H400V190H0z"/><circle cx="291" cy="53" r="29" fill="#f9d4a9"/><path d="M0 138 Q63 46 170 98 T400 92V190H0" fill="#c3a582"/><path d="M0 153Q135 80 261 127T400 110V190H0" fill="#ae8f70"/><path d="M67 105V43h27v62M63 55h35m-36 16h37m-36 16h37" fill="#d5c7ac" stroke="#9b8770" stroke-width="3"/><path d="M320 129V86m0 0q-26-18-39-3m39 3q30-23 47-5m-47 5q-7-27-24-28" stroke="#55664b" stroke-width="5" fill="none"/>${road}</svg>`;
}
