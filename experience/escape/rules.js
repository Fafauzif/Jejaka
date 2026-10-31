/** Fictional civilian outcomes on a map-derived, explicitly compressed route. */
import {LAYOUT} from './layout.js';
import {LINES} from './story.js';
export const VERSION=3;
export const SPAWN=Object.freeze({...LAYOUT.spawn});
export const TARGETS=Object.freeze([LAYOUT.helpPoints.workshop,LAYOUT.actorRoute[2],LAYOUT.cover,LAYOUT.helpPoints.rescue,LAYOUT.plaza,LAYOUT.cart,LAYOUT.refugeApproach,LAYOUT.refuge]);
export const ROUTE=LAYOUT.actorRoute;
const spokenSeconds=a=>a.reduce((n,line)=>n+line.duration,0);
export const WORK_SECONDS=Object.freeze([spokenSeconds(LINES.opening)+.5,spokenSeconds(LINES.clothDye)+.5,spokenSeconds(LINES.clothFinish)+.5]);
export function createRun(){return {version:VERSION,layoutId:LAYOUT.id,phase:0,time:0,phaseTime:0,workStage:0,workProgress:0,workReadyAt:0,workAvailableAt:0,workStarted:false,workNeedsRelease:false,helpProgress:0,bridgeProgress:0,metSari:false,firstWarned:false,alarmTime:0,learned:false,learnedAt:0,helpedAt:0,helped:false,bridgeHelped:false,alleySealed:false,alleySealedAt:0,plazaCutoff:false,plazaCutoffAt:0,exposed:false,exposures:0,stagger:0,hazards:[],safe:false,clothIntact:true,war:.08,routeCursor:12,breatherStarted:false,breatherAt:0,breatherDone:false,events:[]};}
export function createPlayer(){return {...SPAWN,vx:0,vz:0,stance:'walk'};}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function collides(x,z,colliders,r=.33){return colliders.some(b=>{const nx=Math.max(b.minX,Math.min(x,b.maxX)),nz=Math.max(b.minZ,Math.min(z,b.maxZ));return (nx-x)**2+(nz-z)**2<r*r;});}
export function movePlayer(p,input,dt,colliders=[],bounds=LAYOUT.bounds){
 const strafe=(input.right||0)-(input.left||0),forward=(input.forward||0)-(input.backward||0),mag=Math.hypot(strafe,forward),n=mag>1?1/mag:1;
 const speed=(input.crouch?1.9:input.run?5.8:4)*(input.slow?.42:1);
 const tx=(Math.cos(p.yaw)*strafe-Math.sin(p.yaw)*forward)*n*speed,tz=(-Math.sin(p.yaw)*strafe-Math.cos(p.yaw)*forward)*n*speed;
 const blend=1-Math.exp(-dt*(mag?15:22));p.vx+=(tx-p.vx)*blend;p.vz+=(tz-p.vz)*blend;p.stance=input.crouch?'crouch':input.run&&mag?'run':'walk';
 const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vz)*dt/.12));for(let i=0;i<steps;i++){const x=Math.max(bounds.minX,Math.min(bounds.maxX,p.x+p.vx*dt/steps));if(!collides(x,p.z,colliders))p.x=x;else p.vx=0;const z=Math.max(bounds.minZ,Math.min(bounds.maxZ,p.z+p.vz*dt/steps));if(!collides(p.x,z,colliders))p.z=z;else p.vz=0;}return p;
}
export function changePhase(s,phase){if(phase<=s.phase||phase>7)return false;s.phase=phase;s.phaseTime=0;s.events.push({type:'phase',phase,time:s.time});return true;}
export function cartContact(s,p){const x=LAYOUT.cart.x+(s.bridgeProgress||0)*LAYOUT.cartShift,z=LAYOUT.cart.z;return{x:Math.max(x-2.6,Math.min(p.x,x+2.6)),z:Math.max(z-1.5,Math.min(p.z,z+1.5))};}
export function actionAt(s,p){
 if(s.phase===0&&!s.learned&&s.metSari&&s.time>=s.workAvailableAt&&!s.workNeedsRelease&&s.workProgress<1&&distance(p,TARGETS[0])<2.8)return{id:'cloth',label:['Tahan ujung kain','Bentangkan contoh kain celup','Tunjukkan contoh kain jadi'][s.workStage]||'Perhatikan kain',progress:s.workProgress};
 if(s.phase===3&&distance(p,TARGETS[3])<2.7)return{id:'child',label:s.helpProgress?'Angkat rangka · Adi sedang keluar':'Tahan untuk angkat rangka',progress:s.helpProgress};
 if(s.phase===5&&!s.bridgeHelped&&distance(p,cartContact(s,p))<1.7)return{id:'cart',label:s.bridgeProgress>.2?'Dorong · ikuti gerobaknya':'Tahan untuk dorong gerobak',progress:s.bridgeProgress};return null;
}
export function navigationTarget(s,p){
 const r=LAYOUT.actorRoute;
 switch(s.phase){case 0:return s.learned?r[1]:TARGETS[0];case 1:return r[3];case 2:return p.z>LAYOUT.cover.z-4?r[4]:r[5];case 3:return TARGETS[3];case 4:return p.z>LAYOUT.plaza.z+4?r[7]:r[8];case 5:if(p.z>LAYOUT.cart.z-2&&!s.bridgeHelped)return{x:LAYOUT.cart.x,z:LAYOUT.cart.z+2.7};return p.z>LAYOUT.crossing.entry.z?r[10]:r[11];case 6:return r[Math.max(12,Math.min(r.length-1,s.routeCursor))];default:return LAYOUT.refugeApproach;}
}
export function stepRun(s,p,input,dt){
 const events=[];s.stagger=Math.max(0,(s.stagger||0)-dt);s.time+=dt;s.phaseTime+=dt;s.war=s.phase?Math.min(1,.35+s.time/400):.08;
 const physicalHelp=input.helpPressed??input.help;if(!physicalHelp)s.workNeedsRelease=false;
 if(s.phase===0&&distance(p,LAYOUT.workshop)<7&&!s.metSari){s.metSari=true;s.workAvailableAt=s.time+spokenSeconds(LINES.preparation);events.push('meet');}
 const a=actionAt(s,p);
 if(a&&input.help){if(a.id==='cloth'){if(!s.workStarted){s.workStarted=true;s.workReadyAt=s.time+WORK_SECONDS[s.workStage];events.push(['clothWax','clothDye','clothFinish'][s.workStage]);}s.workProgress=Math.min(1,s.workProgress+dt/3.5);}if(a.id==='child'){s.helpProgress=Math.min(1,s.helpProgress+dt/3.5);if(s.helpProgress===1&&!s.helped){s.helped=true;s.helpedAt=s.time;events.push('child');changePhase(s,4);}}if(a.id==='cart'){s.bridgeProgress=Math.min(1,s.bridgeProgress+dt/3.5);if(s.bridgeProgress===1&&!s.bridgeHelped){s.bridgeHelped=true;events.push('cart');}}}
 if(s.phase===0&&s.metSari&&s.workStarted&&s.workProgress>=1&&s.time>=s.workReadyAt&&!s.learned){s.workStage++;s.workProgress=0;s.workStarted=false;s.workReadyAt=0;s.workAvailableAt=s.time;s.workNeedsRelease=!!physicalHelp;if(s.workStage>=3){s.learned=true;s.learnedAt=s.time;events.push('learned');}}
 const leftWorkshop=distance(p,LAYOUT.workshop)>18&&s.time>5;
 if(s.phase===0&&!s.firstWarned&&((s.learned&&s.time-s.learnedAt>5)||leftWorkshop)){s.firstWarned=true;s.alarmTime=s.time;events.push('firstWarning');}
 if(s.phase===0&&s.firstWarned&&s.time-s.alarmTime>=5){changePhase(s,1);events.push('firstBlast');}
 if(s.phase===1&&(p.z<LAYOUT.actorRoute[2].z-6||s.phaseTime>8)){changePhase(s,2);events.push('alley');}
 if(s.phase===2&&distance(p,LAYOUT.rescue)<14){changePhase(s,3);events.push('trapped');}
 if(s.phase===4&&distance(p,LAYOUT.actorRoute[8])<15){changePhase(s,5);events.push('bridge');}
 if(s.phase===5&&p.z<LAYOUT.crossing.west.z-1.2&&Math.abs(p.x-LAYOUT.crossing.west.x)<12){changePhase(s,6);s.routeCursor=12;events.push('refuge');}
 if(s.phase===6){
  if(!s.breatherStarted&&distance(p,LAYOUT.quayBreather)<9){s.breatherStarted=true;s.breatherAt=s.time;events.push('breather');}
  if(s.breatherStarted&&s.time-s.breatherAt>=16)s.breatherDone=true;
  const r=LAYOUT.actorRoute;s.routeCursor=Math.max(12,Math.min(r.length-1,s.routeCursor));if(distance(p,r[s.routeCursor])<5&&s.routeCursor<r.length-1)s.routeCursor++;
  if(distance(p,LAYOUT.refugeApproach)<2.8&&s.routeCursor>=r.length-2&&input.companionsSafe===true){changePhase(s,7);s.safe=true;events.push('safe');}
 }
 return events;
}
function segmentHits(a,b,box){if(b.x>=box.minX&&b.x<=box.maxX&&b.z>=box.minZ&&b.z<=box.maxZ)return false;let lo=0,hi=1;for(const axis of ['X','Z']){const key=axis.toLowerCase(),d=b[key]-a[key],min=box['min'+axis],max=box['max'+axis];if(Math.abs(d)<1e-8){if(a[key]<min||a[key]>max)return false;}else{let t0=(min-a[key])/d,t1=(max-a[key])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}}return hi>.01&&lo<.98;}
export function impactProtection(p,hazard=null,colliders=[],cover=[]){const d=hazard?distance(p,hazard):0,r=hazard?.radius||26;if(hazard&&d>r)return{reason:'outside',distance:d,protected:true};const blockers=hazard?colliders.filter(b=>b.tag!=='river'&&b.tag!=='tree'&&segmentHits(p,hazard,b)):[];const wall=blockers.some(b=>b.tag==='architecture');const low=blockers.length>0||(colliders.length===0&&cover.some(c=>distance(p,c)<(c.r||2)));const protectedByCover=wall||(p.stance==='crouch'&&low);return{reason:protectedByCover?'cover':'exposed',distance:d,protected:protectedByCover};}
export function assessImpact(s,p,cover=[],hazard=null,colliders=[]){const sheltered=impactProtection(p,hazard,colliders,cover).protected;if(!sheltered){s.exposed=true;s.exposures++;s.clothIntact=false;s.stagger=2.4;}return sheltered;}
export function saveRun(s,p,companions=null){return JSON.stringify({version:VERSION,layoutId:LAYOUT.id,state:s,player:{x:p.x,z:p.z,yaw:p.yaw},companions:companions?{...companions,phase:s.phase}:null});}
export function loadRun(raw){try{const d=JSON.parse(raw);if(d.version!==VERSION||d.layoutId!==LAYOUT.id||!d.state||!d.player)return null;const a=d.state,p=d.player,b=LAYOUT.bounds;if(!Number.isInteger(a.phase)||a.phase<0||a.phase>7||!Number.isFinite(a.time)||a.time<0||a.time>20000||![p.x,p.z,p.yaw].every(Number.isFinite)||p.x<b.minX||p.x>b.maxX||p.z<b.minZ||p.z>b.maxZ)return null;const s=createRun();for(const k of ['phase','time','phaseTime','learnedAt','helpedAt','alarmTime','alleySealedAt','plazaCutoffAt','workProgress','workStage','workReadyAt','workAvailableAt','helpProgress','bridgeProgress','exposures','routeCursor','breatherAt'])if(Number.isFinite(a[k]))s[k]=k.includes('Progress')?Math.max(0,Math.min(1,a[k])):a[k];for(const k of ['metSari','workStarted','firstWarned','learned','helped','bridgeHelped','alleySealed','plazaCutoff','exposed','safe','clothIntact','breatherStarted','breatherDone'])if(typeof a[k]==='boolean')s[k]=a[k];s.workStage=Math.max(0,Math.min(3,Math.floor(s.workStage)));s.workNeedsRelease=false;s.phaseTime=Math.max(0,Math.min(20000,s.phaseTime));s.helpedAt=Math.max(0,Math.min(s.time,s.helpedAt));s.exposures=Math.max(0,Math.min(1000,s.exposures));s.routeCursor=Math.max(12,Math.min(LAYOUT.actorRoute.length-1,Math.floor(s.routeCursor)));if(s.phase>=4){s.helped=true;s.helpProgress=1;}s.safe=s.phase===7;s.hazards=Array.isArray(a.hazards)?a.hazards.filter(x=>['alley','square','bridge'].includes(x)):[];s.war=s.phase?Math.min(1,.35+s.time/400):.08;return{state:s,player:{...createPlayer(),...p,vx:0,vz:0},companions:d.companions||null};}catch{return null;}}
