import { useState } from 'react'
export interface Filters { q: string; from?: string; to?: string; categoryId?: number; accountId?: number; type?: 'expense'|'income'|'transfer'|'all' }
export function useFilters() { const [f, setF] = useState<Filters>({ q: '', type: 'all' }); return { filters: f, setFilters: setF } }
