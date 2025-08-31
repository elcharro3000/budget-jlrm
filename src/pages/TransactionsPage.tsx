import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import TransactionForm from '@/components/TransactionForm'
import TransactionsTable from '@/components/TransactionsTable'
import Filters from '@/components/Filters'
import TransactionModal from '@/components/TransactionModal'

export default function TransactionsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [filters, setFilters] = useState<any>({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSaved = () => {
    setRefreshKey(x => x + 1)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold gradient-text">Transactions</h2>
          <p className="text-white/60 mt-1">Manage all your financial transactions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </motion.div>

      <TransactionForm onSaved={() => setRefreshKey(x => x + 1)} />
      
      <div className="no-print">
        <Filters onChange={setFilters} />
      </div>
      
      <TransactionsTable key={refreshKey} filters={filters} />

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fab"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}