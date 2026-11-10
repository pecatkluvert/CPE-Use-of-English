// Pure grading and validation functions shared by the app and tests.
export function normalize(value) {
 let s=String(value).normalize('NFKC').toLowerCase().replace(/[’‘`]/g,"'").trim();
 const forms={"won't":"will not","can't":"cannot","shan't":"shall not","don't":"do not","doesn't":"does not","didn't":"did not","isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not","hasn't":"has not","haven't":"have not","hadn't":"had not","couldn't":"could not","wouldn't":"would not","shouldn't":"should not","mustn't":"must not","i'm":"i am","he's":"he has","she's":"she has","it's":"it has","that's":"that has"};
 s=s.replace(/\b[\w]+'[\w]+\b/g,w=>forms[w]??w.replace(/'ll$/,' will').replace(/'ve$/,' have').replace(/'re$/,' are'));
 return s.replace(/\bcan not\b/g,'cannot').replace(/\s+/g,' ').replace(/[.!?,;:]+$/,'').trim();
}
export function matches(value, answers) {return answers.some(a=>normalize(a)===normalize(value));}
export function validateUnit(u) {
 const fail=m=>{throw new Error('Invalid unit JSON: '+m)};
 if(!u||u.schemaVersion!==1)fail('schemaVersion must be 1.');
 if(typeof u.id!=='string'||!/^[-a-zA-Z0-9_]+$/.test(u.id))fail('id must contain only letters, digits, hyphens or underscores.');
 if(['__proto__','constructor','prototype'].includes(u.id))fail('reserved unit ID.');
 if(typeof u.title!=='string'||!u.title.trim())fail('title is required.');
 if(!Array.isArray(u.exercises)||!u.exercises.length)fail('exercises must be a non-empty array.');
 const es=new Set();let total=0;
 const lessonIds=new Set();
 if(u.lessons!==undefined){
  if(!Array.isArray(u.lessons))fail('lessons must be an array.');
  for(const l of u.lessons){
   if(!l||typeof l.id!=='string'||lessonIds.has(l.id)||typeof l.title!=='string'||!Array.isArray(l.sections))fail('lessons need unique string IDs, titles and sections.');
   lessonIds.add(l.id);
   for(const s of l.sections)if(!s||typeof s.heading!=='string'||typeof s.explanation!=='string'||!Array.isArray(s.examples)||s.examples.some(x=>typeof x!=='string'))fail('lesson sections need heading, explanation and examples.');
  }
 }
 for(const e of u.exercises){
  if(typeof e.id!=='string'||es.has(e.id))fail('exercise IDs must be unique strings.');es.add(e.id);
  for(const k of ['title','instructions'])if(typeof e[k]!=='string')fail('each exercise needs '+k+'.');
  for(const k of ['guidance','answerSource'])if(e[k]!==undefined&&typeof e[k]!=='string')fail(k+' must be text.');
  if(e.lessonIds!==undefined&&(!Array.isArray(e.lessonIds)||e.lessonIds.some(id=>!lessonIds.has(id))))fail('lessonIds must reference lessons in this unit.');
  if(!Array.isArray(e.questions)||!e.questions.length)fail('each exercise needs questions.');
  for(const k of ['example','passage','note'])if(e[k]!==undefined&&typeof e[k]!=='string')fail(k+' must be text.');
  if(e.wordBank!==undefined&&(!Array.isArray(e.wordBank)||e.wordBank.some(w=>typeof w!=='string')))fail('wordBank must be an array of strings.');
  const qs=new Set();
  for(const q of e.questions){
   if(typeof q.id!=='string'||qs.has(q.id))fail('question IDs must be unique strings within an exercise.');qs.add(q.id);
   if(typeof q.prompt!=='string'||!Array.isArray(q.answers)||!q.answers.length)fail('each question needs a prompt and answers.');
   if(q.answers.some(a=>!Array.isArray(a)||!a.length||a.some(v=>typeof v!=='string'||!v.trim())))fail('answers must contain non-empty arrays of strings.');
   if(q.keyword!==undefined&&typeof q.keyword!=='string')fail('keyword must be text.');
   if(q.hint!==undefined&&typeof q.hint!=='string')fail('hint must be text.');
   if(q.options){
    if(q.answers.length!==1||typeof q.options!=='object'||Array.isArray(q.options)||Object.keys(q.options).length<2||Object.values(q.options).some(v=>typeof v!=='string'))fail('invalid multiple-choice options.');
    if(q.answers[0].some(a=>!Object.hasOwn(q.options,a)))fail('choice answers must match option keys.');
   }
   const found=[...q.prompt.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1]));
   if(found.length!==q.answers.length||new Set(found).size!==q.answers.length||found.some(n=>n<1||n>q.answers.length))fail('prompt must contain exactly one {{n}} placeholder for each answer.');
   total+=q.answers.length;
  }
 }
 if(total>5000)fail('maximum 5,000 answer gaps per unit.');
 return u;
}
