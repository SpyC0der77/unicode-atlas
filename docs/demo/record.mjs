import {record} from './studio.mjs';
import {fileURLToPath} from 'node:url';
const tour={async tour(f){
  const p=f.page,search=p.getByPlaceholder('Search characters, code points...');
  f.mark('Browse, then search by code point');await f.move(650,240,1.1);await f.camera(700,130,1.2);await f.type(search,'2192');await f.camera();
  await f.click(p.locator('button[title="U+2192"]'));await f.camera(720,420,1.25);await f.beat(.65);
  await f.assert(()=>p.locator('body').innerText().then(t=>t.includes('Rightwards arrow')),'U+2192 opens the rightwards arrow details');
  f.mark('Inspect font previews and export choices');await f.click(p.getByRole('button',{name:'Font Preview',exact:true}));await f.beat(.4);
  await f.scrollElement(p.locator('[role=dialog]'),0,180,.8);await f.beat(.35);
  await f.scrollElement(p.locator('[role=dialog]'),0,0,.8);
  await f.click(p.getByRole('button',{name:'PNG',exact:true}));await f.beat(.65);await f.click(p.getByRole('menuitem',{name:'PNG (Transparent)',exact:true}));await f.beat(.3);await f.click(p.getByRole('button',{name:'Close',exact:true}));await f.camera();
  f.mark('Theme and character grid');await f.type(search,'');await f.click(p.getByRole('button',{name:'Switch to light mode',exact:true}));await f.move(620,380,1.1);await f.camera(790,410,1.2);await f.beat(.65);
 }}.tour;
await record({name:"unicode-atlas",url:"https://unicode-atlas.vercel.app",tour,output:fileURLToPath(new URL('../images/',import.meta.url))});
