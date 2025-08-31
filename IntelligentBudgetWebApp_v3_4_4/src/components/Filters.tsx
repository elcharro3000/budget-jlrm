import { useEffect, useState } from 'react'
import { db } from '@/db'
export default function Filters({ onChange }:{ onChange:(f:any)=>void }) {
  const [q, setQ] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [categories, setCategories] = useState<any[]>([]); const [accounts, setAccounts] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState<number|undefined>(); const [accountId, setAccountId] = useState<number|undefined>()
  const [type, setType] = useState<'all'|'expense'|'income'|'transfer'>('all')
  useEffect(()=>{ db.categories.toArray().then(setCategories); db.accounts.toArray().then(setAccounts) },[])
  useEffect(()=>{ onChange({ q, from, to, categoryId, accountId, type }) },[q,from,to,categoryId,accountId,type])
  return (
    <div className="card card-pad grid md:grid-cols-6 gap-3 items-end">
      <div><label className="label">Search</label><input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Text..." /></div>
      <div><label className="label">From</label><input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} /></div>
      <div><label className="label">To</label><input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} /></div>
      <div><label className="label">Category</label><select className="select" value={categoryId ?? ''} onChange={e=>setCategoryId(e.target.value?Number(e.target.value):undefined)}><option value="">All</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className="label">Payment Method</label><select className="select" value={accountId ?? ''} onChange={e=>setAccountId(e.target.value?Number(e.target.value):undefined)}><option value="">All</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      <div><label className="label">Type</label><select className="select" value={type} onChange={e=>setType(e.target.value as any)}><option value="all">All</option><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option></select></div>
    </div>
  )
}
