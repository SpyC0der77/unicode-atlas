import {record} from './studio.mjs';
import {fileURLToPath} from 'node:url';
const tour={async tour(f){
  const p=f.page;
  f.mark('Visual search by drawing an arrow');
  await f.click(p.locator('button[title="Draw to search"]'));await f.camera(720,450,1.4);
  const canvas=p.locator('[role=dialog] canvas'),box=await canvas.boundingBox();
  async function stroke(points){
   const [first,...rest]=points;
   await f.move(box.x+box.width*first[0],box.y+box.height*first[1],.65);
   await p.mouse.down();await f.beat(.12);
   for(const [x,y] of rest)await f.move(box.x+box.width*x,box.y+box.height*y,.9);
   await p.mouse.up();await f.beat(.15);
  }
  await stroke([[.2,.5],[.78,.5]]);
  await stroke([[.53,.26],[.78,.5],[.53,.74]]);
  await f.assert(()=>canvas.evaluate(el=>{
   const data=el.getContext('2d').getImageData(0,0,el.width,el.height).data;
   let dark=0;for(let i=0;i<data.length;i+=4)if(data[i]<80&&data[i+1]<80&&data[i+2]<80)dark++;
   return dark>500;
  }),'The canvas contains the drawn arrow');
  const recognition=p.waitForResponse(r=>r.url().endsWith('/api/recognize')&&r.request().method()==='POST',{timeout:45000});
  await f.click(p.getByRole('button',{name:'Search',exact:true}));await f.beat(.5);
  const response=await recognition,result=await response.json();
  await f.assert(()=>Promise.resolve(response.ok()&&Array.isArray(result.characters)&&result.characters.length>0),'The recognition API returns matching characters');
  await p.getByRole('button',{name:'Clear drawing results',exact:true}).waitFor({state:'visible'});
  await f.camera();await f.move(670,210,.8);await f.beat(.65);
  f.events.push({time:+f.seconds.toFixed(2),matches:result.characters});
  f.mark('Inspect a match from the drawing');
  await f.click(p.locator('button[title="U+2192"]'));await f.camera(720,420,1.25);await f.beat(.65);
  await f.assert(()=>p.locator('body').innerText().then(t=>t.includes('Rightwards arrow')),'U+2192 opens the rightwards arrow details');
  f.mark('Inspect font previews and export choices');await f.click(p.getByRole('button',{name:'Font Preview',exact:true}));await f.beat(.4);
  await f.scrollElement(p.locator('[role=dialog]'),0,180,.8);await f.beat(.35);
  await f.scrollElement(p.locator('[role=dialog]'),0,0,.8);
  await f.click(p.getByRole('button',{name:'PNG',exact:true}));await f.beat(.65);await f.click(p.getByRole('menuitem',{name:'PNG (Transparent)',exact:true}));await f.beat(.3);await f.click(p.getByRole('button',{name:'Close',exact:true}));await f.camera();
  f.mark('Theme and character grid');await f.click(p.getByRole('button',{name:'Clear drawing results',exact:true}));await f.click(p.getByRole('button',{name:'Switch to light mode',exact:true}));await f.move(620,380,1.1);await f.camera(790,410,1.2);await f.beat(.65);
 }}.tour;
await record({name:"unicode-atlas",url:"https://unicode-atlas.vercel.app",tour,output:fileURLToPath(new URL('../images/',import.meta.url))});
