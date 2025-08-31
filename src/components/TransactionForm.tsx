import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, Calendar, FileText, CreditCard, Tag, Folder } from 'lucide-react'
import { db } from '@/db'
import type { Transaction } from '@/types'
import { parseAmount, getMXNtoUSD } from '@/utils'
import toast from 'react-hot-toast'

export default function TransactionForm({ onSaved, tx }: { onSaved: () => void; tx?: Transaction }) {
  const initialDate = new Date().toISOString().substring(0, 10)
  const [date, setDate] = useState(tx?.date ?? initialDate)
  const [description, setDescription] = useState(tx?.description ?? '')
  const [amount, setAmount] = useState(String(tx?.amount ?? ''))
  const [currency, setCurrency] = useState<'USD' | 'MXN'>((tx?.currency as any) ?? 'USD')
  const [fxToBase, setFxToBase] = useState(String(tx?.fxToBase ?? '1'))
  const [type, setType] = useState<Transaction['type']>(tx?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState<number | undefined>(tx?.categoryId)
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>(tx?.subcategoryId)
  const [accountId, setAccountId] = useState<number | undefined>(tx?.accountId)
  const [notes, setNotes] = useState(tx?.notes ?? '')
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [newSub, setNewSub] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    db.categories.toArray().then(setCategories)
    db.accounts.toArray().then(setAccounts)
    db.settings.get('settings').then(s => setBaseCurrency(s?.baseCurrency ?? 'USD'))
  }, [])

  useEffect(() => {
    if (categoryId) {
      db.subcategories.where('categoryId').equals(categoryId).toArray().then(setSubcategories)
    } else {
      setSubcategories([])
    }
    setSubcategoryId(undefined)
  }, [categoryId])

  useEffect(() => {
    (async () => {
      if (baseCurrency !== 'USD') return
      if (currency === 'USD') { setFxToBase('1'); return }
      const s = await db.settings.get('settings')
      const saved = s?.fx?.MXN
      try {
        const mxnToUsd = await getMXNtoUSD()
        setFxToBase(String(mxnToUsd))
      } catch {
        if (saved) setFxToBase(String(saved))
        else setFxToBase('0.055')
        toast.error('Could not fetch exchange rate. Using saved/default rate.')
      }
    })()
  }, [currency, baseCurrency])

  async function addSubcategory() {
    if (!categoryId || !newSub.trim()) return
    const id = await db.subcategories.add({ name: newSub.trim(), categoryId })
    setNewSub('')
    setSubcategories(await db.subcategories.where('categoryId').equals(categoryId).toArray())
    setSubcategoryId(id)
    toast.success('Subcategory added!')
  }

  async function save() {
    if (!description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!amount.trim()) {
      toast.error('Amount is required')
      return
    }

    setIsLoading(true)
    try {
      const amt = parseAmount(amount)
      const fx = Number(fxToBase) || 1
      const amountBase = Math.abs(amt) * fx
      const data: Transaction = {
        date,
        description: description.trim(),
        amount: amt,
        currency,
        fxToBase: fx,
        amountBase,
        type,
        categoryId,
        subcategoryId,
        accountId,
        notes: notes.trim() || undefined
      }

      if (tx?.id) {
        data.id = tx.id
        await db.transactions.put(data)
        toast.success('Transaction updated!')
      } else {
        await db.transactions.add(data)
        toast.success('Transaction added!')
      }

      onSaved()
      
      // Reset form for new transactions
      if (!tx?.id) {
        setDate(initialDate)
        setDescription('')
        setAmount('')
        setCurrency('USD')
        setFxToBase('1')
        setType('expense')
        setCategoryId(undefined)
        setSubcategoryId(undefined)
        setAccountId(undefined)
        setNotes('')
        setTimeout(() => dateRef.current?.focus(), 0)
      }
    } catch (error) {
      toast.error('Failed to save transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const typeOptions = [
    { value: 'expense', label: 'Expense', color: 'text-red-400' },
    { value: 'income', label: 'Income', color: 'text-green-400' },
    { value: 'transfer', label: 'Transfer', color: 'text-blue-400' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <h2 className="section-title">{tx ? 'Edit Transaction' : 'Add New Transaction'}</h2>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <input
              ref={dateRef}
              className="input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <input
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What was this for?"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setType(option.value as any)}
                  className={`
                    p-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${type === option.value 
                      ? 'bg-white/20 border-2 border-blue-400' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <span className={option.color}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Amount
            </label>
            <input
              className="input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <select
              className="select"
              value={currency}
              onChange={e => setCurrency(e.target.value as any)}
            >
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
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
              <Tag className="w-4 h-4 inline mr-2" />
              Subcategory
            </label>
            <select
              className="select"
              value={subcategoryId ?? ''}
              onChange={e => setSubcategoryId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {categoryId && (
              <div className="flex gap-2 mt-2">
                <input
                  className="input text-sm"
                  placeholder="Add new subcategory"
                  value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                />
                <button className="btn text-sm" onClick={addSubcategory}>
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment Method
            </label>
            <select
              className="select"
              value={accountId ?? ''}
              onChange={e => setAccountId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select payment method</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">FX Rate to {baseCurrency}</label>
            <input
              className="input"
              value={fxToBase}
              onChange={e => setFxToBase(e.target.value)}
              placeholder="1.0"
            />
          </div>
        </div>

        <div>
          <label className="label">Notes (Optional)</label>
          <input
            className="input"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Additional details..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            disabled={isLoading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {tx?.id ? 'Update' : 'Add'} Transaction
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}