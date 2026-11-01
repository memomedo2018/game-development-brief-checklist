import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}':JSON.stringify(x);
export function validateCard(x){
  const gaps=[];if(!x||typeof x!=='object')return ['card must be an object'];
  for(const k of ['build_id','source_revision','unity_version','target','recipe_id'])if(typeof x[k]!=='string'||!x[k].trim())gaps.push(k+' is required');
  if(!/^[a-f0-9]{40}$/i.test(x.source_revision??''))gaps.push('source_revision must be a full40character commit');
  if(!x.inputs||typeof x.inputs!=='object'||Array.isArray(x.inputs))gaps.push('inputs must be an object');
  if(!['pending','accept','needs_work','blocked'].includes(x.reviewer_decision))gaps.push('reviewer_decision is invalid');
  if(x.reviewer_decision!=='pending'&&(!x.reviewer_note?.trim()||!x.review_reference?.trim()))gaps.push('a reviewer decision needs a note and review reference');
  if(x.artifact_sha256!==null&&!/^[a-f0-9]{64}$/i.test(x.artifact_sha256??''))gaps.push('artifact_sha256 must be null or64hex characters');
  return gaps;
}
export async function hashArtifact(path){
  if(!fs.statSync(path).isFile())throw Error('The explicit artifact path must be a regular file');
  const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(path))hash.update(chunk);return hash.digest('hex');
}
function inputDigest(x){return crypto.createHash('sha256').update(stable({source_revision:x.source_revision,unity_version:x.unity_version,target:x.target,recipe_id:x.recipe_id,inputs:x.inputs})).digest('hex');}
export function compareCards(a,b){
  const gaps=[...validateCard(a).map(x=>'baseline: '+x),...validateCard(b).map(x=>'candidate: '+x)];
  if(gaps.length)return {status:'incomplete_card',gaps,reviewer_decision:'pending'};
  const sameInputs=inputDigest(a)===inputDigest(b),haveArtifacts=a.artifact_sha256!==null&&b.artifact_sha256!==null;
  const sameArtifact=haveArtifacts?a.artifact_sha256===b.artifact_sha256:null;
  return {status:!haveArtifacts?'artifact_evidence_missing':!sameInputs?'declared_inputs_differ':sameArtifact?'same_declared_inputs_and_artifact':'same_declared_inputs_different_artifact',same_declared_inputs:sameInputs,same_artifact:sameArtifact,reviewer_decision:b.reviewer_decision,limit:'Compares supplied declarations and digests. Does not execute Unity, prove complete inputs, verify source truth or accept a build.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [mode,a,b]=process.argv.slice(2);try{
    if(mode==='stamp'&&a&&b){const card=JSON.parse(fs.readFileSync(a,'utf8')),gaps=validateCard(card);if(gaps.length)throw Error(gaps.join('; '));card.artifact_sha256=await hashArtifact(b);console.log(JSON.stringify(card,null,2));}
    else if(mode==='compare'&&a&&b)console.log(JSON.stringify(compareCards(JSON.parse(fs.readFileSync(a,'utf8')),JSON.parse(fs.readFileSync(b,'utf8'))),null,2));
    else throw Error('Usage: node build-review-card.mjs stamp card.json artifact.bin OR compare baseline.json candidate.json');
  }catch(e){console.error(e.message);process.exitCode=1;}
}
