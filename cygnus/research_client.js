'use strict';
(() => {
  const BASE = 'https://truenas-scale.tail40f7e3.ts.net:10000/cygnus-research';
  const ORIGIN = 'https://whykeysay.github.io', LABEL = 'cygnus-public-research-auth.v1';
  const SESSION = 'cygnus.public-research-session.v1', API = '/api/cygnus/stock-inquiry';
  const enc = new TextEncoder(), dec = new TextDecoder('utf-8',{fatal:true});
  const $ = id => document.getElementById(id), root = $('online-research');
  if (!root) return;
  const COPY = {
    zh:{ask:'提问 Cygnus',eyebrow:'CYGNUS / 在线研究',title:'直接核验一只股票',intro:'结合财报和新闻线索，查看支持、反证与资料缺口。',boundary:'目前支持美股；研究草稿，不执行交易。',symbols:'美股代码（最多两个）',question:'你想核验什么？',submit:'提交核验',retry:'重连 / 检查状态',clear:'清空',locked:'解锁后可用',auth:'正在连接研究服务…',ready:'研究服务已连接，可以提问。',offline:'研究服务暂时不可用。可重试连接；未生成投资结论。',invalid:'请输入一至两个有效美股代码及问题（最多1200字）。',queued:'已排队，正在核验公开资料…',waiting_model:'已保存，等待计算节点恢复。',collecting:'正在收集公开资料…',running:'正在生成有来源的研究草稿…',completed:'核验完成 · 未审核研究草稿',failed:'核验未完成；未推断投资结论。',interrupted:'计算中断，请重新提交。',expired:'临时请求已过期，请重新提交。',support:'支持',counter:'反证',gaps:'缺口',next:'下一步核验',sources:'来源',unknown:'未知',asof:'核验时间',published:'发布',observed:'检索',limited:'仅核验有限资料，尚非完整财报或数值审计。',nomodel:'本地模型未产出有效分析；保留已取回的来源。',nosummary:'暂无有来源的模型结论。',timeout:'请求仍在处理，可点击检查状态。',budget:'临时研究次数已达上限，请稍后再试。'},
    en:{ask:'Ask Cygnus',eyebrow:'CYGNUS / ONLINE RESEARCH',title:'Check a stock directly',intro:'Review filings and news leads for supporting evidence, counterevidence and information gaps.',boundary:'US listings only; research drafts, no trading.',symbols:'US symbols (up to two)',question:'What would you like to check?',submit:'Check evidence',retry:'Reconnect / check status',clear:'Clear',locked:'Unlock to use research',auth:'Connecting to research…',ready:'Research connected. Ask a question.',offline:'Research is unavailable. Retry the connection; no investment conclusion was inferred.',invalid:'Enter one or two valid US symbols and a question (up to 1,200 characters).',queued:'Queued. Checking public evidence…',waiting_model:'Saved, waiting for the compute node.',collecting:'Collecting public sources…',running:'Preparing a sourced research draft…',completed:'Review complete · unreviewed draft',failed:'Review incomplete; no investment conclusion was inferred.',interrupted:'Compute interrupted. Submit again.',expired:'Temporary request expired. Submit again.',support:'Support',counter:'Counterevidence',gaps:'Gaps',next:'Next checks',sources:'Sources',unknown:'Unknown',asof:'Review time',published:'Published',observed:'Retrieved',limited:'Limited source review; not a full filing or numerical audit.',nomodel:'The local model produced no valid analysis. Retrieved sources remain available.',nosummary:'No grounded model assessment is available.',timeout:'Still processing. Use check status to continue.',budget:'The temporary research limit has been reached. Try again later.'},
    fr:{ask:'Demander à Cygnus',eyebrow:'CYGNUS / RECHERCHE EN LIGNE',title:'Vérifier une action',intro:'Examinez les rapports financiers et les pistes d’actualité : arguments favorables, contre-arguments et lacunes.',boundary:'Actions américaines ; brouillons de recherche, sans exécution de transactions.',symbols:'Symboles américains (deux au maximum)',question:'Que souhaitez-vous vérifier ?',submit:'Vérifier les sources',retry:'Reconnecter / vérifier l’état',clear:'Effacer',locked:'Déverrouillez pour commencer',auth:'Connexion à la recherche…',ready:'Recherche connectée. Posez une question.',offline:'Recherche indisponible. Réessayez ; aucune conclusion financière n’a été déduite.',invalid:'Saisissez un ou deux symboles valides et une question (1 200 caractères maximum).',queued:'En attente. Vérification des sources…',waiting_model:'Demande conservée, en attente du calcul.',collecting:'Collecte des sources publiques…',running:'Rédaction d’un brouillon sourcé…',completed:'Vérification terminée · brouillon non vérifié',failed:'Vérification incomplète ; aucune conclusion financière déduite.',interrupted:'Calcul interrompu. Soumettez à nouveau.',expired:'Demande temporaire expirée. Soumettez à nouveau.',support:'Arguments favorables',counter:'Contre-arguments',gaps:'Lacunes',next:'Prochaines vérifications',sources:'Sources',unknown:'Inconnu',asof:'Date de vérification',published:'Publication',observed:'Consultation',limited:'Sources limitées ; ni lecture intégrale des rapports ni audit numérique.',nomodel:'Le modèle local n’a produit aucune analyse valide. Les sources restent disponibles.',nosummary:'Aucune analyse sourcée disponible.',timeout:'Traitement en cours. Vérifiez de nouveau l’état.',budget:'Limite temporaire atteinte. Réessayez plus tard.'}
  };
  let language = 'zh', key = null, recipient = null, pageId = null, token = null, expiry = 0, epoch = 0;
  let busy = false, authPromise = null, job = null, requestId = null, pending = null, timer = null, started = 0, state = 'locked', result = null;
  const controllers = new Set();
  const text = (value, max=2400) => typeof value === 'string' ? value.slice(0,max) : '';
  const rows = (value, max=32) => Array.isArray(value) ? value.slice(0,max) : [];
  const node = (tag,value) => { const n=document.createElement(tag); if(value!==undefined)n.textContent=value; return n; };
  const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  function status(value) { state=value; $('research-status').dataset.state=value; $('research-status').textContent=COPY[language][value] || COPY[language].failed; }
  function controls() { $('research-submit').disabled = busy || !key; $('research-retry').disabled = busy || !key; }
  function clock(value) { const d = typeof value === 'string' ? new Date(value) : null; return d && Number.isFinite(d.getTime()) ? d.toLocaleString(language==='zh'?'zh-CN':language==='fr'?'fr-CA':'en-CA',{timeZone:'America/Toronto'})+' · Toronto' : COPY[language].unknown; }
  async function request(path, options={}, authenticated=false) {
    const controller=new AbortController(); controllers.add(controller);
    const timeout=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch(BASE+path,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(authenticated?{Authorization:'Bearer '+token}:{}),...options.headers},credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:controller.signal});
      if(response.redirected || !response.body || !(response.headers.get('content-type')||'').includes('application/json'))throw Error('offline');
      const reader=response.body.getReader(), chunks=[]; let size=0;
      try { while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>262144)throw Error('offline');chunks.push(part.value);} } catch(error){await reader.cancel();throw error;}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      const data=JSON.parse(dec.decode(bytes));
      if(!response.ok){if(response.status===401){token=null;expiry=0;}throw Error(data.error_code==='temporary_research_budget_exhausted'?'budget':data.error_code==='job_expired_or_unknown'?'expired':'offline');}
      return data;
    } finally {clearTimeout(timeout);controllers.delete(controller);}
  }
  async function authenticate() {
    if(token && Date.now()<expiry)return;
    if(authPromise)return authPromise;
    const version=epoch, privateKey=key, id=recipient, scope=pageId;
    if(!privateKey || !/^[a-f0-9]{32}$/.test(scope||''))throw Error('locked');
    status('auth');
    const work=(async()=>{
      const challenge=await request('/auth/challenge?recipient_id='+id);
      if(version!==epoch)throw Error('locked');
      if(challenge.schema_version!==SESSION || challenge.recipient_id!==id || !/^[a-f0-9]{32}$/.test(challenge.challenge_id||'') || challenge.expires_in!==60 || typeof challenge.ciphertext!=='string' || !/^[A-Za-z0-9+/]{512}$/.test(challenge.ciphertext))throw Error('offline');
      const encrypted=Uint8Array.from(atob(challenge.ciphertext),c=>c.charCodeAt(0));
      let plain=new Uint8Array(await crypto.subtle.decrypt({name:'RSA-OAEP',label:enc.encode(LABEL)},privateKey,encrypted));
      let digest;
      try {
        if(version!==epoch || plain.length>318)throw Error('locked');
        const proof=JSON.parse(dec.decode(plain));
        if(!proof || Object.keys(proof).sort().join('|')!=='challenge_id|nonce|origin|schema_version' || proof.schema_version!=='cygnus.public-research-proof.v1' || proof.challenge_id!==challenge.challenge_id || proof.origin!==ORIGIN || !/^[A-Za-z0-9_-]{43}$/.test(proof.nonce||''))throw Error('offline');
        const label=enc.encode(LABEL), scopeBytes=enc.encode(scope), material=new Uint8Array(label.length+1+plain.length+1+scopeBytes.length);material.set(label);material.set(plain,label.length+1);material.set(scopeBytes,label.length+1+plain.length+1);
        try{digest=b64url(new Uint8Array(await crypto.subtle.digest('SHA-256',material)));}finally{material.fill(0);}
      } finally {plain.fill(0);plain=null;}
      if(version!==epoch)throw Error('locked');
      const session=await request('/auth/prove',{method:'POST',body:JSON.stringify({challenge_id:challenge.challenge_id,proof:digest,page_id:scope})});
      if(version!==epoch)throw Error('locked');
      if(session.schema_version!==SESSION || session.expires_in!==1800 || !/^[A-Za-z0-9_-]{43}$/.test(session.token||''))throw Error('offline');
      token=session.token;expiry=Date.now()+1790000;
    })();
    authPromise=work;
    try{await work;}finally{if(authPromise===work)authPromise=null;}
  }
  function render(value) {
    const out=$('research-result');out.replaceChildren();if(!value)return;
    if(typeof value!=='object' || value.trade_ready!==false || value.human_reviewed!==false)throw Error('offline');
    const t=COPY[language];out.append(node('small',t.asof+': '+clock(value.as_of)));
    if(value.numeric_verification!==true || value.full_filings_read!==true)out.append(node('p',t.limited));
    if(!['completed','ready'].includes(value.model?.state))out.append(node('p',t.nomodel));
    out.append(node('p',text(value.analysis?.summary)||t.nosummary));
    const sources=rows(value.evidence), grid=node('div');grid.className='research-grid';
    for(const [field,label] of [['support','support'],['counterevidence','counter'],['gaps','gaps'],['next_checks','next']]){
      const section=node('section'),list=node('ul');section.append(node('h3',t[label]));
      for(const row of rows(value.analysis?.[field],12)){
        const li=node('li',text(typeof row==='string'?row:row?.text));
        for(const id of rows(row?.evidence_ids,8)){const index=sources.findIndex(s=>s?.id===id);if(index>=0){const link=node('a',' ['+(index+1)+']');link.href='#research-source-'+(index+1);li.append(link);}}
        list.append(li);
      }
      if(!list.children.length)list.append(node('li',t.unknown));section.append(list);grid.append(section);
    }
    out.append(grid,node('h3',t.sources));
    sources.forEach((source,index)=>{const item=node('article');item.className='research-source';item.id='research-source-'+(index+1);const title='['+(index+1)+'] '+text(source?.symbol,15)+' · '+text(source?.title,300);let url;try{url=new URL(source?.url);if(url.protocol!=='https:'||url.username||url.password)url=null;}catch(_){url=null;}
      if(url){const link=node('a',title);link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';item.append(link);}else item.append(node('strong',title));
      item.append(node('small',t.published+': '+clock(source?.published_at)+' · '+t.observed+': '+clock(source?.observed_at)),node('p',text(source?.excerpt,2000)));out.append(item);});
  }
  function check(data) {if(data?.schema_version!=='cygnus.stock-inquiry.v1'||data.executable!==false||!/^[a-f0-9]{32}$/.test(data.job_id||''))throw Error('offline');return data;}
  async function poll(version) {
    if(version!==epoch || !job)return;
    timer=null;
    busy=true;controls();
    try{
      await authenticate();if(version!==epoch)return;
      const data=check(await request(API+'?id='+encodeURIComponent(job),{},true));if(version!==epoch)return;
      if(data.job_id!==job)throw Error('offline');
      if(data.state==='completed'){if(!data.result)throw Error('offline');render(data.result);result=data.result;status('completed');return;}
      if(['failed','interrupted','expired'].includes(data.state)){if(data.result){render(data.result);result=data.result;}status(data.state);return;}
      if(!['queued','collecting','waiting_model','running'].includes(data.state))throw Error('offline');
      status(data.state);
      if(Date.now()-started>180000){status('timeout');return;}
      timer=setTimeout(()=>poll(version),3000);
    }catch(error){if(version===epoch)status(error.message==='expired'?'expired':'offline');}
    finally{if(version===epoch){busy=Boolean(timer);controls();}}
  }
  function cancel(){epoch++;clearTimeout(timer);timer=null;for(const controller of controllers)controller.abort();controllers.clear();busy=false;authPromise=null;}
  function clear(){cancel();job=null;requestId=null;pending=null;result=null;$('research-form').reset();$('research-result').replaceChildren();status(key?'ready':'locked');controls();}
  async function send(){
    if(busy || !key)return;
    const symbols=[...new Set($('research-symbols').value.toUpperCase().split(/[\s,;]+/).filter(Boolean))], question=$('research-question').value.trim();
    if(!symbols.length||symbols.length>2||symbols.some(s=>!/^[A-Z][A-Z0-9.\-]{0,14}$/.test(s))||!question||question.length>1200){status('invalid');return;}
    cancel();job=null;result=null;$('research-result').replaceChildren();
    const body=JSON.stringify({symbols,question,language});if(pending!==body){pending=body;requestId=crypto.randomUUID();}
    const version=epoch;busy=true;controls();
    try{await authenticate();if(version!==epoch)return;const data=check(await request(API,{method:'POST',headers:{'X-Cygnus-Request-ID':requestId},body},true));if(version!==epoch)return;job=data.job_id;started=Date.now();busy=false;status('queued');await poll(version);}
    catch(error){if(version===epoch){busy=false;status(['budget','expired'].includes(error.message)?error.message:'offline');controls();}}
  }
  function setLanguage(value){if(!COPY[value])return;language=value;for(const el of root.querySelectorAll('[data-research-copy]'))el.textContent=COPY[language][el.dataset.researchCopy];status(state);render(result);}
  function lock(){root.open=false;const old=token;cancel();key=null;recipient=null;pageId=null;token=null;expiry=0;clear();if(old)fetch(BASE+'/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+old},credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});}
  async function unlock(privateKey,id,lang){lock();key=privateKey;recipient=id;pageId=crypto.randomUUID().replace(/-/g,'');setLanguage(lang);const version=epoch;busy=true;controls();try{await authenticate();if(version===epoch)status('ready');}catch(_){if(version===epoch)status('offline');}finally{if(version===epoch){busy=false;controls();}}}
  $('research-form').addEventListener('submit',event=>{event.preventDefault();send();});
  $('research-clear').addEventListener('click',clear);
  $('research-retry').addEventListener('click',async()=>{if(busy||!key)return;clearTimeout(timer);timer=null;started=Date.now();if(job){poll(epoch);return;}const version=epoch;busy=true;controls();try{await authenticate();if(version===epoch)status('ready');}catch(_){if(version===epoch)status('offline');}finally{if(version===epoch){busy=false;controls();}}});
  window.addEventListener('pagehide',lock);
  window.CygnusResearch=Object.freeze({unlock,lock,setLanguage});setLanguage('zh');controls();
})();
