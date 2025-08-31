import { useEffect, useRef, useState } from 'react'
import { db } from '@/db'
import type { Transaction } from '@/types'
import { parseAmount } from '@/utils'
import { getMXNtoUSD } from '@/utils'

export default function TransactionForm({ onSaved, tx }:{ onSaved:()=>void; tx?:Transaction }) {
  const initialDate = new Date().toISOString().substring(0,10)
  const [date, setDate] = useState(tx?.date ?? initialDate)
  const [description, setDescription] = useState(tx?.description ?? '')
  const [amount, setAmount] = useState(String(tx?.amount ?? ''))
  const [currency, setCurrency] = useState<'USD'|'MXN'>((tx?.currency as any) ?? 'USD')
  const [fxToBase, setFxToBase] = useState(String(tx?.fxToBase ?? '1'))
  const [type, setType] = useState<Transaction['type']>(tx?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState<number|undefined>(tx?.categoryId)
  const [subcategoryId, setSubcategoryId] = useState<number|undefined>(tx?.subcategoryId)
  const [accountId, setAccountId] = useState<number|undefined>(tx?.accountId)
  const [notes, setNotes] = useState(tx?.notes ?? '')
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [newSub, setNewSub] = useState('')
  const dateRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    db.categories.toArray().then(setCategories)
    db.accounts.toArray().then(setAccounts)
    db.settings.get('settings').then(s=>setBaseCurrency(s?.baseCurrency ?? 'USD'))
  },[])

  useEffect(()=>{
    if (categoryId) db.subcategories.where('categoryId').equals(categoryId).toArray().then(setSubcategories)
    else setSubcategories([])
    setSubcategoryId(undefined)
  },[categoryId])

  useEffect(()=>{
    (async ()=>{
      if (baseCurrency !== 'USD') return
      if (currency === 'USD') { setFxToBase('1'); return }
      const s = await db.settings.get('settings')
      const saved = s?.fx?.MXN
      try { const mxnToUsd = await getMXNtoUSD(); setFxToBase(String(mxnToUsd)) }
      catch { if (saved) setFxToBase(String(saved)); else setFxToBase('0.055'); alert('Could not fetch rate. Using saved/default MXN→USD. You can update it in Settings.') }
    })()
  }, [currency, baseCurrency])

  async function addSubcategory() {
    if (!categoryId || !newSub.trim()) return
    const id = await db.subcategories.add({ name: newSub.trim(), categoryId })
    setNewSub('')
    setSubcategories(await db.subcategories.where('categoryId').equals(categoryId).toArray())
    setSubcategoryId(id)
  }

  async function save() {
    const amt = parseAmount(amount)
    const fx = Number(fxToBase) || 1
    const amountBase = Math.abs(amt) * fx
    const data: Transaction = { date, description, amount: amt, currency, fxToBase: fx, amountBase, type, categoryId, subcategoryId, accountId, notes: notes || undefined }
    if (tx?.id) { data.id = tx.id; await db.transactions.put(data); onSaved(); return }
    await db.transactions.add(data); onSaved()
    setDate(initialDate); setDescription(''); setAmount(''); setCurrency('USD'); setFxToBase('1'); setType('expense'); setCategoryId(undefined); setSubcategoryId(undefined); setAccountId(undefined); setNotes('')
    setTimeout(()=> dateRef.current?.focus(), 0)
  }

  return (
    <div className="card card-pad">
      <div className="grid md:grid-cols-4 gap-3">
        <div><label className="label">Date</label><input ref={dateRef} className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">Description</label><input className="input" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" /></div>
        <div><label className="label">Type</label><select className="select" value={type} onChange={e=>setType(e.target.value as any)}><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option></select></div>
        <div><label className="label">Amount</label><input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" /></div>
        <div><label className="label">Currency</label><select className="select" value={currency} onChange={e=>setCurrency(e.target.value as any)}><option value="USD">USD</option><option value="MXN">MXN</option></select></div>
        <div><label className="label">FX → {baseCurrency} (auto)</label><input className="input" value={fxToBase} onChange={e=>setFxToBase(e.target.value)} placeholder="1.0" /></div>
        <div><label className="label">Category</label><select className="select" value={categoryId ?? ''} onChange={e=>setCategoryId(e.target.value?Number(e.target.value):undefined)}><option value="">--</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div>
          <label className="label">Subcategory</label>
          <select className="select" value={subcategoryId ?? ''} onChange={e=>setSubcategoryId(e.target.value?Number(e.target.value):undefined)}>
            <option value="">--</option>
            {subcategories.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2 mt-2">
            <input className="input" placeholder="Add new subcategory" value={newSub} onChange={e=>setNewSub(e.target.value)} />
            <button className="btn" onClick={addSubcategory}>Add</button>
          </div>
        </div>
        <div><label className="label">Payment Method</label><select className="select" value={accountId ?? ''} onChange={e=>setAccountId(e.target.value?Number(e.target.value):undefined)}><option value="">--</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div className="md:col-span-4"><label className="label">Notes</label><input className="input" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
      </div>
      <div className="pt-4 flex gap-2">
        <button className="btn btn-primary" onClick={save}>{tx?.id ? 'Update' : 'Add'} Transaction</button>
      </div>
    </div>
  )
}
