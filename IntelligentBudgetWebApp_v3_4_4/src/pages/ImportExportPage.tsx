import { db } from '@/db'
import { useRef } from 'react'

export default function ImportExportPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  async function exportAll(){
    const data = {
      transactions: await db.transactions.toArray(),
      categories: await db.categories.toArray(),
      subcategories: await db.subcategories.toArray(),
      accounts: await db.accounts.toArray(),
      budgets: await db.budgets.toArray(),
      settings: await db.settings.toArray()
    }
    const blob = new Blob([JSON.stringify(data,null,2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'intelligent-budget-backup.json'; a.click(); URL.revokeObjectURL(url)
  }

  function clickImport(){ fileRef.current?.click() }

  async function importAll(e: any){
    const file = e.target.files?.[0]; if(!file) return
    const text = await file.text()
    let data: any
    try { data = JSON.parse(text) } catch { alert('Invalid JSON'); return }
    // Accept both long and shorthand keys
    const transactions = data.transactions ?? data.txs ?? []
    const categories = data.categories ?? data.cats ?? []
    const subcategories = data.subcategories ?? data.subs ?? []
    const accounts = data.accounts ?? data.acs ?? []
    const budgets = data.budgets ?? data.bds ?? []
    const settingsSingle = data.settings ?? data.s ?? null
    const settingsArr = Array.isArray(data.settings) ? data.settings : (settingsSingle ? [settingsSingle] : [])

    if(!confirm('This will merge data into your current database. Proceed?')) return

    if (categories.length) await db.categories.bulkPut(categories)
    if (subcategories.length) await db.subcategories.bulkPut(subcategories)
    if (accounts.length) await db.accounts.bulkPut(accounts)
    if (transactions.length) await db.transactions.bulkPut(transactions)
    if (budgets.length) await db.budgets.bulkPut(budgets)
    if (settingsArr.length) for (const s of settingsArr) await db.settings.put(s)

    alert('Imported! The page will reload to show your data.')
    location.reload()
  }

  return (
    <div className="card card-pad space-y-3">
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={exportAll}>Export JSON</button>
        <button className="btn" onClick={clickImport}>Import JSON</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={importAll} className="hidden" />
      </div>
      <div className="text-sm text-slate-500">
        Import accepts either keys <code>transactions/categories/subcategories/accounts/budgets/settings</code> or shorthand <code>txs/cats/subs/acs/bds/s</code>.
      </div>
    </div>
  )
}
