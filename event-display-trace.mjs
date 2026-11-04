import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
export function reviewTrace(rows) {
 if(!Array.isArray(rows)||!rows.length) throw Error('A nonempty trace is required');
 const ids=new Set();
 const events=rows.map(r=>{
  if(typeof r.id!=='string'||!r.id.trim()||ids.has(r.id)) throw Error('Unique nonempty event IDs required');
  ids.add(r.id);
  if(!Number.isFinite(r.occurredMs)||!Number.isFinite(r.displayedMs)||r.occurredMs<0||r.displayedMs<r.occurredMs) throw Error('Use finite nonnegative times from the same monotonic clock; display must follow event');
  return {...r,displayDelayMs:r.displayedMs-r.occurredMs};
 });
 const occurrenceOrder=[...events].sort((a,b)=>a.occurredMs-b.occurredMs||a.id.localeCompare(b.id)).map(r=>r.id);
 const presentationOrder=[...events].sort((a,b)=>a.displayedMs-b.displayedMs||a.id.localeCompare(b.id)).map(r=>r.id);
 return {events,occurrenceOrder,presentationOrder,orderDiffers:JSON.stringify(occurrenceOrder)!==JSON.stringify(presentationOrder),accepted:false,limitation:'Synthetic same-clock trace only; ties are ID-ordered for stable output, not causal proof. No Unity, network or device test.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(reviewTrace(JSON.parse(readFileSync(process.argv[2],'utf8'))),null,2));
