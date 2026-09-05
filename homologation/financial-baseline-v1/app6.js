// Ponto de entrada único da conciliação da homologação.
// Toda a lógica legada foi removida deste arquivo. A implementação vigente é a v9.
(function(){
  if(window.__ARITECH_RECONCILIATION_V9__) return;
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/gh/vinicius-cespedes/aritech-plataform@69b9ff6c6a17b31f181f3a4693c1b3b6fd43fbbe/homologation/financial-baseline-v1/app9.js';
  s.async=false;
  s.onload=()=>console.info('Aritech: conciliação v9 carregada.');
  s.onerror=()=>console.error('Aritech: falha ao carregar conciliação v9.');
  document.body.appendChild(s);
})();