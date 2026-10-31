/* Fiche d'un bien */
(function(){
'use strict';
const {$,$$,esc,C,reduce}=AP;
AP.ready(async()=>{
  const id=new URLSearchParams(location.search).get('id');
  const hero=$('#fh'),corps=$('#f-corps'),lat=$('#f-lat');
  const fail=(t,p)=>{
    hero.style.minHeight='60vh';
    $('#fh-txt').innerHTML=`<h1>${t}</h1><p class="lieu">${p}</p><div style="margin-top:26px"><a class="btn mag" href="biens.html"><span>Voir tous les biens</span><span class="pt">${AP.icon.arrow}</span></a></div>`;
    $('#fiche').remove();
  };
  let all=[];
  try{all=await AP.load()}catch(e){return fail('Le bien ne se charge pas','Vérifiez votre connexion et rechargez la page.')}
  const l=all.find(x=>String(x.id)===String(id));
  if(!l)return fail('Ce bien n’est plus disponible','Il a peut-être été vendu ou loué. Voici les autres biens.');

  /* titre, description, données structurées */
  const ph=AP.photos(l),loc=l.type==='location';
  document.title=`${l.title} | Alliance Properties`;
  const desc=(l.description||'').replace(/\s+/g,' ').slice(0,155);
  const setMeta=(sel,v)=>{const m=$(sel);if(m)m.setAttribute('content',v)};
  setMeta('meta[name=description]',desc||document.title);setMeta('meta[property="og:title"]',document.title);setMeta('meta[property="og:description"]',desc);
  if(ph[0])setMeta('meta[property="og:image"]',ph[0]);
  const ld={"@context":"https://schema.org","@type":"RealEstateListing",name:l.title,description:l.description||'',url:location.href,image:ph,
    offers:l.price?{"@type":"Offer",price:l.price,priceCurrency:"ILS",availability:"https://schema.org/InStock"}:undefined,
    about:{"@type":"Residence",address:{"@type":"PostalAddress",streetAddress:l.address||undefined,addressLocality:l.city||undefined,addressCountry:"IL"},numberOfRooms:l.rooms||undefined,floorSize:l.area?{"@type":"QuantitativeValue",value:l.area,unitCode:"MTK"}:undefined}};
  const s=document.createElement('script');s.type='application/ld+json';s.textContent=JSON.stringify(ld);document.head.appendChild(s);

  /* en-tête de fiche */
  $('#fh-media').innerHTML=ph[0]?`<img src="${esc(ph[0])}" alt="${esc(l.title)}">`:AP.homeScene(l,{w:1600,h:900});
  $('#fh-txt').innerHTML=`<nav class="fil" aria-label="Fil d’Ariane"><a href="index.html">Accueil</a><span aria-hidden="true">/</span><a href="biens.html${loc?'?type=location':'?type=vente'}">${loc?'À louer':'À vendre'}</a>${l.city?`<span aria-hidden="true">/</span><a href="biens.html?type=${l.type}&ville=${encodeURIComponent(l.city)}">${esc(l.city)}</a>`:''}</nav>
    ${AP.tag(l)}<h1 style="margin-top:18px">${esc(l.title)}</h1><p class="lieu">${esc(AP.place(l))}</p>
    ${ph.length?`<button class="btn verre btn-photos mag" type="button" data-photo="0"><span>Voir les ${ph.length} photo${ph.length>1?'s':''}</span><span class="pt">${AP.icon.arrow}</span></button>`:''}`;
  $('#fh-prix').innerHTML=`<b class="num">${l.price?AP.fmt(l.price)+'&nbsp;₪':'Prix sur demande'}</b>${loc&&l.price?'<span>par mois</span>':''}`;

  /* faits chiffrés */
  const F=[];
  if(l.area)F.push([l.area,'m²','surface']);
  if(l.rooms)F.push([AP.rooms(l.rooms),'','pièces']);
  if(l.bedrooms)F.push([l.bedrooms,'','chambre'+(l.bedrooms>1?'s':'')]);
  if(l.floor)F.push([esc(l.floor),'','étage']);
  const mosa=ph.length>1?`<div class="mosaique">${ph.slice(0,4).map((p,i)=>`<button type="button" data-photo="${i}" aria-label="Agrandir la photo ${i+1}"><img loading="lazy" src="${esc(p)}" alt="">${i===3&&ph.length>4?`<span class="plus-photos">+${ph.length-4}</span>`:''}</button>`).join('')}</div>`:'';
  const addr=[l.address,l.city,'Israël'].filter(Boolean).join(', ');
  corps.innerHTML=`${mosa}
    ${F.length?`<div class="faits num">${F.map(([v,u,t])=>`<div class="fait"><b>${v}${u?`<small>${u}</small>`:''}</b><span>${t}</span></div>`).join('')}</div>`:''}
    <div class="prose">${AP.prose(l.description)||'<p>Contactez-nous pour recevoir la description complète et organiser une visite.</p>'}</div>
    ${(l.address||l.city)?`<h2 class="sec">Localisation</h2><div class="carte-zone" id="carte"><svg class="fond" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60H400M0 130H400M90 0V200M210 0V200M320 0V200M0 20 400 190M60 200 360 0"/></svg>
      <button class="btn verre mag" type="button" id="carte-b"><span>Afficher la carte</span><span class="pt">${AP.icon.arrow}</span></button></div><p class="muet" style="margin-top:12px">${esc(addr)}</p>`:''}`;
  const cb=$('#carte-b');
  if(cb)cb.addEventListener('click',()=>{
    const z=$('#carte');z.insertAdjacentHTML('beforeend',`<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Carte : ${esc(addr)}" src="https://maps.google.com/maps?q=${encodeURIComponent(addr)}&hl=fr&z=15&output=embed"></iframe>`);cb.remove();
  });

  /* colonne de contact */
  const msg0=`Bonjour, je souhaite organiser une visite pour : ${l.title}.`;
  const fav=AP.favs().has(String(l.id));
  lat.innerHTML=`<h2>Ce bien vous intéresse ?</h2><p>Demandez une visite ou plus d’informations. Nous répondons rapidement, en français.</p>
    <a class="btn mag" data-ap="wa" data-text="Bonjour, je suis intéressé(e) par : ${esc(l.title)}" href="#"><span>Écrire sur WhatsApp</span><span class="pt">${AP.icon.arrow}</span></a>
    <hr>
    <form id="vform" novalidate><input type="hidden" name="bien" value="${esc(l.title)}"><p class="hp"><label>Ne pas remplir : <input name="_honey" tabindex="-1" autocomplete="off"></label></p>
      <label class="champ"><span>Nom et prénom *</span><input type="text" name="nom" required autocomplete="name"></label>
      <label class="champ"><span>Téléphone</span><input type="tel" name="telephone" autocomplete="tel"></label>
      <label class="champ"><span>E-mail *</span><input type="email" name="email" required autocomplete="email"></label>
      <label class="champ"><span>Message *</span><textarea name="message" required>${esc(msg0)}</textarea></label>
      <label class="consent"><input type="checkbox" required><span>J’accepte d’être recontacté(e).</span></label>
      <button class="btn verre mag" type="submit"><span>Demander une visite</span><span class="pt">${AP.icon.arrow}</span></button><p class="retour" role="status"></p></form>
    <div class="petit"><a data-ap="phone" data-keep href="#">Appeler</a><button type="button" id="copier">Copier le lien</button></div>`;
  AP.hydrate();AP.bindForm($('#vform'));
  const cp=$('#copier');cp.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);cp.textContent='Lien copié'}catch(e){cp.textContent='Copie impossible'}setTimeout(()=>cp.textContent='Copier le lien',2200)});

  /* biens similaires */
  const sim=all.filter(x=>String(x.id)!==String(l.id)).map(x=>({x,s:(x.city&&x.city===l.city?2:0)+(x.type===l.type?1:0)+(x.kind===l.kind?1:0)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).slice(0,3).map(o=>o.x);
  if(sim.length){
    const sg=$('#sim-g'),favs=AP.favs();
    sg.innerHTML=sim.map(x=>AP.card(x,0,favs)).join('');AP.bindCards(sg);$('#sim').hidden=false;
  }

  /* diaporama plein écran */
  const dlg=$('#vis');let gi=0;
  if(ph.length){
    const show=i=>{
      gi=(i+ph.length)%ph.length;
      $('#vis-s').innerHTML=`<img src="${esc(ph[gi])}" alt="${esc(l.title)} : photo ${gi+1}">`;
      $('#vis-n').textContent=`${gi+1} / ${ph.length}`;
      $$('#vis-m button').forEach((b,j)=>b.setAttribute('aria-current',j===gi));
    };
    $('#vis-m').innerHTML=ph.map((p,i)=>`<button type="button" data-i="${i}" aria-label="Photo ${i+1}"><img src="${esc(p)}" alt=""></button>`).join('');
    document.addEventListener('click',e=>{const b=e.target.closest('[data-photo]');if(!b)return;show(+b.dataset.photo);dlg.showModal()});
    $('#vis-x').onclick=()=>dlg.close();
    $('#vis-g').onclick=()=>show(gi-1);$('#vis-d').onclick=()=>show(gi+1);
    $('#vis-m').addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(+b.dataset.i)});
    dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(gi-1);if(e.key==='ArrowRight')show(gi+1)});
    let x0=null;dlg.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
    dlg.addEventListener('touchend',e=>{if(x0==null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)show(gi+(d<0?1:-1));x0=null});
    dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
  }
});
})();
