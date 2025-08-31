import { useEffect, useState } from 'react'
import { db } from '@/db'
import { getMXNtoUSD } from '@/utils'

export default function SettingsPage() {
  const [base, setBase] = useState('USD')
  const [mxn, setMxn] = useState('0.055')
  useEffect(()=>{ db.settings.get('settings').then(s=>{ setBase(s?.baseCurrency ?? 'USD'); setMxn(String(s?.fx?.MXN ?? '0.055')) }) },[])
  async function save(){ const s = await db.settings.get('settings') || { key:'settings', baseCurrency: 'USD', fx: { USD:1, MXN: 0.055 } }; s.baseCurrency = base; s.fx.MXN = Number(mxn)||0.055; await db.settings.put(s); alert('Saved!') }
  async function update(){ try { const rate = await getMXNtoUSD(); setMxn(String(rate)); const s = await db.settings.get('settings') || { key:'settings', baseCurrency: 'USD', fx: { USD:1, MXN: 0.055 } }; s.fx.MXN = rate; await db.settings.put(s); alert('Updated rate!') } catch { alert('Could not fetch rate. Check your internet. You can set MXN manually.') } }
  return (
    <div className="card card-pad grid md:grid-cols-3 gap-3">
      <div><label className="label">Base Currency</label><select className="select" value={base} onChange={e=>setBase(e.target.value)}><option value="USD">USD</option></select></div>
      <div><label className="label">MXN→USD (1 MXN equals)</label><input className="input" value={mxn} onChange={e=>setMxn(e.target.value)} /></div>
      <div className="flex items-end gap-2"><button className="btn" onClick={update}>Auto-update USD/MXN</button><button className="btn btn-primary" onClick={save}>Save</button></div>
    </div>
  )
}
