const { test } = require('node:test');
const assert = require('node:assert/strict');
const { padBbox } = require('../src/qa/autoFixedCopy');
test('automatic Fixed Copy bbox expands by 2 original pixels on all sides', () => {
 assert.deepEqual(padBbox({x:10,y:20,width:30,height:40},{width:100,height:100}),{x:8,y:18,width:34,height:44});
});
test('padding clamps at each image boundary', () => {
 assert.deepEqual(padBbox({x:0,y:1,width:99,height:99},{width:100,height:100}),{x:0,y:0,width:100,height:100});
 assert.deepEqual(padBbox({x:98,y:98,width:2,height:2},{width:100,height:100}),{x:96,y:96,width:4,height:4});
});
