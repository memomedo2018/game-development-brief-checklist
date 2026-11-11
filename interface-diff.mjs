import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const types=new Set(['string','number','boolean','object','array']);
export function validate(doc){
 if(!doc||typeof doc!=='object'||Array.isArray(doc)||!Array.isArray(doc.messages))throw Error('Expected messages array');
 const messages=new Map();
 for(const m of doc.messages){
  if(!m||typeof m.name!=='string'||!m.name.trim()||messages.has(m.name)||!Array.isArray(m.fields))throw Error('Invalid or duplicate message');
  const fields=new Map();
  for(const f of m.fields){
   if(!f||typeof f.name!=='string'||!f.name.trim()||fields.has(f.name)||!types.has(f.type)||typeof f.required!=='boolean')throw Error('Invalid or duplicate field');
   fields.set(f.name,{type:f.type,required:f.required});
  }
  messages.set(m.name,fields);
 }
 return messages;
}
export function compare(before,after){
 const a=validate(before),b=validate(after),changes=[];
 for(const name of [...new Set([...a.keys(),...b.keys()])].sort()){
  if(!a.has(name)){changes.push({message:name,change:'message_added'});continue;}
  if(!b.has(name)){changes.push({message:name,change:'message_removed'});continue;}
  const old=a.get(name),next=b.get(name);
  for(const field of [...new Set([...old.keys(),...next.keys()])].sort()){
   if(!old.has(field)){changes.push({message:name,field,change:'field_added',after:next.get(field)});continue;}
   if(!next.has(field)){changes.push({message:name,field,change:'field_removed',before:old.get(field)});continue;}
   if(old.get(field).type!==next.get(field).type||old.get(field).required!==next.get(field).required)changes.push({message:name,field,change:'field_changed',before:old.get(field),after:next.get(field)});
  }
 }
 return {status:changes.length?'review_required':'no_descriptor_changes',changes,acceptance:'not_decided'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{if(process.argv.length!==4)throw Error('Usage: node interface-diff.mjs before.json after.json');console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(process.argv[2],'utf8')),JSON.parse(fs.readFileSync(process.argv[3],'utf8'))),null,2));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
