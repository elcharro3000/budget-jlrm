import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, FileText, Database } from 'lucide-react'
import { db } from '@/db'
import toast from 'react-hot-toast'

export default function ImportExportPage() {
  const fileRef = useRef<HTMLInputElement>(null)

  async function exportAll() {
    try {
      const data = {
        transactions: await db.transactions.toArray(),
        categories: await db.categories.toArray(),
        subcategories: await db.subcategories.toArray(),
        accounts: await db.accounts.toArray(),
        budgets: await db.budgets.toArray(),
        settings: await db.settings.toArray()
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `intelligent-budget-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully!')
    } catch {
      toast.error('Failed to export data')
    }
  }

  function clickImport() {
    fileRef.current?.click()
  }

  async function importAll(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        toast.error('Invalid JSON file')
        return
      }

      // Accept both long and shorthand keys
      const transactions = data.transactions ?? data.txs ?? []
      const categories = data.categories ?? data.cats ?? []
      const subcategories = data.subcategories ?? data.subs ?? []
      const accounts = data.accounts ?? data.acs ?? []
      const budgets = data.budgets ?? data.bds ?? []
      const settingsSingle = data.settings ?? data.s ?? null
      const settingsArr = Array.isArray(data.settings) ? data.settings : (settingsSingle ? [settingsSingle] : [])

      if (!confirm('This will merge data into your current database. Proceed?')) return

      if (categories.length) await db.categories.bulkPut(categories)
      if (subcategories.length) await db.subcategories.bulkPut(subcategories)
      if (accounts.length) await db.accounts.bulkPut(accounts)
      if (transactions.length) await db.transactions.bulkPut(transactions)
      if (budgets.length) await db.budgets.bulkPut(budgets)
      if (settingsArr.length) {
        for (const s of settingsArr) await db.settings.put(s)
      }

      toast.success('Data imported successfully! Reloading...')
      setTimeout(() => location.reload(), 1000)
    } catch {
      toast.error('Failed to import data')
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
          <h2 className="text-2xl font-bold gradient-text">Import & Export</h2>
          <p className="text-white/60 mt-1">Backup and restore your financial data</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Export Data</h3>
              <p className="text-sm text-white/60">Download all your data as JSON</p>
            </div>
          </div>
          
          <button
            onClick={exportAll}
            className="btn-success w-full"
          >
            <Download className="w-4 h-4" />
            Export All Data
          </button>
          
          <div className="mt-4 p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/60">
              This will download a complete backup of all your transactions, categories, 
              budgets, and settings in JSON format.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Import Data</h3>
              <p className="text-sm text-white/60">Restore from JSON backup</p>
            </div>
          </div>
          
          <button
            onClick={clickImport}
            className="btn-primary w-full"
          >
            <Upload className="w-4 h-4" />
            Import JSON File
          </button>
          
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={importAll}
            className="hidden"
          />
          
          <div className="mt-4 p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/60">
              Import accepts both full keys (transactions, categories, etc.) and 
              shorthand keys (txs, cats, subs, etc.). Data will be merged with existing records.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Data Format</h3>
            <p className="text-sm text-white/60">Supported import/export structure</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <pre className="text-xs text-white/70 overflow-x-auto">
{`{
  "transactions": [...],
  "categories": [...],
  "subcategories": [...],
  "accounts": [...],
  "budgets": [...],
  "settings": [...]
}`}
          </pre>
        </div>

        <div className="mt-4 text-xs text-white/60">
          <p className="mb-2"><strong>Supported formats:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• Full keys: transactions, categories, subcategories, accounts, budgets, settings</li>
            <li>• Shorthand: txs, cats, subs, acs, bds, s</li>
            <li>• Mixed format support for maximum compatibility</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}