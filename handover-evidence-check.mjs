import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

// Structural review only: never executes commands or opens referenced artifacts.
export function reviewManifest(x) {
  const gaps=[];
  if(!x || typeof x!=='object') return ['Manifest must be an object.'];
  for(const key of ['project','unityVersion','target']) if(typeof x[key]!=='string'||!x[key].trim()||/REPLACE|Example Unity/.test(x[key])) gaps.push(`${key}: enter a real review value.`);
  if(!/^[a-f0-9]{40}$/i.test(x.sourceRevision??'')) gaps.push('sourceRevision: record the full 40-character commit identifier.');
  if(!x.build?.artifact?.trim()) gaps.push('build.artifact: record a recipient-accessible artifact reference.');
  if(!/^[a-f0-9]{64}$/i.test(x.build?.sha256??'')) gaps.push('build.sha256: record a 64-character SHA-256 digest.');
  const rows=Array.isArray(x.evidence)?x.evidence:[];
  const ids=rows.map(r=>r.id);
  if(new Set(ids).size!==ids.length) gaps.push('evidence: duplicate case identifiers.');
  for(const id of ['clean-build','asset-source','save-continuity','service-ownership','known-limits']) if(!ids.includes(id)) gaps.push(`${id}: missing review case.`);
  for(const r of rows){
    if(typeof r.expected!=='string'||!r.expected.trim()) gaps.push(`${r.id}: expected result is missing.`);
    if(!['pending','observed','blocked','not-applicable'].includes(r.status)) gaps.push(`${r.id}: unknown status.`);
    if(r.status!=='observed'&&r.status!=='not-applicable') gaps.push(`${r.id}: review remains ${r.status??'unset'}.`);
    if(['observed','not-applicable'].includes(r.status)&&(!r.observed?.trim()||!r.artifact?.trim())) gaps.push(`${r.id}: provide an observation/reason and review-record reference.`);
  }
  return gaps;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(!process.argv[2]){console.error('Usage: node handover-evidence-check.mjs manifest.json');process.exitCode=2;}
  else try{const gaps=reviewManifest(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));console.log(JSON.stringify({structuralGaps:gaps,completeFields:gaps.length===0,warning:'Field completeness is not acceptance, security verification or proof that referenced artifacts exist.'},null,2));process.exitCode=gaps.length?1:0;}catch(e){console.error('Cannot review manifest: '+e.message);process.exitCode=2;}
}
