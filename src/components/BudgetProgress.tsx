import { motion } from 'framer-motion'
import { Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { fmtCurrency } from '@/utils'

interface BudgetItem {
  category: string
  budget: number
  actual: number
  pct: number
}

interface BudgetProgressProps {
  budgets: BudgetItem[]
  baseCurrency: string
}

export default function BudgetProgress({ budgets, baseCurrency }: BudgetProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card"
    >
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-blue-400" />
        <h3 className="section-title">Budget Progress</h3>
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No budgets set for this period</p>
          <p className="text-sm">Create budgets to track your spending</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget, index) => {
            const isOverBudget = budget.pct > 100
            const isNearLimit = budget.pct >= 80 && budget.pct <= 100
            const progressWidth = Math.min(100, budget.pct)
            const overflowWidth = Math.max(0, Math.min(100, budget.pct - 100))

            return (
              <motion.div
                key={budget.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{budget.category}</h4>
                    {isOverBudget && (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    {isNearLimit && !isOverBudget && (
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60">
                      {fmtCurrency(budget.actual, baseCurrency)} / {fmtCurrency(budget.budget, baseCurrency)}
                    </div>
                    <div className={`text-xs font-medium ${
                      isOverBudget ? 'text-red-400' : 
                      isNearLimit ? 'text-yellow-400' : 
                      'text-emerald-400'
                    }`}>
                      {budget.pct.toFixed(0)}% used
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="progress">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${progressWidth}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`block h-full rounded-full ${
                        isOverBudget ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        isNearLimit ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gradient-to-r from-emerald-400 to-green-500'
                      }`}
                    />
                    {overflowWidth > 0 && (
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${overflowWidth}%` }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        className="absolute left-full top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      />
                    )}
                  </div>
                </div>

                {isOverBudget && (
                  <div className="mt-2 text-xs text-red-400">
                    Over budget by {fmtCurrency(budget.actual - budget.budget, baseCurrency)}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}