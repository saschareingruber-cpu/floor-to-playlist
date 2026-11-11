import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanArtists, selectTracks, matchingArtists } from './logic.mjs';
const group = (name,count) => ({name,tracks:Array.from({length:count},(_,i)=>({uri:`${name}:${i}`}))});
test('Line-up wird ohne doppelte Namen übernommen',()=>{
  assert.deepEqual(cleanArtists([' A ', 'a', '', 'B', null]),['A','B']);
});
test('30 Tracks werden gleichmäßig über alle Artists verteilt',()=>{
  const selected=selectTracks([group('a',20),group('b',20),group('c',20)]);
  assert.equal(selected.length,30);
  assert.deepEqual(selected.slice(0,3).map(t=>t.uri),['a:0','b:0','c:0']);
});
test('Mehr als 30 Artists bleiben vertreten',()=>{
  assert.equal(selectTracks(Array.from({length:45},(_,i)=>group(String(i),5))).length,45);
});
test('Gemeinsame Tracks werden nicht doppelt aufgenommen',()=>{
  assert.equal(selectTracks([group('a',2),group('a',2)]).length,2);
});
test('Shared top track does not skip another artist when the target is reached',()=>{
  const groups=[{tracks:[{uri:'shared'}]},{tracks:[{uri:'shared'},{uri:'unique-b'}]},{tracks:[{uri:'unique-c'},{uri:'extra-c'}]}];
  assert.deepEqual(selectTracks(groups,3).map(t=>t.uri),['shared','unique-b','unique-c']);
});
test('Kurze und leere Kataloge liefern nur verfügbare Tracks',()=>{
  assert.equal(selectTracks([group('a',1),group('b',0)]).length,1);
  assert.deepEqual(selectTracks([]),[]);
});
test('Mehrdeutige Artist-Namen werden zur Klärung zurückgegeben',()=>{
  assert.equal(matchingArtists('Artist',[{name:'ARTIST',id:'1'},{name:'Artist',id:'2'},{name:'Other',id:'3'}]).length,2);
});
