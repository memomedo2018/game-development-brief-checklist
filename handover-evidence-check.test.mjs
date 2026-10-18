import assert from 'node:assert/strict';import fs from 'node:fs';import {reviewManifest} from './handover-evidence-check.mjs';
const example=JSON.parse(fs.readFileSync(new URL('./handover-evidence.example.json',import.meta.url)));
assert(reviewManifest(example).length>0);assert(reviewManifest(null).length>0);
const filled=structuredClone(example);Object.assign(filled,{project:'Synthetic test fixture',unityVersion:'6000.0.0f1',sourceRevision:'a'.repeat(40)});filled.build={artifact:'review/build.apk',sha256:'b'.repeat(64)};for(const r of filled.evidence)Object.assign(r,{status:'observed',observed:'Synthetic test observation; not project evidence.',artifact:'review/'+r.id+'.md'});assert.deepEqual(reviewManifest(filled),[]);
const duplicate=structuredClone(filled);duplicate.evidence.push(duplicate.evidence[0]);assert(reviewManifest(duplicate).some(x=>x.includes('duplicate')));
const missing=structuredClone(filled);missing.evidence=missing.evidence.slice(1);assert(reviewManifest(missing).some(x=>x.includes('missing review')));
const unsupported=structuredClone(filled);unsupported.evidence[0].status='passed';assert(reviewManifest(unsupported).some(x=>x.includes('unknown status')));
const waived=structuredClone(filled);waived.evidence[0].status='not-applicable';waived.evidence[0].observed='';assert(reviewManifest(waived).some(x=>x.includes('observation/reason')));
console.log('7 structural tests passed; no Unity build was executed.');
