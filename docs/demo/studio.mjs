import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Capture real app state. Camera cropping is applied to pixels after capture,
// so zoom never changes layout, hit testing, or the application's behavior.
const W=1440,H=900,FPS=18,OW=960,OH=600;
const ease=t=>t*t*(3-2*t);
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export async function record({name,url,tour,output}) {
 await mkdir(output,{recursive:true});
 const frames=await mkdtemp(join(tmpdir(),'website-demo-'));
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
 page.setDefaultTimeout(12000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(500);
 // Advance app timers one frame at a time. Slow screenshot encoding cannot
 // accidentally fast-forward playback or leave an animation between frames.
 await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});
 await page.clock.pauseAt(new Date('2026-10-10T12:00:01Z'));
 await page.evaluate(()=>{
  const cursor=document.createElement('div');cursor.id='demo-cursor';
  cursor.setAttribute('aria-hidden','true');
  cursor.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:24px;height:28px;';
  cursor.innerHTML='<svg width="24" height="28" viewBox="0 0 24 28"><path d="M3 2v21l5-5 4 8 4-2-4-8h8Z" fill="white" stroke="#181818" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  document.documentElement.append(cursor);
 });
 let frame=0,pos={x:W*.8,y:H*.75},cam={x:W/2,y:H/2,z:1};
 const events=[];
 const film={page,events,get seconds(){return frame/FPS;},
  mark(text){events.push({time:+this.seconds.toFixed(2),text});console.log(name,this.seconds.toFixed(1),text);},
  async frame(){
   const start=Date.now();
   await page.clock.runFor(1000/FPS);
   await page.evaluate(p=>{document.querySelector('#demo-cursor').style.transform=`translate(${p.x}px,${p.y}px)`;},pos);
   const shot=await page.screenshot({type:'png',animations:'allow'});
   const width=Math.round(W/cam.z),height=Math.round(H/cam.z);
   const left=Math.round(clamp(cam.x-width/2,0,W-width)),top=Math.round(clamp(cam.y-height/2,0,H-height));
   await sharp(shot).extract({left,top,width,height}).resize(OW,OH).png().toFile(join(frames,`${String(frame++).padStart(5,'0')}.png`));
   await page.waitForTimeout(Math.max(0,1000/FPS-(Date.now()-start)));
  },
  async beat(seconds=.6){for(let i=0;i<Math.round(seconds*FPS);i++)await this.frame();},
  async move(x,y,seconds=1){const from={...pos};for(let i=1,n=Math.round(seconds*FPS);i<=n;i++){const t=ease(i/n);pos={x:lerp(from.x,x,t),y:lerp(from.y,y,t)};await page.mouse.move(pos.x,pos.y);await this.frame();}},
  async camera(x=W/2,y=H/2,z=1,seconds=.8){const from={...cam};for(let i=1,n=Math.round(seconds*FPS);i<=n;i++){const t=ease(i/n);cam={x:lerp(from.x,x,t),y:lerp(from.y,y,t),z:lerp(from.z,z,t)};await this.frame();}},
  async target(locator){const b=await locator.boundingBox();if(!b)throw Error('Invisible target');if(b.y<0||b.y+b.height>H)throw Error('Target outside viewport; scroll deliberately first');return {...b,x:b.x+b.width/2,y:b.y+b.height/2};},
  async click(locator,seconds=.85){let b=await this.target(locator);await this.move(b.x,b.y,seconds);const end=await this.target(locator);if(Math.hypot(end.x-pos.x,end.y-pos.y)>3)await this.move(end.x,end.y,.4);await locator.click();await this.beat(.35);},
  async type(locator,text){await this.click(locator,.65);await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');for(let i=0;i<text.length;i+=2){await page.keyboard.insertText(text.slice(i,i+2));await this.beat(1/6);}await this.beat(.25);},
  async scroll(y,seconds=1){const start=await page.evaluate(()=>scrollY);for(let i=1,n=Math.round(seconds*FPS);i<=n;i++){await page.evaluate(y=>window.scrollTo(0,y),lerp(start,y,ease(i/n)));await this.frame();}},
  async scrollElement(locator,x,y,seconds=1){const from=await locator.evaluate(el=>({x:el.scrollLeft,y:el.scrollTop}));for(let i=1,n=Math.round(seconds*FPS);i<=n;i++){await locator.evaluate((el,p)=>el.scrollTo(p.x,p.y),{x:lerp(from.x,x,ease(i/n)),y:lerp(from.y,y,ease(i/n))});await this.frame();}},
  async hover(locator,seconds=1){const b=await this.target(locator);await this.move(b.x,b.y,seconds);await this.beat(.6);},
  async drag(locator,ratio=.75){const b=await locator.boundingBox();await this.move(b.x+b.width*.5,b.y+b.height*.5);await page.mouse.down();await this.move(b.x+b.width*ratio,b.y+b.height*.5,1);await page.mouse.up();await this.beat(.3);},
  async assert(condition,description){if(!await condition())throw Error(description);events.push({time:+this.seconds.toFixed(2),verified:description});}
 };
 try {
  await page.mouse.move(pos.x,pos.y);await film.beat(.65);await tour(film);
  await film.camera();await film.move(W*.88,H*.85,.65);await film.beat(.65);
  if(errors.length)throw Error('App errors: '+errors.join('; '));
  const input=['-y','-hide_banner','-loglevel','error','-framerate',String(FPS),'-i',join(frames,'%05d.png')];
  const mp4=spawnSync('ffmpeg',[...input,'-c:v','libx264','-crf','23','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',join(output,'demo.mp4')],{encoding:'utf8'});
  if(mp4.status!==0)throw Error(mp4.stderr);
  const gif=spawnSync('ffmpeg',[...input,'-filter_complex','fps=10,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle','-loop','0',join(output,'demo.gif')],{encoding:'utf8'});
  if(gif.status!==0)throw Error(gif.stderr);
  await writeFile(join(output,'capture.json'),JSON.stringify({name,url,width:OW,height:OH,fps:FPS,duration:film.seconds,frames,events},null,2));
  console.log(name,'DONE',film.seconds.toFixed(1),'seconds');
 } catch(error) {
  await page.screenshot({path:join(output,'error.png')}).catch(()=>{});
  await writeFile(join(output,'error.txt'),String(error)+'\n'+await page.locator('body').innerText());
  throw error;
 } finally {await browser.close();}
}
