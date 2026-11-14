'use strict';
(() => {
  const names={overview:'概览',research:'研究与判断',memory:'记忆与知识',tasks:'任务与提醒',home:'家与设备',connect:'接入与能力'};
  const commandText=document.querySelector('#command-text');
  const toast=document.querySelector('#toast');
  let toastTimer;
  function notify(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3200);}
  function currentView(){const key=location.hash.slice(1);return Object.hasOwn(names,key)?key:'overview';}
  function showView(key,focus=false){
    if(!Object.hasOwn(names,key))key='overview';
    for(const view of document.querySelectorAll('.view'))view.hidden=view.id!=='view-'+key;
    for(const button of document.querySelectorAll('#navigation [data-view]')){if(button.dataset.view===key)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
    document.querySelector('#breadcrumb').textContent=names[key];
    document.title='Aries · '+names[key];
    if(focus){document.querySelector('#main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }
  function navigate(key){if(location.hash!=='#'+key){location.hash=key;}else showView(key,true);}
  window.addEventListener('hashchange',()=>showView(currentView(),true));
  document.addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button)return;navigate(button.dataset.view);if(button.hasAttribute('data-focus-command'))setTimeout(()=>commandText.focus(),30);});
  showView(currentView());
  async function copy(value){
    try{if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(value);notify('指令已复制。请粘贴到已连接的私人助手。');return true;}
    catch{commandText.value=value;navigate('overview');setTimeout(()=>{commandText.focus();commandText.select();notify('请在输入框中长按或按 Ctrl / ⌘ + C 复制。');},30);return false;}
  }
  document.querySelector('#command-copy').addEventListener('click',()=>{const value=commandText.value.trim();if(!value){notify('先写下一条指令，或选择一个示例。');commandText.focus();return;}copy(value);});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-command]');if(!button)return;commandText.value=button.dataset.command;navigate('overview');setTimeout(()=>commandText.focus(),30);notify('已准备指令，尚未发送。');});
  const memoryCommands=[
    {title:'记下一个想法',description:'把值得保留的想法交给私人助手。',command:'记下：这里填写需要保留的想法和来源。'},
    {title:'说明长期偏好',description:'明确区分长期偏好与这一次的选择。',command:'记住：我希望回答简洁，重要结论附上来源。'},
    {title:'找回项目背景',description:'提供项目关键词，在已授权的资料范围内查找。',command:'检索资料 项目关键词'},
    {title:'搜索自己的资料',description:'在已授权的知识库范围内检索，结果保留来源与缺口。',command:'检索资料 这里填写主题关键词'},
    {title:'查看偏好记录',description:'先查看私人助手中已经保存的偏好，再决定是否调整。',command:'我的偏好'}
  ];
  const taskCommands=[
    {title:'保存一项待办',description:'在私人入口中创建持久记录。',command:'添加待办：这里填写下一件要完成的事。'},
    {title:'设置相对提醒',description:'发送后在实际设备上确认提醒记录与送达设置。',command:'10分钟后提醒我喝水'},
    {title:'查看安排',description:'查询私人助手中已保存的任务和提醒。',command:'提醒列表'}
  ];
  function commandCard(item){const card=document.createElement('article');card.className='command-card';const title=document.createElement('h3');title.textContent=item.title;const description=document.createElement('p');description.textContent=item.description;const preview=document.createElement('div');preview.className='command-preview';preview.textContent=item.command;const button=document.createElement('button');button.type='button';button.textContent='准备这条指令 →';button.dataset.command=item.command;card.append(title,description,preview,button);return card;}
  memoryCommands.forEach(item=>document.querySelector('#memory-commands').append(commandCard(item)));
  taskCommands.forEach(item=>document.querySelector('#task-commands').append(commandCard(item)));
  const devices=[
    {icon:'⌁',title:'空气与环境',description:'HushJet 已有私人助手控制与状态读取记录。先查看设备状态，再决定是否调整。',scope:'已有私人接入记录',command:'家里状态'},
    {icon:'♫',title:'家中的声音',description:'在已接入的 Telegram 入口准备家中播报；声音播放依赖设备与对应电脑在线。',scope:'设备在线时使用',command:'/say 你好，Aries在这里。'},
    {icon:'⌘',title:'电脑与计算',description:'NAS 是协调入口，电脑按实际连接承担本地计算。唤醒是否成功需要状态确认。',scope:'唤醒需实际核对',command:'家里状态'},
    {icon:'▤',title:'打印与材料',description:'已有打印机状态读取与材料预览流程；实际出纸仍待验收。网页不直接提交打印任务。',scope:'状态与材料预览／出纸待验收',command:'打印机状态'}
  ];
  for(const item of devices){const card=document.createElement('article');card.className='device-card';const icon=document.createElement('span');icon.className='device-icon';icon.setAttribute('aria-hidden','true');icon.textContent=item.icon;const title=document.createElement('h2');title.textContent=item.title;const description=document.createElement('p');description.textContent=item.description;const tag=document.createElement('span');tag.className='tag';tag.textContent=item.scope;const preview=document.createElement('div');preview.className='command-preview';preview.textContent=item.command;const button=document.createElement('button');button.className='text-button';button.type='button';button.textContent='准备指令 →';button.dataset.command=item.command;card.append(icon,title,description,tag,preview,button);document.querySelector('#home-commands').append(card);}
  const tasks=[];let nextTask=1;
  const taskInput=document.querySelector('#task-input');
  function renderTasks(){const list=document.querySelector('#task-list');list.replaceChildren();document.querySelector('#task-empty').hidden=tasks.length>0;document.querySelector('#task-count').textContent=tasks.filter(t=>!t.done).length+' 项待办';for(const task of tasks){const li=document.createElement('li');if(task.done)li.className='done';const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=task.done;check.setAttribute('aria-label','完成：'+task.text);check.addEventListener('change',()=>{task.done=check.checked;renderTasks();const newCheck=document.querySelector('[data-task-id="'+task.id+'"] input');newCheck?.focus();});const text=document.createElement('span');text.textContent=task.text;label.append(check,text);const remove=document.createElement('button');remove.className='task-delete';remove.type='button';remove.textContent='移除';remove.setAttribute('aria-label','移除：'+task.text);remove.addEventListener('click',()=>{tasks.splice(tasks.indexOf(task),1);renderTasks();taskInput.focus();});li.dataset.taskId=task.id;li.append(label,remove);list.append(li);}}
  function addTask(){const value=taskInput.value.trim();if(!value){taskInput.focus();notify('写下这页要整理的一项任务。');return;}if(tasks.length>=30){notify('临时清单最多 30 项，请先整理已有任务。');return;}tasks.push({id:nextTask++,text:value.slice(0,180),done:false});taskInput.value='';renderTasks();taskInput.focus();}
  document.querySelector('#task-add').addEventListener('click',addTask);taskInput.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing){event.preventDefault();addTask();}});renderTasks();
  const dialog=document.querySelector('#search-dialog'),searchInput=document.querySelector('#search-input'),results=document.querySelector('#search-results');
  const entries=[...Object.entries(names).map(([key,label])=>({label,kind:'工作区',keywords:key,run:()=>navigate(key)})),...memoryCommands,...taskCommands,...devices].map(item=>item.run?item:{label:item.title,kind:'示例指令',keywords:item.description+' '+item.command,run:()=>{commandText.value=item.command;navigate('overview');setTimeout(()=>commandText.focus(),30);}});
  function search(){const query=searchInput.value.trim().toLowerCase();results.replaceChildren();const found=entries.filter(item=>(item.label+' '+item.keywords).toLowerCase().includes(query)).slice(0,12);if(!found.length){const empty=document.createElement('p');empty.className='search-empty';empty.textContent='没有找到。试试“研究”“待办”或“打印”。';results.append(empty);return;}for(const item of found){const button=document.createElement('button');button.type='button';button.className='search-result';const label=document.createElement('span');label.textContent=item.label;const kind=document.createElement('small');kind.textContent=item.kind+' ↗';button.append(label,kind);button.addEventListener('click',()=>{dialog.close();item.run();});results.append(button);}}
  function openSearch(){if(dialog.open)return;searchInput.value='';search();dialog.showModal();searchInput.focus();}
  document.querySelector('#search-open').addEventListener('click',openSearch);document.querySelector('#search-close').addEventListener('click',()=>dialog.close());searchInput.addEventListener('input',search);searchInput.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('button')?.focus();}if(event.key==='Enter'){event.preventDefault();results.querySelector('button')?.click();}});
  document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
