// Town as homepage: full-screen town, identity card, camera + side panel, text-view toggle (runs after town.js)
(() => {
  const town=document.getElementById('town'), map=document.getElementById('town-map');
  const dialog=document.getElementById('town-dialog'), panel=document.getElementById('town-dialog-content');
  if(!town||!map) return;
  const body=document.body, KEY='homepage-view';
  let mode=(()=>{try{return localStorage.getItem(KEY)}catch(e){return null}})()||'town';
  const q=new URLSearchParams(location.search).get('view'); if(q) mode=q;

  // ---- Identity card (built from the sidebar, which stays the single source)
  const card=document.createElement('aside'); card.className='home-card';
  const av=document.querySelector('.author__avatar img'), name=document.querySelector('.author__name')?.textContent.trim();
  const bio=document.querySelector('.author__bio')?.textContent.trim();
  const links=[...document.querySelectorAll('.author__urls li a')].map(a=>`<a href="${a.href}" ${a.target?'target="_blank" rel="noopener"':''}>${a.querySelector('i')?.outerHTML||''}<span>${a.textContent.trim()}</span></a>`).join('');
  const tags=document.querySelector('.ri-tags')?.outerHTML||'';
  card.innerHTML=`<div class="hc-top"><img src="${av?.src}" alt=""><div><h1>${name}</h1><p>${bio||''}</p></div></div>
    <div class="hc-links">${links}</div>${tags}`;
  const latest=document.querySelectorAll('h1#news + ul > li:nth-child(-n+3)');
  if(latest.length){
    const news=document.createElement('button');
    news.type='button'; news.className='hc-news';
    news.innerHTML='<span>News</span><span class="hc-news-list"></span>';
    for(const item of latest){
      const row=document.createElement('span');
      row.className='hc-news-item';
      const text=item.textContent.trim();
      const parts=text.match(/^(\d{4}\.\d{2})\s*:?\s*(.+)$/s);
      if(parts){
        const date=document.createElement('span');
        date.className='hc-news-date';
        date.textContent=parts[1];
        const headline=document.createElement('span');
        headline.className='hc-news-headline';
        headline.textContent=parts[2];
        row.append(date,headline);
      } else row.textContent=text;
      news.lastElementChild.append(row);
    }
    news.setAttribute('aria-haspopup','dialog');
    news.setAttribute('aria-controls',dialog.id);
    news.addEventListener('click',()=>go('news'));
    card.append(news);
  }
  town.append(card);

  // ---- View toggle in the masthead
  const toggle=document.createElement('button'); toggle.type='button'; toggle.className='view-toggle';
  document.querySelector('.masthead__menu').append(toggle);
  function setMode(m){mode=m; body.classList.toggle('town-home',m==='town'); toggle.textContent=m==='town'?'Text view':'Town view';
    try{localStorage.setItem(KEY,m)}catch(e){} if(m!=='town') closePanel(true);}
  toggle.addEventListener('click',()=>setMode(mode==='town'?'text':'town'));

  // ---- Dialog becomes a side panel in town mode; camera flies to the building
  const nativeModal=dialog.showModal.bind(dialog);
  dialog.showModal=()=>{ if(body.classList.contains('town-home')) dialog.show(); else nativeModal(); };
  function camera(id){
    const b=map.querySelector(`.town-building[data-module="${id}"]`);
    if(!b||!body.classList.contains('town-home')){map.style.transform='';return;}
    const mobile=matchMedia('(max-width: 700px)').matches;
    const s=mobile?1.45:1.5;
    const mr=map.getBoundingClientRect(), br=b.getBoundingClientRect();
    const cur=new DOMMatrixReadOnly(getComputedStyle(map).transform);
    const bx=(br.left+br.width/2-mr.left)/cur.a, by=(br.top+br.height*.55-mr.top)/cur.d; // building centre in un-zoomed map px
    const W=innerWidth, H=innerHeight, panelW=mobile?0:Math.min(640,W*.44);
    const tx=mobile?W/2:(W-panelW)/2, ty=mobile?H*.26:H*.52;
    const ox=map.offsetLeft+map.offsetParent.getBoundingClientRect().left, oy=map.offsetTop+map.offsetParent.getBoundingClientRect().top;
    map.style.transformOrigin='0 0';
    map.style.transform=`translate(${tx-ox-bx*s}px, ${ty-oy-by*s}px) scale(${s})`;
    map.querySelectorAll('.town-building').forEach(x=>x.classList.toggle('is-focus',x===b));
    map.classList.add('is-zoomed');
  }
  function resetCamera(){
    if(map.classList.contains('is-zoomed')){
      // Sample the current translation so an interrupted zoom gets a shorter return.
      const pose=new DOMMatrixReadOnly(getComputedStyle(map).transform);
      const travel=Math.hypot(pose.e,pose.f)/Math.max(1,innerWidth);
      const duration=440+Math.round(200*Math.min(1,Math.max(0,(travel-.15)/.7)));
      map.style.setProperty('--town-return-time',duration+'ms');
    }
    map.style.transform='';
    map.classList.remove('is-zoomed');
    map.querySelectorAll('.is-focus').forEach(x=>x.classList.remove('is-focus'));
  }
  function closePanel(silent){ if(dialog.open) dialog.close();
    if(!silent&&location.hash) history.pushState(null,'',location.pathname+location.search); }
  new MutationObserver(()=>{ if(panel.dataset.module&&dialog.open){ camera(panel.dataset.module);
      if(location.hash!=='#'+panel.dataset.module) history.pushState(null,'','#'+panel.dataset.module);} })
    .observe(panel,{attributes:true,attributeFilter:['data-module']});
  dialog.addEventListener('beforetoggle', e=>{
    if(e.newState==='closed') resetCamera();
  });
  dialog.addEventListener('close',()=>{
    if(dialog.open) return;
    if(map.classList.contains('is-zoomed')) resetCamera();
    if(body.classList.contains('town-home') && location.hash === '#' + panel.dataset.module)
      history.pushState(null,'',location.pathname+location.search);
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&dialog.open&&body.classList.contains('town-home')) closePanel(); });
  // clicking empty sky / ground closes the panel
  town.addEventListener('click',e=>{ if(!dialog.open||!body.classList.contains('town-home')) return;
    if(e.target.closest('.town-building,.town-label,.home-card,#town-dialog')) return; closePanel(); });

  function go(id){ map.querySelector(`.town-building[data-module="${id}"]`)?.click(); }
  // Nav links and back/forward
  window.addEventListener('click',e=>{ if(!body.classList.contains('town-home')) return;
    const a=e.target.closest('.masthead a'); if(!a||!a.hash) return;
    const id=a.hash.slice(1); if(!map.querySelector(`.town-building[data-module="${id}"]`)) return;
    e.preventDefault(); e.stopImmediatePropagation(); go(id); },true);
  window.addEventListener('popstate',()=>{ const id=location.hash.slice(1); if(id) go(id); else closePanel(true); });

  setMode(mode);
  const windmill = map.querySelector('.town-art-windmill');
  const tower = map.querySelector('.town-art-erasmus');
  const sky = town.querySelector('.town-sky');
  function fitSkyTracks() {
    if (!body.classList.contains('town-home') || map.classList.contains('is-zoomed')) return;
    const mobile = matchMedia('(max-width: 700px)').matches;
    const roof = (mobile ? tower : windmill).getBoundingClientRect().top;
    const skyTop = sky.getBoundingClientRect().top;
    const upperEdge = mobile ? card.getBoundingClientRect().bottom : document.querySelector('.masthead').getBoundingClientRect().bottom;
    for (const name of ['sun', 'moon']) {
      const clearance = sky.querySelector('.town-' + name).offsetHeight / 2 + 8;
      const high = upperEdge - skyTop + clearance;
      town.style.setProperty('--' + name + '-high', high + 'px');
      town.style.setProperty('--' + name + '-travel', Math.max(0, roof - skyTop - clearance - high) + 'px');
    }
  }
  const skyResize = new ResizeObserver(fitSkyTracks);
  for (const element of [map, town, card]) skyResize.observe(element);
  fitSkyTracks();
  // Deep link on load (town.js already opened some modules modally)
  const id=location.hash.slice(1);
  if(id&&body.classList.contains('town-home')){ if(dialog.open) dialog.close(); requestAnimationFrame(()=>go(id)); }
})();
