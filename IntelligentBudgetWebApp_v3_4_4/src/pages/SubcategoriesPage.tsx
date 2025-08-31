import { useEffect, useState } from 'react'
import { db } from '@/db'

export default function SubcategoriesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number|undefined>()
  useEffect(()=>{ db.subcategories.toArray().then(setRows); db.categories.toArray().then(setCategories) },[])
  async function add(){ if(!name.trim()||!categoryId) return; await db.subcategories.add({ name: name.trim(), categoryId }); setRows(await db.subcategories.toArray()); setName('') }
  async function remove(id:number){ if(!confirm('Delete subcategory?')) return; await db.subcategories.delete(id); setRows(await db.subcategories.toArray()) }
  return (
    <div className="space-y-4">
      <div className="card card-pad grid md:grid-cols-3 gap-3">
        <div><label className="label">Category</label><select className="select" value={categoryId ?? ''} onChange={e=>setCategoryId(e.target.value?Number(e.target.value):undefined)}><option value="">--</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="label">Subcategory name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="flex items-end"><button className="btn btn-primary" onClick={add}>Add</button></div>
      </div>
      <div className="card card-pad overflow-auto">
        <table className="table min-w-[600px]"><thead><tr><th>Subcategory</th><th>Category</th><th></th></tr></thead><tbody>
          {rows.map(r=>(<tr key={r.id}><td>{r.name}</td><td>{categories.find(c=>c.id===r.categoryId)?.name ?? '-'}</td><td className="text-right">{r.id && <button className="btn" onClick={()=>remove(r.id!)}>Delete</button>}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  )
}
