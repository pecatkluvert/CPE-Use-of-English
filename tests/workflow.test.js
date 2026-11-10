// Exercise app workflows without third-party dependencies. Browser layout is not tested here.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('checking, reveal exclusion, reset, navigation, hosted import and backup/restore',async()=>{
 const elements=new Map();
 function element(id){if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',style:{},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;},click(){this.onclick?.();}});return elements.get(id);}
 const unit=JSON.parse(readFileSync(new URL('../units/unit-1a.json',import.meta.url)));
 const template=JSON.parse(readFileSync(new URL('../units/unit-template.json',import.meta.url)));
 let stored=null,download;
 globalThis.document={getElementById:element,createElement(){return{click(){download=this.download;}};}};
 globalThis.localStorage={getItem(){return stored;},setItem(k,v){stored=v;}};
 globalThis.location={href:'https://example.github.io/practice/',search:''};
 globalThis.history={replaceState(){}};
 globalThis.confirm=()=>true;
 globalThis.alert=message=>assert.fail(message);
 globalThis.fetch=async url=>({ok:true,json:async()=>String(url).includes('catalog.json')?['unit-1a.json','unit-1b.json']:String(url).includes('unit-1b')?structuredClone(template):structuredClone(unit)});
 await import('../app.js');await new Promise(r=>setTimeout(r,20));
 assert.equal(element('progressText').textContent,'0 / 143');
 function enter(qi,gap,value){const body={querySelector(){return{innerHTML:''};},querySelectorAll(){return[];}};element('exerciseCard').listeners.input({target:{matches:()=>true,dataset:{qi:String(qi),gap:String(gap)},value,closest:()=>body}});}
 enter(0,0,'is he leaving');enter(0,1,'is playing');
 assert.equal(element('progressText').textContent,'2 / 143');
 element('checkAll').onclick();assert.equal(element('correctText').textContent,'2 / 143');
 assert.match(element('lessonContent').innerHTML,/Present Simple/);
 element('practiceTab').onclick();assert.equal(element('exerciseCard').hidden,false);
 assert.match(element('exerciseCard').innerHTML,/Review the lesson/);
 element('learnTab').onclick();assert.equal(element('exerciseCard').hidden,true);
 element('exerciseCard').listeners.click({target:{closest:selector=>selector==='[data-action]'?({dataset:{action:'reveal',qi:'0'}}):null}});
 assert.equal(element('correctText').textContent,'0 / 143');
 element('checkAll').onclick();assert.equal(element('correctText').textContent,'0 / 143');
 element('reset').onclick();assert.equal(element('progressText').textContent,'0 / 143');
 element('next').onclick();assert.equal(element('position').textContent,'Exercise 2 of 15');
 enter(0,0,'has gone to');element('checkAll').onclick();assert.equal(element('correctText').textContent,'1 / 143');
 element('exportProgress').onclick();assert.equal(download,'english-practice-progress.json');
 const backup={format:'english-practice-backup-v1',...JSON.parse(stored)};
 element('unitFile').value='unit-1b.json';await element('loadForm').onsubmit({preventDefault(){}});
 assert.equal(element('unitTitle').textContent,'Your next English unit');
 assert.ok(JSON.parse(stored).units['unit-1a']);assert.ok(JSON.parse(stored).units['unit-1b']);
 await element('restoreProgress').onchange({target:{files:[{size:1000,text:async()=>JSON.stringify(backup)}],value:'backup.json'}});
 assert.equal(element('unitTitle').textContent,'Grammar: Tenses');assert.equal(element('correctText').textContent,'1 / 143');
 element('unitSelect').value='unit-1a';element('unitSelect').onchange();element('next').onclick();
 assert.match(element('exerciseCard').innerHTML,/has gone to/);
});
