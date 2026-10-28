// Dependency-free synthetic event review. No SDK, network, disk or production data.
export function reviewEvents(expected, actual) {
  if (!Array.isArray(expected) || !Array.isArray(actual)) throw Error('Expected two arrays');
  const keys = ['event_id','event_name','schema_version','environment','build_id','order_id','cost'];
  const errors = [], ids = new Set(), counts = new Map(), expectedKeys = new Set();
  const key = x => [x.environment,x.build_id,x.order_id,x.event_name].join('|');
  for (const x of expected) {
    if (!x || !['test','production'].includes(x.environment) || ![x.build_id,x.order_id,x.event_name].every(v=>typeof v==='string'&&v.length>0) || !Number.isSafeInteger(x.count) || x.count<0) throw Error('Invalid expectation');
    if (expectedKeys.has(key(x))) throw Error('Duplicate expectation');
    expectedKeys.add(key(x));
  }
  for (const [i,x] of actual.entries()) {
    const valid = x && typeof x==='object' && !Array.isArray(x) && Object.keys(x).length===keys.length && keys.every(k=>Object.hasOwn(x,k)) && [x.event_id,x.build_id,x.order_id].every(v=>typeof v==='string'&&v.length>0) && x.event_name==='order_committed' && x.schema_version===1 && ['test','production'].includes(x.environment) && Number.isSafeInteger(x.cost) && x.cost>=0;
    if (!valid) { errors.push(`row ${i}: schema mismatch`); continue; }
    if (ids.has(x.event_id)) errors.push(`row ${i}: duplicate event_id`);
    ids.add(x.event_id);counts.set(key(x),(counts.get(key(x))??0)+1);
    if (!expectedKeys.has(key(x))) errors.push(`row ${i}: unexpected event identity`);
  }
  for (const x of expected) if ((counts.get(key(x))??0)!==x.count) errors.push(`${key(x)}: expected ${x.count}, observed ${counts.get(key(x))??0}`);
  return {status:errors.length?'mismatch':'matches_declared_fixture',errors,limitations:'Checks the supplied records only; does not prove SDK delivery, consent, gameplay correctness or production acceptance.'};
}
