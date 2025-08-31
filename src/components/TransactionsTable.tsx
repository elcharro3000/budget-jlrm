import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, DollarSign } from 'lucide-react'
import { db } from '@/db'
import type { Transaction } from '@/types'
import { fmtCurrency } from '@/utils'
import TransactionModal from './TransactionModal'
import toast from 'react-hot-toast'

export default function TransactionsTable({ filters }: { filters: any }) {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [subs, setSubs] = useState<Record<number, string>>({})
  const [accounts, setAccounts] = useState<Record<number, string>>({})

  useEffect(() => {
    db.settings.get('settings').then(s => setBaseCurrency(s?.baseCurrency ?? 'USD'))
  }, [])

  useEffect(() => {
    db.categories.toArray().then(arr => {
      const map: Record<number, string> = {}
      arr.forEach(c => { if (c.id) map[c.id] = c.name })
      setCategories(map)
    })
    db.subcategories.toArray().then(arr => {
      const map: Record<number, string> = {}
      arr.forEach(s => { if (s.id) map[s.id] = s.name })
      setSubs(map)
    })
    db.accounts.toArray().then(arr => {
      const map: Record<number, string> = {}
      arr.forEach(a => { if (a.id) map[a.id] = a.name })
      setAccounts(map)
    })
  }, [])

  useEffect(() => {
    db.transactions.toArray().then(setTxs)
  }, [editing])

  const filtered = useMemo(() =>
    txs.filter(t => {
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
    }).sort((a, b) => (a.date < b.date ? 1 : -1))
  , [txs, filters])

  async function remove(id: number) {
    if (!confirm('Delete this transaction?')) return
    try {
      await db.transactions.delete(id)
      setTxs(await db.transactions.toArray())
      toast.success('Transaction deleted')
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditing(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditing(undefined)
  }

  const handleSaved = () => {
    handleModalClose()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'badge-green'
      case 'expense': return 'badge-red'
      case 'transfer': return 'badge-blue'
      default: return 'badge-blue'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="section-title">All Transactions ({filtered.length})</h3>
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or add some transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[1000px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Base Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, index) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="font-mono text-sm">{t.date}</td>
                    <td className="font-medium">{t.description}</td>
                    <td>
                      <span className={`badge ${getTypeColor(t.type)}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>{t.categoryId ? categories[t.categoryId] : '—'}</td>
                    <td>{t.subcategoryId ? subs[t.subcategoryId] : '—'}</td>
                    <td>{t.accountId ? accounts[t.accountId] : '—'}</td>
                    <td className="font-mono">{t.currency} {t.amount.toFixed(2)}</td>
                    <td className="font-mono font-medium">
                      {fmtCurrency(t.amountBase, baseCurrency)}
                    </td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          onClick={() => handleEdit(t)}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        {t.id && (
                          <button
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                            onClick={() => remove(t.id!)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSaved={handleSaved}
        transaction={editing}
      />
    </div>
  )
}