import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, CreditCard, Banknote, Trash2 } from 'lucide-react'
import { db } from '@/db'
import toast from 'react-hot-toast'

const accountTypeIcons = {
  account: Banknote,
  credit: CreditCard,
  debit: CreditCard,
  cash: Wallet
}

const accountTypeColors = {
  account: 'text-blue-400 bg-blue-500/20',
  credit: 'text-red-400 bg-red-500/20',
  debit: 'text-green-400 bg-green-500/20',
  cash: 'text-yellow-400 bg-yellow-500/20'
}

export default function AccountsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('account')

  useEffect(() => {
    db.accounts.toArray().then(setRows)
  }, [])

  async function add() {
    if (!name.trim()) {
      toast.error('Payment method name is required')
      return
    }
    try {
      await db.accounts.add({ name: name.trim(), type: type as any })
      setRows(await db.accounts.toArray())
      setName('')
      toast.success('Payment method added!')
    } catch {
      toast.error('Failed to add payment method')
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this payment method?')) return
    try {
      await db.accounts.delete(id)
      setRows(await db.accounts.toArray())
      toast.success('Payment method deleted')
    } catch {
      toast.error('Failed to delete payment method')
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
          <h2 className="text-2xl font-bold gradient-text">Payment Methods</h2>
          <p className="text-white/60 mt-1">Manage your accounts, cards, and payment methods</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="section-title">Add New Payment Method</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <Wallet className="w-4 h-4 inline mr-2" />
              Name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Chase Checking"
              onKeyPress={e => e.key === 'Enter' && add()}
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="select"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="account">Bank Account</option>
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={add}>
              <Plus className="w-4 h-4" />
              Add Method
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
          <Wallet className="w-5 h-5 text-blue-400" />
          <h3 className="section-title">Your Payment Methods ({rows.length})</h3>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No payment methods yet</p>
            <p className="text-sm">Add your accounts and cards to track spending by payment method</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((account, index) => {
              const Icon = accountTypeIcons[account.type as keyof typeof accountTypeIcons] || Wallet
              const colorClass = accountTypeColors[account.type as keyof typeof accountTypeColors] || 'text-gray-400 bg-gray-500/20'
              
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{account.name}</h4>
                        <p className="text-xs text-white/60 capitalize">{account.type}</p>
                      </div>
                    </div>
                    {account.id && (
                      <button
                        onClick={() => remove(account.id!)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}