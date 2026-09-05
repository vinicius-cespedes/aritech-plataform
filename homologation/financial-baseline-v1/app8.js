// Conciliação v8: módulo final independente, carregado junto ao app5 para evitar sobrescritas assíncronas.
function payableOpenV8(p){return (p.installments||[]).reduce((s,i)=>s+Number(i.open||0),0)}
function openPayablesV8(){return P.filter(p=>['APPROVED','OPEN','PARTIALLY_SETTLED'].includes(p.status)&&payableOpenV8(p)>0.001)}
function allocateOfxToPayableV8(t,p){
  if(!t||!p)return;
  const v=Math.abs(Number(t.amount||0)),open=payableOpenV8(p);
  if(v<=0||v>open+0.011)return alert('O valor do OFX é maior que o saldo TOTAL da Conta a Pagar selecionada ('+money(open)+').');
  let remaining=v,allocations=[];
  const its=(p.installments||[]).filter(i=>Number(i.open)>0).sort((a,b)=>String(a.due||'').localeCompare(String(b.due||''))||Number(a.sequence||0)-Number(b.sequence||0));
  for(const i of its){
    if(remaining<=0.001)break;
    const part=Math.min(remaining,Number(i.open));
    i.open=+(Number(i.open)-part).toFixed(2);
    i.status=i.open<=0.001?'SETTLED':'PARTIALLY_SETTLED';
    allocations.push({installmentId:i.id,sequence:i.sequence,principal:+part.toFixed(2)});
    remaining=+(remaining-part).toFixed(2);
  }
  const all=(p.installments||[]).every(i=>Number(i.open)<=0.001),any=(p.installments||[]).some(i=>Number(i.open)<Number(i.original));
  p.status=all?'SETTLED':any?'PARTIALLY_SETTLED':'OPEN';
  p.reconciliationAllocations=p.reconciliationAllocations||[];
  p.reconciliationAllocations.push({bankTransactionId:t.id,date:ofxDate(t.date),amount:v,allocations,createdAt:new Date().toISOString()});
  const payment={id:crypto.randomUUID(),payableId:p.id,installmentId:allocations.length===1?allocations[0].installmentId:null,allocations,beneficiary:p.beneficiary,description:p.description,date:ofxDate(t.date),account:'Conciliação OFX',method:'OFX',principal:v,interest:0,penalty:0,discount:0,amount:v,reference:t.memo||t.id,status:'RECONCILED',bankTransactionId:t.id,createdFromReconciliation:true};
  PM.push(payment);t.status='RECONCILED';t.paymentId=payment.id;t.payableId=p.id;t.reconciledAt=new Date().toISOString();save();render();return payment;
}
function manualOptionsForTxV8(t){
  if(Number(t.amount||0)<0)return openPayablesV8().map(p=>({kind:'PAYABLE',id:p.id,label:p.beneficiary+' · '+p.description+' · saldo total '+money(payableOpenV8(p))}));
  return AR.filter(r=>arOpen(r)>0).map(r=>({kind:'RECEIVABLE',id:r.id,label:(r.customerName||'Cliente')+' · '+r.description+' · saldo '+money(arOpen(r))}));
}
function manualReconcileV8(txid,value){
  const t=R.find(x=>x.id===txid);if(!t||t.status==='RECONCILED')return;
  const [kind,id]=String(value||'').split(':');
  if(kind==='PAYABLE'){const p=P.find(x=>x.id===id);if(!p||payableOpenV8(p)<=0)return alert('Conta a Pagar não encontrada ou já liquidada.');return allocateOfxToPayableV8(t,p)}
  if(kind==='RECEIVABLE'){
    const r=AR.find(x=>x.id===id);if(!r)return alert('Conta a Receber não encontrada.');
    const v=Math.abs(Number(t.amount||0)),open=arOpen(r);if(v<=0||v>open+0.011)return alert('O valor do OFX é maior que o saldo da Conta a Receber selecionada ('+money(open)+').');
    r.receivedAmount=+(Number(r.receivedAmount||0)+v).toFixed(2);r.status=arOpen(r)<=0.011?'RECEIVED':'PARTIALLY_RECEIVED';r.receivedAt=ofxDate(t.date);r.bankTransactions=r.bankTransactions||[];r.bankTransactions.push({id:t.id,date:ofxDate(t.date),amount:v});t.status='RECONCILED';t.receivableId=r.id;t.reconciledAt=new Date().toISOString();saveAR();save();render();return;
  }
  alert('Selecione uma Conta a Pagar ou Conta a Receber para vincular.');
}
window.manualReconcile=manualReconcileV8;
function goSectionV8(id){const b=document.querySelector('.nav button[data-s="'+id+'"]');if(b)b.click()}
function createFromOfxV8(txid){
  const t=R.find(x=>x.id===txid);if(!t||t.status==='RECONCILED')return;
  const d=ofxDate(t.date),v=Math.abs(Number(t.amount||0));localStorage.setItem('aritech_hml_pending_ofx_link',t.id);
  if(Number(t.amount||0)<0){goSectionV8('pay');pf.description.value=t.memo||'Movimentação importada do OFX';pf.amount.value=moneyMask(String(Math.round(v*100)));pf.issue.value=d;pf.competence.value=d.slice(0,7);pf.due.value=d;pf.scrollIntoView({behavior:'smooth'});alert('Nova Conta a Pagar iniciada com os dados do OFX. Complete beneficiário e classificação, salve e aprove o lançamento; depois retorne à Conciliação para vinculá-lo.');}
  else{goSectionV8('receivables');receivableForm.description.value=t.memo||'Movimentação importada do OFX';receivableForm.amount.value=moneyMask(String(Math.round(v*100)));receivableForm.issue.value=d;receivableForm.due.value=d;receivableForm.level.value='COMMITTED';receivableForm.scrollIntoView({behavior:'smooth'});alert('Nova Conta a Receber iniciada com os dados do OFX. Complete cliente/projeto e salve; depois retorne à Conciliação para vinculá-la.');}
}
window.createFromOfx=createFromOfxV8;
function bestReconciliationCandidateV8(t){
  const txDate=ofxDate(t.date),txValue=Math.abs(Number(t.amount||0));
  if(Number(t.amount||0)>0){const a=bestReceivableCandidate(t);return a?{kind:'RECEIVABLE',receivable:a.r,score:a.score,label:a.r.customerName+' · '+a.r.description,date:a.r.due,value:arOpen(a.r)}:null}
  const payments=PM.filter(p=>p.status!=='RECONCILED'&&exactValue(p.amount,txValue)).map(p=>({kind:'PAYMENT',payment:p,score:daysBetween(txDate,p.date),label:p.beneficiary+' · '+p.description,date:p.date,value:p.amount})).filter(x=>x.score<=30).sort((a,b)=>a.score-b.score);if(payments.length)return payments[0];
  return openPayablesV8().filter(p=>txValue<=payableOpenV8(p)+0.011).map(p=>{const due=(p.installments||[]).filter(i=>Number(i.open)>0).sort((a,b)=>String(a.due||'').localeCompare(String(b.due||'')))[0]?.due||'';return {kind:'PAYABLE',payable:p,score:daysBetween(txDate,due),label:p.beneficiary+' · '+p.description,date:due,value:payableOpenV8(p)}}).filter(x=>x.score<=45).sort((a,b)=>a.score-b.score)[0]||null;
}
bestReconciliationCandidate=bestReconciliationCandidateV8;
function confirmSmartRecV8(txid){
  const t=R.find(x=>x.id===txid);if(!t||t.status==='RECONCILED')return;const c=bestReconciliationCandidateV8(t);if(!c)return alert('Nenhuma correspondência automática encontrada. Use a vinculação manual ou cadastre a movimentação.');
  if(c.kind==='PAYMENT'){c.payment.status='RECONCILED';c.payment.bankTransactionId=t.id;t.status='RECONCILED';t.paymentId=c.payment.id;t.reconciledAt=new Date().toISOString();save();render();return}
  if(c.kind==='PAYABLE')return allocateOfxToPayableV8(t,c.payable);
  if(c.kind==='RECEIVABLE')return manualReconcileV8(txid,'RECEIVABLE:'+c.receivable.id);
}
window.confirmSmartRec=confirmSmartRecV8;
function renderReconciliationV8(){
  const el=document.getElementById('recList');if(!el)return;
  el.innerHTML=R.length?'<table class="table"><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Conciliação</th></tr>'+R.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(t=>{
    if(t.status==='RECONCILED'){const p=PM.find(x=>x.id===t.paymentId),r=AR.find(x=>x.id===t.receivableId),payable=P.find(x=>x.id===t.payableId);const ref=p?(p.beneficiary+' · '+p.description):payable?(payable.beneficiary+' · '+payable.description):r?((r.customerName||'Cliente')+' · '+r.description):'';return '<tr><td>'+esc(ofxDate(t.date))+'</td><td>'+esc(t.memo)+'</td><td>'+money(t.amount)+'</td><td><span class="valid">Conciliado</span>'+(ref?'<div class="muted">'+esc(ref)+'</div>':'')+'</td></tr>'}
    const c=bestReconciliationCandidateV8(t),opts=manualOptionsForTxV8(t),sel='<select id="manual-'+esc(t.id)+'"><option value="">Selecionar lançamento...</option>'+opts.map(o=>'<option value="'+o.kind+':'+o.id+'">'+esc(o.label)+'</option>').join('')+'</select>';
    const auto=c?'<button class="btn success" onclick="confirmSmartRec(\''+t.id+'\')">Confirmar sugestão</button><div class="muted">'+esc(c.label)+' · '+money(c.value)+'</div>':'<span class="muted">Sem match automático</span>';
    return '<tr><td>'+esc(ofxDate(t.date))+'</td><td>'+esc(t.memo)+'</td><td>'+money(t.amount)+'</td><td>'+auto+'<div style="margin-top:10px" class="rowActions">'+sel+'<button class="btn" onclick="manualReconcile(\''+t.id+'\',document.getElementById(\'manual-'+t.id+'\').value)">Vincular manualmente</button><button class="btn primary" onclick="createFromOfx(\''+t.id+'\')">Cadastrar movimentação</button></div></td></tr>';
  }).join('')+'</table>':'<div class="muted">Nenhum OFX importado.</div>';
}
renderSmartRec=renderReconciliationV8;
const renderBeforeV8=render;
render=function(){renderBeforeV8();renderReconciliationV8()};
window.__ARITECH_RECONCILIATION_V8__=true;
render();