import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { Transaction } from '@/types'
import { fmtCurrency } from '@/utils'

interface SpendingTrendsProps {
  transactions: Transaction[]
  baseCurrency: string
}

export default function SpendingTrends({ transactions, baseCurrency }: SpendingTrendsProps) {
  // Group transactions by month
  const monthlyData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const month = transaction.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, amount: 0 }
      }
      acc[month].amount += transaction.amountBase
      return acc
    }, {} as Record<string, { month: string; amount: number }>)

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Last 6 months
    .map(item => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: item.amount
    }))

  const formatter = new Intl.NumberFormat(undefined, { 
    style: 'currency', 
    currency: baseCurrency, 
    maximumFractionDigits: 0 
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{label}</p>
          <p className="text-red-400 font-bold">
            {formatter.format(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card h-[400px]"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <h3 className="section-title">Monthly Spending Trends</h3>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-white/60">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No spending data available</p>
            <p className="text-sm">Add some transactions to see trends</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
              tickFormatter={(value) => formatter.format(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}