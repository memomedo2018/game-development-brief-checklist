import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {validateCard,hashArtifact,compareCards} from './build-review-card.mjs';
let checks=0;const eq=(x,y)=>{assert.deepEqual(x,y);checks++;};
const c=JSON.parse(fs.readFileSync(new URL('./build-review-card.example.json',import.meta.url)));
eq(validateCard(c),[]);eq(compareCards(c,c).status,'artifact_evidence_missing');
const a={...c,artifact_sha256:'a'.repeat(64)},b=structuredClone(a);
eq(compareCards(a,b).status,'same_declared_inputs_and_artifact');eq(compareCards(a,b).reviewer_decision,'pending');
b.build_id='new-label-same-artifact';eq(compareCards(a,b).same_artifact,true);
b.artifact_sha256='b'.repeat(64);eq(compareCards(a,b).status,'same_declared_inputs_different_artifact');
b.inputs.configuration_revision='r2';eq(compareCards(a,b).status,'declared_inputs_differ');
for(const key of ['source_revision','unity_version','target','recipe_id']){let x=structuredClone(a);x[key]=key==='source_revision'?'b'.repeat(40):'different';eq(compareCards(a,x).status,'declared_inputs_differ');}
let x=structuredClone(a);x.inputs={build_options:{development:true},package_lock_reference:'example-lock-reference',configuration_revision:'example-config-r1',scene_list:['ExampleScene']};eq(compareCards(a,x).same_declared_inputs,true);
x.artifact_sha256='not-a-hash';eq(compareCards(a,x).status,'incomplete_card');
x=structuredClone(a);x.reviewer_decision='accept';eq(compareCards(a,x).status,'incomplete_card');
x.reviewer_note='Reviewed separately';x.review_reference='example-review-record';eq(compareCards(a,x).reviewer_decision,'accept');
x=structuredClone(a);x.inputs=[];eq(compareCards(a,x).status,'incomplete_card');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'build-card-test-'));
try{let file=path.join(tmp,'fixture.txt');fs.writeFileSync(file,'one');eq(await hashArtifact(file),crypto.createHash('sha256').update('one').digest('hex'));fs.writeFileSync(file,'two');assert.notEqual(await hashArtifact(file),crypto.createHash('sha256').update('one').digest('hex'));checks++;}finally{fs.rmSync(tmp,{recursive:true});}
console.log(JSON.stringify({passed:true,assertions:checks,scope:'synthetic metadata and actual local fixture hashing only; no Unity build executed'}));
