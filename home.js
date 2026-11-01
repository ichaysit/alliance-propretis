/* Accueil : l'arche s'ouvre, la recherche apparaît dans la lumière */
(function(){
'use strict';
const {$,$$,clamp,reduce,esc}=AP;
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};

AP.ready(async()=>{
  const hero=$('#haut'),arc=$('#arc'),terre=$('#terre'),flou=$('#terre-flou'),cons=$('#console');

  /* --- ouverture : la photo satellite d'Israël apparaît dans l'arche --- */
  setTimeout(()=>hero.classList.add('pret'),250);
  let pe=0;                               /* progression de l'ouverture (0 → 1) */

  /* la photo suit l'arche, puis se dégage pour montrer le pays (le flou prolonge les bords) */
  const RATIO=2743/1248, FOCUS=.35;       /* .35 = hauteur de Tel Aviv / Ra'anana sur l'image */
  function earth(bl,bt,bw,bh,k,w0){
    const vh=innerHeight;
    const wf=Math.max(vh*1.04/RATIO,Math.min(innerWidth*.84,vh/(.42*RATIO)));
    const w=Math.max(lerp(w0,wf,k),bh/RATIO);
    const ih=w*RATIO,off=clamp(ih*FOCUS-bh/2,0,Math.max(0,ih-bh));
    terre.style.width=w.toFixed(1)+'px';terre.style.height=ih.toFixed(1)+'px';
    terre.style.left=(bl+(bw-w)/2).toFixed(1)+'px';terre.style.top=(bt-off).toFixed(1)+'px';
    flou.style.top=(bt-off).toFixed(1)+'px';flou.style.height=ih.toFixed(1)+'px';
    flou.style.opacity=smooth(.1,.7,k).toFixed(3);
    arc.style.setProperty('--m',smooth(.2,.9,k).toFixed(3));
  }

  /* --- version épinglée : l'arche grandit jusqu'à remplir l'écran --- */
  let pinned=false;
  const geom={cl:.58,cr:.06,ct:.13};
  function setup(){
    const want=!reduce&&innerWidth>=900&&innerHeight>=560;
    hero.classList.toggle('epingle',want);pinned=want;
    if(want)hero.style.setProperty('--hh',Math.round(innerHeight*2.6)+'px');
    else{
      hero.style.removeProperty('--hh');
      ['--cl','--cr','--ct','--rad'].forEach(v=>arc.style.removeProperty(v));
      hero.style.removeProperty('--p');cons.style.removeProperty('--cs');cons.classList.remove('actif');pe=0;
      const w=arc.clientWidth;earth(0,0,w,arc.clientHeight,0,w);
    }
  }
  setup();addEventListener('resize',setup);
  AP.loop(()=>{
    if(!pinned)return;
    const r=hero.getBoundingClientRect(),span=hero.offsetHeight-innerHeight;
    const s=span>0?clamp(-r.top/span,0,1):0;
    pe=ease(clamp(s/.68,0,1));
    const vw=innerWidth,vh=innerHeight;
    const cl=lerp(geom.cl*vw,0,pe),cr=lerp(geom.cr*vw,0,pe),ct=lerp(geom.ct*vh,0,pe);
    const w=vw-cl-cr,rad=(w/2)*(1-smooth(.55,1,pe));
    arc.style.setProperty('--cl',cl.toFixed(1)+'px');arc.style.setProperty('--cr',cr.toFixed(1)+'px');
    arc.style.setProperty('--ct',ct.toFixed(1)+'px');arc.style.setProperty('--rad',rad.toFixed(1)+'px');
    hero.style.setProperty('--p',pe.toFixed(3));
    const cs=clamp((s-.6)/.26,0,1);
    cons.style.setProperty('--cs',cs.toFixed(3));cons.classList.toggle('actif',cs>.5);
    earth(cl,ct,w,vh-ct,pe,(1-geom.cl-geom.cr)*vw);
  });

  /* clavier : si la recherche reçoit le focus, on amène l'écran jusqu'à elle */
  cons.addEventListener('focusin',()=>{
    if(!pinned)return;
    const top=hero.getBoundingClientRect().top+scrollY+hero.offsetHeight-innerHeight;
    if(scrollY<top-4)scrollTo({top,behavior:'instant'});
  });

  /* --- données --- */
  let all=[];
  try{all=await AP.load()}catch(e){console.error(e)}

  /* console de recherche */
  const vSel=$('#c-ville'),gSel=$('#c-genre'),cpt=$('#c-compte'),form=cons;
  const uniq=(arr,k)=>[...new Set(arr.map(l=>l[k]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  function refill(){
    const type=form.type.value,pool=all.filter(l=>l.type===type);
    const keepV=vSel.value,keepG=gSel.value;
    vSel.innerHTML='<option value="">Toutes les villes</option>'+uniq(pool,'city').map(c=>`<option>${esc(c)}</option>`).join('');
    gSel.innerHTML='<option value="">Tous les types</option>'+uniq(pool,'kind').map(c=>`<option>${esc(c)}</option>`).join('');
    vSel.value=[...vSel.options].some(o=>o.value===keepV)?keepV:'';
    gSel.value=[...gSel.options].some(o=>o.value===keepG)?keepG:'';
    count();
  }
  function count(){
    const type=form.type.value;
    const n=all.filter(l=>l.type===type&&(!vSel.value||l.city===vSel.value)&&(!gSel.value||l.kind===gSel.value)).length;
    cpt.textContent=n?`${n} bien${n>1?'s':''} ${type==='vente'?'à vendre':'à louer'}`:'Aucun bien pour cette recherche pour le moment';
  }
  if(all.length){
    form.addEventListener('change',e=>{if(e.target.name==='type')refill();else count()});
    refill();
  }else{
    ['Ra’anana','Jérusalem','Tel Aviv','Netanya'].forEach(c=>vSel.insertAdjacentHTML('beforeend',`<option>${c}</option>`));
  }

  /* manifeste : les mots s'allument au fil du défilement */
  const mani=$('#mani');
  if(mani){
    const words=mani.textContent.trim().split(/\s+/);
    mani.innerHTML=words.map(w=>`<span class="mt">${esc(w)}</span> `).join('');
    const ws=$$('.mt',mani);
    if(reduce)ws.forEach(w=>w.classList.add('on'));
    else AP.loop(()=>{
      const r=mani.getBoundingClientRect(),vh=innerHeight;
      const p=clamp((vh*.82-r.top)/(r.height+vh*.28),0,1)*ws.length;
      ws.forEach((w,i)=>w.classList.toggle('on',i<p));
    });
  }

  /* villes : réellement présentes dans les annonces */
  const cityMap=all.reduce((m,l)=>l.city?m.set(l.city,(m.get(l.city)||0)+1):m,new Map());
  const cities=[...cityMap].sort((a,b)=>b[1]-a[1]);
  const vl=$('#villes-l');
  if(cities.length){
    vl.innerHTML=cities.map(([c,n])=>`<a class="ville-l" href="biens.html?ville=${encodeURIComponent(c)}"><span class="vn">${esc(c)}</span><span class="vc">${n} bien${n>1?'s':''}</span><span class="vf">${AP.icon.arrow}</span></a>`).join('');
  }else $('#villes').remove();

  /* chiffres réels, calculés depuis les annonces */
  const ch=$('#chiffres');
  if(ch&&all.length){
    const ventes=all.filter(l=>l.type==='vente'&&l.price).map(l=>l.price);
    const items=[[all.length,all.length>1?'biens en ligne':'bien en ligne'],[cities.length,cities.length>1?'villes':'ville']];
    if(ventes.length)items.push([(Math.min(...ventes)/1e6).toLocaleString('fr-FR',{maximumFractionDigits:2})+' M ₪','à vendre dès']);
    ch.innerHTML=items.map(([b,s])=>`<div><b class="num">${b}</b><span>${s}</span></div>`).join('');
  }else if(ch)ch.remove();

  /* sélection du moment : rail horizontal */
  const sec=$('#selection'),rail=$('#rail');
  const feat=all.filter(l=>l.featured);
  const picks=(feat.length>=3?feat:all).slice(0,6);
  if(!picks.length){sec.remove();return}
  $('#sel-info').textContent=`${picks.length} bien${picks.length>1?'s':''} à la une`;
  rail.innerHTML=picks.map(l=>`<a class="panneau" href="${AP.url(l)}" aria-label="${esc(l.title)}">
    <div class="media">${AP.media(l,{w:1000,h:620})}${AP.tag(l)}</div>
    <div class="txt"><h3>${esc(l.title)}</h3><p class="lieu">${esc(AP.place(l))}</p><p class="px num">${AP.priceHTML(l)}</p></div></a>`).join('')+
    `<div class="panneau fin"><div class="in"><h3>Tous nos biens</h3><a class="btn mag" href="biens.html"><span>Voir la liste</span><span class="pt">${AP.icon.arrow}</span></a></div></div>`;
  const vue=$('.rail-vue',sec),barre=$('.progres',sec),bar=$('i',barre);
  let dist=0,spin=false;
  function setupRail(){
    const want=!reduce&&innerWidth>=900&&innerHeight>=560;
    sec.classList.toggle('epingle',want);spin=want;
    if(want){
      rail.style.transform='';
      dist=Math.max(0,rail.scrollWidth-innerWidth);
      sec.style.height=(dist+innerHeight)+'px';
    }else{sec.style.height='';rail.style.transform=''}
  }
  setupRail();addEventListener('resize',setupRail);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setupRail);
  addEventListener('load',setupRail);
  AP.loop(()=>{
    if(!spin)return;
    const r=sec.getBoundingClientRect(),span=sec.offsetHeight-innerHeight;
    const p=span>0?clamp(-r.top/span,0,1):0;
    rail.style.transform=`translate3d(${(-p*dist).toFixed(1)}px,0,0)`;
    barre.style.setProperty('--p',p.toFixed(3));
    $$('.panneau .media>svg,.panneau .media>img',rail).forEach(m=>{m.style.translate=`${((p-.5)*-44).toFixed(1)}px 0`});
  });
  vue.addEventListener('scroll',()=>{if(!spin){const m=vue.scrollWidth-vue.clientWidth;barre.style.setProperty('--p',m?(vue.scrollLeft/m).toFixed(3):0)}},{passive:true});
});
})();
