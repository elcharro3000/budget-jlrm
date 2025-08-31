import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar, Filter, X } from 'lucide-react'
import { db } from '@/db'

export default function Filters({ onChange }: { onChange: (f: any) => void }) {
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [accountId, setAccountId] = useState<number | undefined>()
  const [type, setType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    db.categories.toArray().then(setCategories)
    db.accounts.toArray().then(setAccounts)
  }, [])

  useEffect(() => {
    onChange({ q, from, to, categoryId, accountId, type })
  }, [q, from, to, categoryId, accountId, type])

  const clearFilters = () => {
    setQ('')
    setFrom('')
    setTo('')
    setCategoryId(undefined)
    setAccountId(undefined)
    setType('all')
  }

  const hasActiveFilters = q || from || to || categoryId || accountId || type !== 'all'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="glass-button text-sm"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="input pl-10"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search transactions..."
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="input pl-10"
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            placeholder="From date"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="input pl-10"
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="To date"
          />
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              className="select"
              value={categoryId ?? ''}
              onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select
              className="select"
              value={accountId ?? ''}
              onChange={e => setAccountId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All Methods</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Transaction Type</label>
            <select
              className="select"
              value={type}
              onChange={e => setType(e.target.value as any)}
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="transfer">Transfers</option>
            </select>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}