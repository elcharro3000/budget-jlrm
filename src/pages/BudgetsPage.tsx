import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, Calendar, DollarSign, Folder, Trash2 } from 'lucide-react'
import { db } from '@/db'
import type { Budget } from '@/types'
import { fmtCurrency } from '@/utils'
import toast from 'react-hot-toast'

export default function BudgetsPage() {
  const [rows, setRows] = useState<Budget[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [amount, setAmount] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')

  useEffect(() => {
    const refetch = () => db.categories.toArray().then(setCategories)
    refetch()
    db.settings.get('settings').then(s => setBaseCurrency(s?.baseCurrency ?? 'USD'))
    window.addEventListener('focus', refetch)
    return () => window.removeEventListener('focus', refetch)
  }, [])

  useEffect(() => {
    db.budgets.where('month').equals(month).toArray().then(setRows)
  }, [month])

  async function add() {
    if (!categoryId) {
      toast.error('Please select a category')
      return
    }
    if (rows.find(r => r.categoryId === categoryId)) {
      toast.error('Budget for this category already exists for this month')
      return
    }
    if (!amount.trim()) {
      toast.error('Please enter a budget amount')
      return
    }

    try {
      await db.budgets.add({ month, categoryId, amountBase: Number(amount) || 0 })
      setRows(await db.budgets.where('month').equals(month).toArray())
      setAmount('')
      setCategoryId(undefined)
      toast.success('Budget added!')
    } catch {
      toast.error('Failed to add budget')
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this budget?')) return
    try {
      await db.budgets.delete(id)
      setRows(await db.budgets.where('month').equals(month).toArray())
      toast.success('Budget deleted')
    } catch {
      toast.error('Failed to delete budget')
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold gradient-text">Budget Management</h2>
          <p className="text-white/60 mt-1">Set and track your monthly spending limits</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="section-title">Add New Budget</h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Month
            </label>
            <input
              className="input"
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <Folder className="w-4 h-4 inline mr-2" />
              Category
            </label>
            <select
              className="select"
              value={categoryId ?? ''}
              onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Budget Amount ({baseCurrency})
            </label>
            <input
              className="input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end gap-2">
            <button className="btn" onClick={() => db.categories.toArray().then(setCategories)}>
              Refresh
            </button>
            <button className="btn-primary" onClick={add}>
              <Plus className="w-4 h-4" />
              Add Budget
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="section-title">Current Budgets</h3>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No budgets set for {month}</p>
            <p className="text-sm">Add your first budget to start tracking spending limits</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[600px]">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Month</th>
                  <th>Budget Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, index) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="font-medium">
                      {categories.find(c => c.id === r.categoryId)?.name ?? '—'}
                    </td>
                    <td className="font-mono text-sm">{r.month}</td>
                    <td className="font-mono font-medium">
                      {fmtCurrency(r.amountBase, baseCurrency)}
                    </td>
                    <td className="text-right">
                      {r.id && (
                        <button
                          className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                          onClick={() => remove(r.id!)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}