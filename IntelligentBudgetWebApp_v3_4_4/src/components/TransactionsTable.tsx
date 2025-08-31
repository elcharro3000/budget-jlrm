import { useEffect, useMemo, useState } from 'react'
import { db } from '@/db'
import type { Transaction } from '@/types'
import { fmtCurrency } from '@/utils'
import TransactionForm from './TransactionForm'

export default function TransactionsTable({ filters }:{ filters:any }) {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [editing, setEditing] = useState<Transaction|undefined>()
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [subs, setSubs] = useState<Record<number, string>>({})
  const [accounts, setAccounts] = useState<Record<number, string>>({})

  useEffect(() => { db.settings.get('settings').then(s=>setBaseCurrency(s?.baseCurrency ?? 'USD')) }, [])

  useEffect(() => {
    db.categories.toArray().then(arr => { const map: Record<number, string> = {}; arr.forEach(c=>{ if (c.id) map[c.id] = c.name }); setCategories(map) })
    db.subcategories.toArray().then(arr => { const map: Record<number, string> = {}; arr.forEach(s=>{ if (s.id) map[s.id] = s.name }); setSubs(map) })
    db.accounts.toArray().then(arr => { const map: Record<number, string> = {}; arr.forEach(a=>{ if (a.id) map[a.id] = a.name }); setAccounts(map) })
  }, [])

  useEffect(() => { db.transactions.toArray().then(setTxs) }, [editing])

  const filtered = useMemo(() =>
    txs.filter(t => {
      if (filters.q) { const q = filters.q.toLowerCase(); if (!(`${t.description} ${t.notes ?? ''}`.toLowerCase().includes(q))) return false }
      if (filters.from && t.date < filters.from) return false
      if (filters.to && t.date > filters.to) return false
      if (filters.categoryId && t.categoryId !== filters.categoryId) return false
      if (filters.accountId && t.accountId !== filters.accountId) return false
      if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false
      return true
    }).sort((a,b)=> (a.date < b.date ? 1 : -1))
  , [txs, filters])

  async function remove(id:number) {
    if (confirm('Delete this transaction?')) { await db.transactions.delete(id); setTxs(await db.transactions.toArray()) }
  }

  return (
    <div className="card card-pad overflow-auto">
      {editing && (
        <div className="mb-4">
          <div className="font-semibold mb-2">Edit Transaction</div>
          <TransactionForm tx={editing} onSaved={() => setEditing(undefined)} />
        </div>
      )}
      <table className="table min-w-[1000px]">
        <thead>
          <tr>
            <th>Date</th><th>Description</th><th>Type</th>
            <th>Category</th><th>Subcat</th><th>Payment</th>
            <th>Amount</th><th>Base</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.description}</td>
              <td><span className={`badge ${t.type==='income'?'badge-green': t.type==='expense'?'badge-red':'badge-blue'}`}>{t.type}</span></td>
              <td>{t.categoryId ? categories[t.categoryId] : '-'}</td>
              <td>{t.subcategoryId ? subs[t.subcategoryId] : '-'}</td>
              <td>{t.accountId ? accounts[t.accountId] : '-'}</td>
              <td>{t.currency} {t.amount.toFixed(2)}</td>
              <td>{fmtCurrency(t.amountBase, baseCurrency)}</td>
              <td className="text-right">
                <button className="btn mr-2" onClick={()=>setEditing(t)}>Edit</button>
                {t.id && <button className="btn" onClick={()=>remove(t.id!)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
