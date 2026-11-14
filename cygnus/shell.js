'use strict';
(() => {
  const MAX_BYTES = 5 * 1024 * 1024;
  const form = document.querySelector('#unlock-form');
  const password = document.querySelector('#password');
  const button = document.querySelector('#unlock');
  const error = document.querySelector('#error');
  const gate = document.querySelector('#gate');
  const viewer = document.querySelector('#viewer');
  const slot = document.querySelector('#frame-slot');
  const footer = document.querySelector('#footer');
  const FAILURE = 'Unable to unlock. Check the password or snapshot file.';
  let generation = 0;

  function bytes(value, expected) {
    if (typeof value !== 'string' || value.length > Math.ceil(MAX_BYTES / 3) * 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error('Invalid encoding');
    const raw = atob(value);
    if ((expected !== undefined && raw.length !== expected) || raw.length > MAX_BYTES) throw new Error('Invalid size');
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }

  async function loadEnvelope() {
    const response = await fetch('./payload.enc.json', {credentials:'omit', cache:'no-store', redirect:'error'});
    if (!response.ok || !response.body) throw new Error('Unavailable');
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BYTES) throw new Error('Too large');
        chunks.push(value);
      }
    } catch (failure) { await reader.cancel(); throw failure; }
    const encoded = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { encoded.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(encoded));
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !password.value) return;
    const attempt = ++generation;
    button.disabled = true;
    button.firstElementChild.textContent = 'Unlocking…';
    error.textContent = '';
    password.removeAttribute('aria-invalid');
    let secret = new TextEncoder().encode(password.value);
    password.value = '';
    let plaintext;
    try {
      if (!window.isSecureContext || !window.crypto?.subtle) throw new Error('Secure context required');
      const envelope = await loadEnvelope();
      if (envelope.schema !== 'cygnus.pages-encrypted.v1' || envelope.kdf?.name !== 'PBKDF2' || envelope.kdf.hash !== 'SHA-256' || envelope.kdf.iterations !== 600000 || envelope.cipher?.name !== 'AES-GCM' || envelope.cipher.aad !== 'cygnus-pages.v1') throw new Error('Invalid contract');
      const salt = bytes(envelope.kdf.salt, 16);
      const iv = bytes(envelope.cipher.iv, 12);
      const ciphertext = bytes(envelope.ciphertext);
      if (ciphertext.length < 16) throw new Error('Invalid payload');
      let material = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey']);
      secret.fill(0); secret = null;
      let key = await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:600000}, material, {name:'AES-GCM',length:256}, false, ['decrypt']);
      material = null;
      plaintext = new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('cygnus-pages.v1'),tagLength:128}, key, ciphertext));
      key = null;
      let bundle = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(plaintext));
      plaintext.fill(0); plaintext = null;
      if (bundle.schema_version !== 'cygnus.pages-bundle.v1' || typeof bundle.html !== 'string' || new TextEncoder().encode(bundle.html).byteLength > MAX_BYTES) throw new Error('Invalid bundle');
      if (attempt !== generation) return;
      const frame = document.createElement('iframe');
      frame.title = 'Cygnus read-only snapshot';
      frame.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
      frame.referrerPolicy = 'no-referrer';
      frame.srcdoc = bundle.html;
      bundle = null;
      slot.replaceChildren(frame);
      gate.hidden = true; footer.hidden = true; viewer.hidden = false;
      document.querySelector('#lock').focus();
    } catch (_) {
      if (attempt === generation) { error.textContent = FAILURE; password.setAttribute('aria-invalid', 'true'); password.focus(); }
    } finally {
      if (secret) secret.fill(0);
      if (plaintext) plaintext.fill(0);
      password.value = '';
      button.disabled = false;
      button.firstElementChild.textContent = 'Unlock snapshot';
    }
  });

  document.querySelector('#lock').addEventListener('click', () => {
    generation++;
    const frame = slot.querySelector('iframe');
    if (frame) { frame.removeAttribute('srcdoc'); frame.src = 'about:blank'; frame.remove(); }
    slot.replaceChildren();
    viewer.hidden = true; gate.hidden = false; footer.hidden = false;
    password.value = ''; error.textContent = ''; password.removeAttribute('aria-invalid'); password.focus();
  });
})();
