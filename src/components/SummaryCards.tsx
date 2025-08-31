import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { fmtCurrency } from '@/utils'
import AnimatedCounter from './AnimatedCounter'

interface SummaryCardsProps {
  baseCurrency: string
  totalIncome: number
  totalExpense: number
  totalBudget?: number
}

export default function SummaryCards({ baseCurrency, totalIncome, totalExpense, totalBudget = 0 }: SummaryCardsProps) {
  const net = totalIncome - totalExpense
  const remaining = totalBudget - totalExpense

  const cards = [
    {
      title: 'Total Budget',
      value: totalBudget,
      icon: Wallet,
      gradient: 'from-blue-400 to-blue-600',
      bgGradient: 'from-blue-500/20 to-blue-600/20'
    },
    {
      title: 'Total Spent',
      value: totalExpense,
      icon: TrendingDown,
      gradient: 'from-red-400 to-orange-500',
      bgGradient: 'from-red-500/20 to-orange-500/20'
    },
    {
      title: 'Remaining',
      value: remaining,
      icon: DollarSign,
      gradient: remaining >= 0 ? 'from-emerald-400 to-green-500' : 'from-red-400 to-orange-500',
      bgGradient: remaining >= 0 ? 'from-emerald-500/20 to-green-500/20' : 'from-red-500/20 to-orange-500/20'
    },
    {
      title: 'Net Income',
      value: net,
      icon: TrendingUp,
      gradient: net >= 0 ? 'from-emerald-400 to-green-500' : 'from-red-400 to-orange-500',
      bgGradient: net >= 0 ? 'from-emerald-500/20 to-green-500/20' : 'from-red-500/20 to-orange-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card group cursor-pointer"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 font-medium">{card.title}</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter 
                value={Math.abs(card.value)} 
                formatter={(v) => fmtCurrency(v, baseCurrency)}
              />
            </div>
            {card.title === 'Net Income' && (
              <div className={`text-sm mt-1 ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {net >= 0 ? '↗ Positive' : '↘ Negative'}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}