import { fmtCurrency } from '@/utils'
export default function SummaryCards({ baseCurrency, totalIncome, totalExpense }:{ baseCurrency:string; totalIncome:number; totalExpense:number }) {
  const net = totalIncome - totalExpense
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="card card-pad"><div className="text-sm text-slate-500">Total Spent</div><div className="text-2xl font-bold">{fmtCurrency(totalExpense, baseCurrency)}</div></div>
      <div className="card card-pad"><div className="text-sm text-slate-500">Total Income</div><div className="text-2xl font-bold">{fmtCurrency(totalIncome, baseCurrency)}</div></div>
      <div className="card card-pad"><div className="text-sm text-slate-500">Net</div><div className={`text-2xl font-bold ${net>=0?'text-green-600':'text-rose-600'}`}>{fmtCurrency(net, baseCurrency)}</div></div>
    </div>
  )
}
