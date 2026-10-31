/* Page « Nos biens » : filtres vivants, réorganisation animée, favoris */
(function(){
'use strict';
const {$,$$,esc,reduce}=AP;
AP.ready(async()=>{
  const grid=$('#grille'),form=$('#filtres');
  let all=[];
  try{all=await AP.load()}catch(e){
    console.error(e);
    grid.innerHTML='<div class="vide"><h3>Les biens ne se chargent pas</h3><p class="muet">Vérifiez votre connexion et rechargez la page, ou contactez-nous directement.</p></div>';
    return;
  }
  const qs=new URLSearchParams(location.search);
  const st={type:qs.get('type')||'',ville:qs.get('ville')||'',genre:qs.get('genre')||'',q:qs.get('q')||'',tri:qs.get('tri')||'sel',max:qs.get('max')?+qs.get('max'):null,fav:qs.get('fav')==='1'};
  const el={vil:$('#f-ville'),gen:$('#f-genre'),tri:$('#f-tri'),q:$('#f-q'),bud:$('#f-budget'),bval:$('#b-val'),n:$('#n'),nl:$('#n-l'),chips:$('#chips')};
  $('#t-cote').textContent=`${all.length} bien${all.length>1?'s':''} en ligne`;
  const favs=AP.favs();
  const uniq=(arr,k)=>[...new Set(arr.map(l=>l[k]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));

  /* cartes créées une seule fois, puis déplacées */
  grid.innerHTML=all.map((l,i)=>AP.card(l,i,favs)).join('')+'<div class="vide" id="vide" hidden></div>';
  const cards=new Map($$('.bien',grid).map(c=>[c.dataset.id,c]));
  AP.bindCards(grid);
  const vide=$('#vide');
  const V=[''];

  function typePool(){return all.filter(l=>!st.type||l.type===st.type)}
  function fillSelects(){
    const pool=typePool();
    el.vil.innerHTML='<option value="">Toutes les villes</option>'+uniq(pool,'city').map(c=>`<option>${esc(c)}</option>`).join('');
    el.gen.innerHTML='<option value="">Tous les types</option>'+uniq(pool,'kind').map(c=>`<option>${esc(c)}</option>`).join('');
    if(![...el.vil.options].some(o=>o.value===st.ville))st.ville='';
    if(![...el.gen.options].some(o=>o.value===st.genre))st.genre='';
    el.vil.value=st.ville;el.gen.value=st.genre;
  }
  function setBudget(){
    const prices=typePool().map(l=>l.price).filter(Boolean);
    if(!st.type||!prices.length){el.bud.disabled=true;el.bud.value=0;el.bud.max=0;el.bval.textContent='Choisissez vente ou location';st.max=null;el.bud.style.removeProperty('--v');return}
    const step=st.type==='vente'?50000:100,lo=Math.floor(Math.min(...prices)/step)*step,hi=Math.ceil(Math.max(...prices)/step)*step;
    el.bud.disabled=false;el.bud.min=lo;el.bud.max=hi;el.bud.step=step;
    if(st.max==null||st.max>hi||st.max<lo)st.max=hi;
    el.bud.value=st.max;paintBudget();
  }
  function paintBudget(){
    const lo=+el.bud.min,hi=+el.bud.max,v=+el.bud.value;
    el.bud.style.setProperty('--v',hi>lo?((v-lo)/(hi-lo)*100)+'%':'100%');
    el.bval.textContent=v>=hi?'Tous budgets':'Jusqu’à '+AP.fmt(v)+' ₪'+(st.type==='location'?' par mois':'');
  }
  function match(l,ignoreCity){
    if(st.type&&l.type!==st.type)return false;
    if(!ignoreCity&&st.ville&&l.city!==st.ville)return false;
    if(st.genre&&l.kind!==st.genre)return false;
    if(st.fav&&!favs.has(String(l.id)))return false;
    if(st.type&&st.max!=null&&!el.bud.disabled&&l.price&&l.price>st.max)return false;
    if(st.q){const t=[l.title,l.city,l.address,l.kind,l.description].join(' ').toLowerCase();if(!t.includes(st.q.toLowerCase()))return false}
    return true;
  }
  function sorted(list){
    const a=list.slice();
    if(st.tri==='asc')a.sort((x,y)=>(x.price||Infinity)-(y.price||Infinity));
    if(st.tri==='desc')a.sort((x,y)=>(y.price||-1)-(x.price||-1));
    return a;
  }
  function chips(){
    const pool=all.filter(l=>match(l,true)),m=new Map();
    pool.forEach(l=>{if(l.city)m.set(l.city,(m.get(l.city)||0)+1)});
    const nf=favs.size;
    el.chips.innerHTML=`<button class="chip" type="button" data-c="" aria-pressed="${!st.ville}">Toutes les villes</button>`+
      [...m].sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<button class="chip" type="button" data-c="${esc(c)}" aria-pressed="${st.ville===c}">${esc(c)}<b>${n}</b></button>`).join('')+
      (nf||st.fav?`<button class="chip" type="button" data-fav aria-pressed="${st.fav}">Mes favoris<b>${nf}</b></button>`:'');
  }
  function url(){
    const p=new URLSearchParams();
    if(st.type)p.set('type',st.type);if(st.ville)p.set('ville',st.ville);if(st.genre)p.set('genre',st.genre);if(st.q)p.set('q',st.q);
    if(st.tri!=='sel')p.set('tri',st.tri);if(st.type&&!el.bud.disabled&&st.max<+el.bud.max)p.set('max',st.max);if(st.fav)p.set('fav','1');
    history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''));
  }

  function render(animate=true){
    const list=sorted(all.filter(l=>match(l)));
    const shown=new Set(list.map(l=>String(l.id)));
    const first=new Map();
    if(animate&&!reduce)cards.forEach(c=>{if(!c.hidden)first.set(c,c.getBoundingClientRect())});
    list.forEach((l,i)=>{const c=cards.get(String(l.id));c.hidden=false;c.className='bien '+V[i%V.length];c.dataset.col=i%3;grid.insertBefore(c,vide)});
    cards.forEach((c,id)=>{if(!shown.has(id))c.hidden=true});
    if(animate&&!reduce){
      list.forEach(l=>{
        const c=cards.get(String(l.id)),f=first.get(c),r=c.getBoundingClientRect();
        if(f){const dx=f.left-r.left,dy=f.top-r.top;if(Math.abs(dx)+Math.abs(dy)>2)c.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:800,easing:'cubic-bezier(.2,.8,.2,1)'})}
        else c.animate([{opacity:0,transform:'translateY(28px) scale(.97)'},{opacity:1,transform:'none'}],{duration:800,easing:'cubic-bezier(.2,.8,.2,1)'});
      });
    }
    el.n.textContent=list.length;el.nl.textContent=list.length>1?'biens trouvés':'bien trouvé';
    if(!list.length){
      vide.hidden=false;
      vide.innerHTML=`<h3>${st.fav?'Aucun favori pour le moment':'Aucun bien ne correspond'}</h3><p class="muet">${st.fav?'Touchez le cœur d’un bien pour le garder ici.':'Élargissez vos critères, ou dites-nous ce que vous cherchez : beaucoup de biens ne sont jamais publiés.'}</p><a class="btn mag" href="contact.html"><span>Décrire mon projet</span><span class="pt">${AP.icon.arrow}</span></a>`;
    }else vide.hidden=true;
    chips();url();
  }

  /* état initial */
  const radio=$(`input[name=type][value="${st.type}"]`,form)||$('#f-tous');radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));
  fillSelects();setBudget();el.tri.value=st.tri;el.q.value=st.q;
  render(false);

  /* interactions */
  form.addEventListener('change',e=>{
    const t=e.target;
    if(t.name==='type'){st.type=t.value;st.max=null;fillSelects();setBudget()}
    else if(t===el.vil)st.ville=t.value;
    else if(t===el.gen)st.genre=t.value;
    else if(t===el.tri)st.tri=t.value;
    else return;
    render();
  });
  el.bud.addEventListener('input',()=>{st.max=+el.bud.value;paintBudget();render()});
  let tm;el.q.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(()=>{st.q=el.q.value.trim();render()},160)});
  el.chips.addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;
    if(b.hasAttribute('data-fav'))st.fav=!st.fav;else{st.ville=b.dataset.c;el.vil.value=st.ville}
    render();
  });
  grid.addEventListener('favchange',()=>{favs.clear();AP.favs().forEach(x=>favs.add(x));if(st.fav)render();else chips()});
});
})();
