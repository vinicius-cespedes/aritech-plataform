'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Item = { id:string; code?:string; name:string; institutionName?:string; type?:string };
type Catalogs = { managementAccounts:Item[]; costCenters:Item[]; businessLines:Item[]; projects:Item[]; financialAccounts:Item[]; paymentTerms:Item[] };
type Supplier = { id:string; legalName?:string; tradeName?:string; taxDocument?:string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:3001/api';
const supplierName=(s:Supplier)=>s.legalName||s.tradeName||'Fornecedor sem nome';
const formatMoneyInput=(value:string)=>{
  const digits=value.replace(/\D/g,'');
  if(!digits)return '';
  const cents=Number(digits)/100;
  return new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(cents);
};
const moneyInputToDecimal=(value:string)=>{
  const digits=value.replace(/\D/g,'');
  return digits ? (Number(digits)/100).toFixed(2) : '0.00';
};

export default function NewPayablePage(){
  const today=new Date().toISOString().slice(0,10);
  const currentMonth=today.slice(0,7);
  const [legalEntityId,setLegalEntityId]=useState('');
  const [actorId,setActorId]=useState('');
  const [catalogs,setCatalogs]=useState<Catalogs|null>(null);
  const [suppliers,setSuppliers]=useState<Supplier[]>([]);
  const [supplierSearch,setSupplierSearch]=useState('');
  const [supplierOpen,setSupplierOpen]=useState(false);
  const [showQuickSupplier,setShowQuickSupplier]=useState(false);
  const [quickSupplier,setQuickSupplier]=useState({legalName:'',tradeName:'',taxDocument:''});
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [form,setForm]=useState({supplierId:'',description:'',originalAmount:'',issueDate:today,competenceMonth:currentMonth,dueDate:today,managementAccountId:'',costCenterId:'',businessLineId:'',projectId:'',costDirectness:'INDIRECT'});

  async function api<T>(path:string,init?:RequestInit){const r=await fetch(`${apiBase}${path}`,{...init,headers:{'Content-Type':'application/json',...(init?.headers||{})}});const b=await r.json();if(!r.ok)throw new Error(b?.message||'Falha na API');return b as T}
  async function load(){setError('');try{const [c,s]=await Promise.all([api<Catalogs>(`/financial/catalogs?legalEntityId=${legalEntityId}`),api<Supplier[]>(`/financial/suppliers?legalEntityId=${legalEntityId}`)]);setCatalogs(c);setSuppliers(s)}catch(e){setError(e instanceof Error?e.message:'Erro ao carregar catálogos')}}
  useEffect(()=>{if(legalEntityId)void load()},[legalEntityId]);

  useEffect(()=>{
    if(!legalEntityId){return}
    const timer=setTimeout(async()=>{
      try{
        const query=supplierSearch.trim();
        const result=await api<Supplier[]>(`/financial/suppliers?legalEntityId=${legalEntityId}${query?`&search=${encodeURIComponent(query)}`:''}`);
        setSuppliers(result);
      }catch{}
    },250);
    return()=>clearTimeout(timer);
  },[supplierSearch,legalEntityId]);

  const selectedSupplier=useMemo(()=>suppliers.find(s=>s.id===form.supplierId),[suppliers,form.supplierId]);
  const exactMatch=useMemo(()=>suppliers.some(s=>supplierName(s).toLocaleLowerCase('pt-BR')===supplierSearch.trim().toLocaleLowerCase('pt-BR')),[suppliers,supplierSearch]);

  function chooseSupplier(s:Supplier){setForm({...form,supplierId:s.id});setSupplierSearch(supplierName(s));setSupplierOpen(false);setShowQuickSupplier(false)}

  async function createQuickSupplier(){
    setError('');
    if(!quickSupplier.legalName.trim()&&!quickSupplier.tradeName.trim()){setError('Informe a razão social ou o nome fantasia do novo fornecedor.');return}
    try{
      const created=await api<Supplier>('/financial/suppliers',{method:'POST',body:JSON.stringify({legalEntityId,legalName:quickSupplier.legalName||undefined,tradeName:quickSupplier.tradeName||undefined,taxDocument:quickSupplier.taxDocument||undefined})});
      setSuppliers(prev=>[created,...prev]);
      chooseSupplier(created);
      setQuickSupplier({legalName:'',tradeName:'',taxDocument:''});
      setMessage('Fornecedor criado e selecionado.');
    }catch(e){setError(e instanceof Error?e.message:'Erro ao criar fornecedor')}
  }

  async function submit(e:FormEvent){
    e.preventDefault();setError('');setMessage('');
    if(!form.supplierId){setError('Selecione ou cadastre um fornecedor.');return}
    if(form.costDirectness==='DIRECT'&&(!form.businessLineId||!form.projectId)){setError('Custos diretos exigem linha de negócio e projeto.');return}
    const competenceDate=`${form.competenceMonth}-01`;
    const originalAmount=moneyInputToDecimal(form.originalAmount);
    if(Number(originalAmount)<=0){setError('Informe um valor maior que zero.');return}
    try{
      await api('/financial/payables',{method:'POST',body:JSON.stringify({legalEntityId,supplierId:form.supplierId,description:form.description,competenceDate,issueDate:form.issueDate,originalAmount,currency:'BRL',sourceType:'MANUAL_ENTRY',createdBy:actorId,installments:[{dueDate:form.dueDate,amount:originalAmount}],allocations:[{managementAccountId:form.managementAccountId,costCenterId:form.costCenterId,businessLineId:form.businessLineId||undefined,projectId:form.projectId||undefined,amount:originalAmount,economicNature:'OPERATING_EXPENSE',costDirectness:form.costDirectness}]})});
      setMessage('Conta a pagar criada com sucesso.');
    }catch(e){setError(e instanceof Error?e.message:'Erro ao salvar')}
  }

  const Select=({label,value,onChange,items,required=true,disabled=false,placeholder='Selecione'}:{label:string;value:string;onChange:(v:string)=>void;items:Item[];required?:boolean;disabled?:boolean;placeholder?:string})=><label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)} required={required} disabled={disabled}><option value="">{placeholder}</option>{items.map(i=><option key={i.id} value={i.id}>{i.code?`${i.code} · `:''}{i.name}</option>)}</select></label>;

  return <main className="wrap"><header><div><p className="eyebrow">Financeiro · Contas a pagar</p><h1>Nova conta a pagar</h1><p className="muted">Registro financeiro com busca de fornecedor e classificação gerencial.</p></div><a href="/">← Voltar ao workspace</a></header>
    <section className="env"><label>Legal Entity ID<input value={legalEntityId} onChange={e=>setLegalEntityId(e.target.value)} placeholder="temporário até autenticação"/></label><label>Actor/User ID<input value={actorId} onChange={e=>setActorId(e.target.value)} placeholder="temporário até autenticação"/></label><button type="button" onClick={load} disabled={!legalEntityId}>Atualizar catálogos</button></section>
    {error&&<div className="errorBox">{error}</div>}{message&&<div className="successBox">{message}</div>}
    <form onSubmit={submit} className="card"><h2>Documento</h2><div className="grid">
      <div className="field full supplierField"><span>Fornecedor</span><input autoComplete="off" value={supplierSearch} placeholder="Comece a digitar o nome do fornecedor" onFocus={()=>setSupplierOpen(true)} onChange={e=>{setSupplierSearch(e.target.value);setForm({...form,supplierId:''});setSupplierOpen(true);setShowQuickSupplier(false)}}/>
        {supplierOpen&&supplierSearch.trim()&&<div className="results">{suppliers.length?suppliers.map(s=><button type="button" key={s.id} onClick={()=>chooseSupplier(s)}><b>{supplierName(s)}</b>{s.legalName&&s.tradeName&&<small>{s.tradeName}</small>}</button>):<div className="noResult">Nenhum fornecedor encontrado.</div>}{!exactMatch&&<button type="button" className="createInline" onClick={()=>{setShowQuickSupplier(true);setQuickSupplier(q=>({...q,tradeName:supplierSearch}));setSupplierOpen(false)}}>+ Cadastrar “{supplierSearch}” como novo fornecedor</button>}</div>}
        {selectedSupplier&&<small className="selected">Selecionado: {supplierName(selectedSupplier)}</small>}
      </div>
      {showQuickSupplier&&<div className="quick full"><div className="quickTitle">Cadastrar fornecedor sem sair da conta a pagar</div><div className="grid"><label className="field"><span>Razão social</span><input value={quickSupplier.legalName} onChange={e=>setQuickSupplier({...quickSupplier,legalName:e.target.value})}/></label><label className="field"><span>Nome fantasia</span><input value={quickSupplier.tradeName} onChange={e=>setQuickSupplier({...quickSupplier,tradeName:e.target.value})}/></label><label className="field"><span>CPF/CNPJ (opcional)</span><input value={quickSupplier.taxDocument} onChange={e=>setQuickSupplier({...quickSupplier,taxDocument:e.target.value})}/></label></div><div className="quickActions"><button type="button" onClick={()=>setShowQuickSupplier(false)}>Cancelar</button><button className="primary" type="button" onClick={createQuickSupplier}>Criar e selecionar</button></div></div>}
      <label className="field full"><span>Descrição</span><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="field"><span>Valor</span><input required inputMode="numeric" value={form.originalAmount} placeholder="0,00" onChange={e=>setForm({...form,originalAmount:formatMoneyInput(e.target.value)})}/><small>Digite apenas os números; os centavos e separadores são aplicados automaticamente.</small></label><label className="field"><span>Emissão</span><input type="date" value={form.issueDate} onChange={e=>setForm({...form,issueDate:e.target.value})}/></label><label className="field"><span>Competência</span><input required type="month" value={form.competenceMonth} onChange={e=>setForm({...form,competenceMonth:e.target.value})}/><small>Mês e ano de competência</small></label><label className="field"><span>Vencimento</span><input required type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label></div>
      <h2>Classificação gerencial</h2><div className="grid"><Select label="Conta gerencial" value={form.managementAccountId} onChange={v=>setForm({...form,managementAccountId:v})} items={catalogs?.managementAccounts||[]}/><Select label="Centro de custo" value={form.costCenterId} onChange={v=>setForm({...form,costCenterId:v})} items={catalogs?.costCenters||[]}/><label className="field"><span>Classificação</span><select value={form.costDirectness} onChange={e=>setForm({...form,costDirectness:e.target.value})}><option value="INDIRECT">Indireto</option><option value="DIRECT">Direto</option></select></label><Select label="Linha de negócio" required={form.costDirectness==='DIRECT'} value={form.businessLineId} onChange={v=>setForm({...form,businessLineId:v})} items={catalogs?.businessLines||[]}/><Select label="Projeto" required={form.costDirectness==='DIRECT'} value={form.projectId} onChange={v=>setForm({...form,projectId:v})} items={catalogs?.projects||[]} disabled={!catalogs?.projects.length} placeholder={catalogs?.projects.length?'Selecione':'Nenhum projeto cadastrado'}/></div>
      <div className="actions"><button className="primary" disabled={!catalogs}>Salvar conta a pagar</button></div></form>
    <style jsx>{`*{box-sizing:border-box}.wrap{max-width:1100px;margin:0 auto;padding:32px 20px 64px;color:#172033}header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:24px}h1{font-size:32px;margin:4px 0}h2{font-size:18px;margin:24px 0 14px}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;color:#64748b}.muted{color:#64748b}.env,.card{border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:20px}.env{display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:end;margin-bottom:18px}.env label,.field{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.full{grid-column:1/-1}input,select,button{min-height:44px;border:1px solid #cbd5e1;border-radius:9px;padding:10px 12px;font:inherit;background:#fff}select:disabled{background:#f1f5f9;color:#64748b}button{cursor:pointer;font-weight:700}.primary{background:#172033;color:white;border-color:#172033}.actions,.quickActions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.errorBox,.successBox{padding:12px 14px;border-radius:10px;margin-bottom:14px}.errorBox{background:#fef2f2;color:#991b1b}.successBox{background:#f0fdf4;color:#166534}a{color:#334155;font-weight:700;text-decoration:none}.supplierField{position:relative}.results{position:absolute;top:70px;left:0;right:0;z-index:10;background:white;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 10px 25px rgba(15,23,42,.12);padding:6px;max-height:300px;overflow:auto}.results button{width:100%;text-align:left;border:0;background:white;display:flex;flex-direction:column;align-items:flex-start}.results button:hover{background:#f8fafc}.results small{color:#64748b}.createInline{color:#1d4ed8!important;border-top:1px solid #e2e8f0!important;border-radius:0!important}.noResult{padding:12px;color:#64748b}.selected{color:#166534}.quick{padding:16px;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff}.quickTitle{font-weight:800;margin-bottom:12px}.quickActions{margin-top:12px}.field small{font-weight:400;color:#64748b}@media(max-width:700px){header{flex-direction:column}.env,.grid{grid-template-columns:1fr}.full{grid-column:auto}.results{top:70px}}`}</style></main>
}
