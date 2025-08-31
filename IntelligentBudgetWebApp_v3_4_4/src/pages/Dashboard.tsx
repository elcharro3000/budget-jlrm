import { useEffect, useMemo, useRef, useState } from 'react'
import { db } from '@/db'
import type { Transaction, Budget } from '@/types'
import { fmtCurrency, monthKey, COLORS } from '@/utils'
import SummaryCards from '@/components/SummaryCards'
import Filters from '@/components/Filters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function Dashboard() {
  const [filters, setFilters] = useState<any>({})
  const [txs, setTxs] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [subnames, setSubnames] = useState<Record<number, string>>({})
  const [accounts, setAccounts] = useState<Record<number, string>>({})
  const reportRef = useRef<HTMLDivElement>(null)

  async function refresh() {
    const [ts, bs, cs, ss, ac] = await Promise.all([
      db.transactions.toArray(), db.budgets.toArray(), db.categories.toArray(), db.subcategories.toArray(), db.accounts.toArray()
    ])
    setTxs(ts); setBudgets(bs)
    const cmap: Record<number,string> = {}; cs.forEach(c=>{ if(c.id) cmap[c.id]=c.name }); setCategories(cmap)
    const smap: Record<number,string> = {}; ss.forEach(s=>{ if(s.id) smap[s.id]=s.name }); setSubnames(smap)
    const amap: Record<number,string> = {}; ac.forEach(a=>{ if(a.id) amap[a.id]=a.name }); setAccounts(amap)
  }

  useEffect(() => { db.settings.get('settings').then(s=>setBaseCurrency(s?.baseCurrency ?? 'USD')); refresh() }, [])

  const filtered = useMemo(() => txs.filter(t => {
    if (filters.q) { const q = filters.q.toLowerCase(); if (!(`${t.description} ${t.notes ?? ''}`.toLowerCase().includes(q))) return false }
    if (filters.from && t.date < filters.from) return false
    if (filters.to && t.date > filters.to) return false
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false
    if (filters.accountId && t.accountId !== filters.accountId) return false
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false
    return true
  }), [txs, filters])

  const totals = useMemo(() => {
    let totalIncome = 0, totalExpense = 0
    for (const t of filtered) { if (t.type === 'income') totalIncome += t.amountBase; if (t.type === 'expense') totalExpense += t.amountBase }
    return { totalIncome, totalExpense }
  }, [filtered])

  const fmt0 = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: baseCurrency, maximumFractionDigits: 0 }), [baseCurrency])
  const shortName = (s:string) => s.length > 14 ? s.slice(0,14) + '…' : s
  const TOP_N_CATEGORIES = 8

  const byCategory = useMemo(() => {
    const map = new Map<number, number>()
    for (const t of filtered) { if (t.type !== 'expense' || !t.categoryId) continue; map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amountBase) }
    const arr = Array.from(map.entries()).map(([id, v]) => ({ name: categories[id] ?? 'Uncategorized', value: v }))
    arr.sort((a,b)=> b.value - a.value)
    const top = arr.slice(0, TOP_N_CATEGORIES)
    const others = arr.slice(TOP_N_CATEGORIES).reduce((s,r)=> s+r.value, 0)
    return others>0 ? [...top, { name: 'Other', value: others }] : top
  }, [filtered, categories])

  const bySubcategory = useMemo(() => {
    const map = new Map<number, number>()
    for (const t of filtered) { if (t.type !== 'expense' || !t.subcategoryId) continue; map.set(t.subcategoryId, (map.get(t.subcategoryId) ?? 0) + t.amountBase) }
    const arr = Array.from(map.entries()).map(([id, v]) => ({ name: subnames[id] ?? '—', value: v }))
    return arr.sort((a,b)=>b.value-a.value).slice(0,10)
  }, [filtered, subnames])

  const byAccount = useMemo(() => {
    const map = new Map<number, number>()
    for (const t of filtered) { if (t.type !== 'expense' || !t.accountId) continue; map.set(t.accountId, (map.get(t.accountId) ?? 0) + t.amountBase) }
    return Array.from(map.entries()).map(([id, v]) => ({ name: accounts[id] ?? 'N/A', value: v }))
  }, [filtered, accounts])

  const budgetView = useMemo(() => {
    const month = filters.from ? filters.from.slice(0,7) : monthKey(new Date().toISOString())
    const bs = budgets.filter(b => b.month === month)
    return bs.map(b => {
      const spent = filtered.filter(t => t.type==='expense' && t.categoryId === b.categoryId && monthKey(t.date)===month)
                            .reduce((sum, t)=> sum + t.amountBase, 0)
      const pct = b.amountBase === 0 ? 0 : Math.round(spent / b.amountBase * 100)
      return { category: categories[b.categoryId] ?? 'Unknown', budget: b.amountBase, actual: spent, pct }
    }).sort((a,b)=> (b.actual - a.actual))
  }, [filtered, budgets, categories, filters])

  async function exportDashboardPDF() {
    if (!reportRef.current) return
    const el = reportRef.current
    const canvas = await html2canvas(el, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
    const w = canvas.width * ratio; const h = canvas.height * ratio
    pdf.addImage(imgData, 'PNG', (pageWidth - w)/2, 20, w, h)
    pdf.save('dashboard-report.pdf')
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex gap-2">
        <button className="btn btn-primary" onClick={exportDashboardPDF}>Download Dashboard PDF</button>
        <button className="btn" onClick={()=>window.print()}>Print</button>
      </div>

      <div className="no-print"><Filters onChange={setFilters} /></div>

      <div ref={reportRef} className="space-y-4">
        <SummaryCards baseCurrency={baseCurrency} totalIncome={totals.totalIncome} totalExpense={totals.totalExpense} />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card card-pad h-[420px]">
            <div className="section-title">Spending by Category (Top {TOP_N_CATEGORIES} + Other)</div>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie dataKey="value" data={byCategory} outerRadius={120} isAnimationActive>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmt0.format(v as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card card-pad h-[420px]">
            <div className="section-title">Spending by Payment Method</div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={byAccount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={shortName} interval={0} angle={-15} height={60} />
                <YAxis />
                <Tooltip formatter={(v: any) => fmt0.format(v as number)} />
                <Bar dataKey="value" name="Spent" fill="#6366F1">
                  <LabelList dataKey="value" position="top" formatter={(v: any) => fmt0.format(v as number)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad h-[420px]">
          <div className="section-title">Top Subcategories</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={bySubcategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={shortName} interval={0} angle={-15} height={60} />
              <YAxis />
              <Tooltip formatter={(v: any) => fmt0.format(v as number)} />
              <Bar dataKey="value" name="Spent" fill="#10B981">
                <LabelList dataKey="value" position="top" formatter={(v: any) => fmt0.format(v as number)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-pad">
          <div className="section-title">Budget vs Actual (current month unless filtered)</div>
          <div className="space-y-3">
            {budgetView.length === 0 && <div className="text-slate-500 text-sm">No budgets set for this month yet.</div>}
            {budgetView.map((b, i) => {
              const capped = Math.min(100, Math.max(0, b.pct))
              const overflow = Math.max(0, Math.min(200, b.pct) - 100)
              const overAmt = Math.max(0, b.actual - b.budget)
              const status = b.pct>100 ? `Over by ${fmtCurrency(overAmt, baseCurrency)} (${b.pct}%)`
                          : b.pct>=80 ? `On track (${b.pct}%)` : `Under (${b.pct}%)`
              return (
                <div key={i} className="grid md:grid-cols-6 gap-3 items-center">
                  <div className="md:col-span-2 font-medium">{b.category}</div>
                  <div>{fmtCurrency(b.actual, baseCurrency)}</div>
                  <div className="text-slate-500">{fmtCurrency(b.budget, baseCurrency)}</div>
                  <div className="text-sm">
                    <div className="progress">
                      <span style={{ width: `${capped}%` }}></span>
                      {overflow>0 && <span style={{ width: `${overflow}%` }} className="block h-full bg-rose-500 absolute left-full"></span>}
                    </div>
                  </div>
                  <div className={`${b.pct>100?'text-rose-600':'text-slate-600'} text-xs`}>{status}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
