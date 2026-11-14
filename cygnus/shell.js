'use strict';
(() => {
  const MAX = 5 * 1024 * 1024, LABEL = 'cygnus-pages-sealed.v1';
  const URL = 'https://raw.githubusercontent.com/WHYKEYSAY/whykeysay.github.io/cygnus-data/cygnus/payload.enc.json';
  const enc = new TextEncoder(), dec = new TextDecoder('utf-8', {fatal:true});
  const $ = id => document.getElementById(id);
  let privateKey = null, recipientId = null, generation = 0, timer = null, freshnessTimer = null, active = null;
  let current = null, failure = '', pulling = false;
  const hex = bytes => Array.from(bytes, x => x.toString(16).padStart(2,'0')).join('');
  function bytes(value, expected) {
    if (typeof value !== 'string' || value.length > Math.ceil(MAX / 3) * 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw Error('Invalid encoding');
    const raw = atob(value);
    if ((expected !== undefined && raw.length !== expected) || raw.length > MAX) throw Error('Invalid size');
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }
  function utc(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/.test(value)) throw Error('Invalid timestamp');
    const result = Date.parse(value);
    if (!Number.isFinite(result) || result > Date.now() + 60000) throw Error('Future timestamp');
    return result;
  }
  function status() {
    if (!current) return;
    const stale = Boolean(failure) || current.source_as_of === null || current.collector_as_of === null || ['generated_at','collector_as_of'].some(k => current[k] !== null && Date.now() - utc(current[k]) > 15 * 60000);
    $('status').textContent = `${stale ? 'STALE · ' : ''}${current.view_source}${failure ? ' · ' + failure : ''} · Source as of ${current.source_as_of || 'unavailable'} · Collected ${current.collector_as_of || 'unavailable'} · Snapshot generated ${current.generated_at}`;
    $('status').dataset.stale = String(stale);
    $('last-failure').textContent = failure ? 'Last refresh failed; the prior snapshot remains visible and stale.' : '';
  }
  async function readJSON(response) {
    if (!response.ok || response.redirected || !response.body || Number(response.headers.get('content-length') || 0) > MAX) throw Error('Unavailable');
    const reader = response.body.getReader(), chunks = [];
    let count = 0;
    try {
      while (true) {
        const {done,value} = await reader.read();
        if (done) break;
        count += value.byteLength;
        if (count > MAX) throw Error('Oversized publication');
        chunks.push(value);
      }
    } catch (e) { await reader.cancel(); throw e; }
    const all = new Uint8Array(count); let offset = 0;
    for (const item of chunks) { all.set(item,offset); offset += item.length; }
    return JSON.parse(dec.decode(all));
  }
  async function decrypt(envelope, key, id) {
    if (envelope.schema !== 'cygnus.pages-sealed.v1' || envelope.compression !== 'gzip' || envelope.recipient_id !== id || envelope.cipher?.name !== 'AES-GCM' || envelope.cipher.aad !== LABEL) throw Error('Invalid publication');
    let raw = new Uint8Array(await crypto.subtle.decrypt({name:'RSA-OAEP',label:enc.encode(LABEL)}, key, bytes(envelope.wrapped_key,384)));
    let aes;
    try { aes = await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']); } finally { raw.fill(0); raw = null; }
    let plain = new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.cipher.iv,12),additionalData:enc.encode(LABEL),tagLength:128},aes,bytes(envelope.ciphertext)));
    aes = null;
    let bundle;
    try {
      if (typeof DecompressionStream !== 'function') throw Error('Gzip not supported');
      bundle = await readJSON(new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))));
    } finally { plain.fill(0); plain = null; }
    if (bundle.schema_version !== 'cygnus.pages-live-bundle.v1' || typeof bundle.html !== 'string' || enc.encode(bundle.html).length > MAX) throw Error('Invalid bundle');
    for (const field of ['generated_at','source_as_of','collector_as_of']) {
      if (!Object.prototype.hasOwnProperty.call(bundle,field)) throw Error('Missing clock field');
      if (bundle[field] !== null || field === 'generated_at') utc(bundle[field]);
    }
    for (const field of ['source_as_of','collector_as_of']) if (bundle[field] !== null && utc(bundle[field]) > utc(bundle.generated_at) + 1000) throw Error('Invalid capture time');
    if (!/^[a-f0-9]{64}$/.test(bundle.content_hash) || hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(bundle.html)))) !== bundle.content_hash) throw Error('Invalid content hash');
    if (current) {
      if (utc(bundle.generated_at) < utc(current.generated_at)) throw Error('Rollback rejected');
      if (bundle.collector_as_of !== null && current.collector_as_of !== null && utc(bundle.collector_as_of) < utc(current.collector_as_of)) throw Error('Collection rollback rejected');
      if (utc(bundle.generated_at) === utc(current.generated_at) && bundle.content_hash !== current.content_hash) throw Error('Conflicting publication');
    }
    return bundle;
  }
  function display(bundle, viewSource = 'Published NAS snapshot') {
    if (!current || current.content_hash !== bundle.content_hash) {
      const frame = document.createElement('iframe');
      frame.title = 'Cygnus read-only research snapshot';
      frame.setAttribute('sandbox','allow-popups allow-popups-to-escape-sandbox');
      frame.referrerPolicy = 'no-referrer'; frame.srcdoc = bundle.html;
      $('frame-slot').replaceChildren(frame);
    }
    current = {view_source:viewSource,generated_at:bundle.generated_at,source_as_of:bundle.source_as_of,collector_as_of:bundle.collector_as_of,content_hash:bundle.content_hash};
    failure = ''; status();
  }
  async function pull() {
    if (!privateKey || pulling) return;
    const attempt = generation, key = privateKey, id = recipientId;
    const controller = new AbortController(); active = controller; pulling = true;
    $('refresh').disabled = true;
    const timeout = setTimeout(() => controller.abort(),10000);
    try {
      const response = await fetch(URL,{credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
      if (response.url && response.url !== URL) throw Error('Unexpected endpoint');
      const envelope = await readJSON(response);
      if (attempt !== generation) return;
      const bundle = await decrypt(envelope,key,id);
      if (attempt !== generation) return;
      display(bundle);
    } catch (_) {
      if (attempt === generation) { failure = 'Refresh unavailable or publication rejected'; status(); }
    } finally {
      clearTimeout(timeout);
      if (attempt === generation) { active = null; pulling = false; $('refresh').disabled = false; }
    }
  }
  function schedule() {
    clearInterval(timer); timer = null;
    if (privateKey && $('automatic').checked) timer = setInterval(pull,60000);
  }
  function lock() {
    generation++; clearInterval(timer); clearInterval(freshnessTimer); timer = freshnessTimer = null;
    if (active) active.abort(); active = null;
    privateKey = null; recipientId = null; current = null; failure = ''; pulling = false;
    const frame = $('frame-slot').querySelector('iframe');
    if (frame) { frame.removeAttribute('srcdoc'); frame.src = 'about:blank'; frame.remove(); }
    $('frame-slot').replaceChildren(); $('status').textContent = ''; $('last-failure').textContent = '';
    $('viewer').hidden = true; $('gate').hidden = false; $('footer').hidden = false;
    $('password').value = ''; $('error').textContent = ''; $('password').removeAttribute('aria-invalid'); $('password').focus();
  }
  $('unlock-form').addEventListener('submit', async event => {
    event.preventDefault(); if ($('unlock').disabled || !$('password').value) return;
    const attempt = ++generation;
    $('unlock').disabled = true; $('error').textContent = '';
    let secret = enc.encode($('password').value), plain;
    $('password').value = '';
    try {
      if (!window.isSecureContext || !crypto?.subtle) throw Error('Secure context required');
      const bootstrap = JSON.parse($('bootstrap').textContent), r = bootstrap.recipient;
      if (bootstrap.schema !== 'cygnus.pages-bootstrap.v1' || r?.schema !== 'cygnus.pages-recipient.v1' || bootstrap.kdf?.name !== 'PBKDF2' || bootstrap.kdf.hash !== 'SHA-256' || bootstrap.kdf.iterations !== 600000 || bootstrap.cipher?.name !== 'AES-GCM' || bootstrap.cipher.aad !== 'cygnus-pages-bootstrap.v1:' + r.recipient_id) throw Error('Invalid bootstrap');
      if (hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes(r.spki)))) !== r.recipient_id) throw Error('Invalid recipient');
      let material = await crypto.subtle.importKey('raw',secret,'PBKDF2',false,['deriveKey']);
      secret.fill(0); secret = null;
      let wrapping = await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(bootstrap.kdf.salt,16),iterations:600000},material,{name:'AES-GCM',length:256},false,['decrypt']);
      material = null;
      plain = new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(bootstrap.cipher.iv,12),additionalData:enc.encode('cygnus-pages-bootstrap.v1:' + r.recipient_id),tagLength:128},wrapping,bytes(bootstrap.encrypted_private_key)));
      wrapping = null;
      const key = await crypto.subtle.importKey('pkcs8',plain,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);
      plain.fill(0); plain = null;
      const fallback = await decrypt(bootstrap.fallback,key,r.recipient_id);
      if (attempt !== generation) return;
      privateKey = key; recipientId = r.recipient_id; display(fallback,'Embedded fallback snapshot');
      $('gate').hidden = true; $('footer').hidden = true; $('viewer').hidden = false;
      $('refresh').disabled = false; $('lock').focus(); schedule(); freshnessTimer = setInterval(status,30000); pull();
    } catch (_) {
      if (attempt === generation) { $('error').textContent = 'Unable to unlock. Check the password or encrypted snapshot.'; $('password').setAttribute('aria-invalid','true'); $('password').focus(); }
    } finally {
      if (secret) secret.fill(0); if (plain) plain.fill(0);
      $('password').value = ''; $('unlock').disabled = false;
    }
  });
  $('refresh').addEventListener('click',pull); $('automatic').addEventListener('change',schedule); $('lock').addEventListener('click',lock);
  window.addEventListener('pagehide',lock);
})();
