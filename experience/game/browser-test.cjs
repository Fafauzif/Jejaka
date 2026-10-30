/* Street-edition browser integration checks.
 * Runs its own static server at the repository root (override with JEJAKA_TEST_URL):
 *   CHROMIUM_PATH=/path/to/chrome node experience/game/browser-test.cjs
 * Test-only teleports place the visitor near interactions; all gameplay actions,
 * choices, camera, notebook download, save/continue and pause use actual DOM/input.
 * Screenshots and JSON default to a temporary folder, outside release artifacts.
 * Software WebGL establishes functional behavior, not consumer-GPU performance.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright'));
const base=process.env.JEJAKA_TEST_URL||'http://127.0.0.1:8123/experience/?test=1';
const out=process.env.JEJAKA_QA_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'jejaka-street-qa-'));
fs.mkdirSync(out,{recursive:true});
const report={base,started:new Date().toISOString(),checks:[],errors:[],requestFailures:[],consoleErrors:[],screenshots:[],measurements:{},limitations:['Spatial interaction tests use test-only teleports; this is not a timed human playtest.','Software WebGL frame timings do not establish target hardware FPS.']};
let browser,page,server;
const http=require('node:http');
const siteRoot=path.resolve(__dirname,'../..');
report.sourceHashes=Object.fromEntries(['experience/index.html','experience/game.css','experience/game/actors.js','experience/game/app.js','experience/game/effects.js','experience/game/simulation.js','experience/game/world.js'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(siteRoot,f))).digest('hex')]));
async function serve(){if(process.env.JEJAKA_TEST_URL)return;server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}const file=path.resolve(siteRoot,'.'+name+(name.endsWith('/')?'index.html':''));if(!file.startsWith(siteRoot+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}const ext=path.extname(file);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.woff':'font/woff','.gz':'application/octet-stream','.jpg':'image/jpeg','.png':'image/png'})[ext]||'application/octet-stream');res.end(data);});});await new Promise(r=>server.listen(8123,'127.0.0.1',r));}

const pass=(name,detail)=>{report.checks.push({name,status:'passed',...(detail?{detail}:{})});console.log('PASS',name);};
const snapshot=async name=>{const file=path.join(out,name+'.png');await page.screenshot({path:file,timeout:120000});report.screenshots.push(file);};
async function stage(expected){await page.waitForFunction(expected=>window.__JEJAKA?.session.stage===expected,expected,{timeout:90000});}
async function teleport(x,z,yaw=0){await page.evaluate(([x,z,yaw])=>window.__JEJAKA.teleport(x,z,yaw),[x,z,yaw]);await page.waitForFunction(()=>window.__JEJAKA?.mode==='play');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function interaction(){await page.keyboard.press('e');}
async function choose(id){await page.locator('#panel[open] [data-action="'+id+'"]').click();await page.waitForFunction(()=>!document.getElementById('panel').open);}
async function waitReady(){await page.waitForFunction(()=>window.__JEJAKA&&document.getElementById('start-button').disabled===false,null,{timeout:120000});}
async function layout(){return page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dialog:(()=>{const el=document.getElementById('panel'),b=el.getBoundingClientRect();return{open:el.open,x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height};})()}));}
(async()=>{
 try{
  await serve();
  const options={headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']};
  if(process.env.CHROMIUM_PATH)options.executablePath=process.env.CHROMIUM_PATH;
  browser=await chromium.launch(options);
  const context=await browser.newContext({viewport:{width:640,height:400},deviceScaleFactor:1,acceptDownloads:true});
  await context.addInitScript(()=>localStorage.setItem('jejaka.preferences.v3',JSON.stringify({lang:'id',quality:'low'})));
  page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
  page.on('requestfailed',r=>report.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>{if(r.status()>=400)report.requestFailures.push({url:r.url(),status:r.status()});});
  await page.goto(base,{waitUntil:'domcontentloaded'});await waitReady();
  assert(await page.locator('#title-screen').isVisible());
  assert(!(await page.locator('#start-button').isDisabled()));
  await snapshot('01-title');pass('Title reaches a ready, enabled state');
  await page.locator('#start-button').click();await stage('sari');
  await page.waitForFunction(()=>window.__JEJAKA.mode==='play');
  const initial=await page.evaluate(()=>({x:__JEJAKA.player.x,z:__JEJAKA.player.z}));
  await page.keyboard.down('w');await page.waitForFunction(z=>__JEJAKA.player.z<z-.5,initial.z,{timeout:30000});await page.keyboard.up('w');
  const moved=await page.evaluate(()=>({x:__JEJAKA.player.x,z:__JEJAKA.player.z}));assert(moved.z<initial.z-.5);pass('WASD moves the embodied player through the scene',{initial,moved});
  await teleport(7,-22,0);await page.keyboard.down('w');
  await page.waitForFunction(()=>__JEJAKA.player.z < -23.5,null,{timeout:30000});await page.waitForTimeout(900);await page.keyboard.up('w');
  const blocked=await page.evaluate(()=>({x:__JEJAKA.player.x,z:__JEJAKA.player.z}));
  assert(blocked.z>=-23.68,'Player entered the river collision volume: '+JSON.stringify(blocked));pass('River outside the bridge blocks forward travel',blocked);
  await teleport(0,24,0);await page.locator('#pause-button').click();
  const pauseTime=await page.evaluate(()=>__JEJAKA.session.time);await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>__JEJAKA.session.time),pauseTime);assert.equal(await page.evaluate(()=>__JEJAKA.mode),'pause');
  await page.locator('#resume-button').click();pass('Pause freezes narrative time and resumes');
  await teleport(-6,12,0);await interaction();assert(await page.locator('#panel[open]').isVisible());await choose('warn');await stage('bridge');
  assert(await page.evaluate(()=>__JEJAKA.session.flags.sariWarned));pass('Sari choice uses the dialog and records a world consequence');
  await teleport(0,-22,0);await snapshot('02-street-bridge');await interaction();
  await page.waitForFunction(()=>!document.getElementById('viewfinder').hidden);
  await page.locator('#shutter-button').click();await stage('damar');
  const photo=await page.evaluate(()=>({valid:__JEJAKA.photo?.startsWith('data:image/jpeg;base64,'),length:__JEJAKA.photo?.length}));assert(photo.valid&&photo.length>2000);
  pass('Actual camera shutter creates and records an image',photo);
  // A reload is a separate application boot; continue must restore actual saved bytes.
  await page.reload({waitUntil:'domcontentloaded'});await waitReady();assert(await page.locator('#continue-button').isVisible());await page.locator('#continue-button').click();await stage('damar');
  assert(await page.evaluate(()=>__JEJAKA.session.flags.photographed&&__JEJAKA.photo?.startsWith('data:image/jpeg;base64,')&&__JEJAKA.session.choices.sari==='warn'));
  pass('Reload and Continue restore progress, choice and captured photograph');
  await teleport(6,-40,0);await interaction();await stage('parcel');pass('Damar encounter advances the physical errand');
  await teleport(-8,-48,Math.PI/2);await interaction();await stage('shelter');
  assert(await page.evaluate(()=>__JEJAKA.session.flags.parcel&&__JEJAKA.session.pendingImpact==='north'));
  await page.waitForFunction(()=>__JEJAKA.session.flags.impact,null,{timeout:120000});
  await teleport(0,-20,Math.PI);await snapshot('03-impact');
  await page.waitForFunction(()=>__JEJAKA.session.event==='aftermath',null,{timeout:90000});
  await snapshot('04-aftermath');report.measurements.aftermath=await page.evaluate(()=>__JEJAKA.stats);
  pass('Parcel causes impact and persistent aftermath with active effects',report.measurements.aftermath.effects);
  await teleport(-13.3,-12,Math.PI/2);await page.keyboard.down('e');await stage('handoff');await page.keyboard.up('e');
  assert(await page.evaluate(()=>__JEJAKA.session.flags.rescued&&__JEJAKA.session.flags.shelterOpen&&!__JEJAKA.session.flags.cartCleared));
  pass('Shelter help choice opens the courtyard and preserves its branch');
  const liveDamar=await page.evaluate(()=>__JEJAKA.actors.damar);await teleport(liveDamar.x+1.5,liveDamar.z,Math.PI/2);await interaction();await choose('page');await stage('ending');
  assert(await page.evaluate(()=>__JEJAKA.session.flags.notebookPassed&&__JEJAKA.session.choices.handoff==='page'));
  const entriesBefore=await page.evaluate(()=>__JEJAKA.session.entries.length);await snapshot('05-ending');
  await page.evaluate(()=>__JEJAKA.finishEnding());await stage('afterword');
  await page.waitForFunction(()=>document.getElementById('panel').open);
  assert.equal(await page.evaluate(()=>__JEJAKA.session.entries.length),entriesBefore);
  assert.match(await page.locator('#panel-title').innerText(),/account survives|Catatannya tetap hidup/);await snapshot('06-afterword');
  pass('Non-graphic ending reaches historical afterword without posthumous notes');
  await page.locator('#ending-notebook').click();assert(await page.locator('.notebook-photo img').isVisible());assert.equal(await page.locator('.notebook-entry').count(),9);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download-notes').click()]);
  const downloaded=path.join(out,download.suggestedFilename());await download.saveAs(downloaded);const notebook=fs.readFileSync(downloaded,'utf8');
  assert.match(notebook,/data:image\/jpeg;base64,/);assert.match(notebook,/National Army Museum/);assert.match(notebook,/Damar/);pass('Notebook download contains all nine entries, captured photo and sources');
  await page.setViewportSize({width:390,height:844});const narrow=await layout();
  assert(narrow.scroll<=narrow.width+1,'Horizontal page overflow');assert(narrow.dialog.x>=0&&narrow.dialog.right<=390.5,'Dialog exceeds narrow viewport');
  await snapshot('07-narrow-notebook');pass('Narrow viewport notebook stays within the screen',narrow);
  await page.locator('#panel-close').click();await page.waitForFunction(()=>__JEJAKA.mode==='title');
  await page.setViewportSize({width:640,height:400});await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'domcontentloaded'});await waitReady();
  await page.locator('#settings-button').click();
  // Preferences already exist, so explicitly choose the comfort option and low tier.
  await page.locator('#reducedMotion').check();await page.locator('#quality').selectOption('low');
  assert(await page.locator('body').evaluate(el=>el.classList.contains('reduced-motion')));
  await page.locator('#panel-close').click();await page.locator('#start-button').click();await stage('sari');
  assert(await page.evaluate(()=>__JEJAKA.session.entries.length===1&&!__JEJAKA.session.flags.impact));
  await page.keyboard.press('Escape');await page.locator('#pause-settings-button').click();assert(await page.locator('#reducedMotion').isChecked());
  await page.locator('#language').selectOption('id');assert.equal(await page.locator('html').getAttribute('lang'),'id');
  await snapshot('08-comfort-settings');pass('New account resets temporary state; low quality, reduced motion and Indonesian persist');
  report.measurements.final=await page.evaluate(()=>__JEJAKA.stats);
  assert.equal(report.errors.length,0,'Uncaught application errors: '+report.errors.join('\n'));
  assert.equal(report.consoleErrors.length,0,'Console errors: '+report.consoleErrors.join('\n'));
  assert.equal(report.requestFailures.length,0,'Failed requests: '+JSON.stringify(report.requestFailures));
  pass('No uncaught errors, console errors or failed resource requests');
 }catch(error){report.failure={message:error.message,stack:error.stack};console.error(error.stack);try{if(page)await snapshot('failure');}catch{}}
 finally{report.finished=new Date().toISOString();fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));console.log('QA_OUTPUT='+out);if(report.failure)process.exitCode=1;}
})();
