import assert from 'node:assert/strict';import {review} from './config-boundary.mjs';
const last={enemySpeed:1,eventEnabled:false,maxStages:10};
const checks=[
 ['valid numeric adjustment',()=>assert.equal(review({schema:1,values:{enemySpeed:1.2}},last).values.enemySpeed,1.2)],
 ['boolean toggle already implemented',()=>assert.equal(review({schema:1,values:{eventEnabled:true}},last).values.eventEnabled,true)],
 ['unknown feature cannot be invented',()=>assert.equal(review({schema:1,values:{newWeapon:true}},last).accepted,false)],
 ['unknown schema rejected',()=>assert.equal(review({schema:2,values:{}},last).accepted,false)],
 ['range violation retains prior values',()=>assert.deepEqual(review({schema:1,values:{enemySpeed:20,eventEnabled:true}},last).values,last)],
 ['type mismatch rejected',()=>assert.equal(review({schema:1,values:{eventEnabled:'false'}},last).accepted,false)],
 ['integer constraint',()=>assert.equal(review({schema:1,values:{maxStages:1.5}},last).accepted,false)],
 ['invalid envelope',()=>assert.equal(review(null,last).accepted,false)],
 ['nonfinite rejected',()=>assert.equal(review({schema:1,values:{enemySpeed:NaN}},last).accepted,false)],
 ['input not mutated',()=>{const c={schema:1,values:{enemySpeed:1.2}};review(c,last);assert.deepEqual(last,{enemySpeed:1,eventEnabled:false,maxStages:10});assert.equal(c.values.enemySpeed,1.2);}]
];for(const [name,run]of checks){run();console.log('PASS '+name);}console.log(checks.length+' synthetic checks passed; no Unity or live service test.');
