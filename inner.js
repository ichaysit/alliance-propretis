/* Comportements communs à toutes les pages : arche de lumière, services, étapes, scène du pied de page */
(function(){
'use strict';
const {$,$$,clamp,reduce}=AP;
AP.ready(()=>{
  const page=document.body.dataset.page;

  /* services : lignes qui s'ouvrent */
  const srv=$('#srv');
  if(srv){
    const multi=page==='services';
    srv.addEventListener('click',e=>{
      const b=e.target.closest('.srv-l button');if(!b)return;
      const l=b.closest('.srv-l'),open=!l.classList.contains('ouvert');
      if(!multi&&open)$$('.srv-l.ouvert',srv).forEach(o=>{o.classList.remove('ouvert');$('button',o).setAttribute('aria-expanded','false')});
      l.classList.toggle('ouvert',open);b.setAttribute('aria-expanded',open);
    });
  }

  /* étapes : la ligne se remplit au défilement (vraie séquence) */
  const et=$('#etapes');
  if(et){
    const steps=$$('.etape',et),th=[.12,.45,.8];
    AP.loop(()=>{
      const r=et.getBoundingClientRect(),vh=innerHeight;
      const p=clamp((vh*.72-r.top)/(r.height+vh*.1),0,1);
      et.style.setProperty('--p',p.toFixed(3));
      steps.forEach((s,i)=>s.classList.toggle('on',p>=th[i]));
    });
    if(reduce)steps.forEach(s=>s.classList.add('on'));
  }
});
})();
