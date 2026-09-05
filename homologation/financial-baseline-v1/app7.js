// Camada final da conciliação: mantém conciliação automática e manual e usa sempre o saldo total da Conta a Pagar.
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

// Renderização final e explícita: sempre preserva os controles manuais.
renderSmartRec=function(){
  const el=document.getElementById('recList');
  if(!el)return;
  el.innerHTML=R.length?'<table class="table"><tr><th>Data</th><th>Descrição</th><th>Valor</th><th>Conciliação</th></tr>'+R.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(t=>{
    if(t.status==='RECONCILED'){
      const p=PM.find(x=>x.id===t.paymentId),r=AR.find(x=>x.id===t.receivableId),payable=P.find(x=>x.id===t.payableId);
      const ref=p?(p.beneficiary+' · '+p.description):payable?(payable.beneficiary+' · '+payable.description):r?((r.customerName||'Cliente')+' · '+r.description):'';
      return '<tr><td>'+esc(ofxDate(t.date))+'</td><td>'+esc(t.memo)+'</td><td>'+money(t.amount)+'</td><td><span class="valid">Conciliado</span>'+(ref?'<div class="muted">'+esc(ref)+'</div>':'')+'</td></tr>';
    }
    const c=bestReconciliationCandidate(t),opts=manualOptionsForTx(t);
    const sel='<select id="manual-'+esc(t.id)+'"><option value="">Selecionar lançamento...</option>'+opts.map(o=>'<option value="'+o.kind+':'+o.id+'">'+esc(o.label)+'</option>').join('')+'</select>';
    let auto='';
    if(c){const source=c.kind==='PAYMENT'?'Pagamento registrado':c.kind==='RECEIVABLE'?'Conta a receber':'Conta a pagar';auto='<button class="btn success" onclick="confirmSmartRec(\''+t.id+'\')">Confirmar sugestão</button><div class="muted">'+esc(c.label)+' · '+money(c.value)+' · '+source+'</div>'}
    else auto='<span class="muted">Sem match automático</span>';
    return '<tr><td>'+esc(ofxDate(t.date))+'</td><td>'+esc(t.memo)+'</td><td>'+money(t.amount)+'</td><td>'+auto+'<div style="margin-top:10px" class="rowActions">'+sel+'<button class="btn" onclick="manualReconcile(\''+t.id+'\',document.getElementById(\'manual-'+t.id+'\').value)">Vincular manualmente</button><button class="btn primary" onclick="createFromOfx(\''+t.id+'\')">Cadastrar movimentação</button></div></td></tr>';
  }).join('')+'</table>':'<div class="muted">Nenhum OFX importado.</div>';
};

render();