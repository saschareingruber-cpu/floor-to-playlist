import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { languages, messages, translate } from './i18n.mjs';

for (const lang of Object.keys(languages)) {
  test(`${lang}: complete translations and matching placeholders`,()=>{
    assert.deepEqual(Object.keys(messages[lang]).sort(),Object.keys(messages.en).sort());
    for(const [key,value] of Object.entries(messages[lang])) {
      assert.ok(value.trim(),key);
      const tokens=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
      assert.deepEqual(tokens(value),tokens(messages.en[key]),`${lang}.${key}`);
    }
    assert.ok(translate(lang,'prompt',{event:'Test Event'}).includes('Test Event'));
    assert.ok(!translate(lang,'count',{count:30}).includes('{count}'));
  });
}
test('all HTML translation keys exist in every language',async()=>{
  const html=await readFile(new URL('./index.html',import.meta.url),'utf8');
  for(const [,key] of html.matchAll(/data-(?:i18n|placeholder)="([^"]+)"/g)) {
    for(const lang of Object.keys(languages)) assert.ok(messages[lang][key],`${lang}.${key}`);
  }
});
