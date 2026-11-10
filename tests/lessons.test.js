import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateUnit} from '../engine.js';
const read=name=>JSON.parse(readFileSync(new URL('../units/'+name,import.meta.url)));
test('Unit 1b covers every exercise and all numbered questions from pages 15–19',()=>{
 const u=validateUnit(read('unit-1b.json'));
 assert.deepEqual(u.exercises.map(e=>e.id),Array.from({length:12},(_,i)=>String(i+16)));
 assert.deepEqual(u.exercises.map(e=>e.questions.length),[8,8,9,9,9,9,10,19,10,8,10,11]);
 assert.equal(u.exercises.flatMap(e=>e.questions).length,120);
 assert.equal(u.exercises.flatMap(e=>e.questions.flatMap(q=>q.answers)).length,121);
 assert.deepEqual(u.exercises[0].questions.map(q=>q.answers[0]),[['both','even'],['over','down','through'],['although'],['do'],['just'],['to'],['set'],['as']]);
 for(const e of u.exercises)assert.match(e.answerSource,Number(e.id)<20?/Supplied answer key/:/Suggested answers/);
 assert.equal(u.exercises[7].questions[18].keyword,'eye');
});
test('both units contain linked lessons, source examples and guidance for every question',()=>{
 for(const file of ['unit-1a.json','unit-1b.json']){
  const u=validateUnit(read(file));assert.ok(u.lessons.length>=6);
  assert.ok(u.lessons.some(l=>l.sections.some(s=>s.examples.length)));
  for(const e of u.exercises){assert.ok(e.guidance);assert.ok(e.lessonIds.length);for(const q of e.questions)assert.ok(q.hint);}
  for(const e of u.exercises.filter(e=>e.passage))for(const q of e.questions)assert.ok(q.prompt.length>40,'Passage question includes sentence context');
 }
});
test('invalid lesson imports are rejected',()=>{
 const u=read('unit-1b.json');u.lessons[0].sections[0].examples='not an array';assert.throws(()=>validateUnit(u));
 const v=read('unit-1a.json');v.exercises[0].lessonIds=['missing'];assert.throws(()=>validateUnit(v));
});
