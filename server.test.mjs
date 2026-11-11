import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';

test('local app: BOM/config priority, five-language assets, mocked OAuth, fallback and repeat-safe export',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'floor-playlist-test-'));
  const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');
  const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
  const origin=`http://127.0.0.1:${port}`;
  let child;
  try {
    for(const name of ['server.mjs','logic.mjs','i18n.mjs','index.html','app.mjs']) await copyFile(new URL(name,import.meta.url),join(dir,name));
    await writeFile(join(dir,'.env'),`\uFEFFSPOTIFY_CLIENT_ID=fake-file-id\nSPOTIFY_REDIRECT_URI=${origin}/callback\nOPENAI_API_KEY=fake-file-key\n`);
    // No real credentials or external requests: upstream calls are replaced in the child.
    await writeFile(join(dir,'mock.mjs'),`
      import {appendFileSync} from 'node:fs';
      const actualFetch=globalThis.fetch;
      globalThis.fetch=async (input,options={})=>{
        const u=new URL(input);
        if(!['api.spotify.com','accounts.spotify.com','api.openai.com'].includes(u.hostname)) return actualFetch(input,options);
        const answer=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
        if(u.hostname==='api.openai.com') {
          if(options.headers.Authorization!=='Bearer fake-file-key') throw Error('Config override failed');
          return answer({error:{message:'must not leak raw provider response'}},401);
        }
        if(u.hostname==='accounts.spotify.com') return answer({access_token:'fake-token',refresh_token:'fake-refresh',expires_in:3600});
        if(u.pathname.endsWith('/top-tracks')) return answer({},403);
        if(u.pathname==='/v1/search') {
          const q=u.searchParams.get('q');
          if(u.searchParams.get('type')==='artist') return answer({artists:{items:[{id:q,name:q}]}});
          const name=q.slice(8,-1);
          return answer({tracks:{items:Array.from({length:10},(_,i)=>({uri:'spotify:track:'+name+i,name:'Track '+i,artists:[{id:name,name}],external_urls:{spotify:'https://open.spotify.com/track/'+name+i}}))}});
        }
        appendFileSync('calls.jsonl',JSON.stringify({path:u.pathname,method:options.method,body:JSON.parse(options.body)})+'\\n');
        if(u.pathname==='/v1/me/playlists') return answer({id:'fake-playlist',external_urls:{spotify:'https://open.spotify.com/playlist/fake-playlist'}});
        if(u.pathname==='/v1/playlists/fake-playlist/items') return answer({snapshot_id:'fake'});
        throw Error('Unexpected mock request '+u.pathname);
      };
    `);
    child=spawn(process.execPath,['--import',pathToFileURL(join(dir,'mock.mjs')).href,join(dir,'server.mjs')],{
      cwd:dir,env:{...process.env,SPOTIFY_CLIENT_ID:'wrong-inherited-id',OPENAI_API_KEY:'wrong-inherited-key'},stdio:['ignore','pipe','pipe']
    });
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server exited');}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout')),10000);timer.unref();})]);
    const initial=await fetch(origin);assert.equal(initial.status,200);
    let cookie=initial.headers.get('set-cookie').split(';')[0];
    for(const asset of ['/app.mjs','/i18n.mjs']) assert.equal((await fetch(origin+asset)).status,200);
    assert.equal((await fetch(origin+'/.env')).status,404);
    const post=async(path,data)=>fetch(origin+'/api/'+path,{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(data)});
    assert.equal((await fetch(origin+'/api/create',{method:'POST',headers:{Origin:'https://example.com'}})).status,403);
    const login=await fetch(origin+'/login?lang=fr',{headers:{Cookie:cookie},redirect:'manual'});
    const auth=new URL(login.headers.get('location'));
    assert.equal(auth.searchParams.get('client_id'),'fake-file-id');
    assert.equal(auth.searchParams.get('code_challenge_method'),'S256');
    const callback=await fetch(origin+'/callback?code=fake-code&state='+auth.searchParams.get('state'),{headers:{Cookie:cookie},redirect:'manual'});
    assert.equal(callback.status,302);assert.equal(callback.headers.get('location'),'/');
    const search=await post('discover',{event:'Fake event',lang:'it'});
    const searchError=await search.json();assert.equal(searchError.errorCode,'invalidKey');assert.ok(!JSON.stringify(searchError).includes('must not leak'));
    const preview=await post('preview',{event:'Fake Event',artists:['Alpha','Beta','Alpha'],lang:'es'}).then(r=>r.json());
    assert.equal(preview.tracks.length,20);assert.equal(preview.fallback.length,2);
    const first=await post('create',{id:preview.id}).then(r=>r.json());
    const second=await post('create',{id:preview.id}).then(r=>r.json());assert.deepEqual(first,second);
    let calls=(await readFile(join(dir,'calls.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(calls.filter(c=>c.path==='/v1/me/playlists').length,1);
    assert.equal(calls[0].body.public,false);assert.equal(calls[1].body.uris.length,20);
    const large=await post('preview',{event:'Large',artists:Array.from({length:101},(_,i)=>'Artist'+i)}).then(r=>r.json());
    assert.equal(large.tracks.length,101);
    await post('create',{id:large.id});
    calls=(await readFile(join(dir,'calls.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(calls.at(-2).method,'PUT');assert.equal(calls.at(-2).body.uris.length,100);
    assert.equal(calls.at(-1).method,'POST');assert.equal(calls.at(-1).body.uris.length,1);
  } finally {
    if(child && child.exitCode===null) {child.kill();await once(child,'exit');}
    await rm(dir,{recursive:true,force:true});
  }
});
