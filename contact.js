/* Page Contact */
AP.ready(()=>{
  const f=AP.$('#cform');if(!f)return;
  AP.bindForm(f);
  const b=new URLSearchParams(location.search).get('bien');
  if(b){f.message.value='Bonjour, je souhaite des informations sur : '+b+'.';f.bien.value=b}
});
