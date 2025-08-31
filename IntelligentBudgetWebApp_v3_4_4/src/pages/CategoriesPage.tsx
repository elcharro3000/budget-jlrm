import { useEffect, useState } from 'react'
import { db } from '@/db'

export default function CategoriesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState('')
  useEffect(()=>{ db.categories.toArray().then(setRows) },[])
  async function add(){ if(!name.trim()) return; await db.categories.add({ name: name.trim() }); setRows(await db.categories.toArray()); setName('') }
  async function remove(id:number){ if(!confirm('Delete category?')) return; await db.categories.delete(id); setRows(await db.categories.toArray()) }
  return (
    <div className="space-y-4">
      <div className="card card-pad grid md:grid-cols-3 gap-3"><div className="md:col-span-2"><label className="label">Category name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div><div className="flex items-end"><button className="btn btn-primary" onClick={add}>Add</button></div></div>
      <div className="card card-pad">
        <table className="table"><thead><tr><th>Name</th><th></th></tr></thead><tbody>
          {rows.map(r=>(<tr key={r.id}><td>{r.name}</td><td className="text-right">{r.id && <button className="btn" onClick={()=>remove(r.id!)}>Delete</button>}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  )
}
