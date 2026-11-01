/* ==========================================================================
   Alliance Properties — cœur du site public
   Données (Supabase), dessins d'architecture, en-tête, transitions de pages,
   moteur de défilement, formulaires. Aucune dépendance externe.
   ========================================================================== */
(function(){
'use strict';
const C=window.SITE_CONFIG||{};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const AP=window.AP={C,$,$$,esc,clamp,reduce,fine};
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
AP.store=store;

/* ---------- formats ---------- */
const nf=new Intl.NumberFormat('fr-FR');
AP.fmt=n=>nf.format(n);
AP.rooms=n=>String(n).replace('.',',');
AP.priceHTML=l=>l.price?`${nf.format(l.price)}&nbsp;₪${l.type==='location'?'<small>par mois</small>':''}`:'Prix sur demande';
AP.priceText=l=>l.price?`${nf.format(l.price)} ₪${l.type==='location'?' par mois':''}`:'Prix sur demande';
AP.photos=l=>Array.isArray(l.photos)?l.photos.filter(Boolean):[];
AP.place=l=>[l.address,l.city].filter(Boolean).join(', ')||'Israël';
AP.url=l=>'bien.html?id='+encodeURIComponent(l.id);

/* ---------- données ---------- */
let _data=null;
function normalize(arr){return (arr||[]).map(x=>Object.assign({},x,{price:x.price==null?null:Number(x.price),rooms:x.rooms==null?null:Number(x.rooms)}))}
async function viaRest(){
  const u=C.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/listings?select=*&published=eq.true&order=featured.desc,created_at.desc';
  const r=await fetch(u,{headers:{apikey:C.SUPABASE_ANON_KEY,Accept:'application/json'}});
  if(!r.ok)throw new Error('REST '+r.status);
  return r.json();
}
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
async function viaClient(){
  if(!window.supabase)await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  const sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
  const {data,error}=await sb.from('listings').select('*').eq('published',true).order('featured',{ascending:false}).order('created_at',{ascending:false});
  if(error)throw error;return data;
}
AP.live=!!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY);
AP.load=function(){
  if(_data)return _data;
  _data=(async()=>{
    if(!AP.live){
      return normalize((window.SEED||[]).map((s,i)=>Object.assign({id:'demo'+i,created_at:new Date(Date.now()-i*1000).toISOString(),published:true},s)));
    }
    try{
      const c=sessionStorage.getItem('ap-biens');
      if(c){const j=JSON.parse(c);if(Date.now()-j.t<60000)return normalize(j.d)}
    }catch(e){}
    let d;
    try{d=await viaRest()}catch(e1){console.warn('REST',e1);d=await viaClient()}
    try{sessionStorage.setItem('ap-biens',JSON.stringify({t:Date.now(),d}))}catch(e){}
    return normalize(d);
  })();
  return _data;
};

/* ---------- dessins d'architecture ---------- */
function rng(str){
  let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}
  return function(){h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
}
const f1=n=>Math.round(n*10)/10;
let UID=0;
function S(R,anim,wd0){
  const rect=(x,y,w,h,c,x2)=>`<rect class="${c}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" pathLength="1"${x2||''}/>`;
  const path=(d,c)=>`<path class="${c}" d="${d}" pathLength="1"/>`;
  const win=(x,y,w,h,p,arch)=>{
    const lit=R()<p,tw=lit&&R()<.28;
    const st=anim?` style="--wd:${f1(wd0+R()*2.4)}s;--o:${f1(.55+R()*.45)};--d:${f1(R()*5)}s"`:` style="--o:${f1(.55+R()*.45)};--d:${f1(R()*5)}s"`;
    const cl=`w${lit?' on':''}${tw?' tw':''}`;
    if(arch){const r=w/2;return `<path class="${cl}" d="M${f1(x)} ${f1(y+h)}V${f1(y+r)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x+w)} ${f1(y+r)}V${f1(y+h)}Z"${st}/>`}
    return `<rect class="${cl}" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"${st}/>`;
  };
  /* chauffe-eau solaire : détail des toits israéliens */
  const solaire=(x,top)=>{
    const o=R()<.5?0:1;
    return path(`M${f1(x)} ${f1(top)}l4 -11h24l-4 11M${f1(x+14)} ${f1(top-11)}l-2 11M${f1(x+8)} ${f1(top-11)}l-1.5 11`,'s')+
      `<rect class="s" x="${f1(x+(o?32:-22))}" y="${f1(top-10)}" width="18" height="8" rx="4" pathLength="1"/>`+
      path(`M${f1(x+(o?32:-22)+9)} ${f1(top-2)}V${f1(top)}`,'s');
  };
  const bauhaus=(x,gy,w,h,pl)=>{
    const top=gy-h,fl=Math.max(2,Math.floor(h/34)),fh=h/fl,cols=Math.max(2,Math.floor((w-8)/24)),cw=(w-8)/cols;
    let o=`<rect class="b" x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="2" pathLength="1"/>`;
    for(let i=0;i<fl;i++){
      const y=top+i*fh;
      if(i>0&&R()<.65)o+=path(`M${f1(x-5)} ${f1(y)}H${f1(x+w+5)}`,'d');
      for(let j=0;j<cols;j++)o+=win(x+4+j*cw+cw*.18,y+fh*.26,cw*.64,fh*.48,pl);
    }
    o+=path(`M${f1(x-3)} ${f1(top)}H${f1(x+w+3)}`,'d');
    if(R()<.75)o+=solaire(x+w*(.25+R()*.3),top);
    if(R()<.3)o+=path(`M${f1(x+w*.8)} ${f1(top)}V${f1(top-16)}`,'s');
    return o;
  };
  const pierre=(x,gy,w,h,pl)=>{
    const top=gy-h,fl=Math.max(2,Math.floor(h/38)),fh=h/fl,cols=Math.max(2,Math.floor((w-8)/26)),cw=(w-8)/cols;
    let o=rect(x,top,w,h,'b');
    for(let i=0;i<fl;i++){
      const y=top+i*fh;
      for(let j=0;j<cols;j++)o+=win(x+4+j*cw+cw*.22,y+fh*.2,cw*.56,fh*.62,pl,true);
      if(i>0)o+=path(`M${f1(x)} ${f1(y)}H${f1(x+w)}`,'s');
    }
    o+=path(`M${f1(x-2)} ${f1(top)}H${f1(x+w+2)}M${f1(x-2)} ${f1(top+4)}H${f1(x+w+2)}`,'d');
    if(R()<.4){const cx=x+w/2,r=Math.min(w*.3,26);o+=path(`M${f1(cx-r)} ${f1(top)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(cx+r)} ${f1(top)}M${f1(cx)} ${f1(top-r)}V${f1(top-r-9)}`,'d')}
    else if(R()<.6)o+=solaire(x+w*(.2+R()*.4),top);
    return o;
  };
  const tour=(x,gy,w,h,pl)=>{
    const top=gy-h;
    let o=rect(x,top,w,h,'b');
    for(let k=1;k<5;k++)o+=path(`M${f1(x+w*k/5)} ${f1(top+6)}V${f1(gy)}`,'s');
    const fl=Math.floor(h/16),cols=4;
    for(let i=1;i<fl;i++)for(let j=0;j<cols;j++)if(R()<pl*1.1)o+=win(x+w*(j+.28)/cols,top+i*16,w/cols*.44,6,1);
    o+=rect(x+w*.14,top-18,w*.72,18,'b')+path(`M${f1(x+w*.5)} ${f1(top-18)}V${f1(top-46-R()*14)}`,'d');
    return o;
  };
  const cypres=(x,gy,h)=>`<path class="b" d="M${f1(x)} ${f1(gy)}C${f1(x-h*.12)} ${f1(gy-h*.3)} ${f1(x-h*.1)} ${f1(gy-h*.75)} ${f1(x)} ${f1(gy-h)}C${f1(x+h*.1)} ${f1(gy-h*.75)} ${f1(x+h*.12)} ${f1(gy-h*.3)} ${f1(x)} ${f1(gy)}Z" pathLength="1"/>`;
  const arbre=(x,gy,r)=>path(`M${f1(x)} ${f1(gy)}V${f1(gy-r*1.2)}`,'s')+`<circle class="b" cx="${f1(x)}" cy="${f1(gy-r*1.9)}" r="${f1(r)}" pathLength="1"/>`;
  const villa=(x,gy,w,pl)=>{
    const h1=w*.2,h2=w*.17,x2=x+w*.34,w2=w*.62;
    let o=rect(x,gy-h1,w*.78,h1,'b');
    o+=rect(x2,gy-h1-h2,w2,h2,'b');
    o+=path(`M${f1(x-8)} ${f1(gy-h1-2)}H${f1(x+w*.78+8)}M${f1(x2-10)} ${f1(gy-h1-h2-2)}H${f1(x2+w2+10)}`,'d');
    // grandes baies vitrées
    const bw=w*.46,bx=x+w*.05;
    o+=`<rect class="w on" x="${f1(bx)}" y="${f1(gy-h1+h1*.2)}" width="${f1(bw)}" height="${f1(h1*.6)}" style="--o:.85;--wd:${f1(wd0+.4)}s"/>`;
    for(let k=1;k<7;k++)o+=path(`M${f1(bx+bw*k/7)} ${f1(gy-h1+h1*.2)}V${f1(gy-h1+h1*.8)}`,'s');
    const bx2=x2+w2*.1,bw2=w2*.56;
    o+=`<rect class="w${R()<.6?' on':''}" x="${f1(bx2)}" y="${f1(gy-h1-h2+h2*.22)}" width="${f1(bw2)}" height="${f1(h2*.56)}" style="--o:.8;--wd:${f1(wd0+.8)}s"/>`;
    for(let k=1;k<5;k++)o+=path(`M${f1(bx2+bw2*k/5)} ${f1(gy-h1-h2+h2*.22)}V${f1(gy-h1-h2+h2*.78)}`,'s');
    o+=win(x+w*.58,gy-h1+h1*.3,w*.1,h1*.4,.5);
    o+=solaire(x2+w2*.7,gy-h1-h2);
    return o;
  };
  const piscine=(x,gy,w)=>{
    let o=`<rect class="eau" x="${f1(x)}" y="${f1(gy+6)}" width="${f1(w)}" height="${f1(w*.1)}" rx="2" pathLength="1"/>`;
    for(let k=1;k<4;k++)o+=path(`M${f1(x+w*.08)} ${f1(gy+6+w*.1*k/4)}q${f1(w*.07)} -3 ${f1(w*.14)} 0t${f1(w*.14)} 0t${f1(w*.14)} 0t${f1(w*.14)} 0`,'s');
    return o;
  };
  return {rect,path,win,bauhaus,pierre,tour,cypres,arbre,villa,piscine,solaire};
}

/* ligne d'horizon de la ville : plusieurs plans qui se déplacent à des vitesses différentes */
AP.cityScene=function({w=1600,h=640,seed='ville',anim=true,mood=''}={}){
  const R=rng(seed),K=S(R,anim,2.3);
  const layers=[
    {k:.32,a:.28,fa:.55,hMin:.14,hMax:.34,wMin:34,wMax:78,gap:[6,26],lit:.12,gy:h-10},
    {k:.18,a:.5,fa:.82,hMin:.2,hMax:.52,wMin:50,wMax:110,gap:[2,18],lit:.22,gy:h-4},
    {k:.07,a:.85,fa:.96,hMin:.16,hMax:.66,wMin:90,wMax:190,gap:[10,60],lit:.34,gy:h+2}
  ];
  let g='',idx=0;
  layers.forEach((L,li)=>{
    let x=-40+R()*30,body='';
    while(x<w+40){
      const bw=L.wMin+R()*(L.wMax-L.wMin),bh=h*(L.hMin+R()*(L.hMax-L.hMin));
      const t=R();
      let el;
      if(li===2&&t<.12)el=K.villa(x,L.gy,bw*1.1,L.lit)+K.cypres(x+bw*1.15,L.gy,bh*.35);
      else if(t<.5)el=K.bauhaus(x,L.gy,bw,bh,L.lit);
      else if(t<.78)el=K.pierre(x,L.gy,bw,bh*.8,L.lit);
      else el=K.tour(x,L.gy,Math.min(bw,80),bh*1.05,L.lit);
      body+=`<g style="--d:${f1(.15+idx*.045)}s">${el}</g>`;idx++;
      x+=bw+L.gap[0]+R()*(L.gap[1]-L.gap[0]);
      if(li===2&&R()<.25){body+=K.cypres(x+6,L.gy,h*(.14+R()*.1));x+=22}
    }
    g+=`<g class="ly" data-k="${L.k}" style="--a:${L.a};--fa:${L.fa}">${body}</g>`;
  });
  g+=`<path class="sol-l" d="M0 ${h-1}H${w}"/>`;
  return `<svg class="sc${anim?' trace':''}${mood==='glace'?' glace':''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${g}</svg>`;
};

/* profondeur : les plans du dessin bougent à des vitesses différentes (défilement + souris) */
AP.layers=function(root,{scroll=1,mouse=true,off:offFn}={}){
  const gs=$$('.ly',root);if(!gs.length||reduce)return;
  let mx=0,cx=0,vis=true;
  if(mouse&&fine)addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5},{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(root);
  AP.loop((y,dy,dt)=>{
    if(!vis)return;
    cx+=(mx-cx)*Math.min(1,dt*3.2);
    const off=offFn?offFn():Math.max(0,-root.getBoundingClientRect().top)*scroll;
    gs.forEach(g=>{const k=+g.dataset.k;g.style.transform=`translate3d(${f1(cx*(.42-k)*70)}px,${f1(off*k*1.6)}px,0)`});
  });
};

/* dessin propre à chaque bien (utilisé tant qu'il n'y a pas de photo) */
AP.homeScene=function(l,{w=800,h=600}={}){
  const id='s'+(++UID),rent=l.type==='location';
  const a=rent?'#f6f2ea':'#f1ece2',b=rent?'#e6dfd0':'#ded6c5';
  return `<svg class="sc ph" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/><text x="50%" y="50%" text-anchor="middle" font-size="${Math.round(w/38)}" letter-spacing="${Math.round(w/200)}" fill="#8c8474" font-family="Instrument Sans,Inter,Arial,sans-serif">PHOTOS À VENIR</text></svg>`;
};

/* ---------- média d'un bien : photo ou dessin ---------- */
AP.media=(l,opt)=>{
  const ph=AP.photos(l);
  return ph[0]?`<img loading="lazy" decoding="async" src="${esc(ph[0])}" alt="${esc(l.title)}">`:AP.homeScene(l,opt);
};

/* ---------- carte de bien ---------- */
const ic={arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6C20.5 15 12 20.5 12 20.5z"/></svg>'};
AP.icon=ic;
AP.favs=()=>new Set(store.get('ap-fav',[]).map(String));
AP.cotes=l=>{
  const s=[];
  if(l.area)s.push(`<li><b>${l.area}</b> <span>m²</span></li>`);
  if(l.rooms)s.push(`<li><b>${AP.rooms(l.rooms)}</b> <span>pièces</span></li>`);
  if(l.bedrooms)s.push(`<li><b>${l.bedrooms}</b> <span>chambre${l.bedrooms>1?'s':''}</span></li>`);
  if(l.floor)s.push(`<li><span>étage</span> <b>${esc(l.floor)}</b></li>`);
  return s.join('')||'<li><span>Détails sur demande</span></li>';
};
AP.tag=l=>`<span class="etiq${l.type==='location'?' loc':''}">${l.type==='location'?'À louer':'À vendre'}</span>`;
AP.card=(l,i,fav,variant)=>`<article class="bien ${variant||''}" data-id="${esc(l.id)}">
  <div class="bien-media"><div class="inner">${AP.media(l)}</div>${AP.tag(l)}<span class="reflet"></span>
    <a class="bien-lien" href="${AP.url(l)}" aria-label="${esc(l.title)} : voir le bien"></a></div>
  <button class="fav" type="button" aria-pressed="${fav&&fav.has(String(l.id))?'true':'false'}" aria-label="Garder ${esc(l.title)} dans mes favoris">${ic.heart}</button>
  <div class="bien-txt"><h3>${esc(l.title)}</h3><p class="lieu">${esc(AP.place(l))}</p><p class="prix num">${AP.priceHTML(l)}</p>
    <ul class="cotes num">${AP.cotes(l)}</ul></div></article>`;

/* effets sur les cartes (reflet + inclinaison) et favoris */
AP.bindCards=function(root){
  root.addEventListener('click',e=>{
    const b=e.target.closest('.fav');if(!b)return;
    const id=b.closest('.bien').dataset.id,set=AP.favs();
    if(set.has(id)){set.delete(id);b.setAttribute('aria-pressed','false')}else{set.add(id);b.setAttribute('aria-pressed','true')}
    store.set('ap-fav',[...set]);
    root.dispatchEvent(new CustomEvent('favchange',{bubbles:true}));
  });
  if(!fine||reduce)return;
  root.addEventListener('pointermove',e=>{
    const m=e.target.closest('.bien-media');if(!m)return;
    const r=m.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    m.style.setProperty('--gx',x*100+'%');m.style.setProperty('--gy',y*100+'%');
  });
};

/* ---------- description : paragraphes + listes ---------- */
AP.prose=txt=>{
  const out=[];let ul=null;
  String(txt||'').split(/\r?\n/).map(s=>s.trim()).forEach(line=>{
    if(!line){ul=null;return}
    if(/^[•\-–]\s*/.test(line)){if(!ul){ul=[];out.push(ul)}ul.push(line.replace(/^[•\-–]\s*/,''))}
    else{ul=null;out.push(line)}
  });
  return out.map(x=>Array.isArray(x)?`<ul>${x.map(i=>`<li><span>${esc(i)}</span></li>`).join('')}</ul>`:`<p>${esc(x)}</p>`).join('');
};

/* ---------- coordonnées de l'agence ---------- */
AP.hydrate=function(){
  $$('[data-ap="licence"]').forEach(e=>e.textContent=C.AGENT_LICENSE||'');
  $$('[data-ap="phone-t"]').forEach(e=>e.textContent=C.PHONE||'');
  $$('[data-ap="mail-t"]').forEach(e=>e.textContent=C.EMAIL||'');
  $$('[data-ap="annee"]').forEach(e=>e.textContent=new Date().getFullYear());
  const tel=C.PHONE?'tel:'+C.PHONE.replace(/[^\d+]/g,''):'';
  $$('[data-ap="phone"]').forEach(e=>{if(!C.PHONE){e.hidden=true;return}e.href=tel;if(!e.hasAttribute('data-keep'))e.textContent=C.PHONE});
  $$('[data-ap="mail"]').forEach(e=>{if(!C.EMAIL){e.hidden=true;return}e.href='mailto:'+C.EMAIL;if(!e.hasAttribute('data-keep'))e.textContent=C.EMAIL});
  $$('[data-ap="wa"]').forEach(e=>{if(!C.WHATSAPP){e.hidden=true;return}const t=e.dataset.text;e.href='https://wa.me/'+C.WHATSAPP+(t?'?text='+encodeURIComponent(t):'');e.target='_blank';e.rel='noopener'});
  const wa=$('#wa');if(wa&&C.WHATSAPP){wa.href='https://wa.me/'+C.WHATSAPP;wa.style.display='grid'}
};

/* ---------- formulaire (FormSubmit : e-mail, compatible GitHub Pages) ---------- */
AP.bindForm=function(form,getBien){
  const msg=$('.retour',form);
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=form.querySelector('button[type=submit]');
    if(!form.reportValidity())return;
    if(form._honey&&form._honey.value)return;
    const dest=C.CONTACT_EMAIL||C.EMAIL;
    msg.className='retour';
    if(!dest){msg.className='retour ko';msg.textContent='Le formulaire n\'est pas configuré. Appelez-nous ou écrivez-nous sur WhatsApp.';return}
    btn.disabled=true;msg.textContent='Envoi en cours…';
    try{
      const body={_subject:'Nouveau message depuis le site Alliance Properties',_captcha:'false',_template:'table',
        nom:form.nom.value,telephone:form.telephone?form.telephone.value:'',email:form.email.value,_replyto:form.email.value,
        bien:getBien?getBien():(form.bien?form.bien.value:''),message:form.message.value};
      const r=await fetch('https://formsubmit.co/ajax/'+encodeURIComponent(dest),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body)});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||j.success==='false')throw new Error(j.message||r.status);
      msg.className='retour ok';msg.textContent='Message envoyé. Nous vous répondons très vite.';form.reset();
    }catch(err){
      msg.className='retour ko';msg.textContent='L\'envoi a échoué. Appelez-nous ou écrivez-nous sur WhatsApp.';
    }
    btn.disabled=false;
  });
};

/* ---------- sélecteur segmenté (curseur qui glisse) ---------- */
AP.seg=function(el){
  const th=$('.thumb',el);if(!th)return;
  const place=()=>{
    const c=$('input:checked',el);if(!c)return;
    const lb=c.nextElementSibling;
    th.style.width=lb.offsetWidth+'px';
    th.style.transform=`translateX(${lb.offsetLeft-5}px)`;
  };
  el.addEventListener('change',place);
  addEventListener('resize',place);
  requestAnimationFrame(place);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
  return place;
};

/* ---------- moteur de défilement ---------- */
const loops=[];
AP.loop=fn=>loops.push(fn);
let sy=scrollY,last=performance.now();
function frame(t){
  const dt=Math.min(.05,(t-last)/1000);last=t;
  const y=scrollY,dy=y-sy;sy=y;
  for(let i=0;i<loops.length;i++)loops[i](y,dy,dt,t);
  requestAnimationFrame(frame);
}
AP.vh=()=>innerHeight;

/* apparitions : seulement titres, traits et quelques blocs */
function reveals(){
  const els=$$('.masque,.fondu,.monte,.cote');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('vu'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vu');io.unobserve(e.target)}}),{threshold:.2,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>{if(e.dataset.delay)e.style.transitionDelay=e.dataset.delay;io.observe(e)});
}

/* effet magnétique sur les boutons */
function magnets(){
  if(!fine||reduce)return;
  $$('.mag').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${f1(x*.16)}px,${f1(y*.28)}px)`;
    });
    el.addEventListener('pointerleave',()=>{el.style.transform=''});
  });
}

/* en-tête */
function header(){
  const h=$('.entete');if(!h)return;
  let prev=scrollY;
  AP.loop(y=>{
    const d=y-prev;
    if(y>260&&d>8&&!document.body.classList.contains('menu-ouvert'))h.classList.add('cache');
    else if(d<-6||y<200)h.classList.remove('cache');
    prev=y;
  });
  const nav=$('.nav',h),pill=$('.pill',nav);
  if(nav&&pill&&fine){
    const move=a=>{pill.style.opacity=1;pill.style.width=a.offsetWidth+'px';pill.style.transform=`translateX(${a.offsetLeft}px)`};
    $$('a',nav).forEach(a=>{a.addEventListener('pointerenter',()=>move(a));a.addEventListener('focus',()=>move(a))});
    nav.addEventListener('pointerleave',()=>{pill.style.opacity=0});
  }
  const b=$('.burger');
  if(b){
    const set=o=>{document.body.classList.toggle('menu-ouvert',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu');$('.feuille').toggleAttribute('inert',!o)};
    b.addEventListener('click',()=>set(!document.body.classList.contains('menu-ouvert')));
    addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
    $('.feuille').addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
    $('.feuille').setAttribute('inert','');
  }
}


/* ---------- lumière vivante : un ciel de bord de mer rendu en WebGL ---------- */
AP.mouse={x:.5,y:.5};
if(fine)addEventListener('pointermove',e=>{AP.mouse.x=e.clientX/innerWidth;AP.mouse.y=1-e.clientY/innerHeight},{passive:true});
const VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FS=`precision mediump float;
uniform vec2 r,m;uniform float t,k,dim,rise,sx,p;
float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 q){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(q);q=q*2.03+vec2(5.2,1.3);a*=.5;}return v;}
vec3 ramp(float y,float k){
  vec3 a0=vec3(1.,.87,.64),a1=vec3(.93,.64,.46),a2=vec3(.64,.45,.34),a3=vec3(.31,.21,.155),a4=vec3(.165,.11,.08);
  vec3 b0=vec3(1.,.975,.91),b1=vec3(.93,.84,.68),b2=vec3(.72,.58,.43),b3=vec3(.40,.29,.21),b4=vec3(.18,.12,.09);
  vec3 A=mix(a0,a1,smoothstep(0.,.22,y));A=mix(A,a2,smoothstep(.16,.46,y));A=mix(A,a3,smoothstep(.4,.74,y));A=mix(A,a4,smoothstep(.7,1.,y));
  vec3 B=mix(b0,b1,smoothstep(0.,.22,y));B=mix(B,b2,smoothstep(.16,.46,y));B=mix(B,b3,smoothstep(.4,.74,y));B=mix(B,b4,smoothstep(.7,1.,y));
  return mix(A,B,k);
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 q=vec2(uv.x*asp,uv.y);
  float w1=fbm(q*1.5+vec2(t*.04,-t*.025));
  float w2=fbm(q*2.6+vec2(-t*.03,t*.05)+w1*1.8);
  float y=clamp(uv.y*.92+(w1-.5)*.34+(w2-.5)*.12+(m.y-.5)*.04,0.,1.);
  vec3 c=mix(ramp(y,k),vec3(.165,.11,.08),dim);
  vec2 sp=vec2(sx+(m.x-.5)*.05,mix(-.18,.2,rise)+p*.12);
  vec2 dd=(uv-sp)*vec2(asp,1.);float d=length(dd);
  c+=vec3(1.,.72,.42)*exp(-d*3.2)*.5*(1.-k*.4)+vec3(1.,.9,.7)*exp(-d*9.)*.5;
  float ray=fbm(vec2(atan(dd.y,dd.x)*3.+t*.05,d*.6));
  c+=vec3(1.,.8,.6)*ray*exp(-d*2.2)*.13;
  c=mix(c,vec3(1.,.97,.86),smoothstep(.066,.058,d)*(1.-k*.15));
  c+=(h(gl_FragCoord.xy+fract(t))-.5)*.035;
  gl_FragColor=vec4(c,1.);
}`;
AP.light=function(cv,o={}){
  const S=Object.assign({k:0,dim:0,rise:1,sx:.5,p:0,q:.62,fps:45},o);
  let gl=null;try{gl=cv.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'})}catch(e){}
  if(!gl){cv.classList.add('sans-gl');return S}
  const sh=(ty,src)=>{const x=gl.createShader(ty);gl.shaderSource(x,src);gl.compileShader(x);return x};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){cv.classList.add('sans-gl');return S}
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const at=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
  const U={};['r','m','t','k','dim','rise','sx','p'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
  let W=0,H=0,vis=true,last=0,t0=Math.random()*40;
  const size=()=>{const dpr=Math.min(devicePixelRatio||1,1.5)*S.q,w=Math.max(2,Math.round(cv.clientWidth*dpr)),h=Math.max(2,Math.round(cv.clientHeight*dpr));if(w!==W||h!==H){W=cv.width=w;H=cv.height=h;gl.viewport(0,0,w,h)}};
  S.draw=sec=>{
    size();
    gl.uniform2f(U.r,W,H);gl.uniform2f(U.m,AP.mouse.x,AP.mouse.y);
    gl.uniform1f(U.t,(t0+sec)%900);gl.uniform1f(U.k,S.k);gl.uniform1f(U.dim,S.dim);gl.uniform1f(U.rise,S.rise);gl.uniform1f(U.sx,S.sx);gl.uniform1f(U.p,S.p);
    gl.drawArrays(gl.TRIANGLES,0,3);
  };
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)S.draw(performance.now()/1000)},{rootMargin:'80px'}).observe(cv);
  if(reduce){S.draw(6);addEventListener('resize',()=>S.draw(6));return S}
  AP.loop((y,dy,dt,t)=>{if(!vis||document.hidden||t-last<1000/S.fps)return;last=t;S.draw(t/1000)});
  return S;
};

/* le teint des zones claires change du matin au soir pendant le défilement */
function dayCycle(){
  if(reduce)return;
  const root=document.documentElement;let prev=-1;
  AP.loop(y=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),d=Math.round(clamp(y/max,0,1)*200)/200;
    if(d!==prev){prev=d;root.style.setProperty('--day',d)}
  });
}

/* le grand mot du pied de page s'ajuste à la largeur */
function fitGrand(){
  const g=$('#grand');if(!g)return;
  const fit=()=>{g.style.width='max-content';g.style.fontSize='100px';const w=g.parentElement.clientWidth,sw=g.getBoundingClientRect().width;if(sw>0)g.style.fontSize=Math.floor(100*w/sw*.995)+'px'};
  fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);addEventListener('resize',fit);
  if(fine&&!reduce)g.parentElement.addEventListener('pointermove',e=>{const r=g.getBoundingClientRect();g.style.setProperty('--mx',clamp((e.clientX-r.left)/r.width*100,0,100)+'%')});
}

AP.ready=function(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()};
AP.ready(()=>{
  AP.hydrate();
  header();reveals();magnets();fitGrand();dayCycle();
  $$('.seg').forEach(AP.seg);
  requestAnimationFrame(frame);
});
})();
