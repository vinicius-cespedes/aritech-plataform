// Camada final de conciliação: elimina o caminho antigo por parcela e usa sempre o saldo total da Conta a Pagar.
function bestReconciliationCandidateV7(t){
  const txDate=ofxDate(t.date),txValue=Math.abs(Number(t.amount||0));
  if(Number(t.amount||0)>0){
    const a=bestReceivableCandidate(t);
    if(a)return {kind:'RECEIVABLE',receivable:a.r,score:a.score,label:a.r.customerName+' · '+a.r.description,date:a.r.due,value:arOpen(a.r)};
    return null;
  }
  const payments=PM.filter(p=>p.status!=='RECONCILED'&&exactValue(p.amount,txValue)).map(p=>({kind:'PAYMENT',payment:p,score:daysBetween(txDate,p.date),label:p.beneficiary+' · '+p.description,date:p.date,value:p.amount})).filter(x=>x.score<=30).sort((a,b)=>a.score-b.score);
  if(payments.length)return payments[0];
  const payables=openPayables().filter(p=>txValue<=payableOpen(p)+0.011).map(p=>{const due=(p.installments||[]).filter(i=>Number(i.open)>0).sort((a,b)=>String(a.due||'').localeCompare(String(b.due||'')))[0]?.due||'';return {kind:'PAYABLE',payable:p,score:daysBetween(txDate,due),label:p.beneficiary+' · '+p.description,date:due,value:payableOpen(p)}}).filter(x=>x.score<=45).sort((a,b)=>a.score-b.score);
  return payables[0]||null;
}
bestReconciliationCandidate=bestReconciliationCandidateV7;

confirmSmartRec=function(txid){
  const t=R.find(x=>x.id===txid);
  if(!t||t.status==='RECONCILED')return;
  const c=bestReconciliationCandidate(t);
  if(!c)return alert('Nenhuma correspondência automática encontrada. Use a vinculação manual ou cadastre a movimentação.');
  if(c.kind==='PAYMENT'){
    c.payment.status='RECONCILED';c.payment.bankTransactionId=t.id;t.status='RECONCILED';t.paymentId=c.payment.id;t.reconciledAt=new Date().toISOString();save();render();return;
  }
  if(c.kind==='PAYABLE')return allocateOfxToPayable(t,c.payable);
  if(c.kind==='RECEIVABLE'){
    const r=c.receivable,v=Math.abs(Number(t.amount||0)),open=arOpen(r);
    if(v>open+0.011)return alert('O valor do OFX é maior que o saldo da Conta a Receber selecionada.');
    r.receivedAmount=+(Number(r.receivedAmount||0)+v).toFixed(2);r.status=arOpen(r)<=0.011?'RECEIVED':'PARTIALLY_RECEIVED';r.receivedAt=ofxDate(t.date);r.bankTransactions=r.bankTransactions||[];r.bankTransactions.push({id:t.id,date:ofxDate(t.date),amount:v});t.status='RECONCILED';t.receivableId=r.id;t.reconciledAt=new Date().toISOString();saveAR();save();render();return;
  }
};
window.confirmSmartRec=confirmSmartRec;

// Garante que qualquer seleção legada de parcela seja convertida para a Conta a Pagar correspondente.
const manualReconcileV6=manualReconcile;
manualReconcile=function(txid,value){
  const [kind,id]=String(value||'').split(':');
  if(kind==='INSTALLMENT'){
    const x=openInstallments().find(z=>z.i.id===id);
    if(!x)return alert('Parcela não encontrada ou já liquidada.');
    return allocateOfxToPayable(R.find(t=>t.id===txid),x.p);
  }
  return manualReconcileV6(txid,value);
};
window.manualReconcile=manualReconcile;
render();