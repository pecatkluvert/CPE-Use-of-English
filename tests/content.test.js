import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matches,normalize,validateUnit} from '../engine.js';
const unit=JSON.parse(readFileSync(new URL('../units/unit-1a.json',import.meta.url)));
test('all source exercises and numbered questions are present',()=>{
 validateUnit(unit);
 assert.equal(unit.exercises.length,15);
 assert.deepEqual(unit.exercises.map(e=>e.questions.length),[9,4,6,9,8,10,6,9,13,13,10,8,7,9,9]);
 assert.equal(unit.exercises.flatMap(e=>e.questions).length,130);
 assert.equal(unit.exercises.flatMap(e=>e.questions.flatMap(q=>q.answers)).length,143);
});
test('multiple choice answers agree with the supplied key',()=>{
 for(const [id,letters] of Object.entries({'5':'DBCAAABC','9':'ADABBCABBBDCC','11':'BACDDBCAAB','14':'ABBCDCCDB'})){
  const e=unit.exercises.find(e=>e.id===id);
  assert.equal(e.questions.map(q=>q.answers[0][0]).join(''),letters);
 }
});
test('the key alternatives remain accepted for multiple blanks and passages',()=>{
 const e=unit.exercises.find(e=>e.id==='8'),q=e.questions[6];
 assert.ok(matches('were advancing',q.answers[0]));assert.ok(matches('advanced',q.answers[0]));
 assert.ok(matches('were planning',q.answers[1]));assert.ok(matches('was planning',q.answers[1]));
 for(const [eid,num] of [['3',6],['4',9],['6',10],['10',13]]){
  const passage=unit.exercises.find(e=>e.id===eid).passage;
  assert.deepEqual([...passage.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1])),Array.from({length:num},(_,i)=>i+1));
 }
});
test('grading accepts punctuation, spacing and supported contractions, while rejecting tense errors',()=>{
 assert.ok(matches('  DON’T really think. ',['do not really think']));
 assert.ok(matches("the first time he’s ever felt so",['the first time he has ever felt so']));
 assert.ok(matches('have   been rehearsing',['have been rehearsing']));
 assert.ok(matches("won't",['will not']));assert.ok(matches('cannot',['can not']));
 assert.equal(matches('had been rehearsing',['have been rehearsing']),false);
 assert.equal(matches('',['has been']),false);assert.equal(matches('B',['A']),false);
 assert.equal(normalize("I'd gone"),"i'd gone");
});
test('all accepted answers match themselves and blank answers never match',()=>{
 for(const e of unit.exercises)for(const q of e.questions)for(const gap of q.answers){for(const a of gap)assert.ok(matches(a,gap));assert.equal(matches('',gap),false);}
});
test('reusable template validates',()=>validateUnit(JSON.parse(readFileSync(new URL('../units/unit-template.json',import.meta.url)))));
test('malformed imported units are rejected before activation',()=>{
 const mutate=fn=>{const u=structuredClone(unit);fn(u);return ()=>validateUnit(u);};
 assert.throws(mutate(u=>u.id='__proto__'));
 assert.throws(mutate(u=>u.exercises[0].questions[0].answers=[]));
 assert.throws(mutate(u=>u.exercises[0].questions[0].prompt='Missing gap'));
 assert.throws(mutate(u=>u.exercises[0].questions[0].prompt='{{1}} {{1}}'));
 assert.throws(mutate(u=>u.exercises[0].questions[0].answers[0]=['']));
 assert.throws(mutate(u=>u.exercises[4].questions[0].answers=[['Z']]));
 assert.throws(mutate(u=>u.exercises[1].id='1'));
 assert.throws(()=>validateUnit({schemaVersion:2}));
});
