export type TxType = 'expense' | 'income' | 'transfer'
export interface Category { id?: number; name: string; parentId?: number | null }
export interface Subcategory { id?: number; name: string; categoryId: number }
export interface Account { id?: number; name: string; type: 'credit'|'debit'|'cash'|'account'; last4?: string }
export interface Budget { id?: number; month: string; categoryId: number; amountBase: number }
export interface Transaction {
  id?: number
  date: string
  description: string
  amount: number
  currency: string
  fxToBase: number
  amountBase: number
  type: TxType
  categoryId?: number
  subcategoryId?: number
  notes?: string
  accountId?: number
}
export interface Settings { key: string; baseCurrency: string; fx: Record<string, number> }
