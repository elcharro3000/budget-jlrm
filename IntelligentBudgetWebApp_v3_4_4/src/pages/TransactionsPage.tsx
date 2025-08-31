import TransactionForm from '@/components/TransactionForm'
import TransactionsTable from '@/components/TransactionsTable'
import Filters from '@/components/Filters'
import { useState } from 'react'

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [filters, setFilters] = useState<any>({})
  return (
    <div className="space-y-4">
      <TransactionForm onSaved={()=>setRefreshKey(x=>x+1)} />
      <div className="no-print"><Filters onChange={setFilters} /></div>
      <TransactionsTable key={refreshKey} filters={filters} />
    </div>
  )
}
