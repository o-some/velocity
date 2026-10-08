"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#g'),cx=cv.getContext('2d'),mc=$('#mm').getContext('2d');
let W,H,DPR,G3=null,UI_SCREEN='menu';const rs=()=>{DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;if(G3&&G3.r){G3.r.setPixelRatio(Math.min(DPR,[.85,1.25,1.6][cfg.quality]||1.25));G3.r.setSize(W,H,false);G3.cam.aspect=W/H;G3.cam.updateProjectionMatrix()}};addEventListener('resize',rs);rs();
const ST={g(k,d){try{const v=localStorage.getItem('vgp'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},s(k,v){try{localStorage.setItem('vgp'+k,JSON.stringify(v))}catch(e){}}};
const cfg=Object.assign({car:0,track:0,laps:3,diff:1,snd:true,rain:false,quality:1,touch:0,sens:1,assist:true,line:false,shake:true},ST.g('cfg',{})),sv=()=>ST.s('cfg',cfg);
// Retain older saves while constraining corrupted/outdated preferences.
for(const [k,max] of [['car',3],['track',2],['diff',2],['quality',2],['touch',1]])cfg[k]=Math.max(0,Math.min(max,Math.floor(Number(cfg[k])||0)));
cfg.laps=Math.max(1,Math.min(99,Math.floor(Number(cfg.laps)||3)));cfg.sens=[.8,1,1.2].includes(cfg.sens)?cfg.sens:1;
const wr=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a};
const fmt=t=>{if(!t||!isFinite(t))return'—';const ms=Math.round(t*1000),m=Math.floor(ms/60000),s=(ms-m*60000)/1000;return m+':'+(s<10?'0':'')+s.toFixed(3)};
const DS=40,TW=190;
const CARS=[
{n:'AURORA AR-1',t:'Aurora Dynamics',c:'#ff2a36',d:'#ffffff',s:[88,84,78,80,76]},
{n:'NOVA NX-7',t:'Nova Racing',c:'#22d3ee',d:'#0b1020',s:[82,90,80,86,84]},
{n:'HELIX H3',t:'Helix Motorsport',c:'#ffd60a',d:'#15151a',s:[93,76,74,72,66]},
{n:'TITAN TX',t:'Titan Works',c:'#9bf03a',d:'#15151a',s:[78,82,92,90,92]}];
const DRV=['Ravel','Okafor','Lindqvist','Tanaka','Moreau','Duarte','Kessler','Bianchi'],PTS=[25,18,15,12,10,8,6,4];
const TR=[
{n:'Autodromo Rosso',c:'Italien',f:'🇮🇹',s:.62,st:2480,p:[0,0,4,0,8,0,12,.2,15,2,16,5,14.5,8.2,11,9.6,7,9.4,3.5,8.4,0,9.2,-3.2,7.6,-4.4,4.4,-3.6,1.6]},
{n:'Neon Harbor GP',c:'Japan',f:'🇯🇵',s:.6,st:2400,p:[0,0,4,0,8,0,12,.4,14.4,2.8,13.2,6,10,7.6,7.6,10,4,11.4,0,10.2,-2.8,7,-3.2,3.2,-2.2,.8]},
{n:'Desert Arc Circuit',c:'Bahrain',f:'🇧🇭',s:.58,st:2320,p:[0,0,4,0,8,0,12.5,.4,16,3,16.4,7,13.4,10,9,10.8,5,9.2,1.6,10.6,-2.4,8.4,-3.8,4.4,-3,1.2]}];

function build(t){
  const r=t.p,n=r.length/2,S=t.s*1000,q=[];
  for(let k=0;k<n;k++){const g=j=>{const m=(k+j+n)%n;return[r[2*m]*S,r[2*m+1]*S]},A=g(-1),B=g(0),C=g(1),D=g(2);
    for(let u=0;u<16;u++){const s=u/16,s2=s*s,s3=s2*s;q.push([0,1].map(i=>.5*(2*B[i]+(C[i]-A[i])*s+(2*A[i]-5*B[i]+4*C[i]-D[i])*s2+(3*B[i]-A[i]-3*C[i]+D[i])*s3)))}}
  const M=q.length,cum=[0];for(let i=0;i<M;i++){const p=q[i],o=q[(i+1)%M];cum.push(cum[i]+Math.hypot(o[0]-p[0],o[1]-p[1]))}
  const L=cum[M],N=Math.round(L/DS),ds=L/N;let P=[],z=0;
  for(let m=0;m<N;m++){const tg=m*ds;while(cum[z+1]<tg)z++;const f=(tg-cum[z])/(cum[z+1]-cum[z]),p=q[z],o=q[(z+1)%M];P.push({x:p[0]+(o[0]-p[0])*f,y:p[1]+(o[1]-p[1])*f})}
  const k0=Math.round(t.st/ds);P=P.slice(k0).concat(P.slice(0,k0));
  const th=P.map((p,i)=>{const a=P[(i+N-1)%N],b=P[(i+1)%N];return Math.atan2(b.y-a.y,b.x-a.x)});
  P.forEach((p,i)=>{p.t=th[i];p.nx=-Math.sin(th[i]);p.ny=Math.cos(th[i])});
  const kp=P.map((p,i)=>Math.abs(wr(th[(i+3)%N]-th[(i-3+N)%N]))/(6*ds)),ks=kp.map((v,i)=>{let s=0;for(let j=-2;j<=2;j++)s+=kp[(i+j+N)%N];return s/5});
  const vl=ks.map(k=>Math.min(2200,Math.sqrt(700/Math.max(k,1e-5))));
  let cn=0,on=false;ks.forEach(k=>{const h=k>1/1900;if(h&&!on)cn++;on=h});
  const path=new Path2D();P.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));path.closePath();
  const off=(a,b,o)=>{const z=new Path2D();for(let i=a;i<=b;i++){const p=P[(i+N)%N],x=p.x+p.nx*o,y=p.y+p.ny*o;i==a?z.moveTo(x,y):z.lineTo(x,y)}return z};
  const stands=[off(-26,26,TW/2+150),off(-26,26,-TW/2-150)];
  const trees=new Path2D();let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<N;i+=3)for(const sg of[-1,1]){const p=P[i],o=sg*(TW/2+260+rnd()*480),x=p.x+p.nx*o,y=p.y+p.ny*o,rr=28+rnd()*40;trees.moveTo(x+rr,y);trees.arc(x,y,rr,0,7)}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;P.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)});
  const fit=(w,h,pd)=>{const s=Math.min((w-2*pd)/(x1-x0),(h-2*pd)/(y1-y0));return{s,ox:(w-(x1-x0)*s)/2-x0*s,oy:(h-(y1-y0)*s)/2-y0*s}};
  const ma=fit(150,150,14),mb=fit(200,130,14),mpath=new Path2D(),sv2=[];
  P.forEach((p,i)=>{if(i%4==0){const X=p.x*ma.s+ma.ox,Y=p.y*ma.s+ma.oy;i?mpath.lineTo(X,Y):mpath.moveTo(X,Y);sv2.push((sv2.length?'L':'M')+(p.x*mb.s+mb.ox).toFixed(1)+' '+(p.y*mb.s+mb.oy).toFixed(1))}});mpath.closePath();
  return{...t,P,N,ds,L,vl,cn,path,stands,trees,mpath,a:ma,svg:'<path d="'+sv2.join('')+'Z"/>',km:L*.0917/1000};
}
const TRK=TR.map((t,i)=>build({...t,i}));

const phys=s=>({vmax:820+s[0]*1.4,acc:(200+s[1]*2.2)*.55,brk:330+s[2]*3.2,lat:420+s[3]*3.4,df:s[4]});
const surf=d=>{d=Math.abs(d);const h=TW/2;return d<h?[1,1,0]:d<h+13?[.92,.98,.1]:d<h+55?[.5,.42,1.8]:[.32,.26,3.4]};
let R,PT=[],SK=[],DB=[],CAMF=false;const CM={x:0,y:0,a:0,z:1,sh:0},KY={},TC={};
const DZ=$$('#dsv [data-z]');
const E={hud:$('#hud'),sp:$('#sp'),gr:$('#gr'),rv:$('#rv'),pp:$('#pp'),pt:$('#pt2'),lp:$('#lp'),tm:$('#tm'),ls:$('#ls'),tw:$('#tw'),en:$('#en'),eb:$('#enb'),dp:$('#dpc'),ds:$('#dsp')};
const pf=(x,y,vx,vy,l,r,c,g)=>{if(PT.length<700)PT.push({x,y,vx,vy,l,m:l,r,c,g})};

/* ---- Audio ---- */
let AC,eo,eg,ef,nb,A={},DEAD=0;
function initAudio(){if(DEAD)return;if(AC){if(AC.state=='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();
  const cp=AC.createDynamicsCompressor(),m=AC.createGain();m.gain.value=.65;m.connect(cp);cp.connect(AC.destination);AC.m=m;
  const L=AC.sampleRate*2,b=AC.createBuffer(1,L,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<L;i++)d[i]=Math.random()*2-1;nb=b;
  const nz=(ty,f,q)=>{const s=AC.createBufferSource();s.buffer=nb;s.loop=true;const fl=AC.createBiquadFilter();fl.type=ty;fl.frequency.value=f;fl.Q.value=q;const g=AC.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(m);s.start();return{f:fl,g}};
  A.wind=nz('bandpass',600,.6);A.sq=nz('bandpass',2300,9);A.gr=nz('lowpass',500,.7);A.bo=nz('highpass',1800,.5);A.ia=nz('bandpass',1200,.8);A.ex=nz('lowpass',700,.6);
  const sh=AC.createWaveShaper(),cv=new Float32Array(256);for(let i=0;i<256;i++)cv[i]=Math.tanh((i/128-1)*2.4);sh.curve=cv;
  /* V8-4-Takt: Oszillator = Arbeitstakt (U/min/120); Harmonische = Motorordnungen, jede 8. = Zündfolge */
  sh.oversample='2x';const pw=()=>{const N=96,re=new Float32Array(N),im=new Float32Array(N);for(let h=1;h<N;h++){const w=h%8==0?Math.pow(h/8,-.7):h%2==0?.3*Math.pow(h/2,-.5):.12*Math.pow(h,-.3),p=(h%8?6.28:.8)*Math.random();re[h]=w*Math.cos(p);im[h]=w*Math.sin(p)}return AC.createPeriodicWave(re,im)};
  const ch=[[200,2.2,7],[620,2.5,6],[1650,2.5,5],[3500,2,3]].reduce((n,[fr,q,gn])=>{const bq=AC.createBiquadFilter();bq.type='peaking';bq.frequency.value=fr;bq.Q.value=q;bq.gain.value=gn;n.connect(bq);return bq},sh);
  ef=AC.createBiquadFilter();ef.type='lowpass';ef.frequency.value=900;ef.Q.value=.7;eg=AC.createGain();eg.gain.value=0;ch.connect(ef);ef.connect(eg);eg.connect(m);
  const rb=AC.createBuffer(1,AC.sampleRate*.4|0,AC.sampleRate),rd=rb.getChannelData(0),cr=AC.createConvolver(),rw=AC.createGain();for(let i=0;i<rd.length;i++)rd[i]=(Math.random()*2-1)*Math.pow(1-i/rd.length,3);cr.buffer=rb;rw.gain.value=.2;eg.connect(cr);cr.connect(rw);rw.connect(m);
  const W=pw();eo=[1,1.004].map((r,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.setPeriodicWave(i?pw():W);o.r=r;g.gain.value=i?.4:.6;o.connect(g);g.connect(sh);o.start();return o});
  A.ro=AC.createOscillator();A.ro.setPeriodicWave(W);const rf=AC.createBiquadFilter();rf.type='lowpass';rf.frequency.value=1200;A.rg=AC.createGain();A.rg.gain.value=0;A.ro.connect(rf);rf.connect(A.rg);
  if(AC.createStereoPanner){A.rp=AC.createStereoPanner();A.rg.connect(A.rp);A.rp.connect(m)}else A.rg.connect(m);A.ro.start();
}catch(e){AC=null}}
function beep(f,d,v){if(!AC||!cfg.snd)return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.m);o.start();o.stop(t+d)}
function burst(f,d,v,ty){if(!AC||!nb||!cfg.snd)return;const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;s.buffer=nb;fl.type=ty||'lowpass';fl.frequency.setValueAtTime(f,t);fl.frequency.exponentialRampToValueAtTime(Math.max(40,f/4),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(AC.m);s.start(t,Math.random(),d+.05)}
function crash(v){if(!AC||!nb||!cfg.snd)return;const q=Math.min(.8,v/260);burst(2200,.5,q);const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type='sine';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.25);g.gain.setValueAtTime(q,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(AC.m);o.start(t);o.stop(t+.32)}
function fanfare(w){(w?[523,659,784,1047]:[392,330]).forEach((f,i)=>setTimeout(()=>{if(R&&!R.demo)beep(f,.35,.12)},i*130))}
function eng(c,on){
  if(!AC||!eg)return;const t=AC.currentTime,run=on&&cfg.snd&&!R.paused,f=Math.max(20,c.rpmS/120),rr=Math.min(1,c.rpmS/12800);
  A.j=(A.j||0)+(Math.random()*2-1-(A.j||0))*.25;
  eo.forEach(o=>o.frequency.setTargetAtTime(f*o.r*(1+A.j*.005),t,.03));
  ef.frequency.setTargetAtTime(500+(.25+.75*c.thr)*(2200+c.rpmS*.4),t,.05);
  eg.gain.setTargetAtTime(run?(.035+c.thr*.065)*(.7+rr*.4)*(t<A.cut?.25:1)*(1+A.j*.07):0,t,.04);
  A.ia.g.gain.setTargetAtTime(run?c.thr*rr*rr*.05:0,t,.06);A.ia.f.frequency.setTargetAtTime(500+c.rpmS*.15,t,.06);
  A.ex.g.gain.setTargetAtTime(run?(.012+c.thr*.03)*rr:0,t,.06);
  const v=run?c.v||0:0,vr=Math.min(1,v/950);
  A.wind.g.gain.setTargetAtTime(vr*vr*.2,t,.1);A.wind.f.frequency.setTargetAtTime(400+vr*1400,t,.1);
  A.sq.g.gain.setTargetAtTime(run&&c.slipA>60&&c.sf[0]>.9?Math.min(.09,(c.slipA-60)/900):0,t,.05);
  A.gr.g.gain.setTargetAtTime(run&&c.sf[2]>1?Math.min(.22,v/2500):0,t,.08);
  A.bo.g.gain.setTargetAtTime(run&&c.bo?.12:0,t,.08);
  let nd=1e9,nc=null;if(run&&!R.demo)for(const o of R.cars)if(o!==c){const d=Math.hypot(o.x-c.x,o.y-c.y);if(d<nd){nd=d;nc=o}}
  const q=nc&&nd<700?1-nd/700:0;A.ro.frequency.setTargetAtTime(nc?Math.max(20,nc.rpmS/120):40,t,.05);A.rg.gain.setTargetAtTime(q*q*.07,t,.08);
  if(A.rp&&nc)A.rp.pan.setTargetAtTime(Math.max(-1,Math.min(1,Math.sin(Math.atan2(nc.y-c.y,nc.x-c.x)-c.a))),t,.1);
  if(run){if(A.g&&c.gear>A.g){burst(900,.08,.08,'bandpass');A.cut=t+.07}if(c.thr<.1&&c.rpmS>7000&&Math.random()<(A.th>.7?.5:.06))burst(300+Math.random()*700,.05+Math.random()*.06,.04+Math.random()*.09,'bandpass');A.g=c.gear;A.th=c.thr}
}

/* ---- Rennlogik ---- */
function getUp(i){const u=ST.g('ups',{})[i];return Array.isArray(u)&&u.length==5?u:[0,0,0,0,0]}
const dsc=(tm,nm)=>({tm,nm,pf:(Math.random()-.5)*50,rc:.15+Math.random()*.4,sk:[.78,.86,.94][cfg.diff]+Math.random()*.05});
let QL=null;
function mkCar(T,i,d,isP){
  const K=CARS[d.tm],dist=60+(i>>1)*110+(i&1)*55,P0=T.P[0],ln=(i&1?1:-1)*38;
  return{id:i,isP,name:isP?'Du':DRV[d.nm],code:isP?'DU':DRV[d.nm].slice(0,3).toUpperCase(),team:K.t,col:K.c,col2:K.d,ph:phys(isP?K.s.map((v,k)=>v+getUp(d.tm)[k]*3):K.s),
    x:P0.x-Math.cos(P0.t)*dist+P0.nx*ln,y:P0.y-Math.sin(P0.t)*dist+P0.ny*ln,a:P0.t,vx:0,vy:0,v:0,steer:0,i:(T.N-Math.round(dist/T.ds)+T.N)%T.N,
    lap:0,lapT:-1,best:0,last:0,fin:0,fo:0,en:1,bo:0,d:0,sf:[1,1,0],gear:1,rpmS:4000,thr:0,brk:0,shT:0,sl:0,stun:0,gl:ln,lane:ln,pref:d.pf,
    react:d.rc,skill:d.sk,auto:false,slipA:0,w:null,prog:0,dmg:0,av:0,dz:[0,0,0,0]}
}
function simLap(T,d){
  const sv=R,c=mkCar(T,0,d,false);R={T,demo:true,mode:'race',laps:1,t:0,nf:0,cars:[c],rec:[],rk:[c],hold:0};
  for(let k=0;k<30000&&!c.fin;k++){loc(c);c.sl=0;step(c,ai(c,.0167),.0167);R.t+=.0167}
  R=sv;return c.last||9999;
}
function newRace(demo,mode,q){
  const T=TRK[mode=='career'?ST.g('rnd',0)%3:cfg.track],Q=mode=='time'||q=='q',pool=[0,1,2,3,0,1,2,3];
  if(!demo)pool.splice(pool.indexOf(cfg.car),1);pool.sort(()=>Math.random()-.5);
  let L=[];
  if(q=='g'&&QL)L=QL.g;
  else{
    const n=Q?1:8;
    for(let i=0;i<n;i++){const isP=!demo&&i==(Q?0:4);L.push({p:isP,d:dsc(isP?cfg.car:pool.pop(),i)})}
    if(q=='q'){QL={ai:[]};for(let k=0;k<8;k++)if(k!=4){const d=dsc(pool.pop(),k);QL.ai.push({p:0,d,t:simLap(T,d)})}}
  }
  R={T,demo,mode,q:q=='q',laps:demo?999:q=='q'?1:mode=='career'?3:cfg.laps,t:0,pt:0,ph:demo?'run':'form',nl:0,nf:0,cars:[],fl:null,rk:[],paused:false,rec:[],gh:null,hold:.3+Math.random()*.8};
  PT=[];SK=[];DB=[];
  L.forEach((x,i)=>R.cars.push(mkCar(T,i,x.d,!!x.p)));
  R.cars.forEach(loc);R.rk=[...R.cars];R.pl=R.cars.find(c=>c.isP);R.focus=R.pl||R.cars[0];
  CM.a=R.focus.a;CM.sh=0;
}
function qualiEnd(){
  const pl=R.pl,g=[...QL.ai,{p:1,d:dsc(cfg.car,4),t:pl.last||pl.fin||9999}].sort((a,b)=>a.t-b.t);QL.g=g;R.ph='done';
  $('#qb').innerHTML=g.map((x,i)=>`<tr class="${x.p?'me':''}" style="--d:${i*.07}s"><td>${i+1}</td><td><i style="background:${CARS[x.d.tm].c}"></i>${x.p?'Du':DRV[x.d.nm]}<small>${CARS[x.d.tm].t}</small></td><td>${i?'+'+(x.t-g[0].t).toFixed(3):fmt(x.t)}</td></tr>`).join('');
  E.hud.classList.remove('on');lights(0);show('qres');
}
function loc(c){
  const T=R.T,P=T.P,N=T.N;let bi=c.i,bd=1e12;
  const sc=(lo,hi)=>{for(let k=lo;k<=hi;k++){const j=(k%N+N)%N,p=P[j],dx=c.x-p.x,dy=c.y-p.y,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;bi=j}}};
  sc(c.i-8,c.i+12);if(bd>360000){bd=1e12;sc(0,N-1)}
  const p=P[bi];c.pi=c.i;c.i=bi;const dx=c.x-p.x,dy=c.y-p.y;
  c.d=dx*p.nx+dy*p.ny;c.fr=(dx*Math.cos(p.t)+dy*Math.sin(p.t))/T.ds;c.sf=surf(c.d);
  if(c.pi>N*.75&&c.i<N*.25){c.lap++;lapX(c)}else if(c.pi<N*.25&&c.i>N*.75)c.lap--;
  c.prog=c.lap*N+c.i+c.fr;
  const ea=c.a-p.t,lim=TW/2+80-Math.abs(Math.sin(ea))*49-Math.abs(Math.cos(ea))*21;
  for(const k of[0,-2,-1,1,2]){const p=P[(bi+k+N)%N],d=(c.x-p.x)*p.nx+(c.y-p.y)*p.ny,ss=(c.x-p.x)*Math.cos(p.t)+(c.y-p.y)*Math.sin(p.t);if((k==0||Math.abs(ss)<T.ds*.75)&&Math.abs(d)>lim){const e=Math.abs(d)-lim,sg=Math.sign(d);c.x-=p.nx*sg*e;c.y-=p.ny*sg*e;const vn=(c.vx*p.nx+c.vy*p.ny)*sg;
    if(vn>0){c.vx-=p.nx*sg*vn*1.4;c.vy-=p.ny*sg*vn*1.4;const q=1-Math.min(.2,.005+vn/1500);c.vx*=q;c.vy*=q;if(vn>80)hit(c.x,c.y,vn,c.isP,c,null,p.nx*sg,p.ny*sg);if(vn>150)c.av=(c.av||0)+(Math.random()<.5?-1:1)*Math.min(4,vn*.008)}}}
}
function lapX(c){
  const t=R.t;
  if(c.lap>=2&&c.lapT>=0){const lt=t-c.lapT;c.last=lt;if(!c.best||lt<c.best)c.best=lt;if(c.isP){const nw=lt<=c.best;recBest(lt);if(nw)R.gh=R.rec;R.rec=[];toast('RUNDE '+(c.lap-1)+' · '+fmt(lt)+(nw?' · BESTZEIT':'')+(c.lap==R.laps?' · LETZTE RUNDE':''),nw?'#b45cff':'var(--r)');if(nw)beep(1300,.15,.12)}}
  c.lapT=t;
  if(c.lap>R.laps&&!c.fin){c.fin=t;c.fo=++R.nf;if(c.isP)playerDone()}
}
const recBest=t=>{const k='b'+R.T.i,b=ST.g(k,0);if(!b||t<b)ST.s(k,t)};
function hit(x,y,v,pl,c1,c2,dx,dy){
  const f=R&&R.focus,fd=f?Math.hypot(x-f.x,y-f.y):0;if(!(R&&R.demo)&&(pl||fd<900))crash(pl?v:v*(1-fd/900));
  if(pl){CM.sh=Math.min(22,v*.08);if(v>180)CM.fl=Math.min(.45,v/700)}
  for(let i=0;i<Math.min(26,v/8);i++){const a=Math.random()*6.28,s=120+Math.random()*420;pf(x,y,Math.cos(a)*s,Math.sin(a)*s,.3+Math.random()*.4,1.6,Math.random()<.5?'#ffd27a':'#ff9a3c',1);const q=PT[PT.length-1];if(q)q.k=1}
  if(v>90)for(let i=0;i<3;i++)pf(x,y,(Math.random()-.5)*70,(Math.random()-.5)*70,.9,12,'rgba(210,210,215,.35)',0);
  if(v>150){const cl=[c1&&c1.col,c2&&c2.col,'#15151a','#d8dbe2'].filter(Boolean);for(let i=0;i<Math.min(12,v/35|0);i++){const a=Math.random()*6.28,s=60+Math.random()*320;DB.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,a:Math.random()*6.28,va:(Math.random()-.5)*20,l:5+Math.random()*4,w:3+Math.random()*9,h:2+Math.random()*5,c:cl[i%cl.length]})}while(DB.length>160)DB.shift()}
  const zn=(c,ex,ey)=>{if(!c||v<=110)return;const fw=ex*Math.cos(c.a)+ey*Math.sin(c.a),lt=-ex*Math.sin(c.a)+ey*Math.cos(c.a),z=Math.abs(fw)>Math.abs(lt)?(fw>0?0:2):(lt>0?1:3);
    c.dz=c.dz||[0,0,0,0];const b=c.dz[z];c.dz[z]=Math.min(1,b+v/1100);c.dmg=Math.min(.9,(c.dmg||0)+v/1800);
    {const nb=c.dz[z],cs=Math.cos(c.a),sn=Math.sin(c.a),fo=z==0?28:z==2?-30:0,lo=z==1?14:z==3?-14:0,px=c.x+cs*fo-sn*lo,py=c.y+sn*fo+cs*lo,rn=Math.random;
      for(const th of[.3,.6,.85])if(b<th&&nb>=th){for(let k=0;k<5;k++)DB.push({x:px,y:py,vx:c.vx*.8+(rn()-.5)*280,vy:c.vy*.8+(rn()-.5)*280,a:rn()*6.28,va:(rn()-.5)*18,l:7+rn()*4,w:5+rn()*10,h:3+rn()*9,c:k%2?c.col:'#15151a'});
        if(th==.85&&z%2)DB.push({x:px,y:py,vx:c.vx*.9+(rn()-.5)*200,vy:c.vy*.9+(rn()-.5)*200,a:rn()*6.28,va:12,l:10,w:14,h:14,c:'#08080a'});
        if(c.isP&&z%2&&th==.6)toast('SEITENKASTEN BESCHÄDIGT','#ff2a36');if(c.isP&&z%2&&th==.85)toast('RAD BESCHÄDIGT','#ff2a36')}}
    if(z==0&&b<.45&&c.dz[0]>=.45){DB.push({x:c.x+Math.cos(c.a)*30,y:c.y+Math.sin(c.a)*30,vx:c.vx*.9+(Math.random()-.5)*120,vy:c.vy*.9+(Math.random()-.5)*120,a:c.a,va:9,l:9,w:8,h:28,c:c.col2});if(c.isP)toast('SCHADEN · FRONTFLÜGEL GEBROCHEN','#ff2a36')}
    if(z==2&&b<.55&&c.dz[2]>=.55&&c.isP)toast('HECKFLÜGEL BESCHÄDIGT','#ff2a36')};
  zn(c1,dx||0,dy||0);zn(c2,-(dx||0),-(dy||0));
}
const dmgSp=c=>{const z=c.dz||[0,0,0,0];return 1-(c.dmg||0)*.2-z[2]*.06-(z[1]>.9?.08:0)-(z[3]>.9?.08:0)};
function step(c,u,dt){
  const P=c.ph,sf=c.sf,dz=c.dz||[0,0,0,0];let vf=c.vx*Math.cos(c.a)+c.vy*Math.sin(c.a);
  const vr=Math.min(1.2,Math.abs(vf)/P.vmax),lat=P.lat*(1+P.df/260*vr*vr)*sf[0]*(cfg.rain?.85:1)*(1-dz[0]*.3-dz[2]*.12);
  c.steer+=(u.s-c.steer)*Math.min(1,dt*8);c.av=c.av||0;c.a+=c.av*dt;c.av*=Math.exp(-2.2*dt);
  c.a+=c.steer*Math.min(2.2,lat/Math.max(60,Math.abs(vf)))*Math.min(1,(Math.abs(vf)+70*u.t)/80)*(vf<-5?-1:1)*dt;
  c.a+=((dz[1]-dz[3])*.12+(dz[1]>.9?.1:0)-(dz[3]>.9?.1:0))*Math.min(1,Math.abs(vf)/350)*dt;
  const ux=Math.cos(c.a),uy=Math.sin(c.a),rx=-uy,ry=ux;
  vf=c.vx*ux+c.vy*uy;let vl=c.vx*rx+c.vy*ry;
  const ag=Math.abs(c.steer)*vr;let g=8*sf[0]*(cfg.rain?.8:1);
  if(ag>.6)g*=Math.max(.3,1-(ag-.6)*1.6);if(u.b>0&&Math.abs(c.steer)>.3)g*=.7;if(c.isP&&cfg.assist&&!u.h)g*=1.12;if(u.h)g*=.2;
  vl*=Math.exp(-g*dt);
  const bs=u.o&&c.en>.02?1:0;c.bo=bs;c.en=Math.max(0,Math.min(1,c.en+(bs?-.2:u.b>0?.3:.03)*dt));const vm=P.vmax*dmgSp(c)*sf[1]*(1+c.sl*.05+bs*.07);
  vf+=u.t*P.acc*(1-(c.dmg||0)*.3)*(1+bs*.7)*Math.max(0,1-vf/vm)*(c.shT>0?.4:1)*dt;
  if(u.b>0)vf-=Math.sign(vf)*Math.min(Math.abs(vf),P.brk*u.b*dt);
  vf-=vf*((u.t?.012:.06)+sf[2])*dt;
  if(vf>vm)vf-=(vf-vm)*Math.min(1,3*dt);
  c.vx=ux*vf+rx*vl;c.vy=uy*vf+ry*vl;c.x+=c.vx*dt;c.y+=c.vy*dt;c.v=Math.hypot(c.vx,c.vy);c.slipA=Math.abs(vl);
}
function ai(c,dt){
  const T=R.T,N=T.N,v=c.v;let ln=c.pref,lim=1e9;
  for(const o of R.cars){if(o===c)continue;const q=(o.prog-c.prog)*T.ds,dl=o.d-c.d;
    if(q>-50&&q<120&&Math.abs(dl)<46){if(q>0)lim=Math.min(lim,o.v+(q-(R.t<5?108:55))*2.2);ln=Math.abs(dl)<8?c.d+(c.id%2?-50:50):dl>0?o.d-56:o.d+56;break}}
  if(R.t<5)ln=c.gl;
  ln=Math.max(-TW/2+26,Math.min(TW/2-26,ln));c.lane+=(ln-c.lane)*Math.min(1,dt*3);
  const p=T.P[(c.i+2+Math.floor(v/180))%N],tx=p.x+p.nx*c.lane,ty=p.y+p.ny*c.lane,df=wr(Math.atan2(ty-c.y,tx-c.x)-c.a);
  let tv=c.ph.vmax*c.skill;const k=c.ph.lat/700,br=c.ph.brk*.75,sk=c.skill*c.skill;
  for(let q=0;q<=24;q++){const vv=T.vl[(c.i+q)%N];tv=Math.min(tv,Math.sqrt(vv*vv*k*sk+2*br*q*T.ds))}
  if(c.sf[0]<1)tv*=.8;if(cfg.rain)tv*=.9;tv=Math.min(tv,lim);
  const e=tv-v;let t=Math.max(0,Math.min(1,e/45)),b=Math.max(0,Math.min(1,-e/60));
  if(c.stun>0)t*=.5;if(Math.abs(df)>1.5){t=.7;b=0}
  return{t,b,s:Math.max(-1,Math.min(1,df*2.4)),h:0,o:t>.9&&c.en>.4&&Math.abs(df)<.25?1:0};
}
function coll(a,b){
  // Kollision als gedrehte Rechtecke (SAT) über die ganze Fahrzeugform: Front-/Heckflügel und Räder inklusive
  const ex=b.x-a.x,ey=b.y-a.y;if(ex*ex+ey*ey>14400)return;
  const HL=49,HW=21,OF=5,c1=Math.cos(a.a),s1=Math.sin(a.a),c2=Math.cos(b.a),s2=Math.sin(b.a),
    dx=(b.x+c2*OF)-(a.x+c1*OF),dy=(b.y+s2*OF)-(a.y+s1*OF);let best=null;
  for(const[ux,uy]of[[c1,s1],[-s1,c1],[c2,s2],[-s2,c2]]){
    const ra=Math.abs(c1*ux+s1*uy)*HL+Math.abs(-s1*ux+c1*uy)*HW,rb=Math.abs(c2*ux+s2*uy)*HL+Math.abs(-s2*ux+c2*uy)*HW,sp=dx*ux+dy*uy,pn=ra+rb-Math.abs(sp);
    if(pn<=0)return;
    if(!best||pn<best.pn)best={pn,nx:sp<0?-ux:ux,ny:sp<0?-uy:uy}}
  best.x=(a.x+b.x+(c1+c2)*OF)/2;best.y=(a.y+b.y+(s1+s2)*OF)/2;
  const nx=best.nx,ny=best.ny,pen=best.pn+.5;
  a.x-=nx*pen/2;a.y-=ny*pen/2;b.x+=nx*pen/2;b.y+=ny*pen/2;
  const cl=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
  if(cl>0){const j=cl*.65;a.vx-=nx*j;a.vy-=ny*j;b.vx+=nx*j;b.vy+=ny*j;
    const ca=Math.cos(a.a)*ny-Math.sin(a.a)*nx,cb=Math.cos(b.a)*ny-Math.sin(b.a)*nx,k=Math.min(.12,cl*.0012);
    a.a-=Math.sign(ca)*k;b.a+=Math.sign(cb)*k;a.stun=b.stun=.7;
    if(cl>70){a.av=(a.av||0)-Math.sign(ca)*Math.min(5,cl*.014);b.av=(b.av||0)+Math.sign(cb)*Math.min(5,cl*.014)}if(cl>40)hit(best.x,best.y,cl,a.isP||b.isP,a,b,nx,ny)}
}
function fxs(c,u,dt){
  const gp=Math.min(1,c.v/c.ph.vmax)*8.4,g=Math.min(8,1+Math.floor(gp));
  if(g!=c.gear){if(g>c.gear)c.shT=.12;c.gear=g}
  const fr=g==8?Math.min(1,gp-7):gp-Math.floor(gp),tg=c.v<30?4000+u.t*5500:4300+(.2+.8*fr)*8200;
  c.rpmS+=(tg-c.rpmS)*Math.min(1,dt*14);c.thr=u.t;c.brk=u.b;c.stun=Math.max(0,c.stun-dt);c.shT=Math.max(0,c.shT-dt);
  const cs=Math.cos(c.a),sn=Math.sin(c.a),w=[c.x-cs*22-sn*12,c.y-sn*22+cs*12,c.x-cs*22+sn*12,c.y-sn*22-cs*12];
  if(c.slipA>75&&c.sf[0]>.9&&c.w){for(let k=0;k<4;k+=2)SK.push([c.w[k],c.w[k+1],w[k],w[k+1]]);if(SK.length>700)SK.splice(0,40);if(Math.random()<.5)pf(w[0],w[1],(Math.random()-.5)*30,(Math.random()-.5)*30,.7,7,'rgba(225,225,235,.35)',0)}
  else if(c.sf[2]>1&&c.v>150&&Math.random()<.5)pf(w[0],w[1],(Math.random()-.5)*60,(Math.random()-.5)*60,.6,6,c.sf[2]>3?'rgba(150,130,95,.4)':'rgba(70,120,70,.35)',0);
  if(c.bo&&Math.random()<.8)pf((w[0]+w[2])/2,(w[1]+w[3])/2,-Math.cos(c.a)*160,-Math.sin(c.a)*160,.25,5,'#4ab4ff',1);if(cfg.rain&&c.v>350&&Math.random()<.6)pf(w[0],w[1],(Math.random()-.5)*70,(Math.random()-.5)*70,.5,6,'rgba(205,220,255,.28)',0);if(c.dmg>.45&&Math.random()<c.dmg*.55)pf(c.x+cs*20,c.y+sn*20,-cs*40+(Math.random()-.5)*40,-sn*40+(Math.random()-.5)*40,.9,7,c.dmg>.7?'rgba(25,25,28,.55)':'rgba(120,120,125,.4)',0);if(c.dmg>.75&&Math.random()<.4)pf(c.x+cs*18,c.y+sn*18,(Math.random()-.5)*50,(Math.random()-.5)*50,.25,4,'#ff7a1a',1);c.w=w;
}
const input=()=>{let g=0;try{g=navigator.getGamepads?[...navigator.getGamepads()].find(x=>x)||0:0}catch(e){}const B=i=>g&&g.buttons[i]?g.buttons[i].value:0,X=g&&Math.abs(g.axes[0])>.12?g.axes[0]:0;
return{t:KY.ArrowUp||KY.KeyW||TC.t?1:B(7)||B(0),b:KY.ArrowDown||KY.KeyS||TC.b?1:B(6)||B(1),s:Math.max(-1,Math.min(1,((KY.ArrowRight||KY.KeyD||TC.r?1:0)-(KY.ArrowLeft||KY.KeyA||TC.l?1:0)+X+(TC.axis||0))*cfg.sens)),h:KY.Space||B(2)?1:0,o:KY.ShiftLeft||KY.ShiftRight||KY.KeyE||TC.o||B(5)?1:0}};
const key=c=>c.fin?1e9-c.fin:c.prog;
let tt;function toast(t,c){const e=$('#toast');e.textContent=t;e.style.borderColor=c||'var(--r)';e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2200)}
function lights(n){$$('#lt i').forEach((e,i)=>e.classList.toggle('on',i<n));$('#lt').classList.toggle('on',n>0)}
function ann(t,cls,sub){const a=$('#ann');a.className='';a.innerHTML=t+(sub?'<small>'+sub+'</small>':'');void a.offsetWidth;a.className='pop '+(cls||'')}
function respawn(c){if(c.isP)clearControls();const p=R.T.P[c.i];c.x=p.x;c.y=p.y;c.a=p.t;c.vx=c.vy=0;c.av=0;c.steer=0;c.stun=1;c.w=null}
function sim(dt){
  const r=R,T=r.T;
  if(r.ph=='form'){r.pt+=dt;if(r.pt>3.4){r.ph='count';r.pt=0;r.nl=0}return}
  if(r.ph=='count'){r.pt+=dt;const n=Math.min(5,Math.floor(r.pt/.9)+1),p=r.pl;
    if(p){p.rpmS+=(9200+Math.sin(r.pt*22)*700-p.rpmS)*.2;p.thr=1}
    if(n!=r.nl){r.nl=n;lights(n);beep(420+n*30,.2,.25);ann(String(6-n))}
    if(r.pt>4.5+r.hold){r.ph='run';r.t=0;r.nl=0;lights(0);ann('GO!','go');beep(900,.6,.3);CM.sh=16}
    return}
  r.t+=dt;
  for(const c of r.cars){
    loc(c);c.sl=0;
    for(const o of r.cars)if(o!==c){const q=(o.prog-c.prog)*T.ds;if(q>30&&q<180&&Math.abs(o.d-c.d)<32){c.sl=1;break}}
    if((!c.isP||!c.auto)&&r.ph=='run'&&!c.fin){c.stk=c.v<40&&Math.abs(c.d)>TW/2+20?(c.stk||0)+dt:0;if(c.stk>2.5){c.stk=0;respawn(c);if(c.isP)toast('ZURÜCK AUF DER STRECKE')}}
    let u;if(c.isP&&!c.auto&&!r.demo)u=input();else{u=ai(c,dt);if(r.t<c.react)u.t=0}
    if(c.dmg>=.89&&!c.fin){u.t=0;u.o=0;u.s=0;u.h=0;u.b=.5;if(!c.dnf){c.dnf=1;if(c.isP&&!r.demo){toast('TOTALSCHADEN · AUSGEFALLEN','#ff2a36');CM.sh=14;setTimeout(()=>{if(R===r&&r.ph=='run'){if(r.mode=='time')start('time');else if(r.q){r.ph='fin';qualiEnd()}else results()}},3200)}}}
    if(c.isP&&c.lap>=1&&!c.fin&&r.t-c.lapT>=r.rec.length*.05)r.rec.push([c.x,c.y,c.a]);step(c,u,dt);fxs(c,u,dt);
  }
  for(let i=0;i<r.cars.length;i++)for(let j=i+1;j<r.cars.length;j++)coll(r.cars[i],r.cars[j]);
  r.rk.sort((a,b)=>key(b)-key(a));
}
function playerDone(){const c=R.pl;R.ph='fin';c.auto=true;if(R.q){ann('QUALIFYING BEENDET','go');setTimeout(()=>{if(R&&R.ph=='fin')qualiEnd()},2600);return}const w=R.mode!='time'&&c.fo==1;fanfare(w);ann(w?'SIEG!':'ZIELFLAGGE',w?'go':'');setTimeout(()=>{if(R&&R.ph=='fin')results()},3200)}
function upd(dt){
  CM.sh=Math.max(0,CM.sh-dt*50);CM.fl=Math.max(0,(CM.fl||0)-dt*2.2);
  for(let i=DB.length-1;i>=0;i--){const d=DB[i];d.l-=dt;if(d.l<=0){DB.splice(i,1);continue}d.x+=d.vx*dt;d.y+=d.vy*dt;d.a+=d.va*dt;const q=Math.exp(-1.8*dt);d.vx*=q;d.vy*=q;d.va*=q}
  for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.l-=dt;if(p.l<=0){PT.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97}
}

/* ---- Darstellung ---- */
/* ---- 3D (three.js) ---- */
let DK3,BX3;
function strip(T,vf,cf,mat){
  const P=T.P,N=T.N,pos=new Float32Array((N+1)*6),col=new Float32Array((N+1)*6),idx=[];
  for(let i=0;i<=N;i++){const p=P[i%N],c=cf(i),k=i*6;pos.set(vf(p),k);col.set([c.r,c.g,c.b,c.r,c.g,c.b],k);if(i<N){const a=2*i;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  return new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));
}
let TKIT=null;
function treeKit(){
  if(TKIT)return TKIT;
  const hs3=(x,y,z,s)=>{const q=Math.sin(x*12.9898+y*78.233+z*37.719+(s||0)*4.1)*43758.5453;return q-Math.floor(q)},cl=(v,a,b)=>v<a?a:v>b?b:v;
  let ls=1;const lr=()=>(ls=(ls*16807)%2147483647)/2147483647;
  const mx=(x,y,z,s,ry,rx,rz)=>{const o=new THREE.Object3D(),k=Array.isArray(s)?s:[s||1,s||1,s||1];o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0,'YXZ');o.scale.set(k[0],k[1],k[2]);o.updateMatrix();return o.matrix.clone()};
  const bark=c=>v=>{const k=.7+.55*hs3(Math.round(v.x*30),v.y*11,Math.round(v.z*30));return[c[0]*k,c[1]*k,c[2]*k]};
  const fol=(d,l,y0,y1)=>(v,n)=>{const hh=cl((v.y-y0)/(y1-y0),0,1),t=cl(.1+.5*(n.y*.5+.5)+.3*hh+(hs3(v.x*9,v.y*9,v.z*9)-.5)*.4,0,1);return[d[0]+(l[0]-d[0])*t,d[1]+(l[1]-d[1])*t,d[2]+(l[2]-d[2])*t]};
  const merge=parts=>{const pos=[],nor=[],col=[],uv=[],barkIdx=[],leafIdx=[],v=new THREE.Vector3(),n=new THREE.Vector3(),c=new THREE.Vector3(),nm=new THREE.Matrix3();let off=0;
    for(const pt of parts){const g=pt.g,pa=g.attributes.position,na=g.attributes.normal,ua=g.attributes.uv,isBark=g.type==='CylinderGeometry';nm.getNormalMatrix(pt.m);
      for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);n.fromBufferAttribute(na,i);
        if(pt.jit){const s=pt.seed||0,q=Math.sin(v.x*2.3+s)*Math.sin(v.y*2.1+s*1.7)*Math.sin(v.z*2.5+s*.6);v.multiplyScalar(1+pt.jit*(.7*q+.9*(hs3(v.x,v.y,v.z,s)-.5)))}
        v.applyMatrix4(pt.m);n.applyMatrix3(nm).normalize();
        if(pt.soft){c.set(pt.soft[0],pt.soft[1],pt.soft[2]);c.subVectors(v,c).normalize();n.lerp(c,pt.soft[3]).normalize()}
        const k=pt.col(v,n),shade=.72+.28*cl((k[0]+k[1]+k[2])/1.5,0,1);pos.push(v.x,v.y,v.z);nor.push(n.x,n.y,n.z);col.push(shade,shade,shade);uv.push(ua.getX(i)*2,ua.getY(i)*(isBark?3:2))}
      const ix=g.index.array,target=isBark?barkIdx:leafIdx;for(let i=0;i<ix.length;i++)target.push(ix[i]+off);off+=pa.count}
    const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));G.setIndex(barkIdx.concat(leafIdx));if(barkIdx.length)G.addGroup(0,barkIdx.length,0);if(leafIdx.length)G.addGroup(barkIdx.length,leafIdx.length,1);G.computeBoundingSphere();return G};
  const SG=new THREE.SphereGeometry(1,9,7),cyl=(a,b,h,s,t)=>new THREE.CylinderGeometry(a,b,h,s,t);
  const blobs=(P,cc,sp,cnt,r0,r1,sy,d,l,y0,y1,jit,seed)=>{for(let i=0;i<cnt;i++){let a,b,c;do{a=lr()*2-1;b=lr()*2-1;c=lr()*2-1}while(a*a+b*b+c*c>1);const r=r0+(r1-r0)*lr();
    P.push({g:SG,m:mx(cc[0]+a*sp[0],cc[1]+b*sp[1],cc[2]+c*sp[2],[r,r*sy,r],lr()*6),jit,seed:seed+i*1.7,soft:[cc[0],cc[1],cc[2],.68],col:fol(d,l,y0,y1)})}};
  // Fichte: 11 unregelmäßige, hängende Astetagen
  const sp=[{g:cyl(.08,.18,1.6,7,3),m:mx(0,.8,0),col:bark([.22,.15,.1])}];
  for(let k=0;k<11;k++){const t=k/10,r=(1-t)+.17,h=.9-.32*t,y=.5+t*3.05+h*.5,tip=[.13+.05*t,.32+.06*t,.15],dk=[.035,.12,.06];
    sp.push({g:new THREE.ConeGeometry(r,h,10,1),m:mx(0,y,0,1,k*2.4),jit:.38,seed:k*3.3+1,soft:[0,y-h*1.1,0,.6],col:(v,n)=>{const u=cl((v.y-(y-h/2))/h,0,1)*.9,q=(.8+.4*hs3(v.x*8,v.y*8,v.z*8))*(.7+.5*(n.y*.5+.5));return[(tip[0]+(dk[0]-tip[0])*u)*q,(tip[1]+(dk[1]-tip[1])*u)*q,(tip[2]+(dk[2]-tip[2])*u)*q]}})}
  sp.push({g:new THREE.ConeGeometry(.11,.75,6),m:mx(0,4.55,0),col:()=>[.1,.28,.12]});
  // Eiche: kräftiger Stamm, Äste, Krone aus vielen Blättertrauben
  ls=11;const oak=[{g:cyl(.13,.27,1.8,8,4),m:mx(0,.9,0),col:bark([.2,.15,.11])}];
  for(let k=0;k<5;k++){const th=k*1.26+.3,ph=.5+.35*lr(),len=1.5;oak.push({g:cyl(.04,.11,len,5,2),m:mx(Math.sin(ph)*Math.sin(th)*len/2,1.55+Math.cos(ph)*len/2,Math.sin(ph)*Math.cos(th)*len/2,1,th,ph,0),col:bark([.2,.15,.11])})}
  blobs(oak,[0,2.85,0],[1.45,.9,1.45],18,.55,.9,.82,[.04,.15,.05],[.3,.5,.12],1.8,3.9,.38,5);
  // Birke: weißer Stamm mit dunklen Querbändern, helle Krone
  ls=23;const bi=[{g:cyl(.05,.1,2.8,6,14),m:mx(0,1.4,0,1,0,0,.05),col:v=>hs3(0,Math.floor(v.y*7),0)>.72?[.1,.09,.08]:[.8+.1*hs3(v.x*9,v.y*9,v.z*9),.78,.72]}];
  blobs(bi,[0,3.2,0],[.75,.9,.75],10,.45,.75,1.15,[.07,.22,.05],[.4,.58,.18],2.2,4.4,.4,9);
  // Kiefer: hoher kahler Stamm, flache Schirmkrone
  ls=37;const pi=[{g:cyl(.06,.14,4,7,6),m:mx(0,2,0),col:bark([.4,.22,.12])}];
  blobs(pi,[0,4.1,0],[1,.45,1],6,.7,1,.5,[.05,.15,.09],[.15,.3,.16],3.5,5,.4,13);
  // Busch
  ls=51;const bu=[];blobs(bu,[0,.45,0],[.6,.25,.6],5,.45,.65,.8,[.06,.19,.06],[.22,.4,.09],0,1.1,.42,17);
  return TKIT={sp:merge(sp),oak:merge(oak),bi:merge(bi),pi:merge(pi),bu:merge(bu)};
}
function build3(T){
  const grp=new THREE.Group(),C=h=>new THREE.Color(h),N=T.N,P=T.P,add=m=>{grp.add(m);return m};
  const rb=(o1,o2,y,cf)=>strip(T,p=>[p.x+p.nx*o1,y,p.y+p.ny*o1,p.x+p.nx*o2,y,p.y+p.ny*o2],cf),h=TW/2;
  const aA=C('#33353d'),aB=C('#2c2e36'),rl=C('#25272d'),wh=C('#e9ebf0'),rd=C('#d8202c'),gv=C('#a89670'),gv2=C('#968660');
  const hs=i=>{const x=Math.sin(i*127.1+3.7)*43758.5;return x-Math.floor(x)},tn=(c,i,a)=>{const v=1-a+hs(i)*a*2;return new THREE.Color(c.r*v,c.g*v,c.b*v)};
  const asph=add(rb(-h,h,.6,i=>tn((i>>3)&1?aA:aB,i,.08)));
  add(rb(-h,-h+3,1.8,()=>wh));add(rb(h-3,h,1.8,()=>wh));
  for(const s of[-1,1]){const a=s<0?-h-13:h,b=s<0?-h:h+13,a2=s<0?-h-82:h+13,b2=s<0?-h-13:h+82;
    const kerb=add(rb(a,b,1,i=>i&1?wh:rd));paintCircuitSurface3(kerb);const runoff=add(rb(a2,b2,0,i=>tn((i>>1)&1?gv:gv2,i+99,.12)));applySurface3(runoff,'sand',48,.84);
    const barrier=add(strip(T,p=>{const o=s*(h+82);return[p.x+p.nx*o,0,p.y+p.ny*o,p.x+p.nx*o,16,p.y+p.ny*o]},i=>(i>>1)&1?wh:rd));paintCircuitSurface3(barrier,true)}
  for(const s of[-1,1]){const f=strip(T,p=>{const o=s*(h+86);return[p.x+p.nx*o,16,p.y+p.ny*o,p.x+p.nx*o,46,p.y+p.ny*o]},()=>C('#9aa0aa'));applyFence3(f,T);add(f);
    add(strip(T,p=>{const a=s*(h+80),b=s*(h+86);return[p.x+p.nx*a,16.2,p.y+p.ny*a,p.x+p.nx*b,16.2,p.y+p.ny*b]},()=>C('#d5d8df')));
    add(strip(T,p=>{const o=s*(h+86);return[p.x+p.nx*o,0,p.y+p.ny*o,p.x+p.nx*o,16,p.y+p.ny*o]},i=>(i>>1)&1?C('#8d1a22'):C('#b8bcc6')))}
  const pg=[];for(let i=0;i<N;i+=4)for(const s of[-1,1]){const p=P[i],o=s*(h+86);pg.push([p.x+p.nx*o,p.y+p.ny*o])}
  const ps=new THREE.InstancedMesh(new THREE.BoxGeometry(1.6,34,1.6),new THREE.MeshLambertMaterial({color:0x3a3d44}),pg.length),pm=new THREE.Object3D();pg.forEach((v,i)=>{pm.position.set(v[0],33,v[1]);pm.updateMatrix();ps.setMatrixAt(i,pm.matrix)});grp.add(ps);
  // Start/Ziel
  const cvs=document.createElement('canvas');cvs.width=64;cvs.height=320;const q=cvs.getContext('2d');for(let i=0;i<2;i++)for(let j=0;j<10;j++){q.fillStyle=(i+j)&1?'#f5f5f5':'#111';q.fillRect(i*32,j*32,32,32)}
  const sl=new THREE.Mesh(new THREE.PlaneGeometry(24,TW),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cvs)}));sl.rotation.x=-Math.PI/2;
  const gt=new THREE.Group();gt.position.set(P[0].x,0,P[0].y);gt.rotation.y=-P[0].t;sl.position.y=2.1;gt.add(sl);
  const dk=new THREE.MeshLambertMaterial({color:0x16171c}),lights=[];
  for(const s of[-1,1]){const po=new THREE.Mesh(new THREE.BoxGeometry(5,80,5),dk);po.position.set(78,40,s*(h+30));gt.add(po)}
  const bm=new THREE.Mesh(new THREE.BoxGeometry(14,12,TW+70),dk);bm.position.set(78,84,0);gt.add(bm);
  for(let k=0;k<5;k++){const l=new THREE.Mesh(new THREE.SphereGeometry(5,10,8),new THREE.MeshBasicMaterial({color:0x3a0d12}));l.position.set(70,84,-48+k*24);gt.add(l);lights.push(l)}
  grp.add(gt);
  // Tribünen
  const bg=new THREE.BoxGeometry(1,1,1),sb=new THREE.MeshStandardMaterial({color:'#a2a29a',map:TRACK_PAINT_MAP,roughness:.86});
  for(let i=-26;i<=26;i+=2)for(const s of[-1,1]){const p=P[(i+N)%N];for(let row=0;row<3;row++){const o=s*(h+125+row*19),step=new THREE.Mesh(bg,sb);step.name='concrete-grandstand-terrace';step.scale.set(T.ds*2.05,34+row*6,22);step.position.set(p.x+p.nx*o,(34+row*6)/2,p.y+p.ny*o);step.rotation.y=-p.t;grp.add(step)}}
  // Bäume, Büsche, weiche Schatten
  let shd=null;
  {
    const K=treeKit(),dm=new THREE.Object3D(),cc=new THREE.Color();
    let s2=7;const rn=()=>(s2=(s2*16807)%2147483647)/2147483647;
    const nz=(x,y)=>Math.sin(x*.0011+1.3)*Math.sin(y*.0013+.4)+.5*Math.sin(x*.0031+y*.0027+2)+.25*Math.sin(x*.0073-y*.0061),mz=(x,y)=>Math.sin(x*.0007+2)*Math.cos(y*.0009+1);
    const near=(x,y,d)=>{const d2=d*d;for(let j=0;j<N;j+=2){const p=P[j],dx=p.x-x,dy=p.y-y;if(dx*dx+dy*dy<d2)return true}return false};
    const I={sp:[],oak:[],bi:[],pi:[],bu:[]},SZ={sp:[34,38,4.9,1.1],oak:[34,26,4,1.9],bi:[30,20,4.6,1.1],pi:[30,25,5.2,1.5],bu:[14,16,1.1,.9]};
    const put=(ty,x,z,ci)=>{const q=SZ[ty],s=q[0]+rn()*q[1],br=.8+rn()*.38,w=(ty=='oak'||ty=='bi')&&rn()<.15;
      I[ty].push({x,z,s,w:.85+rn()*.3,ry:rn()*6.28,lx:(rn()-.5)*.07,lz:(rn()-.5)*.07,ci,H:q[2]*s,cr:q[3]*s,c:[br*(.92+rn()*.16)*(w?1.4:1),br*(.96+rn()*.08)*(w?1.05:1),br*(.88+rn()*.2)*(w?.7:1)]})};
    for(let i=0;T.i===0&&i<N;i+=3)for(const sg of[-1,1])for(let a=0;a<3;a++){
      const p=P[i],o=h+240+Math.pow(rn(),1.6)*1250,x=p.x+p.nx*sg*o+(rn()-.5)*120,y=p.y+p.ny*sg*o+(rn()-.5)*120,ci=Math.floor(i*12/N);
      if(rn()>.78+nz(x,y)*.55||near(x,y,h+235))continue;
      const m=mz(x,y),r=rn();let ty;
      if(m>.25)ty=r<.55?'oak':r<.85?'bi':'pi';else if(m<-.25)ty=r<.82?'sp':'pi';else ty=r<.42?'sp':r<.62?'oak':r<.75?'bi':r<.88?'pi':'sp';
      put(ty,x,y,ci);
      if(rn()<.4){const an=rn()*6.28,d=45+rn()*70;put('bu',x+Math.cos(an)*d,y+Math.sin(an)*d,ci)}}
    for(let i=0;T.i===0&&i<N;i+=2)for(const sg of[-1,1]){const p=P[i],o=h+210+rn()*320,x=p.x+p.nx*sg*o,y=p.y+p.ny*sg*o;if(rn()<.5&&!near(x,y,h+200))put('bu',x,y,Math.floor(i*12/N))}
    const mat=treeMaterials3();
    const chunks=(G,list,fill,material)=>{const by={};list.forEach(t=>(by[t.ci]=by[t.ci]||[]).push(t));
      for(const k in by){const a=by[k];let cx=0,cz=0;a.forEach(t=>{cx+=t.x;cz+=t.z});cx/=a.length;cz/=a.length;let rad=0;a.forEach(t=>{rad=Math.max(rad,Math.hypot(t.x-cx,t.z-cz)+t.H*1.2+t.cr*2)});
        const g2=new THREE.BufferGeometry();g2.attributes=G.attributes;g2.index=G.index;G.groups.forEach(g=>g2.addGroup(g.start,g.count,g.materialIndex));g2.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,0,cz),rad);
        const im=new THREE.InstancedMesh(g2,material,a.length);a.forEach((t,i)=>fill(im,t,i));im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;grp.add(im)}};
    for(const ty in I)chunks(K[ty],I[ty],(im,t,i)=>{dm.position.set(t.x,0,t.z);dm.rotation.set(t.lx,t.ry,t.lz);dm.scale.set(t.s*t.w,t.s,t.s*t.w);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);cc.setRGB(t.c[0],t.c[1],t.c[2]);im.setColorAt(i,cc)},mat);
    // weiche Schlagschatten (Sonne von hinten rechts)
    const sc=document.createElement('canvas');sc.width=sc.height=64;const sq=sc.getContext('2d'),sg2=sq.createRadialGradient(32,32,0,32,32,32);sg2.addColorStop(0,'rgba(0,0,0,.55)');sg2.addColorStop(.55,'rgba(0,0,0,.4)');sg2.addColorStop(1,'rgba(0,0,0,0)');sq.fillStyle=sg2;sq.fillRect(0,0,64,64);
    shd=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false,opacity:(typeof cfg!=='undefined'&&cfg.rain)?.3:.75});
    const SH=new THREE.CircleGeometry(1,18);SH.rotateX(-Math.PI/2);const all=[].concat(I.sp,I.oak,I.bi,I.pi,I.bu);
    chunks(SH,all,(im,t,i)=>{const Ls=t.H*.67;dm.position.set(t.x-.857*Ls*.5,1.5,t.z-.515*Ls*.5);dm.rotation.set(0,2.6,0);dm.scale.set(Ls*.5+t.cr,1,t.cr*.95);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)},shd);
  }
  const world=decorateCircuit3(T,grp);applyRoadMaterial3(asph,T);return{grp,asph,lights,shade:shd,world};
}
function init3d(){
  if(typeof THREE==='undefined')return;
  try{
    const c3=$('#g3'),r=new THREE.WebGLRenderer({canvas:c3,antialias:true,powerPreference:'high-performance'});
    r.setPixelRatio(Math.min(DPR,[.85,1.25,1.6][cfg.quality]||1.25));r.setSize(W,H,false);r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.96;if(r.shadowMap){r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap}
    const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(62,W/H,10,40000);
    sc.fog=new THREE.Fog(0xa9cdf0,2500,13000);
    const hemi=new THREE.HemisphereLight(0xdfeaff,0x24402c,.95),sun=new THREE.DirectionalLight(0xfff0d8,.85);sun.position.set(1500,2600,900);sc.add(hemi,sun);
    const sk=document.createElement('canvas');sk.width=1024;sk.height=256;const q=sk.getContext('2d'),gr=q.createLinearGradient(0,0,0,256);
    [[0,'#1f4fa3'],[.3,'#3a7fd6'],[.44,'#6fb0f0'],[.5,'#cfe4f8'],[.501,'#1c3a28'],[1,'#1c3a28']].forEach(a=>gr.addColorStop(a[0],a[1]));q.fillStyle=gr;q.fillRect(0,0,1024,256);
    for(let i=0;i<70;i++){const x=Math.random()*1024,y=70+Math.random()*50,cr=30+Math.random()*60,g2=q.createRadialGradient(x,y,0,x,y,cr);g2.addColorStop(0,'rgba(255,255,255,.55)');g2.addColorStop(1,'rgba(255,255,255,0)');q.save();q.translate(x,y);q.scale(1.8,.45);q.translate(-x,-y);q.fillStyle=g2;q.fillRect(x-cr,y-cr,2*cr,2*cr);q.restore()}
    const sky=new THREE.Mesh(new THREE.SphereGeometry(25000,64,32),new THREE.MeshBasicMaterial({map:panoramaTexture3(cfg.track),side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));sky.renderOrder=-1;sc.add(sky);const atmosphere=createAtmosphere3(sc);
    const gc=document.createElement('canvas');gc.width=gc.height=128;const gq=gc.getContext('2d');gq.fillStyle='#1d5632';gq.fillRect(0,0,64,128);gq.fillStyle='#215b35';gq.fillRect(64,0,64,128);const gp=['rgba(120,150,55,.11)','rgba(15,55,22,.15)','rgba(95,75,40,.09)','rgba(255,255,255,.04)'];for(let i=0;i<4200;i++){gq.fillStyle=gp[i&3];gq.fillRect(Math.random()*128,Math.random()*128,1+Math.random()*2,1+Math.random()*2)}
    const gt=new THREE.CanvasTexture(gc);gt.wrapS=gt.wrapT=THREE.RepeatWrapping;gt.repeat.set(1,1);
    const gm=new THREE.Mesh(new THREE.PlaneGeometry(60000,60000),new THREE.MeshLambertMaterial({map:gt}));const groundUV=gm.geometry.attributes.uv;for(let i=0;i<groundUV.count;i++)groundUV.setXY(i,groundUV.getX(i)*230,groundUV.getY(i)*230);gm.rotation.x=-Math.PI/2;gm.position.y=-.6;sc.add(gm);
    const skm=new THREE.BufferGeometry();skm.setAttribute('position',new THREE.BufferAttribute(new Float32Array(2800*3),3));const ix=[];for(let i=0;i<700;i++){const a=i*4;ix.push(a,a+1,a+2,a,a+2,a+3)}skm.setIndex(ix);
    const skid=new THREE.Mesh(skm,new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide}));skid.frustumCulled=false;sc.add(skid);
    DK3=new THREE.Color('#222226');BX3=new THREE.BoxGeometry(1,1,1);G3={ok:true,r,sc,cam,hemi,sun,sky,atmosphere,gm,skid,fog:sc.fog,cars:[],deb:[],fv:62,V:new THREE.Vector3(),wet:null};initShowroom3(G3);c3.style.display='block';c3.addEventListener('webglcontextlost',e=>{e.preventDefault();if(G3){G3.ok=false;c3.style.display='none'}});
  }catch(e){G3=null;console.error(e)}
}
function render3d(dt){
  const g=G3,r=R,T=r.T,f=r.focus,cam=g.cam,vr=Math.min(1,f.v/f.ph.vmax),m=(+CAMF)|0;
  if(r.demo&&['menu','garage'].includes(UI_SCREEN)){renderShowroom3(g,dt);return;}
  if(g.T!==T){if(g.cur)g.sc.remove(g.cur.grp);if(!T.g3)T.g3=build3(T);g.cur=T.g3;g.sc.add(g.cur.grp);g.T=T}
  if(g.R!==r){g.cars.forEach(o=>{g.sc.remove(o.g);disposeVehicle3(o)});if(g.gh){g.sc.remove(g.gh.g);disposeVehicle3(g.gh);g.gh=null}g.cars=r.cars.map(c=>{const o=buildCar(c.col,c.col2,false,CARS.findIndex(k=>k.c===c.col));g.sc.add(o.g);return o});g.R=r}
  if(g.wet!==cfg.rain||g.theme!==T.i){setWorldTheme3(g,T,cfg.rain);g.wet=cfg.rain;g.theme=T.i;}
  updateCircuit3(g,dt);
  const e0=r.ph=='form'?Math.min(1,r.pt/3.4):1,e=e0*e0*(3-2*e0);
  if(r.ph=='form'){const a=r.cars[0],b=r.pl||f;CM.x=a.x+(b.x-a.x)*e;CM.y=a.y+(b.y-a.y)*e;CM.a=T.P[0].t+(1-e)*.9}
  else{CM.x=f.x;CM.y=f.y;CM.a+=wr(f.a-CM.a)*Math.min(1,dt*(r.demo?3:6))}
  const ya=m==2&&r.ph!='form'?f.a:CM.a,ux=Math.cos(ya),uz=Math.sin(ya);
  let dist=[165,260,-8][m]+vr*[45,50,0][m],hh=[62,150,20][m]+vr*[10,15,0][m];
  dist=dist*(.35+.65*e)+(1-e)*300;hh=hh*(.4+.6*e)+(1-e)*280;
  const sx=cfg.shake?(Math.random()-.5)*CM.sh*.9:0,sy=cfg.shake?(Math.random()-.5)*CM.sh*.6:0;
  cam.position.set(CM.x-ux*dist-uz*sx,hh+sy,CM.y-uz*dist+ux*sx);
  const la=m==2?200:95;cam.lookAt(CM.x+ux*la,m==2?14:10,CM.y+uz*la);
  g.fv+=(60+vr*18+(f.bo?8:0)-g.fv)*Math.min(1,dt*4);if(Math.abs(cam.fov-g.fv)>.05){cam.fov=g.fv;cam.updateProjectionMatrix()}
  g.sky.position.copy(cam.position);
  animateAtmosphere3(g.atmosphere,r.paused?0:dt,T.i,cfg.rain,cfg.quality>0,cam.position);
  const sp=r.paused?0:dt;
  r.cars.forEach((c,i)=>{const o=g.cars[i],dz=c.dz||[0,0,0,0],dg=c.dmg||0,v1=Math.min(1,c.v/c.ph.vmax);
    o.detail.visible=cfg.quality>0;
    o.g.position.set(c.x,1.6,c.y);o.g.rotation.y=-c.a;
    o.body.rotation.x=-c.steer*v1*.07;o.body.rotation.z=c.thr*.02-c.brk*.035;
    o.wl.forEach(w=>{w.sp.rotation.z-=c.v*sp/w.r;if(w.f)w.st.rotation.y=-c.steer*.45});
    o.mB.color.copy(o.base).lerp(DK3,Math.min(.55,dg*.7));
    {const sg=c.id%2?1:-1;o.fw.visible=dz[0]<.85;o.fw.scale.z=1-Math.min(.55,dz[0]*.9);o.fw.position.z=dz[0]*10*sg;o.fw.rotation.y=dz[0]*.5*sg;o.fw.rotation.z=-dz[0]*.3;
    const ns=1-Math.max(0,dz[0]-.3)*.7;o.nose.scale.x=10*ns;o.nose.position.x=41+5*ns;
    o.pS.forEach((m,k)=>{const v=dz[k?3:1];m.scale.y=8*(1-v*.5);m.scale.z=9*(1-v*.35);m.position.y=9-v*2;m.rotation.x=(k?-1:1)*v*.35;m.visible=v<.92});
    o.scr.forEach((m,z)=>{const v=dz[z];m.visible=v>.18;if(z%2)m.scale.x=24*(.4+.6*v);else if(z==0)m.scale.x=5+v*4});
    o.wl.forEach((w,k)=>{const v=dz[k%2?3:1];w.st.visible=v<.9;if(w.f&&v>.35)w.st.rotation.y+=(k==2?-1:1)*Math.min(.6,v*.7);w.st.rotation.x=v>.5?(k%2?1:-1)*(v-.5)*.5:0})}
    o.rw.rotation.z=dz[2]>=.55?.3:0;o.rw.visible=dz[2]<.9;o.bl.material.color.setHex(c.brk>.2?0xff3030:0x5a0f0f)});
  if(r.mode=='time'&&r.gh&&r.pl&&r.pl.lap>=1){const q=r.gh[Math.min(r.gh.length-1,Math.floor((r.t-r.pl.lapT)/.05))];
    if(q){if(!g.gh){g.gh=buildCar('#9be7ff','#fff',true,cfg.car);g.sc.add(g.gh.g)}g.gh.g.visible=true;g.gh.g.position.set(q[0],1.6,q[1]);g.gh.g.rotation.y=-q[2]}else if(g.gh)g.gh.g.visible=false}
  else if(g.gh)g.gh.g.visible=false;
  g.cur.lights.forEach((l,k)=>l.material.color.setHex(r.ph==='count'&&k<r.nl?0xff253c:0x28090e));
  // Trümmer
  while(g.deb.length<DB.length){const mm=new THREE.Mesh(BX3,new THREE.MeshLambertMaterial({color:0xffffff}));g.sc.add(mm);g.deb.push(mm)}
  g.deb.forEach((mm,i)=>{const d=DB[i];if(!d){mm.visible=false;return}mm.visible=true;if(mm.cc!==d.c){mm.cc=d.c;mm.material.color.set(d.c)}mm.scale.set(d.w,1.6,d.h);mm.position.set(d.x,2.2,d.y);mm.rotation.y=-d.a});
  // Reifenspuren
  const ks=SK.length+':'+(SK.length?SK[SK.length-1][0]:0);
  if(g.ks!==ks){g.ks=ks;const pa=g.skid.geometry.attributes.position.array,n=Math.min(700,SK.length);
    for(let i=0;i<n;i++){const s=SK[SK.length-n+i],dx=s[2]-s[0],dy=s[3]-s[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*1.8,ny=dx/l*1.8,k=i*12;
      pa[k]=s[0]+nx;pa[k+1]=2.2;pa[k+2]=s[1]+ny;pa[k+3]=s[0]-nx;pa[k+4]=2.2;pa[k+5]=s[1]-ny;pa[k+6]=s[2]-nx;pa[k+7]=2.2;pa[k+8]=s[3]-ny;pa[k+9]=s[2]+nx;pa[k+10]=2.2;pa[k+11]=s[3]+ny}
    g.skid.geometry.attributes.position.needsUpdate=true;g.skid.geometry.setDrawRange(0,n*6)}
  g.r.render(g.sc,cam);
  // Overlay (Partikel, Namen, Wetter, Effekte)
  cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);
  const fk=H/2/Math.tan(cam.fov*Math.PI/360),Vv=g.V,pj=(x,y,z)=>{Vv.set(x,y,z).applyMatrix4(cam.matrixWorldInverse);const d=-Vv.z;return d<12?null:[W/2+Vv.x/d*fk,H/2-Vv.y/d*fk,fk/d]};
  for(const p of PT){const k=p.l/p.m,q=pj(p.x,p.g?8:3+(1-k)*16,p.y);if(!q)continue;
    cx.globalAlpha=Math.max(0,k);cx.globalCompositeOperation=p.g?'lighter':'source-over';
    if(p.k){const q2=pj(p.x-p.vx*.04,8,p.y-p.vy*.04);if(!q2)continue;cx.strokeStyle=p.c;cx.lineWidth=Math.max(1.2,Math.min(3,p.r*q[2]*.5));cx.beginPath();cx.moveTo(q[0],q[1]);cx.lineTo(q2[0],q2[1]);cx.stroke();continue}
    cx.fillStyle=p.c;cx.beginPath();cx.arc(q[0],q[1],Math.max(.8,p.r*(p.g?1:2-k)*q[2]*.7),0,7);cx.fill()}
  cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  if(!r.demo){cx.fillStyle='rgba(255,255,255,.88)';cx.font='700 15px Rajdhani,sans-serif';cx.textAlign='center';
    for(const c of r.cars)if(c!==f&&Math.abs(c.x-f.x)+Math.abs(c.y-f.y)<1500){const q=pj(c.x,46,c.y);if(q)cx.fillText(c.code,q[0],q[1])}}
  if(cfg.rain){cx.fillStyle='rgba(8,14,30,.22)';cx.fillRect(0,0,W,H);cx.strokeStyle='rgba(190,210,255,.35)';cx.lineWidth=1.2;cx.beginPath();for(let i=0;i<120;i++){const x=Math.random()*W,y=Math.random()*H;cx.moveTo(x,y);cx.lineTo(x-4,y+24)}cx.stroke()}
  const sl=Math.max(0,vr-.55)/.45;
  if(sl>0){cx.strokeStyle='rgba(255,255,255,'+.12*sl+')';cx.lineWidth=1.5;cx.beginPath();for(let i=0;i<14;i++){const a=Math.random()*6.283,r1=Math.max(W,H)*(.36+Math.random()*.2),r2=r1+60+Math.random()*140*sl;cx.moveTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1);cx.lineTo(W/2+Math.cos(a)*r2,H/2+Math.sin(a)*r2)}cx.stroke()}
  if(CM.fl>0){cx.fillStyle='rgba(255,235,220,'+CM.fl+')';cx.fillRect(0,0,W,H)}
  if(f.bo){const gg=cx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);gg.addColorStop(0,'rgba(58,160,255,0)');gg.addColorStop(1,'rgba(58,160,255,.24)');cx.fillStyle=gg;cx.fillRect(0,0,W,H)}
}

const ASP=(()=>{try{const o=document.createElement('canvas');o.width=o.height=128;const g=o.getContext('2d');for(let i=0;i<1100;i++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.055)':'rgba(0,0,0,.14)';g.fillRect(Math.random()*128,Math.random()*128,1+Math.random()*2,1+Math.random()*2)}return cx.createPattern(o,'repeat')}catch(e){return null}})();
function drawCar(c){
  cx.save();cx.translate(c.x,c.y);cx.rotate(c.a);const dm=c.dmg||0;
  cx.fillStyle='rgba(0,0,0,.18)';cx.beginPath();cx.ellipse(6,6,44,20,0,0,7);cx.fill();
  cx.fillStyle='rgba(0,0,0,.28)';cx.beginPath();cx.ellipse(4,4,36,14,0,0,7);cx.fill();
  cx.strokeStyle='#17181d';cx.lineWidth=2;cx.beginPath();for(const y of[-1,1]){cx.moveTo(18,y*4);cx.lineTo(19,y*13);cx.moveTo(-18,y*6);cx.lineTo(-21,y*14)}cx.stroke();
  for(const[x,y,w]of[[-21,-14,17],[-21,14,17],[19,-13,13],[19,13,13]]){cx.fillStyle='#08080a';cx.fillRect(x-w/2,y-5,w,10);cx.fillStyle='#2d2f37';cx.fillRect(x-w/2+2,y-1.5,w-4,3);cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(x-w/2,y-5,w,1.5)}
  cx.fillStyle=c.col;cx.beginPath();cx.moveTo(38,0);cx.lineTo(24,-2.5);cx.lineTo(12,-4.5);cx.lineTo(0,-10);cx.lineTo(-14,-11);cx.lineTo(-24,-7);cx.lineTo(-24,7);cx.lineTo(-14,11);cx.lineTo(0,10);cx.lineTo(12,4.5);cx.lineTo(24,2.5);cx.closePath();cx.fill();
  cx.fillStyle='rgba(255,255,255,.2)';cx.beginPath();cx.moveTo(38,0);cx.lineTo(12,-4.5);cx.lineTo(0,-10);cx.lineTo(-14,-11);cx.lineTo(-24,-7);cx.lineTo(-24,0);cx.lineTo(12,0);cx.closePath();cx.fill();
  cx.fillStyle='rgba(0,0,0,.22)';cx.beginPath();cx.moveTo(12,4.5);cx.lineTo(0,10);cx.lineTo(-14,11);cx.lineTo(-24,7);cx.lineTo(-24,0);cx.lineTo(12,0);cx.closePath();cx.fill();
  cx.fillStyle=c.col2;cx.fillRect(-4,-1.2,24,2.4);if(dm<.4){cx.fillRect(29,-15,6,30);cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(29,-15,1.5,30)}else{cx.fillRect(29,-15,6,14);cx.fillRect(31,3,4,9)}cx.fillStyle=c.col2;cx.fillRect(-33,-14,8,28);cx.fillStyle=c.col;cx.fillRect(-33,-14,8,3);cx.fillRect(-33,11,8,3);cx.fillStyle=c.col2;cx.fillRect(27,-16,10,2);cx.fillRect(27,14,10,2);
  cx.fillStyle='#0b0b0d';cx.beginPath();cx.ellipse(-3,0,8,4.6,0,0,7);cx.fill();cx.strokeStyle='#2a2b31';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(-8,-5);cx.lineTo(4,-1.5);cx.moveTo(-8,5);cx.lineTo(4,1.5);cx.stroke();
  cx.fillStyle=c.col2;cx.beginPath();cx.arc(-3,0,3.6,0,7);cx.fill();cx.fillStyle='#f4f4f4';cx.beginPath();cx.arc(-2.6,0,2.4,0,7);cx.fill();cx.fillStyle='rgba(20,30,50,.75)';cx.fillRect(-1.5,-1.6,1.6,3.2);
  if(dm>.15){cx.strokeStyle='rgba(0,0,0,.5)';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(22,-3);cx.lineTo(9,5);cx.moveTo(-9,-8);cx.lineTo(-18,-2);if(dm>.5){cx.moveTo(14,6);cx.lineTo(2,9)}cx.stroke()}
  if(c.brk>.2){cx.fillStyle='#ff2020';cx.shadowColor='#f22';cx.shadowBlur=18;cx.fillRect(-36,-3,3,6);cx.fillRect(-36,-3,3,6)}
  cx.restore();
}
function render(dt){
  if(G3&&G3.ok){try{render3d(dt);return}catch(e){G3.ok=false;$('#g3').style.display='none';console.error(e)}}
  const r=R,T=r.T,f=r.focus,vr=Math.min(1,f.v/f.ph.vmax),base=Math.max(.5,Math.min(1.3,Math.min(W,H*1.4)/900))*(CAMF?.6:1);
  if(r.ph=='form'){const u=Math.min(1,r.pt/3.4),e=u*u*(3-2*u),a=r.cars[0],b=r.pl||f;CM.x=a.x+(b.x-a.x)*e;CM.y=a.y+(b.y-a.y)*e;CM.a=T.P[0].t+(1-e)*.9;CM.z=base*(.42+.66*e)}
  else{CM.x=f.x+f.vx*.16;CM.y=f.y+f.vy*.16;CM.a+=wr(f.a-CM.a)*Math.min(1,dt*(r.demo?3:6));CM.z+=(base*(1.08-.5*vr)-CM.z)*Math.min(1,dt*3)}
  cx.setTransform(DPR,0,0,DPR,0,0);cx.fillStyle=WORLD_THEMES[T.i].ground;cx.fillRect(0,0,W,H);
  cx.save();cx.translate(W/2+(cfg.shake?(Math.random()-.5)*CM.sh:0),H*.66+(cfg.shake?(Math.random()-.5)*CM.sh:0));cx.rotate(-Math.PI/2-CM.a);cx.scale(CM.z,CM.z);cx.translate(-CM.x,-CM.y);
  cx.lineJoin='round';cx.fillStyle='#0e2a1b';if(T.i===0)cx.fill(T.trees);
  cx.setLineDash([]);cx.strokeStyle='#d8dbe2';cx.lineWidth=TW+210;cx.stroke(T.path);
  cx.strokeStyle='#e0202c';cx.setLineDash([36,36]);cx.stroke(T.path);cx.setLineDash([]);
  cx.strokeStyle='#4a4234';cx.lineWidth=TW+190;cx.stroke(T.path);
  cx.strokeStyle='#17402a';cx.lineWidth=TW+112;cx.stroke(T.path);cx.strokeStyle='rgba(255,255,255,.075)';cx.setLineDash([280,280]);cx.stroke(T.path);cx.setLineDash([]);
  cx.strokeStyle='#eee';cx.lineWidth=TW+28;cx.stroke(T.path);
  cx.strokeStyle='#e0202c';cx.setLineDash([30,30]);cx.stroke(T.path);cx.setLineDash([]);
  cx.strokeStyle='#cfd2da';cx.lineWidth=TW+6;cx.stroke(T.path);
  cx.strokeStyle=cfg.rain?'#1c1f27':'#2c2e35';cx.lineWidth=TW;cx.stroke(T.path);if(ASP){cx.strokeStyle=ASP;cx.globalAlpha=cfg.rain?.45:1;cx.stroke(T.path);cx.globalAlpha=1}if(cfg.rain){cx.strokeStyle='rgba(130,170,255,.08)';cx.lineWidth=TW*.55;cx.stroke(T.path)}
  cx.strokeStyle='rgba(0,0,0,.17)';cx.lineWidth=46;cx.stroke(T.path);
  const p0=T.P[0];cx.save();cx.translate(p0.x,p0.y);cx.rotate(p0.t);
  for(let i=0;i<2;i++)for(let j=0;j<10;j++){cx.fillStyle=(i+j)&1?'#f5f5f5':'#111';cx.fillRect(-12+i*12,-TW/2+j*15,12,15)}
  cx.fillStyle='#16171c';cx.fillRect(70,-TW/2-40,16,TW+80);
  for(let k=0;k<5;k++){cx.fillStyle='#3a0d12';cx.beginPath();cx.arc(78,-48+k*24,6,0,7);cx.fill()}
  cx.restore();
  cx.strokeStyle='rgba(6,6,8,.5)';cx.lineWidth=3.5;cx.beginPath();for(const s of SK){cx.moveTo(s[0],s[1]);cx.lineTo(s[2],s[3])}cx.stroke();
  for(const s of T.stands){cx.strokeStyle='#14151a';cx.lineWidth=64;cx.stroke(s);cx.lineWidth=44;cx.setLineDash([2,10]);
    ['#ff5964','#eaeef6','#ffd166'].forEach((c,i)=>{cx.strokeStyle=c;cx.lineDashOffset=i*4;cx.stroke(s)});cx.setLineDash([]);cx.lineDashOffset=0}
  if(r.mode=='time'&&r.gh&&r.pl&&r.pl.lap>=1){const g=r.gh[Math.min(r.gh.length-1,Math.floor((r.t-r.pl.lapT)/.05))];if(g){cx.globalAlpha=.4;drawCar({x:g[0],y:g[1],a:g[2],col:'#9be7ff',col2:'#fff',brk:0});cx.globalAlpha=1}}
  for(const d of DB){cx.save();cx.translate(d.x,d.y);cx.rotate(d.a);cx.globalAlpha=Math.min(1,d.l);cx.fillStyle=d.c;cx.fillRect(-d.w/2,-d.h/2,d.w,d.h);cx.restore()}
  for(const c of r.cars)if(c!==f)drawCar(c);drawCar(f);
  for(const c of r.cars)if(c!==f&&!r.demo&&Math.abs(c.x-f.x)+Math.abs(c.y-f.y)<900){cx.save();cx.translate(c.x,c.y);cx.rotate(Math.PI/2+CM.a);cx.fillStyle='rgba(255,255,255,.85)';cx.font='700 15px Rajdhani,sans-serif';cx.textAlign='center';cx.fillText(c.code,0,-40);cx.restore()}
  for(const p of PT){const k=p.l/p.m;cx.globalAlpha=Math.max(0,k);cx.fillStyle=p.c;cx.globalCompositeOperation=p.g?'lighter':'source-over';if(p.k){cx.strokeStyle=p.c;cx.lineWidth=p.r;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);cx.stroke();continue}cx.beginPath();cx.arc(p.x,p.y,p.r*(p.g?1:2-k),0,7);cx.fill()}
  cx.globalAlpha=1;cx.globalCompositeOperation='source-over';cx.restore();
  if(cfg.rain){cx.fillStyle='rgba(8,14,30,.3)';cx.fillRect(0,0,W,H);cx.strokeStyle='rgba(190,210,255,.35)';cx.lineWidth=1.2;cx.beginPath();for(let i=0;i<120;i++){const x=Math.random()*W,y=Math.random()*H;cx.moveTo(x,y);cx.lineTo(x-4,y+24)}cx.stroke()}
  if(CM.fl>0){cx.fillStyle='rgba(255,235,220,'+CM.fl+')';cx.fillRect(0,0,W,H)}
  if(f.bo){const g=cx.createRadialGradient(W/2,H*.6,H*.3,W/2,H*.6,H*.95);g.addColorStop(0,'rgba(58,160,255,0)');g.addColorStop(1,'rgba(58,160,255,.24)');cx.fillStyle=g;cx.fillRect(0,0,W,H)}
  const sp=Math.max(0,vr-.55)/.45;
  if(sp>0){cx.strokeStyle='rgba(255,255,255,'+.13*sp+')';cx.lineWidth=1.5;cx.beginPath();for(let i=0;i<16;i++){const a=Math.random()*6.283,r1=Math.max(W,H)*(.34+Math.random()*.2),r2=r1+60+Math.random()*140*sp;cx.moveTo(W/2+Math.cos(a)*r1,H*.55+Math.sin(a)*r1);cx.lineTo(W/2+Math.cos(a)*r2,H*.55+Math.sin(a)*r2)}cx.stroke()}
}
function drawMM(){
  const T=R.T;mc.clearRect(0,0,150,150);mc.lineJoin='round';mc.lineWidth=9;mc.strokeStyle='rgba(0,0,0,.6)';mc.stroke(T.mpath);mc.lineWidth=4;mc.strokeStyle='#c9cdd8';mc.stroke(T.mpath);
  for(const c of R.cars){const x=c.x*T.a.s+T.a.ox,y=c.y*T.a.s+T.a.oy;mc.fillStyle=c.isP?'#fff':c.col;mc.beginPath();mc.arc(x,y,c.isP?6:3.8,0,7);mc.fill();if(c.isP){mc.strokeStyle='#ff2a36';mc.lineWidth=2.5;mc.stroke()}}
}
function tower(){const r=R,l=r.rk[0],T=r.T;E.tw.innerHTML=r.rk.map((c,i)=>`<div class="${c.isP?'me':''}"><b>${i+1}</b><i style="background:${c.col}"></i><span>${c.code}</span><em>${c.fin?'ZIEL':i?'+'+Math.max(0,(l.prog-c.prog)*T.ds/650).toFixed(1):'LEAD'}</em></div>`).join('')}
function hud(){
  const r=R,c=r.pl;if(!c)return;
  E.sp.textContent=Math.round(c.v*.33);E.gr.textContent=c.v<5?'N':c.gear;E.rv.style.width=100-Math.max(0,Math.min(1,(c.rpmS-4000)/8800))*100+'%';
  const ps=r.rk.indexOf(c)+1;E.pp.style.color=ps==1?'#ffd60a':'';E.pp.textContent='P'+ps;E.en.style.width=c.en*100+'%';E.eb.classList.toggle('on',!!c.bo);
  if(r.ph=='run'){if(r.p0&&ps!=r.p0)toast(ps<r.p0?'▲ P'+ps+' · '+r.rk[ps].name:'▼ P'+ps+' · '+r.rk[ps-2].name,ps<r.p0?'#2bff88':'#ff2a36');r.p0=ps}E.pt.textContent='/'+r.cars.length;
  E.lp.textContent=Math.min(r.laps,Math.max(1,c.lap))+'/'+r.laps;
  E.tm.textContent=r.ph=='run'||r.ph=='fin'?fmt(r.t):'0:00.000';E.ls.textContent=fmt(c.last)+' · '+fmt(c.best);
  if(r.ph=='run'&&!c.fin&&c.v>60&&Math.abs(wr(c.a-r.T.P[c.i].t))>2.2&&(r.tk||0)%45==0)toast('FALSCHE RICHTUNG','#ff2a36');
  {const dz=c.dz||[0,0,0,0],dk=dz.map(x=>Math.round(x*20)).join()+'|'+Math.round((c.dmg||0)*20);if(dk!==r.dk){r.dk=dk;DZ.forEach(e=>{const z=+e.dataset.z,v=Math.min(1,z==4?(c.dmg||0)/.9:dz[z]);e.style.fill='hsl('+Math.round(125*(1-v))+',80%,'+(v>.02?52:42)+'%)'});E.dp.textContent=Math.round((c.dmg||0)/.9*100)+'%';E.ds.textContent='TEMPO −'+Math.round((1-dmgSp(c))*100)+'%'}}
  updateRaceEvolution();drawMM();if((r.tk=(r.tk||0)+1)%10==0)tower();
}

/* ---- Menüs ---- */
function show(id){UI_SCREEN=id;document.body.dataset.screen=id||'race';clearControls();releaseVenuePointer();$$('.scr').forEach(s=>s.classList.toggle('on',s.id==id));const f={garage,tracks:trackCards,settings:setts,menu:menuInfo}[id];f&&f()}
function menuInfo(){$('#chip').textContent='⚡ '+ST.g('tok',0)+' UPGRADE-PUNKTE';const gi=$('[data-a=garage] i');if(gi)gi.textContent='Garage · '+ST.g('tok',0)+' Upgrade-Punkte';const c=CARS[cfg.car];$('#bc').style.cssText='--c:'+c.c+';--d:'+c.d;$('#mf').textContent=c.n+'  ·  '+TRK[cfg.track].n;updateMenuEvolution();$('#ci').textContent='Saison · Runde '+(ST.g('rnd',0)%3+1)+'/3'+' · '+ST.g('pts',0)+' Punkte'}
function garage(){
  updateGarageEvolution();const c=CARS[cfg.car];$('#gcar').style.cssText='--c:'+c.c+';--d:'+c.d;$('#cn').textContent=c.n;$('#ct').textContent=c.t.toUpperCase();
  const u=getUp(cfg.car),tok=ST.g('tok',0),UN=['GESCHWINDIGKEIT','BESCHLEUNIGUNG','BREMSEN','HANDLING','ABTRIEB'];
  $('#cs').innerHTML=`<div class="t"><span>UPGRADE-PUNKTE</span><em>${tok}</em></div>`+(tok||u.some(x=>x)?'':'<div class="hint">Beende ein Rennen: +1 Punkt. Podium: +2. Sieg: +3.</div>')+UN.map((l,i)=>`<div class="t"><span>${l} · LV ${u[i]}/5<button class="upb" data-u="${i}" ${tok<1||u[i]>=5?'disabled':''}>+</button></span><em>${Math.min(100,c.s[i]+u[i]*3)}${u[i]?'<b class="up">+'+u[i]*3+'</b>':''}</em></div><div class="bar"><i data-w="${Math.min(100,c.s[i]+u[i]*3)}"></i></div>`).join('');
  $$('#cs .upb').forEach(b=>b.onclick=()=>{const i=+b.dataset.u,t=ST.g('tok',0),us=ST.g('ups',{}),v=getUp(cfg.car).slice();if(t<1||v[i]>=5)return;v[i]++;us[cfg.car]=v;ST.s('ups',us);ST.s('tok',t-1);beep(1100,.08,.1);garage()});
  $('#cl').innerHTML=CARS.map((k,i)=>`<button class="ch team-choice ${i==cfg.car?'sel':''}" data-i="${i}" style="--c:${k.c}" aria-pressed="${i==cfg.car}"><span class="team-swatch"><img src="assets/portraits/${LIVERY_NAMES[i]}.webp" width="960" height="640" loading="lazy" decoding="async" alt=""><b>${['01','07','03','04'][i]}</b></span><span><small>${k.t}</small><strong>${k.n}</strong></span></button>`).join('');
  $$('#cl .ch').forEach(b=>b.onclick=()=>{cfg.car=+b.dataset.i;sv();garage();newRace(true)});
  void $('#cs').offsetWidth;$$('#cs .bar i').forEach(e=>e.style.width=e.dataset.w+'%');
}
function trackCards(){
  $('#tl').innerHTML=TRK.map((t,i)=>`<button class="card ${i==cfg.track?'sel':''}" data-i="${i}" aria-pressed="${i==cfg.track}"><div class="track-art" data-world="${t.i}">${circuitArtwork(t.i)}<svg class="track-map" viewBox="0 0 200 130" aria-label="Streckenverlauf">${t.svg}</svg><span class="track-number">CIRCUIT / 0${i+1}</span></div><h3>${t.f} ${t.n}</h3><p>${t.c} · ${WORLD_THEMES[t.i].label}</p><dl><div><dt>LÄNGE</dt><dd>${t.km.toFixed(2)} km</dd></div><div><dt>KURVEN</dt><dd>${t.cn}</dd></div><div><dt>BESTZEIT</dt><dd>${fmt(ST.g('b'+i,0))}</dd></div></dl></button>`).join('');
  $$('#tl .card').forEach(b=>b.onclick=()=>{cfg.track=+b.dataset.i;sv();trackCards();newRace(true)});
}
function setts(){const li=$('#lapin');if(li){if(document.activeElement!==li)li.value=cfg.laps;li.classList.toggle('sel',![3,5,8].includes(cfg.laps))}$$('.ch[data-o]').forEach(b=>{const[k,v]=b.dataset.o.split(':');b.classList.toggle('sel',String(cfg[k])===v)})}
$$('.ch[data-o]').forEach(b=>b.onclick=()=>{const[k,v]=b.dataset.o.split(':');cfg[k]=v=='true'?true:v=='false'?false:+v;sv();rs();setts();applyEvolutionPreferences()});
{const li=$('#lapin');li.oninput=()=>{const v=parseInt(li.value);if(v>=1){cfg.laps=Math.min(99,v);sv();setts()}};li.onchange=()=>{const v=Math.max(1,Math.min(99,parseInt(li.value)||cfg.laps));cfg.laps=v;li.value=v;sv();setts()}}
function start(m){
  clearControls();initAudio();newRace(false,m,m=='time'?0:'q');show('');E.hud.classList.add('on');E.tw.innerHTML='';updateRaceEvolution();
  ann(R.q?'QUALIFYING':'FORMATION LAP','fm',R.T.n+' · '+(R.q?'1 Runde Zeitfahren · bestimmt die Startposition':R.T.c)+' · Enter/Tippen = überspringen');$('#ann').classList.add('fm');beep(220,.4,.15);toast(matchMedia('(pointer:coarse)').matches?(cfg.touch?'Touch-Tasten unten · BOOST für Extra-Tempo':'Links analog lenken · rechts Gas, Bremse und Boost'):'W/↑ Gas · S/↓ Bremse · A D/←→ Lenken · Shift Boost','#3aa0ff');
}
function toMenu(){clearTimeout(tt);const a=$('#ann'),t=$('#toast');if(a)a.className='';if(t)t.classList.remove('on');E.hud.classList.remove('on');lights(0);newRace(true);show('menu')}
function endGame(){DEAD=1;try{AC&&AC.close()}catch(e){}AC=null;eg=null;
  document.body.insertAdjacentHTML('beforeend','<div id="bye" style="position:fixed;inset:0;z-index:99999;background:#050609;color:#e9ebf0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;font:700 24px system-ui;letter-spacing:.12em"><div>SPIEL BEENDET</div><button style="font:600 15px system-ui;padding:12px 26px;border-radius:12px;border:1px solid #556;background:#15171d;color:#fff" onclick="location.reload()">NEU STARTEN</button></div>');
  try{window.close()}catch(e){}}
function pause(on){if(R.demo||R.ph=='done')return;clearControls();R.paused=on;show(on?'pause':'')}
function results(){
  const r=R,T=r.T;if(r.resultsShown)return;r.resultsShown=true;r.ph='done';r.paused=false;clearControls();
  for(const c of r.cars)if(!c.fin)c.fin=c.dnf?1e9-c.prog:r.t+((r.laps+1)*T.N-c.prog)*T.ds/Math.max(350,c.v);
  const rk=[...r.cars].sort((a,b)=>a.fin-b.fin),pl=r.pl,pos=rk.indexOf(pl)+1;
  let fl=null;for(const c of rk)if(c.best&&(!fl||c.best<fl.best))fl=c;
  const pts=rk.map((c,i)=>r.mode=='time'?0:(PTS[i]||0)+(c==fl&&i<8?1:0)),pp=pts[pos-1],won=r.mode!='time'&&pos==1;let tot=0;const earned=r.mode!='time'&&pl.fo&&!pl.dnf?(pos===1?3:pos<=3?2:1):0;if(earned)ST.s('tok',ST.g('tok',0)+earned);recordSessionEvolution(r,pos,earned);
  let end=false;if(r.mode=='career'){const rn=ST.g('rnd',0)+1;tot=ST.g('pts',0)+pp;end=rn%3==0;ST.s('pts',end?0:tot);ST.s('rnd',rn)}
  $('#rsub').textContent=T.n+' · '+T.c+(r.mode=='career'?' · Karriere':'');
  $('#rt').textContent=end?'SAISON BEENDET · '+tot+' PUNKTE':r.mode=='time'?'ZEITFAHREN':pos==1?'SIEG!':pl.dnf?'AUSGEFALLEN · P'+pos:'ENDERGEBNIS · P'+pos;
  $('#rt').style.color=r.mode!='time'&&pos==1?'#ffd60a':'';$('#pod').innerHTML=r.mode=='time'?'':[1,0,2].filter(i=>rk[i]).map(i=>`<div style="--c:${rk[i].col};--d:${.2+(2-i)*.25}s"><small>${rk[i].name}</small><u style="height:${[150,110,80][i]}px">${i+1}</u></div>`).join('');
  $('#rb').innerHTML=rk.map((c,i)=>`<tr class="${c.isP?'me':''}" style="--d:${i*.08}s"><td>${i+1}</td><td><i style="background:${c.col}"></i>${c.name}<small>${c.team}</small></td><td>${c.dnf?'DNF':i?'+'+(c.fin-rk[0].fin).toFixed(3):fmt(c.fin)}</td><td>${fmt(c.best)}</td><td>${pts[i]}</td></tr>`).join('');
  $('#rs').innerHTML=[['RENNZEIT',pl.dnf?'DNF':fmt(pl.fin)],['SCHNELLSTE RUNDE',fl?fmt(fl.best)+' · '+fl.code:'—'],['Ø GESCHWINDIGKEIT',(pl.dnf?'—':Math.round(T.km*r.laps/(pl.fin/3600))+' km/h')],['PUNKTE','+'+pp+(r.mode=='career'?' · Σ '+tot:'')]].concat(earned?[['UPGRADE','+'+earned+' Punkte · in der Garage']]:[]).map(x=>`<div class="gl"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
  E.hud.classList.remove('on');show('res');
}

/* ---- Eingaben & Start ---- */
$$('.mi[data-a]').forEach((b,i)=>{b.style.setProperty('--n',i);b.onclick=()=>{initAudio();const a=b.dataset.a;a=='race'||a=='career'||a=='time'?start(a):show(a)}});
$$('[data-b]').forEach(b=>b.onclick=()=>show('menu'));
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.mi,.ch,.bk,.card,#pzb')){initAudio();beep(900,.05,.06);try{navigator.vibrate&&navigator.vibrate(12)}catch(x){}}});
$('#qgo').onclick=()=>{initAudio();newRace(false,R.mode,'g');show('');E.hud.classList.add('on');E.tw.innerHTML='';ann('FORMATION LAP','fm',R.T.n+' · '+R.T.c+' · Enter/Tippen = überspringen');$('#ann').classList.add('fm');beep(220,.4,.15)};
$('#rst').onclick=()=>start(R.mode);
{const b=$('#rsd');let w=0;b.onclick=()=>{if(!w){w=1;b.textContent='Wirklich löschen? Nochmal tippen';setTimeout(()=>{w=0;b.textContent='Fortschritt löschen'},3000);return}try{Object.keys(localStorage).filter(k=>k.startsWith('vgp')).forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()}}
cv.addEventListener('pointerdown',()=>{if(R&&R.ph=='form'&&!R.demo)R.pt=3.4});
$('#again').onclick=()=>start(R.mode);$('#tomenu').onclick=toMenu;$('#rsm').onclick=()=>pause(false);$('#qt').onclick=toMenu;$('#pzb').onclick=()=>pause(true);
addEventListener('keydown',e=>{if(e.target&&e.target.tagName=='INPUT')return;if(e.code=='Escape'&&['garage','tracks','settings'].some(i=>$('#'+i).classList.contains('on'))){show('menu');return}if((e.code=='Enter'||e.code=='Space')&&R&&R.ph=='form'&&!R.demo)R.pt=3.4;KY[e.code]=1;initAudio();if((e.code.startsWith('Arrow')||e.code=='Space')&&E.hud.classList.contains('on'))e.preventDefault();if((e.code=='Escape'||e.code=='KeyP')&&!e.repeat)pause(!R.paused);if(e.code=='KeyC'&&!e.repeat){CAMF=((+CAMF)+1)%3;if(R&&!R.demo)toast(['CHASE-KAMERA','HOHE KAMERA','COCKPIT-KAMERA'][CAMF],'#3aa0ff')}if(e.code=='KeyR'&&!e.repeat&&R.pl&&R.ph=='run'&&!R.paused&&!R.pl.auto)respawn(R.pl)});
addEventListener('keyup',e=>KY[e.code]=0);document.addEventListener('visibilitychange',()=>{if(document.hidden&&R&&!R.demo&&R.ph!='done'&&!R.paused)pause(true)});addEventListener('pointerdown',initAudio);addEventListener('blur',clearControls);
$$('#tc button').forEach(b=>{const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(x){}TC[k]=1;b.classList.add('d')});['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>{TC[k]=0;b.classList.remove('d')}))});
addEventListener('contextmenu',e=>e.preventDefault());
$('#fs').onclick=()=>{const d=document,e=d.documentElement;try{d.fullscreenElement?d.exitFullscreen():e.requestFullscreen().catch(()=>{})}catch(x){}};
for(let i=0;i<9;i++){const e=document.createElement('i');e.style.cssText=`top:${8+i*10}%;animation-duration:${.7+Math.random()*1.2}s;animation-delay:${-Math.random()*2}s;width:${16+Math.random()*26}%`;$('#sl').appendChild(e)}
let lt=0,gpS=0;
function loop(ts){
  try{const g=navigator.getGamepads?[...navigator.getGamepads()].find(x=>x):0,s=g&&g.buttons[9]&&g.buttons[9].pressed?1:0;if(s&&!gpS&&R.pl)pause(!R.paused);gpS=s}catch(e){}
  const dt=Math.min(.05,(ts-lt)/1000||.016);lt=ts;
  if(!R.paused){const n=Math.ceil(dt/.0167);for(let i=0;i<n;i++)sim(dt/n);upd(dt)}
  render(dt);if(!R.demo)hud();
  if(AC&&eg)eng(R.pl||{rpmS:4000,thr:0},!R.demo&&R.ph!='done');
  if(!DEAD)requestAnimationFrame(loop);
}
{const b=document.createElement('button');b.className='mi';b.style.setProperty('--n',6);b.innerHTML='<b>SPIEL BEENDEN</b><i>Komplett schließen</i>';b.onclick=endGame;const n=$('[data-a=settings]');n&&n.parentNode.appendChild(b)}
initEvolution();init3d();newRace(true);show('menu');requestAnimationFrame(loop);

