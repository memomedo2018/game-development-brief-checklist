import assert from 'node:assert/strict';import {reviewTrace} from './event-display-trace.mjs';
const a=[{id:'pickup',occurredMs:10,displayedMs:35},{id:'damage',occurredMs:12,displayedMs:20}],r=reviewTrace(a);
assert.deepEqual(r.occurrenceOrder,['pickup','damage']);assert.deepEqual(r.presentationOrder,['damage','pickup']);assert.equal(r.events[0].displayDelayMs,25);assert.equal(r.events[1].displayDelayMs,8);assert.equal(r.orderDiffers,true);assert.equal(r.accepted,false);assert.equal(a[0].displayDelayMs,undefined);
assert.equal(reviewTrace([{id:'a',occurredMs:0,displayedMs:0}]).events[0].displayDelayMs,0);
assert.throws(()=>reviewTrace([]));assert.throws(()=>reviewTrace([a[0],a[0]]));assert.throws(()=>reviewTrace([{id:'a',occurredMs:10,displayedMs:9}]));assert.throws(()=>reviewTrace([{id:'a',occurredMs:NaN,displayedMs:10}]));assert.throws(()=>reviewTrace([{id:'',occurredMs:1,displayedMs:2}]));
assert.deepEqual(reviewTrace([{id:'b',occurredMs:1,displayedMs:2},{id:'a',occurredMs:1,displayedMs:2}]).occurrenceOrder,['a','b']);console.log('14 synthetic assertions passed; no engine or device acceptance');
