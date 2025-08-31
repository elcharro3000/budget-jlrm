import { useEffect, useState } from 'react'
import { db } from '@/db'

export default function AccountsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('account')
  useEffect(()=>{ db.accounts.toArray().then(setRows) },[])
  async function add(){ if(!name.trim()) return; await db.accounts.add({ name: name.trim(), type: type as any }); setRows(await db.accounts.toArray()); setName('') }
  async function remove(id:number){ if(!confirm('Delete payment method?')) return; await db.accounts.delete(id); setRows(await db.accounts.toArray()) }
  return (
    <div className="space-y-4">
      <div className="card card-pad grid md:grid-cols-3 gap-3">
        <div><label className="label">Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label className="label">Type</label><select className="select" value={type} onChange={e=>setType(e.target.value)}><option value="account">Bank Account</option><option value="credit">Credit Card</option><option value="debit">Debit Card</option><option value="cash">Cash</option></select></div>
        <div className="flex items-end"><button className="btn btn-primary" onClick={add}>Add</button></div>
      </div>
      <div className="card card-pad">
        <table className="table"><thead><tr><th>Name</th><th>Type</th><th></th></tr></thead><tbody>
          {rows.map(r=>(<tr key={r.id}><td>{r.name}</td><td>{r.type}</td><td className="text-right">{r.id && <button className="btn" onClick={()=>remove(r.id!)}>Delete</button>}</td></tr>))}
        </tbody></table>
      </div>
    </div>
  )
}
