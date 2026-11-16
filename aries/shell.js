'use strict';
(() => {
  const MAX=5*1024*1024,APP_LABEL='aries-pages-app.v1',BOOT_LABEL='cygnus-pages-bootstrap.v1:';
  const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
  const $=id=>document.getElementById(id),allowed=new Set(['en','fr','zh']);
  const copy={
    en:{back:'Back to homepage',private:'PRIVATE WORKSPACE',eyebrow:'WELCOME TO ARIES',title:'Your private<br><span>Aries workspace.</span>',intro:'Use the same password as Cygnus to unlock your workspace.',password:'Workspace password',unlock:'Unlock Aries',note:'Decrypted only in this browser. This page does not save or send your password.',error:'Unable to unlock. Check the password or reload this page.',lock:'Lock workspace',unlocked:'PRIVATE · UNLOCKED',footer:'Research, memory and everyday life — in one place.',pending:'Unlocking…'},
    fr:{back:'Retour à l’accueil',private:'ESPACE PRIVÉ',eyebrow:'BIENVENUE DANS ARIES',title:'Votre espace Aries,<br><span>en toute intimité.</span>',intro:'Utilisez le même mot de passe que Cygnus pour ouvrir votre espace.',password:'Mot de passe de l’espace',unlock:'Ouvrir Aries',note:'Déchiffré uniquement dans ce navigateur. Cette page ne conserve ni ne transmet votre mot de passe.',error:'Impossible de déverrouiller. Vérifiez le mot de passe ou rechargez la page.',lock:'Verrouiller',unlocked:'PRIVÉ · OUVERT',footer:'Recherche, mémoire et quotidien — au même endroit.',pending:'Déverrouillage…'},
    zh:{back:'返回个人首页',private:'私人工作台',eyebrow:'欢迎来到 ARIES',title:'你的 Aries，<br><span>由你解锁。</span>',intro:'使用与 Cygnus 相同的密码，打开你的工作台。',password:'工作台密码',unlock:'解锁 Aries',note:'仅在此浏览器解密。本页不保存或发送你的密码。',error:'无法解锁，请核对密码或刷新页面重试。',lock:'锁定工作台',unlocked:'私人工作台 · 已解锁',footer:'研究、记忆与日常，汇聚在一处。',pending:'正在解锁…'}
  };
  let language='zh',generation=0,busy=false,frame=null,controller=null;
  function setLanguage(value){
    if(!allowed.has(value))return;language=value;document.documentElement.lang=value==='zh'?'zh-CN':value;
    const t=copy[value];document.title='Aries · '+t.private;for(const node of document.querySelectorAll('[data-text]'))node.textContent=t[node.dataset.text];
    $('title').innerHTML=t.title;$('unlock').textContent=busy?t.pending:t.unlock;
    for(const button of document.querySelectorAll('[data-language]')){button.setAttribute('aria-pressed',String(button.dataset.language===value));}
    if($('error').textContent)$('error').textContent=t.error;
    if(frame){frame.title='Aries · '+t.private;frame.contentWindow.postMessage({type:'aries-language',language:value},'*');}
  }
  for(const button of document.querySelectorAll('[data-language]'))button.addEventListener('click',()=>setLanguage(button.dataset.language));
  window.addEventListener('message',event=>{if(frame&&event.source===frame.contentWindow&&event.data?.type==='aries-ready')setLanguage(language);});
  function bytes(value,size){
    if(typeof value!=='string'||value.length>Math.ceil(MAX/3)*4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))throw Error('encoding');
    const decoded=atob(value);if(decoded.length>MAX||(size!==undefined&&decoded.length!==size))throw Error('size');return Uint8Array.from(decoded,c=>c.charCodeAt(0));
  }
  const hex=value=>Array.from(value,x=>x.toString(16).padStart(2,'0')).join('');
  async function boundedJSON(response){
    if(!response.ok||response.redirected||!response.body||Number(response.headers.get('content-length')||0)>MAX)throw Error('response');
    const reader=response.body.getReader(),chunks=[];let count=0;
    try{while(true){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>MAX)throw Error('large');chunks.push(value);}}
    catch(error){await reader.cancel();throw error;}
    const result=new Uint8Array(count);let position=0;for(const chunk of chunks){result.set(chunk,position);position+=chunk.length;}
    try{return JSON.parse(dec.decode(result));}finally{result.fill(0);}
  }
  async function decrypt(document,secret){
    if(document.schema!=='aries.pages-bootstrap.v1')throw Error('schema');
    const bootstrap=document.shared_key,r=bootstrap?.recipient,seal=document.sealed;
    if(bootstrap?.schema!=='cygnus.pages-bootstrap.v1'||r?.schema!=='cygnus.pages-recipient.v1'||
       !/^[a-f0-9]{64}$/.test(r.recipient_id)||bootstrap.kdf?.name!=='PBKDF2'||bootstrap.kdf.hash!=='SHA-256'||
       bootstrap.kdf.iterations!==600000||bootstrap.cipher?.name!=='AES-GCM'||bootstrap.cipher.aad!==BOOT_LABEL+r.recipient_id)throw Error('bootstrap');
    if(hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes(r.spki))))!==r.recipient_id)throw Error('recipient');
    let material=await crypto.subtle.importKey('raw',secret,'PBKDF2',false,['deriveKey']);secret.fill(0);
    let wrapping=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(bootstrap.kdf.salt,16),iterations:600000},material,{name:'AES-GCM',length:256},false,['decrypt']);material=null;
    let plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(bootstrap.cipher.iv,12),additionalData:enc.encode(BOOT_LABEL+r.recipient_id),tagLength:128},wrapping,bytes(bootstrap.encrypted_private_key)));
    wrapping=null;let privateKey;
    try{privateKey=await crypto.subtle.importKey('pkcs8',plain,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);}finally{plain.fill(0);plain=null;}
    if(seal?.schema!=='aries.pages-sealed.v1'||seal.recipient_id!==r.recipient_id||seal.compression!=='gzip'||seal.cipher?.name!=='AES-GCM'||seal.cipher.aad!==APP_LABEL)throw Error('sealed');
    let raw=new Uint8Array(await crypto.subtle.decrypt({name:'RSA-OAEP',label:enc.encode(APP_LABEL)},privateKey,bytes(seal.wrapped_key,384)));privateKey=null;
    if(raw.length!==32){raw.fill(0);throw Error('key');}
    let aes;try{aes=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']);}finally{raw.fill(0);raw=null;}
    plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(seal.cipher.iv,12),additionalData:enc.encode(APP_LABEL),tagLength:128},aes,bytes(seal.ciphertext)));aes=null;
    let bundle;try{bundle=await boundedJSON(new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))));}finally{plain.fill(0);plain=null;}
    const expected=$('app-hash').content;
    if(bundle.schema!=='aries.pages-app.v1'||typeof bundle.html!=='string'||enc.encode(bundle.html).length>MAX||bundle.content_hash!==expected||
      hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(bundle.html))))!==expected)throw Error('app hash');
    return bundle.html;
  }
  function lock(){
    generation++;if(controller)controller.abort();controller=null;busy=false;
    if(frame){frame.removeAttribute('srcdoc');frame.src='about:blank';frame.remove();frame=null;}
    $('frame-slot').replaceChildren();$('gate').hidden=false;$('viewer').hidden=true;$('footer').hidden=false;
    $('password').value='';$('error').textContent='';$('password').removeAttribute('aria-invalid');$('unlock').disabled=false;setLanguage(language);$('password').focus();
  }
  $('unlock-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!$('password').value)return;
    const attempt=++generation;busy=true;$('unlock').disabled=true;$('error').textContent='';
    let secret=enc.encode($('password').value);$('password').value='';setLanguage(language);
    const own=new AbortController();controller=own;const timeout=setTimeout(()=>own.abort(),10000);
    try{
      if(!isSecureContext||!crypto?.subtle||typeof DecompressionStream!=='function')throw Error('browser');
      const response=await fetch('./payload.enc.json?v=9a858036ec8ef975',{credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:own.signal});
      if(new URL(response.url).origin!==location.origin)throw Error('origin');
      const payload=await boundedJSON(response);if(attempt!==generation)return;
      const html=await decrypt(payload,secret);if(attempt!==generation)return;
      frame=document.createElement('iframe');frame.title='Aries private workspace';frame.setAttribute('sandbox','allow-scripts allow-popups allow-popups-to-escape-sandbox');frame.referrerPolicy='no-referrer';frame.srcdoc=html;
      $('frame-slot').replaceChildren(frame);$('gate').hidden=true;$('footer').hidden=true;$('viewer').hidden=false;$('lock').focus();
    }catch(error){if(attempt===generation){$('error').textContent=copy[language].error;$('password').setAttribute('aria-invalid','true');$('password').focus();}}
    finally{clearTimeout(timeout);secret.fill(0);secret=null;if(attempt===generation){busy=false;controller=null;$('password').value='';$('unlock').disabled=false;setLanguage(language);}}
  });
  $('lock').addEventListener('click',lock);window.addEventListener('pagehide',lock);setLanguage('zh');
})();
