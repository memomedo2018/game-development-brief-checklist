// A local review model, not an SDK, deployment system or security boundary.
const rules={schema:1,keys:{enemySpeed:{type:'number',min:0.5,max:2},eventEnabled:{type:'boolean'},maxStages:{type:'number',min:1,max:20,integer:true}}};
export function review(candidate,lastAccepted={enemySpeed:1,eventEnabled:false,maxStages:10}){
 const errors=[];
 if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))return {accepted:false,errors:['not_object'],values:{...lastAccepted}};
 if(candidate.schema!==rules.schema)errors.push('unsupported_schema');
 if(!candidate.values||typeof candidate.values!=='object'||Array.isArray(candidate.values))errors.push('invalid_values');
 else for(const [key,value]of Object.entries(candidate.values)){
  const r=rules.keys[key];if(!Object.hasOwn(rules.keys,key)){errors.push('unknown_key:'+key);continue;}
  if(typeof value!==r.type || (r.type==='number'&&(!Number.isFinite(value)||value<r.min||value>r.max||(r.integer&&!Number.isInteger(value)))))errors.push('invalid_value:'+key);
 }
 return {accepted:errors.length===0,errors,values:errors.length?{...lastAccepted}:{...lastAccepted,...candidate.values}};
}
