import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  Car, 
  Home, 
  Utensils, 
  Coffee, 
  Gamepad2, 
  Plane, 
  GraduationCap,
  Zap,
  Smartphone,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react'
import type { Transaction } from '@/types'
import { fmtCurrency } from '@/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories: Record<number, string>
  accounts: Record<number, string>
  baseCurrency: string
  onEdit: (transaction: Transaction) => void
  onDelete: (id: number) => void
}

const categoryIcons: Record<string, any> = {
  'Housing': Home,
  'Groceries': ShoppingBag,
  'Restaurants': Utensils,
  'Transportation': Car,
  'Entertainment': Gamepad2,
  'Travel': Plane,
  'Education': GraduationCap,
  'Utilities': Zap,
  'Subscriptions': Smartphone,
  'Coffee': Coffee,
  'Income': DollarSign
}

export default function RecentTransactions({ 
  transactions, 
  categories, 
  accounts, 
  baseCurrency, 
  onEdit, 
  onDelete 
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 8)

  const getIcon = (categoryId?: number) => {
    if (!categoryId) return DollarSign
    const categoryName = categories[categoryId]
    return categoryIcons[categoryName] || DollarSign
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-emerald-400'
      case 'expense': return 'text-red-400'
      case 'transfer': return 'text-blue-400'
      default: return 'text-white/60'
    }
  }

  const getAmountDisplay = (transaction: Transaction) => {
    const sign = transaction.type === 'income' ? '+' : '-'
    return `${sign}${fmtCurrency(transaction.amountBase, baseCurrency)}`
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title">Recent Transactions</h3>
        <span className="text-sm text-white/60">{recent.length} of {transactions.length}</span>
      </div>

      <div className="space-y-3">
        {recent.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
          </div>
        ) : (
          recent.map((transaction, index) => {
            const Icon = getIcon(transaction.categoryId)
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${transaction.type === 'income' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : transaction.type === 'expense'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white truncate">{transaction.description}</h4>
                    <div className={`font-bold ${getTypeColor(transaction.type)}`}>
                      {getAmountDisplay(transaction)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                    <span>{transaction.date}</span>
                    {transaction.categoryId && (
                      <>
                        <span>•</span>
                        <span>{categories[transaction.categoryId]}</span>
                      </>
                    )}
                    {transaction.accountId && (
                      <>
                        <span>•</span>
                        <span>{accounts[transaction.accountId]}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => transaction.id && onDelete(transaction.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}