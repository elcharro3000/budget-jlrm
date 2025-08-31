import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { COLORS } from '@/utils'

interface SpendingChartProps {
  data: Array<{ name: string; value: number }>
  baseCurrency: string
}

export default function SpendingChart({ data, baseCurrency }: SpendingChartProps) {
  const formatter = new Intl.NumberFormat(undefined, { 
    style: 'currency', 
    currency: baseCurrency, 
    maximumFractionDigits: 0 
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-blue-400 font-bold">
            {formatter.format(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card h-[400px]"
    >
      <h3 className="section-title">Spending by Category</h3>
      
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-white/60">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-8 h-8" />
            </div>
            <p>No expense data available</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: 'rgba(255, 255, 255, 0.8)' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  )
}