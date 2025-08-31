import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import { db } from '@/db'
import toast from 'react-hot-toast'

export default function CategoriesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState('')

  useEffect(() => {
    db.categories.toArray().then(setRows)
  }, [])

  async function add() {
    if (!name.trim()) {
      toast.error('Category name is required')
      return
    }
    try {
      await db.categories.add({ name: name.trim() })
      setRows(await db.categories.toArray())
      setName('')
      toast.success('Category added!')
    } catch {
      toast.error('Failed to add category')
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this category? This will also delete all associated subcategories and may affect existing transactions.')) return
    try {
      await db.categories.delete(id)
      setRows(await db.categories.toArray())
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
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
          <h2 className="text-2xl font-bold gradient-text">Categories</h2>
          <p className="text-white/60 mt-1">Organize your transactions into categories</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="section-title">Add New Category</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="label">
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Category Name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter category name..."
              onKeyPress={e => e.key === 'Enter' && add()}
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={add}>
              <Plus className="w-4 h-4" />
              Add Category
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
          <FolderOpen className="w-5 h-5 text-purple-400" />
          <h3 className="section-title">All Categories ({rows.length})</h3>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No categories yet</p>
            <p className="text-sm">Add your first category to start organizing transactions</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{category.name}</h4>
                      <p className="text-xs text-white/60">Category</p>
                    </div>
                  </div>
                  {category.id && (
                    <button
                      onClick={() => remove(category.id!)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}