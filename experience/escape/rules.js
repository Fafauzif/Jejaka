/** Escape rules. Fictional local outcomes; no battle-win or arbitrary death state. */
export const VERSION=1;
export const SPAWN=Object.freeze({x:0,z:12,yaw:0});
export const TARGETS=Object.freeze([{x:-2.4,z:4.8},{x:0,z:-20},{x:24,z:-61},{x:24,z:-93},{x:-20,z:-160},{x:-20,z:-179},{x:-20,z:-225.5},{x:-20,z:-228.5}]);
export const ROUTE=Object.freeze([{x:0,z:12},{x:-3,z:4},{x:0,z:-20},{x:24,z:-46},{x:24,z:-82},{x:24,z:-93},{x:24,z:-108},{x:0,z:-126},{x:-20,z:-160},{x:-20,z:-179},{x:-20,z:-201},{x:-20,z:-220}]);
export function createRun(){return {version:VERSION,phase:0,time:0,phaseTime:0,workProgress:0,helpProgress:0,bridgeProgress:0,metSari:false,firstWarned:false,alarmTime:0,learned:false,learnedAt:0,helpedAt:0,helped:false,bridgeHelped:false,alleySealed:false,alleySealedAt:0,plazaCutoff:false,plazaCutoffAt:0,exposed:false,exposures:0,stagger:0,hazards:[],safe:false,clothIntact:true,war:0,events:[]};}
export function createPlayer(){return {...SPAWN,vx:0,vz:0,stance:'walk'};}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function collides(x,z,colliders,r=.33){return colliders.some(b=>{const nx=Math.max(b.minX,Math.min(x,b.maxX)),nz=Math.max(b.minZ,Math.min(z,b.maxZ));return (nx-x)**2+(nz-z)**2<r*r;});}
export function movePlayer(p,input,dt,colliders=[],bounds={minX:-63,maxX:63,minZ:-240,maxZ:26}){
 const strafe=(input.right||0)-(input.left||0),forward=(input.forward||0)-(input.backward||0),mag=Math.hypot(strafe,forward),n=mag>1?1/mag:1;
 const speed=(input.crouch?2.25:input.run?7.2:4.65)*(input.slow ? .42 : 1);
 const tx=(Math.cos(p.yaw)*strafe-Math.sin(p.yaw)*forward)*n*speed,tz=(-Math.sin(p.yaw)*strafe-Math.cos(p.yaw)*forward)*n*speed;
 const blend=1-Math.exp(-dt*(mag?15:22));p.vx+=(tx-p.vx)*blend;p.vz+=(tz-p.vz)*blend;
 p.stance=input.crouch?'crouch':input.run&&mag?'run':'walk';
 const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vz)*dt/.12));
 for(let i=0;i<steps;i++){const x=Math.max(bounds.minX,Math.min(bounds.maxX,p.x+p.vx*dt/steps));if(!collides(x,p.z,colliders))p.x=x;else p.vx=0;const z=Math.max(bounds.minZ,Math.min(bounds.maxZ,p.z+p.vz*dt/steps));if(!collides(p.x,z,colliders))p.z=z;else p.vz=0;}
 return p;
}
export function changePhase(s,phase){if(phase<=s.phase||phase>7)return false;s.phase=phase;s.phaseTime=0;s.events.push({type:'phase',phase,time:s.time});return true;}
export function cartContact(s,p){const x=-20+(s.bridgeProgress||0)*3.2;return{x:Math.max(x-2.6,Math.min(p.x,x+2.6)),z:Math.max(-183.5,Math.min(p.z,-180.5))};}
export function actionAt(s,p){
 if(s.phase===0&&!s.learned&&distance(p,TARGETS[0])<2.5)return {id:'cloth',label:s.workProgress?'Tahan kain · lihat garisnya':'Bantu bentangkan kain',progress:s.workProgress};
 if(s.phase===3&&distance(p,TARGETS[3])<2.7)return {id:'child',label:s.helpProgress?'Angkat rangka · Adi sedang keluar':'Tahan untuk angkat rangka',progress:s.helpProgress};
 if(s.phase===5&&!s.bridgeHelped&&distance(p,cartContact(s,p))<1.7)return {id:'cart',label:s.bridgeProgress>.2?'Dorong · ikuti gerobaknya':'Tahan untuk dorong gerobak',progress:s.bridgeProgress};
 return null;
}
export function stepRun(s,p,input,dt){
 const events=[];s.stagger=Math.max(0,(s.stagger||0)-dt);s.time+=dt;s.phaseTime+=dt;s.war=s.phase?Math.min(1,.35+s.time/220):0;
 if(s.phase===0&&distance(p,TARGETS[0])<6&&!s.metSari){s.metSari=true;events.push('meet');}
 const a=actionAt(s,p);
 if(a&&input.help){if(a.id==='cloth'){s.workProgress=Math.min(1,s.workProgress+dt/2.5);if(s.workProgress===1&&!s.learned){s.learned=true;s.learnedAt=s.time;events.push('learned');}}if(a.id==='child'){s.helpProgress=Math.min(1,s.helpProgress+dt/3.5);if(s.helpProgress===1&&!s.helped){s.helped=true;s.helpedAt=s.time;events.push('child');changePhase(s,4);}}if(a.id==='cart'){s.bridgeProgress=Math.min(1,s.bridgeProgress+dt/3.5);if(s.bridgeProgress===1&&!s.bridgeHelped){s.bridgeHelped=true;events.push('cart');}}}
 if(s.phase===0&&!s.firstWarned&&((s.learned&&s.time>22)||(p.z<-12&&s.time>3)||(s.time>44))){s.firstWarned=true;s.alarmTime=s.time;events.push('firstWarning');}if(s.phase===0&&s.firstWarned&&s.time-s.alarmTime>=4){changePhase(s,1);events.push('firstBlast');}
 if(s.phase===1&&(p.z<-21||p.x>11)){changePhase(s,2);events.push('alley');}
 if(s.phase===2&&distance(p,{x:24,z:-84})<12){changePhase(s,3);events.push('trapped');}
 if(s.phase===4&&p.z<-157&&(p.x<-8||p.z<-172)){changePhase(s,5);events.push('bridge');}
 if(s.phase===5&&p.z<-198){changePhase(s,6);events.push('refuge');}
 if(s.phase===6&&distance(p,TARGETS[6])<2.8&&p.z<-224.2&&input.companionsSafe!==false){changePhase(s,7);s.safe=true;events.push('safe');}
 return events;
}
function segmentHits(a,b,box){if(b.x>=box.minX&&b.x<=box.maxX&&b.z>=box.minZ&&b.z<=box.maxZ)return false;let lo=0,hi=1;for(const axis of ['X','Z']){const key=axis.toLowerCase(),d=b[key]-a[key],min=box['min'+axis],max=box['max'+axis];if(Math.abs(d)<1e-8){if(a[key]<min||a[key]>max)return false;}else{let t0=(min-a[key])/d,t1=(max-a[key])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}}return hi>.01&&lo<.98;}
export function impactProtection(p,hazard=null,colliders=[],cover=[]){const d=hazard?distance(p,hazard):0,r=hazard?.radius||26;if(hazard&&d>r)return{reason:'outside',distance:d,protected:true};const blockers=hazard?colliders.filter(b=>b.tag!=='river'&&b.tag!=='tree'&&segmentHits(p,hazard,b)):[];const wall=blockers.some(b=>b.tag==='architecture');const low=blockers.length>0||(colliders.length===0&&cover.some(c=>distance(p,c)<(c.r||2)));const protectedByCover=wall||(p.stance==='crouch'&&low);return{reason:protectedByCover?'cover':'exposed',distance:d,protected:protectedByCover};}
export function assessImpact(s,p,cover=[],hazard=null,colliders=[]){const sheltered=impactProtection(p,hazard,colliders,cover).protected;if(!sheltered){s.exposed=true;s.exposures++;s.clothIntact=false;s.stagger=2.4;}return sheltered;}
export function saveRun(s,p,companions=null){return JSON.stringify({version:VERSION,state:s,player:{x:p.x,z:p.z,yaw:p.yaw},companions:companions?{...companions,phase:s.phase}:null});}
export function loadRun(raw){try{const d=JSON.parse(raw);if(d.version!==VERSION||!d.state||!d.player)return null;const a=d.state,p=d.player;if(!Number.isInteger(a.phase)||a.phase<0||a.phase>7||!Number.isFinite(a.time)||a.time<0||a.time>20000||![p.x,p.z,p.yaw].every(Number.isFinite)||Math.abs(p.x)>65||p.z<-245||p.z>30)return null;const s=createRun();for(const k of ['phase','time','phaseTime','learnedAt','helpedAt','alarmTime','alleySealedAt','plazaCutoffAt','workProgress','helpProgress','bridgeProgress','exposures'])if(Number.isFinite(a[k]))s[k]=k.includes('Progress')?Math.max(0,Math.min(1,a[k])):a[k];for(const k of ['metSari','firstWarned','learned','helped','bridgeHelped','alleySealed','plazaCutoff','exposed','safe','clothIntact'])if(typeof a[k]==='boolean')s[k]=a[k];s.phaseTime=Math.max(0,Math.min(20000,s.phaseTime));s.helpedAt=Math.max(0,Math.min(s.time,s.helpedAt));s.exposures=Math.max(0,Math.min(1000,s.exposures));if(s.phase>=4){s.helped=true;s.helpProgress=1;}s.safe=s.phase===7;s.hazards=Array.isArray(a.hazards)?a.hazards.filter(x=>['alley','square','bridge'].includes(x)):[];s.war=s.phase?Math.min(1,.35+s.time/220):0;return {state:s,player:{...createPlayer(),...p,vx:0,vz:0},companions:d.companions||null};}catch{return null;}}
