import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tags, Plus, Folder, Trash2 } from 'lucide-react'
import { db } from '@/db'
import toast from 'react-hot-toast'

export default function SubcategoriesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()

  useEffect(() => {
    db.subcategories.toArray().then(setRows)
    db.categories.toArray().then(setCategories)
  }, [])

  async function add() {
    if (!name.trim()) {
      toast.error('Subcategory name is required')
      return
    }
    if (!categoryId) {
      toast.error('Please select a category')
      return
    }
    try {
      await db.subcategories.add({ name: name.trim(), categoryId })
      setRows(await db.subcategories.toArray())
      setName('')
      toast.success('Subcategory added!')
    } catch {
      toast.error('Failed to add subcategory')
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this subcategory?')) return
    try {
      await db.subcategories.delete(id)
      setRows(await db.subcategories.toArray())
      toast.success('Subcategory deleted')
    } catch {
      toast.error('Failed to delete subcategory')
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
          <h2 className="text-2xl font-bold gradient-text">Subcategories</h2>
          <p className="text-white/60 mt-1">Create detailed subcategories for better tracking</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="section-title">Add New Subcategory</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <Folder className="w-4 h-4 inline mr-2" />
              Parent Category
            </label>
            <select
              className="select"
              value={categoryId ?? ''}
              onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <Tags className="w-4 h-4 inline mr-2" />
              Subcategory Name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter subcategory name..."
              onKeyPress={e => e.key === 'Enter' && add()}
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={add}>
              <Plus className="w-4 h-4" />
              Add Subcategory
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
          <Tags className="w-5 h-5 text-green-400" />
          <h3 className="section-title">All Subcategories ({rows.length})</h3>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Tags className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No subcategories yet</p>
            <p className="text-sm">Add subcategories to organize your transactions better</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((sub, index) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Tags className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{sub.name}</h4>
                      <p className="text-xs text-white/60">
                        {categories.find(c => c.id === sub.categoryId)?.name ?? 'Unknown Category'}
                      </p>
                    </div>
                  </div>
                  {sub.id && (
                    <button
                      onClick={() => remove(sub.id!)}
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