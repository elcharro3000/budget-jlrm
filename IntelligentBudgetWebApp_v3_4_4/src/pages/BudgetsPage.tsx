import { useEffect, useState } from 'react'
import { db } from '@/db'
import type { Budget } from '@/types'
import { fmtCurrency } from '@/utils'

export default function BudgetsPage() {
  const [rows, setRows] = useState<Budget[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [categoryId, setCategoryId] = useState<number|undefined>()
  const [amount, setAmount] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')

  useEffect(() => {
    const refetch = () => db.categories.toArray().then(setCategories)
    refetch()
    db.settings.get('settings').then(s=>setBaseCurrency(s?.baseCurrency ?? 'USD'))
    window.addEventListener('focus', refetch)
    return () => window.removeEventListener('focus', refetch)
  }, [])

  useEffect(() => { db.budgets.where('month').equals(month).toArray().then(setRows) }, [month])

  async function add() {
    if (!categoryId) return alert('Pick a category')
    if (rows.find(r=>r.categoryId===categoryId)) return alert('Budget for this category already exists for this month.')
    await db.budgets.add({ month, categoryId, amountBase: Number(amount)||0 })
    setRows(await db.budgets.where('month').equals(month).toArray())
    setAmount(''); setCategoryId(undefined)
  }

  async function remove(id:number) { if (!confirm('Delete budget?')) return; await db.budgets.delete(id); setRows(await db.budgets.where('month').equals(month).toArray()) }

  return (
    <div className="space-y-4">
      <div className="card card-pad grid md:grid-cols-5 gap-3">
        <div><label className="label">Month</label><input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">Category</label><select className="select" value={categoryId ?? ''} onChange={e=>setCategoryId(e.target.value ? Number(e.target.value) : undefined)}><option value="">--</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="label">Budget ({baseCurrency})</label><input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" /></div>
        <div className="flex items-end gap-2">
          <button className="btn" onClick={()=>db.categories.toArray().then(setCategories)}>Refresh Categories</button>
          <button className="btn btn-primary" onClick={add}>Add Budget</button>
        </div>
      </div>
      <div className="card card-pad overflow-auto">
        <table className="table min-w-[600px]">
          <thead><tr><th>Category</th><th>Month</th><th>Budget</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{categories.find(c=>c.id===r.categoryId)?.name ?? '-'}</td>
                <td>{r.month}</td>
                <td>{fmtCurrency(r.amountBase, baseCurrency)}</td>
                <td className="text-right">{r.id && <button className="btn" onClick={()=>remove(r.id!)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
