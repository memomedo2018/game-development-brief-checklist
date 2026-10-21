// Synthetic acceptance model only. No store SDK, receipt validation or persistence.
export function review(events) {
  const granted=new Set(),revoked=new Set(),balances=new Map(),trace=[];
  for(const e of events) {
    if(!e||typeof e.transaction!=='string'||!e.transaction.trim()||typeof e.product!=='string'||!e.product.trim()) throw Error('Missing identity');
    if(!['pending','verified','rejected','revoked'].includes(e.status))throw Error('Unknown status');
    const key=JSON.stringify([e.product,e.transaction]);let result='unchanged';
    if(e.status==='verified'&&!granted.has(key)&&!revoked.has(key)){granted.add(key);balances.set(e.product,(balances.get(e.product)??0)+1);result='grant';}
    if(e.status==='revoked'&&!revoked.has(key)){revoked.add(key);if(granted.has(key)){balances.set(e.product,balances.get(e.product)-1);result='revoke';}}
    trace.push({transaction:e.transaction,product:e.product,status:e.status,result});
  }
  return {balances:Object.fromEntries(balances),trace};
}
