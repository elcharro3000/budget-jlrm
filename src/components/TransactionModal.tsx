import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, DollarSign, Calendar, FileText, CreditCard, Tag, Folder } from 'lucide-react'
import { db } from '@/db'
import type { Transaction } from '@/types'
import { parseAmount, getMXNtoUSD } from '@/utils'
import toast from 'react-hot-toast'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  transaction?: Transaction
}

export default function TransactionModal({ isOpen, onClose, onSaved, transaction }: TransactionModalProps) {
  const initialDate = new Date().toISOString().substring(0, 10)
  const [date, setDate] = useState(transaction?.date ?? initialDate)
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(String(transaction?.amount ?? ''))
  const [currency, setCurrency] = useState<'USD' | 'MXN'>((transaction?.currency as any) ?? 'USD')
  const [fxToBase, setFxToBase] = useState(String(transaction?.fxToBase ?? '1'))
  const [type, setType] = useState<Transaction['type']>(transaction?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState<number | undefined>(transaction?.categoryId)
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>(transaction?.subcategoryId)
  const [accountId, setAccountId] = useState<number | undefined>(transaction?.accountId)
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [newSub, setNewSub] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const descriptionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      db.categories.toArray().then(setCategories)
      db.accounts.toArray().then(setAccounts)
      db.settings.get('settings').then(s => setBaseCurrency(s?.baseCurrency ?? 'USD'))
      setTimeout(() => descriptionRef.current?.focus(), 100)
    }
  }, [isOpen])

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

      if (transaction?.id) {
        data.id = transaction.id
        await db.transactions.put(data)
        toast.success('Transaction updated!')
      } else {
        await db.transactions.add(data)
        toast.success('Transaction added!')
      }

      onSaved()
      onClose()
      
      // Reset form for new transactions
      if (!transaction?.id) {
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
      }
    } catch (error) {
      toast.error('Failed to save transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const typeOptions = [
    { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'text-red-400' },
    { value: 'income', label: 'Income', icon: TrendingUp, color: 'text-green-400' },
    { value: 'transfer', label: 'Transfer', icon: CreditCard, color: 'text-blue-400' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {transaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg glass-button flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
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
                    ref={descriptionRef}
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
                          flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                          ${type === option.value 
                            ? 'bg-white/20 border-2 border-blue-400' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }
                        `}
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-xs font-medium">{option.label}</span>
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
                        placeholder="New subcategory"
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
                      {transaction ? 'Update' : 'Add'} Transaction
                    </>
                  )}
                </button>
                <button onClick={onClose} className="btn">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}