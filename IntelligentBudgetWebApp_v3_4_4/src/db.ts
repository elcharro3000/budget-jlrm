import Dexie, { Table } from 'dexie'
import type { Transaction, Category, Account, Budget, Settings, Subcategory } from './types'

export class IBDatabase extends Dexie {
  transactions!: Table<Transaction, number>
  categories!: Table<Category, number>
  subcategories!: Table<Subcategory, number>
  accounts!: Table<Account, number>
  budgets!: Table<Budget, number>
  settings!: Table<Settings, string>

  constructor() {
    super('intelligent-budget-jlrm')
    this.version(2).stores({
      transactions: '++id, date, type, categoryId, subcategoryId, accountId, amountBase',
      categories: '++id, name, parentId',
      subcategories: '++id, name, categoryId',
      accounts: '++id, name, type',
      budgets: '++id, month, categoryId',
      settings: 'key'
    })
  }
}

export const db = new IBDatabase()

export async function ensureDefaults() {
  const s = await db.settings.get('settings')
  if (!s) {
    await db.settings.put({ key: 'settings', baseCurrency: 'USD', fx: { USD: 1, MXN: 0.055 } })
  }
  if (await db.categories.count() === 0) {
    await db.categories.bulkAdd([
      { name: 'Housing' },{ name: 'Groceries' },{ name: 'Restaurants' },{ name: 'Transportation' },
      { name: 'Health' },{ name: 'Fitness' },{ name: 'Entertainment' },{ name: 'Travel' },
      { name: 'Education' },{ name: 'Utilities' },{ name: 'Subscriptions' },{ name: 'Services' },
      { name: 'Miscellaneous' },{ name: 'Income' }
    ])
  }
  if (await db.subcategories.count() === 0) {
    const cats = await db.categories.toArray()
    function cid(n:string){ return cats.find(c=>c.name===n)?.id }
    const seed = [
      { n:'Rent/Mortgage', c:'Housing' },{ n:'Repairs', c:'Housing' },{ n:'HOA/Property Tax', c:'Housing' },
      { n:'Supermarket', c:'Groceries' },{ n:'Farmers Market', c:'Groceries' },
      { n:'Coffee', c:'Restaurants' },{ n:'Fast Casual', c:'Restaurants' },{ n:'Dining Out', c:'Restaurants' },
      { n:'Gas', c:'Transportation' },{ n:'Rideshare', c:'Transportation' },{ n:'Parking/Tolls', c:'Transportation' },
      { n:'Electric', c:'Utilities' },{ n:'Water', c:'Utilities' },{ n:'Internet', c:'Utilities' },
      { n:'Streaming', c:'Subscriptions' },{ n:'Apps/Software', c:'Subscriptions' },
      { n:'Movies/Events', c:'Entertainment' },
      { n:'Flights', c:'Travel' },{ n:'Hotels', c:'Travel' }
    ]
    const rows = seed.map(s=>({ name: s.n, categoryId: cid(s.c)! })).filter(r=>!!r.categoryId)
    if (rows.length) await db.subcategories.bulkAdd(rows)
  }
  if (await db.accounts.count() === 0) {
    await db.accounts.bulkAdd([
      { name: 'Cash', type: 'cash' },
      { name: 'BBVA Check Account', type: 'account' },
      { name: 'BoFa Check Account', type: 'account' },
      { name: 'BoFa Credit Card', type: 'credit' },
      { name: 'American Express', type: 'credit' }
    ])
  }
}
