import { languages, translate } from './i18n.mjs';
const $ = id => document.getElementById(id);
let lang = navigator.language?.slice(0,2) || 'en';
try { lang = localStorage.getItem('eventPlaylistLanguage') || lang; } catch {}
if (!languages[lang]) lang = 'en';
let previewData, resultData, busy = false, serviceStatus, currentMessage, noticeKey = 'copyHint';
const t = (key, params) => translate(lang,key,params);
function text(tag,value,parent) { const node=document.createElement(tag); node.textContent=value; parent.append(node); return node; }
function link(label,url,parent) {
  try { if (!['https:','http:'].includes(new URL(url).protocol)) return; } catch { return; }
  const a=text('a',label,parent); a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
}
function showMessage(key,params={},error=false) { currentMessage={key,params,error}; renderMessage(); }
function renderMessage() {
  $('status').className=currentMessage?.error?'error':'';
  $('status').textContent=currentMessage?t(currentMessage.key,currentMessage.params):'';
}
function updatePrompt() { $('prompt').value=t('prompt',{event:$('event').value.trim() || `[${t('eventLabel')}]`}); }
function renderPreview() {
  $('trackSection').classList.toggle('hidden',!previewData);
  $('tracks').replaceChildren(); $('warnings').replaceChildren(); $('result').replaceChildren();
  if (!previewData) return;
  $('count').textContent=t('count',{count:previewData.tracks.length});
  for (const item of previewData.unresolved) text('p',`${item.name}: ${t(item.reasonCode || 'notFound')}`,$('warnings'));
  if (previewData.fallback.length) text('p',t('fallback',{names:previewData.fallback.join(', ')}),$('warnings'));
  for (const track of previewData.tracks) link(`${track.artist} – ${track.name}`,track.url,text('li','',$('tracks')));
  if (resultData) link(t('result',{count:resultData.count}),resultData.url,$('result'));
}
function render() {
  document.documentElement.lang=lang; $('language').value=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
  document.querySelectorAll('[data-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.placeholder);});
  $('connect').textContent=t(serviceStatus?.connected?'connected':'connect');
  $('connect').href=`/login?lang=${lang}`;
  $('apiSetup').textContent=t(serviceStatus ? (serviceStatus.searchConfigured?'apiReady':'apiMissing') : 'apiChecking');
  $('copyNotice').textContent=t(noticeKey);
  updatePrompt(); renderPreview(); renderMessage();
}
function saveDraft() { try {sessionStorage.setItem('eventPlaylistDraft',JSON.stringify({event:$('event').value,artists:$('artists').value}));} catch {} }
function invalidate() { previewData=null; resultData=null; $('create').disabled=true; renderPreview(); }
async function api(path,data) {
  let response;
  try { response=await fetch('/api/'+path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,lang})}); }
  catch { throw {code:'networkError'}; }
  let result;
  try { result=await response.json(); } catch { throw {code:'invalidResponse'}; }
  if (!response.ok) throw {code:result.errorCode || 'unknownError',params:{status:result.status || response.status,url:result.playlistUrl || ''}};
  return result;
}
async function run(key,job) {
  if (busy) return;
  busy=true; document.querySelectorAll('button').forEach(b=>b.disabled=true); $('event').disabled=true; $('artists').disabled=true;
  showMessage(key);
  try {await job(); currentMessage=null; renderMessage();}
  catch(error) {showMessage(error.code || 'unknownError',error.params,true);}
  finally {busy=false; document.querySelectorAll('button').forEach(b=>b.disabled=false);$('event').disabled=false;$('artists').disabled=false;$('create').disabled=!previewData?.tracks.length;}
}
try {
  const draft=JSON.parse(sessionStorage.getItem('eventPlaylistDraft') || '{}');
  if(typeof draft.event==='string') $('event').value=draft.event;
  if(typeof draft.artists==='string') $('artists').value=draft.artists;
} catch {}
$('language').onchange=()=>{lang=$('language').value;try{localStorage.setItem('eventPlaylistLanguage',lang);}catch{}render();};
$('event').addEventListener('input',()=>{invalidate();saveDraft();noticeKey='updated';$('copyNotice').textContent=t(noticeKey);updatePrompt();});
$('artists').addEventListener('input',()=>{invalidate();saveDraft();});
$('copyPrompt').onclick=async()=>{
  if(!$('event').value.trim()) {noticeKey='noEvent';$('event').focus();}
  else try {await navigator.clipboard.writeText($('prompt').value);noticeKey='copied';}
  catch {$('prompt').focus();$('prompt').select();noticeKey='copyFallback';}
  $('copyNotice').textContent=t(noticeKey);
};
$('discover').onclick=()=>run('discovering',async()=>{
  const result=await api('discover',{event:$('event').value});
  invalidate();$('artists').value=result.artists.join('\n');saveDraft();$('research').replaceChildren();
  text('h3',[result.event,result.date,result.venue].filter(Boolean).join(' · '),$('research'));
  text('p',result.notes || t('checkLineup'),$('research'));
  for(const source of result.sources) link(source.title || source.url,source.url,text('p','',$('research')));
});
$('preview').onclick=()=>run('previewing',async()=>{
  invalidate();previewData=await api('preview',{event:$('event').value,artists:$('artists').value.split('\n')});renderPreview();
});
$('create').onclick=()=>run('creating',async()=>{resultData=await api('create',{id:previewData.id});renderPreview();});
render();
const callbackError=new URLSearchParams(location.search).get('error');
if(callbackError) {showMessage(callbackError,{},true);history.replaceState(null,'','/');}
api('status').then(s=>{serviceStatus=s;render();}).catch(()=>{$('apiSetup').textContent=t('apiUnknown');});
