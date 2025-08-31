import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { db } from '@/db'
import type { Transaction, Budget } from '@/types'
import { monthKey } from '@/utils'
import SummaryCards from '@/components/SummaryCards'
import Filters from '@/components/Filters'
import SpendingChart from '@/components/SpendingChart'
import RecentTransactions from '@/components/RecentTransactions'
import BudgetProgress from '@/components/BudgetProgress'
import SpendingTrends from '@/components/SpendingTrends'
import TransactionModal from '@/components/TransactionModal'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [filters, setFilters] = useState<any>({})
  const [txs, setTxs] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [accounts, setAccounts] = useState<Record<number, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()

  async function refresh() {
    const [ts, bs, cs, ac] = await Promise.all([
      db.transactions.toArray(),
      db.budgets.toArray(),
      db.categories.toArray(),
      db.accounts.toArray()
    ])
    setTxs(ts)
    setBudgets(bs)
    
    const cmap: Record<number, string> = {}
    cs.forEach(c => { if (c.id) cmap[c.id] = c.name })
    setCategories(cmap)
    
    const amap: Record<number, string> = {}
    ac.forEach(a => { if (a.id) amap[a.id] = a.name })
    setAccounts(amap)
  }

  useEffect(() => {
    db.settings.get('settings').then(s => setBaseCurrency(s?.baseCurrency ?? 'USD'))
    refresh()
  }, [])

  const filtered = useMemo(() => txs.filter(t => {
    if (filters.q) {
      const q = filters.q.toLowerCase()
      if (!(`${t.description} ${t.notes ?? ''}`.toLowerCase().includes(q))) return false
    }
    if (filters.from && t.date < filters.from) return false
    if (filters.to && t.date > filters.to) return false
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false
    if (filters.accountId && t.accountId !== filters.accountId) return false
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false
    return true
  }), [txs, filters])

  const totals = useMemo(() => {
    let totalIncome = 0, totalExpense = 0
    for (const t of filtered) {
      if (t.type === 'income') totalIncome += t.amountBase
      if (t.type === 'expense') totalExpense += t.amountBase
    }
    return { totalIncome, totalExpense }
  }, [filtered])

  const totalBudget = useMemo(() => {
    const currentMonth = monthKey(new Date().toISOString())
    return budgets
      .filter(b => b.month === currentMonth)
      .reduce((sum, b) => sum + b.amountBase, 0)
  }, [budgets])

  const byCategory = useMemo(() => {
    const map = new Map<number, number>()
    for (const t of filtered) {
      if (t.type !== 'expense' || !t.categoryId) continue
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amountBase)
    }
    const arr = Array.from(map.entries()).map(([id, v]) => ({
      name: categories[id] ?? 'Uncategorized',
      value: v
    }))
    arr.sort((a, b) => b.value - a.value)
    const top = arr.slice(0, 8)
    const others = arr.slice(8).reduce((s, r) => s + r.value, 0)
    return others > 0 ? [...top, { name: 'Other', value: others }] : top
  }, [filtered, categories])

  const budgetView = useMemo(() => {
    const month = filters.from ? filters.from.slice(0, 7) : monthKey(new Date().toISOString())
    const bs = budgets.filter(b => b.month === month)
    return bs.map(b => {
      const spent = filtered.filter(t => 
        t.type === 'expense' && 
        t.categoryId === b.categoryId && 
        monthKey(t.date) === month
      ).reduce((sum, t) => sum + t.amountBase, 0)
      const pct = b.amountBase === 0 ? 0 : Math.round(spent / b.amountBase * 100)
      return {
        category: categories[b.categoryId] ?? 'Unknown',
        budget: b.amountBase,
        actual: spent,
        pct
      }
    }).sort((a, b) => b.actual - a.actual)
  }, [filtered, budgets, categories, filters])

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await db.transactions.delete(id)
      await refresh()
      toast.success('Transaction deleted')
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(undefined)
  }

  const handleTransactionSaved = () => {
    refresh()
    handleModalClose()
  }

  return (
    <div className="space-y-8">
      <Filters onChange={setFilters} />
      
      <SummaryCards
        baseCurrency={baseCurrency}
        totalIncome={totals.totalIncome}
        totalExpense={totals.totalExpense}
        totalBudget={totalBudget}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <SpendingChart data={byCategory} baseCurrency={baseCurrency} />
        <SpendingTrends transactions={filtered} baseCurrency={baseCurrency} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <RecentTransactions
          transactions={filtered.sort((a, b) => (a.date < b.date ? 1 : -1))}
          categories={categories}
          accounts={accounts}
          baseCurrency={baseCurrency}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
        <BudgetProgress budgets={budgetView} baseCurrency={baseCurrency} />
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fab"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSaved={handleTransactionSaved}
        transaction={editingTransaction}
      />
    </div>
  )
}