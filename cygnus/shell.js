'use strict';
(() => {
  const MAX = 5 * 1024 * 1024, ENVELOPE_MAX = 8 * 1024 * 1024, LABEL = 'cygnus-pages-sealed.v1';
  const BRANCH_API = 'https://api.github.com/repos/WHYKEYSAY/whykeysay.github.io/git/ref/heads/cygnus-data';
  const RAW_PREFIX = 'https://raw.githubusercontent.com/WHYKEYSAY/whykeysay.github.io/';
  const SIGNED_LATEST_URL = 'https://truenas-scale.tail40f7e3.ts.net:10000/cygnus/latest.json';
  const SIGNED_LATEST_JWK = 'eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6Ik5SbV9EOEk3UFpXM1Awd1FYaGhhc1pEWUNHQkE3TmpKYklhNnlQZ2x2VjAiLCJ5IjoiUGtxSjR2b252UHFfNUJrcjFnTVA3Ymt0TU5aMUR5Wkk2YjEwR0hiLWtmSSJ9';
  const FROZEN_GIT_COMMIT = '9c0fe01c95da8e1619cccc0e4d442d4c33014903';
  const SIGNED_SCHEMA = 'cygnus.pages-latest.v1', SIGNED_MAX = Math.ceil(ENVELOPE_MAX / 3) * 4 + 512;
  const SIGNED_MODE = [SIGNED_LATEST_URL,SIGNED_LATEST_JWK,FROZEN_GIT_COMMIT].some(value => !/^__CYGNUS_[A-Z0-9_]+__$/.test(value));
  const POLL_MS = 300000, MANUAL_MS = 60000;
  const LANGUAGES = ['en','fr','zh'];
  const COPY = {
    en:{title:'Cygnus · Private snapshot',home:'Cygnus home',language:'Language',encrypted:'ENCRYPTED SNAPSHOT',eyebrow:'A PRIVATE VIEW',heading:'Your perspective.<br><span>Under your key.</span>',intro:'Unlock an encrypted, read-only snapshot of Cygnus.',password:'Snapshot password',unlock:'Unlock snapshot',unlocking:'Unlocking…',note:'Decrypted in this browser.<br>Your password is never saved or sent.',orbit:'CLARITY, HELD PRIVATELY.',viewer:'Unlocked snapshot',research:'READ-ONLY RESEARCH',details:'Refresh & snapshot details',automatic:'Auto refresh',refresh:'Refresh',lock:'Lock snapshot',publication:'NAS publication runs about every five minutes; this browser checks every five minutes while unlocked. Platform caching and hosting delays may apply. Automatic updates do not promote drafts to human-reviewed evidence.',private:'PRIVATE BY DESIGN',footer:'Encrypted updates are checked only while unlocked.',personal:'CYGNUS / PERSONAL',error:'Unable to unlock. Check the password or encrypted snapshot.',frame:'Cygnus read-only research snapshot',legacy:'This older snapshot has no translated variants. Its original text is shown.',stale:'STALE',published:'Published NAS snapshot',fallback:'Embedded fallback snapshot',refreshFailure:'Refresh unavailable or publication rejected',source:'Source as of',collector:'Collected',generated:'Snapshot generated',unavailable:'unavailable',lastFailure:'Last refresh failed; the prior snapshot remains visible and stale.',next:'Next check available',checking:'Checking for a new snapshot…',schedule:'Automatic checks run every five minutes while enabled; manual checks are limited to once a minute.',retry:'Next retry available',timezone:'Toronto time'},
    fr:{title:'Cygnus · Vue privée',home:'Accueil Cygnus',language:'Langue',encrypted:'VUE CHIFFRÉE',eyebrow:'UN REGARD PRIVÉ',heading:'Votre perspective.<br><span>Sous votre clé.</span>',intro:'Ouvrez une vue chiffrée de Cygnus, en lecture seule.',password:'Mot de passe de la vue',unlock:'Ouvrir la vue',unlocking:'Déverrouillage…',note:'Déchiffré dans ce navigateur.<br>Votre mot de passe n’est ni conservé ni transmis.',orbit:'LA CLARTÉ, EN TOUTE INTIMITÉ.',viewer:'Vue déverrouillée',research:'RECHERCHE EN LECTURE SEULE',details:'Actualisation et détails',automatic:'Actualisation auto',refresh:'Actualiser',lock:'Verrouiller',publication:'Le NAS publie environ toutes les cinq minutes ; ce navigateur vérifie les mises à jour toutes les cinq minutes pendant que la vue est ouverte. Le cache et l’hébergement peuvent ajouter un délai. Les mises à jour ne transforment pas les brouillons en preuves validées par une personne.',private:'PRIVÉ DÈS LA CONCEPTION',footer:'Les mises à jour chiffrées sont vérifiées uniquement quand la vue est ouverte.',personal:'CYGNUS / PERSONNEL',error:'Impossible de déverrouiller. Vérifiez le mot de passe ou la vue chiffrée.',frame:'Vue de recherche Cygnus en lecture seule',legacy:'Cette ancienne vue ne contient pas de traductions. Son texte original est affiché.',stale:'PÉRIMÉ',published:'Vue publiée par le NAS',fallback:'Vue de secours intégrée',refreshFailure:'Actualisation indisponible ou publication refusée',source:'Sources au',collector:'Collecte',generated:'Vue générée',unavailable:'indisponible',lastFailure:'La dernière actualisation a échoué ; la vue précédente reste visible et périmée.',next:'Prochaine vérification possible',checking:'Recherche d’un nouvel instantané…',schedule:'Les vérifications automatiques ont lieu toutes les cinq minutes ; les vérifications manuelles sont limitées à une par minute.',retry:'Prochaine tentative possible',timezone:'heure de Toronto'},
    zh:{title:'Cygnus · 私人研究快照',home:'Cygnus 首页',language:'语言',encrypted:'加密研究快照',eyebrow:'私人研究视角',heading:'你的视角。<br><span>由你解锁。</span>',intro:'解锁 Cygnus 加密只读研究快照。',password:'快照密码',unlock:'解锁快照',unlocking:'正在解锁…',note:'仅在此浏览器解密。<br>本页不保存或发送你的密码。',orbit:'清晰判断，私密掌握。',viewer:'已解锁研究快照',research:'只读研究',details:'刷新与快照详情',automatic:'自动刷新',refresh:'刷新',lock:'锁定快照',publication:'NAS 约每五分钟发布一次；解锁期间，浏览器约每五分钟检查更新。缓存和托管平台可能产生延迟。自动更新不会把草稿变成人工审核通过的证据。',private:'隐私优先',footer:'仅在解锁期间检查加密更新。',personal:'CYGNUS / 私人',error:'无法解锁，请核对密码或加密快照。',frame:'Cygnus 只读研究快照',legacy:'此旧快照尚无三语版本，当前显示原始文字。',stale:'已过期',published:'NAS 发布快照',fallback:'内嵌备用快照',refreshFailure:'刷新不可用或发布内容未通过核验',source:'来源截至',collector:'采集完成',generated:'快照生成',unavailable:'不可用',lastFailure:'上次刷新失败；保留上一份快照并标记为过期。',next:'下次可检查时间',checking:'正在检查快照更新…',schedule:'自动检查约每五分钟一次；手动检查最多每分钟一次。',retry:'下次可重试时间',timezone:'多伦多时间'}
  };
  let currentCommit = null, signedAccepted = false, lastAttempt = -Infinity, retryAfter = 0;
  const enc = new TextEncoder(), dec = new TextDecoder('utf-8', {fatal:true});
  const signedPrefix = enc.encode(SIGNED_SCHEMA + '\n');
  const $ = id => document.getElementById(id);
  let privateKey = null, recipientId = null, generation = 0, timer = null, freshnessTimer = null, active = null;
  let current = null, currentBundle = null, renderedHash = null, renderedLanguage = null;
  let failure = '', pulling = false, language = 'zh', unlockError = false, nextState = '', nextAt = null;
  const hex = bytes => Array.from(bytes, x => x.toString(16).padStart(2,'0')).join('');
  function formatted(value) {
    if (value === null) return COPY[language].unavailable;
    const locales = {en:'en-CA',fr:'fr-CA',zh:'zh-CN'};
    return new Intl.DateTimeFormat(locales[language],{dateStyle:'medium',timeStyle:'medium',timeZone:'America/Toronto'}).format(new Date(value)) + ' · ' + COPY[language].timezone;
  }
  function nextCheck(state, at = null) {
    nextState = state; nextAt = at;
    const t = COPY[language];
    $('next-check').textContent = state === 'checking' ? t.checking : state === 'schedule' ? t.schedule : state === 'wait' ? t.next + ' ' + formatted(at) + '.' : state === 'retry' ? t.retry + ' ' + formatted(at) + '.' : '';
  }
  function identity(bundle) {
    return bundle.content_hash + '|' + LANGUAGES.map(key => bundle.localized_html?.[key]?.content_hash || 'original').join('|');
  }
  function mount() {
    if (!currentBundle) return;
    const variant = currentBundle.localized_html?.[language];
    const html = variant ? variant.html : currentBundle.html;
    const hash = variant ? variant.content_hash : currentBundle.content_hash;
    if (renderedHash !== hash || renderedLanguage !== language) {
      const frame = document.createElement('iframe');
      frame.title = COPY[language].frame;
      frame.dataset.language = variant ? language : 'original';
      frame.setAttribute('sandbox','allow-popups allow-popups-to-escape-sandbox');
      frame.referrerPolicy = 'no-referrer'; frame.srcdoc = html;
      $('frame-slot').replaceChildren(frame);
      renderedHash = hash; renderedLanguage = language;
    }
    $('language-fallback').hidden = Boolean(variant);
    $('language-fallback').textContent = variant ? '' : COPY[language].legacy;
  }
  function setLanguage(value) {
    if (!LANGUAGES.includes(value)) return;
    language = value;
    const t = COPY[value];
    document.documentElement.lang = value === 'zh' ? 'zh-CN' : value;
    document.title = t.title;
    for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t[node.dataset.i18n];
    for (const node of document.querySelectorAll('[data-i18n-aria]')) node.setAttribute('aria-label',t[node.dataset.i18nAria]);
    for (const node of document.querySelectorAll('[data-language]')) node.setAttribute('aria-pressed',String(node.dataset.language === value));
    $('title').innerHTML = t.heading;
    $('local-note').innerHTML = t.note;
    $('unlock-label').textContent = $('unlock').disabled ? t.unlocking : t.unlock;
    $('error').textContent = unlockError ? t.error : '';
    window.CygnusResearch?.setLanguage(language);
    nextCheck(nextState,nextAt); mount(); status();
  }
  function bytes(value, expected, limit = MAX) {
    if (typeof value !== 'string' || value.length > Math.ceil(limit / 3) * 4 || value.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw Error('Invalid encoding');
    const raw = atob(value);
    if ((expected !== undefined && raw.length !== expected) || raw.length > limit) throw Error('Invalid size');
    const decoded = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) decoded[i] = raw.charCodeAt(i);
    return decoded;
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
    const t = COPY[language];
    $('status').textContent = `${stale ? t.stale + ' · ' : ''}${t[current.view_source] || t.published}${failure ? ' · ' + t.refreshFailure : ''} · ${t.source} ${formatted(current.source_as_of)} · ${t.collector} ${formatted(current.collector_as_of)} · ${t.generated} ${formatted(current.generated_at)}`;
    $('status').dataset.stale = String(stale);
    $('summary-status').textContent = failure ? t.refreshFailure : stale ? t.stale : '';
    $('summary-status').hidden = !stale;
    $('status').dataset.generatedAt = current.generated_at;
    $('status').dataset.sourceAsOf = current.source_as_of || '';
    $('status').dataset.collectorAsOf = current.collector_as_of || '';
    $('status').title = [current.source_as_of,current.collector_as_of,current.generated_at].filter(x => x !== null).join(' · ');
    $('last-failure').textContent = failure ? t.lastFailure : '';
  }
  async function readJSON(response, limit = MAX) {
    if (!response.ok || response.redirected || !response.body || Number(response.headers.get('content-length') || 0) > limit) throw Error('Unavailable');
    const reader = response.body.getReader(), chunks = [];
    let count = 0;
    try {
      while (true) {
        const {done,value} = await reader.read();
        if (done) break;
        count += value.byteLength;
        if (count > limit) throw Error('Oversized publication');
        chunks.push(value);
      }
    } catch (e) { await reader.cancel(); throw e; }
    const all = new Uint8Array(count); let offset = 0;
    for (const item of chunks) { all.set(item,offset); offset += item.length; }
    return JSON.parse(dec.decode(all));
  }
  function signedLatestConfig() {
    const url = new URL(SIGNED_LATEST_URL);
    if (url.protocol !== 'https:' || url.href !== SIGNED_LATEST_URL || url.username || url.password || /[?#]/.test(url.href) ||
        !/^[A-Za-z0-9_-]{1,512}$/.test(SIGNED_LATEST_JWK) || !/^[a-f0-9]{40}$/.test(FROZEN_GIT_COMMIT)) throw Error('Invalid signed publication configuration');
    const b64 = SIGNED_LATEST_JWK.replaceAll('-','+').replaceAll('_','/').padEnd(Math.ceil(SIGNED_LATEST_JWK.length / 4) * 4,'=');
    const jwk = JSON.parse(dec.decode(bytes(b64)));
    if (!jwk || Object.keys(jwk).sort().join('|') !== 'crv|kty|x|y' || jwk.kty !== 'EC' || jwk.crv !== 'P-256' ||
        typeof jwk.x !== 'string' || typeof jwk.y !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(jwk.x) || !/^[A-Za-z0-9_-]{43}$/.test(jwk.y)) throw Error('Invalid publication key');
    return {url:url.href,jwk};
  }
  async function signedEnvelope(options) {
    const {url,jwk} = signedLatestConfig();
    const response = await fetch(url,options);
    if (response.url !== url) throw Error('Unexpected signed publication endpoint');
    const receipt = await readJSON(response,SIGNED_MAX);
    if (!receipt || Object.keys(receipt).sort().join('|') !== 'payload|schema|signature' || receipt.schema !== SIGNED_SCHEMA) throw Error('Invalid signed publication');
    const payload = bytes(receipt.payload,undefined,ENVELOPE_MAX), signature = bytes(receipt.signature,64);
    const signed = new Uint8Array(signedPrefix.length + payload.length);
    signed.set(signedPrefix); signed.set(payload,signedPrefix.length);
    const key = await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
    if (!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,signature,signed)) throw Error('Invalid publication signature');
    return JSON.parse(dec.decode(payload));
  }
  async function gitEnvelope(options, frozen = null) {
    let commit = frozen;
    if (commit === null) {
      const response = await fetch(BRANCH_API,options);
      if (response.url !== BRANCH_API) throw Error('Unexpected ref endpoint');
      const ref = await readJSON(response,16384);
      if (ref.ref !== 'refs/heads/cygnus-data' || ref.object?.type !== 'commit') throw Error('Invalid branch ref');
      commit = ref.object.sha;
    }
    if (typeof commit !== 'string' || !/^[a-f0-9]{40}$/.test(commit)) throw Error('Invalid commit');
    if (commit === currentCommit) return null;
    const url = RAW_PREFIX + commit + '/cygnus/payload.enc.json';
    const response = await fetch(url,options);
    if (response.url !== url) throw Error('Unexpected data endpoint');
    return {commit,envelope:await readJSON(response,ENVELOPE_MAX)};
  }
  async function decrypt(envelope, key, id) {
    if (envelope.schema !== 'cygnus.pages-sealed.v1' || envelope.compression !== 'gzip' || envelope.recipient_id !== id || envelope.cipher?.name !== 'AES-GCM' || envelope.cipher.aad !== LABEL) throw Error('Invalid publication');
    let raw = new Uint8Array(await crypto.subtle.decrypt({name:'RSA-OAEP',label:enc.encode(LABEL)}, key, bytes(envelope.wrapped_key,384)));
    let aes;
    try { aes = await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']); } finally { raw.fill(0); raw = null; }
    let plain = new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.cipher.iv,12),additionalData:enc.encode(LABEL),tagLength:128},aes,bytes(envelope.ciphertext,undefined,ENVELOPE_MAX)));
    aes = null;
    let bundle;
    try {
      if (typeof DecompressionStream !== 'function') throw Error('Gzip not supported');
      bundle = await readJSON(new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))));
    } finally { plain.fill(0); plain = null; }
    if (bundle.schema_version !== 'cygnus.pages-live-bundle.v1' || typeof bundle.html !== 'string' || enc.encode(bundle.html).length > MAX || enc.encode(JSON.stringify(bundle)).length > MAX) throw Error('Invalid bundle');
    for (const field of ['generated_at','source_as_of','collector_as_of']) {
      if (!Object.prototype.hasOwnProperty.call(bundle,field)) throw Error('Missing clock field');
      if (bundle[field] !== null || field === 'generated_at') utc(bundle[field]);
    }
    for (const field of ['source_as_of','collector_as_of']) if (bundle[field] !== null && utc(bundle[field]) > utc(bundle.generated_at) + 1000) throw Error('Invalid capture time');
    if (!/^[a-f0-9]{64}$/.test(bundle.content_hash) || hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(bundle.html)))) !== bundle.content_hash) throw Error('Invalid content hash');
    if (Object.prototype.hasOwnProperty.call(bundle,'localized_html')) {
      const variants = bundle.localized_html;
      if (!variants || typeof variants !== 'object' || Array.isArray(variants) || Object.keys(variants).sort().join('|') !== 'en|fr|zh') throw Error('Invalid languages');
      for (const lang of LANGUAGES) {
        const variant = variants[lang];
        if (!variant || typeof variant !== 'object' || Array.isArray(variant) || Object.keys(variant).sort().join('|') !== 'content_hash|html' || typeof variant.html !== 'string' || !/^[a-f0-9]{64}$/.test(variant.content_hash) || enc.encode(variant.html).length > MAX) throw Error('Invalid language variant');
        if (hex(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(variant.html)))) !== variant.content_hash) throw Error('Invalid language hash');
      }
      if (variants.en.html !== bundle.html || variants.en.content_hash !== bundle.content_hash) throw Error('Invalid default language');
    }
    if (current) {
      if (utc(bundle.generated_at) < utc(current.generated_at)) throw Error('Rollback rejected');
      if (bundle.collector_as_of !== null && current.collector_as_of !== null && utc(bundle.collector_as_of) < utc(current.collector_as_of)) throw Error('Collection rollback rejected');
      if (utc(bundle.generated_at) === utc(current.generated_at) && identity(bundle) !== current.bundle_identity) throw Error('Conflicting publication');
    }
    return bundle;
  }
  function display(bundle, viewSource = 'published') {
    currentBundle = bundle;
    current = {view_source:viewSource,generated_at:bundle.generated_at,source_as_of:bundle.source_as_of,collector_as_of:bundle.collector_as_of,content_hash:bundle.content_hash,bundle_identity:identity(bundle)};
    mount();
    failure = ''; status();
  }
  async function publicationRequest(operation) {
    const controller = new AbortController(); active = controller;
    const timeout = setTimeout(() => controller.abort(),10000);
    try {
      return await operation({credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
    } finally {
      clearTimeout(timeout);
      if (active === controller) active = null;
    }
  }
  async function showGit(attempt,key,id,frozen = null) {
    const result = await publicationRequest(options => gitEnvelope(options,frozen));
    if (!result || attempt !== generation) return;
    const bundle = await decrypt(result.envelope,key,id);
    if (attempt !== generation) return;
    display(bundle); currentCommit = result.commit;
  }
  async function pull() {
    if (!privateKey || pulling) return;
    const eligible = Math.max(lastAttempt + MANUAL_MS, retryAfter);
    if (Date.now() < eligible) {
      nextCheck('wait',eligible);
      return;
    }
    lastAttempt = Date.now();
    const attempt = generation, key = privateKey, id = recipientId;
    pulling = true;
    $('refresh').disabled = true; nextCheck('checking');
    try {
      if (SIGNED_MODE) {
        const envelope = await publicationRequest(signedEnvelope);
        if (attempt !== generation) return;
        const bundle = await decrypt(envelope,key,id);
        if (attempt !== generation) return;
        display(bundle); signedAccepted = true;
      } else {
        await showGit(attempt,key,id);
      }
      if (attempt !== generation) return;
      failure = ''; status();
      retryAfter = 0;
      nextCheck('schedule');
    } catch (_) {
      if (attempt === generation && SIGNED_MODE && !signedAccepted && currentCommit !== FROZEN_GIT_COMMIT) {
        try { await showGit(attempt,key,id,FROZEN_GIT_COMMIT); }
        catch (_) { /* Keep the embedded view when both publication sources fail. */ }
      }
      if (attempt === generation) {
        retryAfter = Date.now() + POLL_MS;
        failure = 'refresh'; status();
        nextCheck('retry',retryAfter);
      }
    } finally {
      if (attempt === generation) { pulling = false; $('refresh').disabled = false; }
    }
  }
  function schedule() {
    clearInterval(timer); timer = null;
    if (privateKey && $('automatic').checked) timer = setInterval(pull,POLL_MS);
  }
  function lock() {
    window.CygnusResearch?.lock();
    generation++; clearInterval(timer); clearInterval(freshnessTimer); timer = freshnessTimer = null;
    if (active) active.abort(); active = null;
    privateKey = null; recipientId = null; current = null; currentBundle = null; currentCommit = null; signedAccepted = false; failure = ''; pulling = false;
    renderedHash = renderedLanguage = null; unlockError = false;
    const frame = $('frame-slot').querySelector('iframe');
    if (frame) { frame.removeAttribute('srcdoc'); frame.src = 'about:blank'; frame.remove(); }
    $('frame-slot').replaceChildren(); $('status').textContent = ''; $('last-failure').textContent = ''; nextCheck('');
    for (const key of ['generatedAt','sourceAsOf','collectorAsOf','stale']) delete $('status').dataset[key];
    $('status').removeAttribute('title'); $('language-fallback').textContent = ''; $('language-fallback').hidden = true;
    $('publication-controls').open = false; $('summary-status').textContent = ''; $('summary-status').hidden = true;
    $('viewer').hidden = true; $('gate').hidden = false; $('footer').hidden = false;
    $('password').value = ''; $('error').textContent = ''; $('password').removeAttribute('aria-invalid'); $('unlock').disabled = false; setLanguage(language); $('password').focus();
  }
  $('unlock-form').addEventListener('submit', async event => {
    event.preventDefault(); if ($('unlock').disabled || !$('password').value) return;
    const attempt = ++generation;
    $('unlock').disabled = true; unlockError = false; $('error').textContent = ''; setLanguage(language);
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
      privateKey = key; recipientId = r.recipient_id; display(fallback,'fallback');
      window.CygnusResearch?.unlock(key,recipientId,language);
      $('gate').hidden = true; $('footer').hidden = true; $('viewer').hidden = false;
      $('refresh').disabled = false; $('publication-summary').focus(); schedule(); freshnessTimer = setInterval(status,30000); pull();
    } catch (_) {
      if (attempt === generation) { unlockError = true; $('error').textContent = COPY[language].error; $('password').setAttribute('aria-invalid','true'); $('password').focus(); }
    } finally {
      if (secret) secret.fill(0); if (plain) plain.fill(0);
      if (attempt === generation) { $('password').value = ''; $('unlock').disabled = false; setLanguage(language); }
    }
  });
  $('refresh').addEventListener('click',pull); $('automatic').addEventListener('change',schedule); $('lock').addEventListener('click',lock);
  for (const button of document.querySelectorAll('[data-language]')) button.addEventListener('click',() => setLanguage(button.dataset.language));
  window.addEventListener('pagehide',lock);
  const requestedLanguage = new URL(location.href).searchParams.get('lang');
  setLanguage(LANGUAGES.includes(requestedLanguage) ? requestedLanguage : 'zh');
})();
