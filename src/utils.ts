export function fmtCurrency(n: number, code: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code }).format(n)
  } catch {
    return `${code} ${n.toFixed(2)}`
  }
}

export function monthKey(dateISOorYMD: string) {
  const s = dateISOorYMD.length >= 10 ? dateISOorYMD.substring(0, 10) : dateISOorYMD
  return s.substring(0, 7)
}

export function parseAmount(v: string): number {
  const n = Number(String(v).replace(/[^0-9.-]/g, ''))
  return isFinite(n) ? n : 0
}

export const COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#06B6D4', 
  '#84CC16', '#F43F5E', '#8B5CF6', '#14B8A6', '#A855F7', '#DC2626',
  '#7C3AED', '#059669', '#D97706', '#DC2626', '#2563EB', '#0891B2'
]

export async function getMXNtoUSD(): Promise<number> {
  try {
    const r = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=MXN', { mode: 'cors' })
    if (r.ok) {
      const j = await r.json()
      const usdToMxn = j?.rates?.MXN
      if (usdToMxn > 0) return 1 / usdToMxn
    }
  } catch {}
  
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=MXN', { mode: 'cors' })
    if (r.ok) {
      const j = await r.json()
      const usdToMxn = j?.rates?.MXN
      if (usdToMxn > 0) return 1 / usdToMxn
    }
  } catch {}
  
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD', { mode: 'cors' })
    if (r.ok) {
      const j = await r.json()
      const usdToMxn = j?.rates?.MXN
      if (usdToMxn > 0) return 1 / usdToMxn
    }
  } catch {}
  
  throw new Error('Could not fetch rate')
}