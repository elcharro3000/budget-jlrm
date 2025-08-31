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
      { name: 'Housing' }, { name: 'Groceries' }, { name: 'Restaurants' }, { name: 'Transportation' },
      { name: 'Health' }, { name: 'Fitness' }, { name: 'Entertainment' }, { name: 'Travel' },
      { name: 'Education' }, { name: 'Utilities' }, { name: 'Subscriptions' }, { name: 'Services' },
      { name: 'Shopping' }, { name: 'Bills' }, { name: 'Income' }
    ])
  }
  
  if (await db.subcategories.count() === 0) {
    const cats = await db.categories.toArray()
    function cid(n: string) { return cats.find(c => c.name === n)?.id }
    const seed = [
      { n: 'Rent/Mortgage', c: 'Housing' }, { n: 'Repairs', c: 'Housing' }, { n: 'HOA/Property Tax', c: 'Housing' },
      { n: 'Supermarket', c: 'Groceries' }, { n: 'Farmers Market', c: 'Groceries' }, { n: 'Organic Foods', c: 'Groceries' },
      { n: 'Coffee Shops', c: 'Restaurants' }, { n: 'Fast Food', c: 'Restaurants' }, { n: 'Fine Dining', c: 'Restaurants' },
      { n: 'Gas', c: 'Transportation' }, { n: 'Uber/Lyft', c: 'Transportation' }, { n: 'Public Transit', c: 'Transportation' },
      { n: 'Electricity', c: 'Utilities' }, { n: 'Water', c: 'Utilities' }, { n: 'Internet', c: 'Utilities' },
      { n: 'Netflix', c: 'Subscriptions' }, { n: 'Spotify', c: 'Subscriptions' }, { n: 'Apps', c: 'Subscriptions' },
      { n: 'Movies', c: 'Entertainment' }, { n: 'Concerts', c: 'Entertainment' }, { n: 'Games', c: 'Entertainment' },
      { n: 'Flights', c: 'Travel' }, { n: 'Hotels', c: 'Travel' }, { n: 'Car Rental', c: 'Travel' },
      { n: 'Clothing', c: 'Shopping' }, { n: 'Electronics', c: 'Shopping' }, { n: 'Home Goods', c: 'Shopping' },
      { n: 'Salary', c: 'Income' }, { n: 'Freelance', c: 'Income' }, { n: 'Investments', c: 'Income' }
    ]
    const rows = seed.map(s => ({ name: s.n, categoryId: cid(s.c)! })).filter(r => !!r.categoryId)
    if (rows.length) await db.subcategories.bulkAdd(rows)
  }
  
  if (await db.accounts.count() === 0) {
    await db.accounts.bulkAdd([
      { name: 'Cash', type: 'cash' },
      { name: 'Chase Checking', type: 'account' },
      { name: 'Wells Fargo Savings', type: 'account' },
      { name: 'Chase Sapphire', type: 'credit' },
      { name: 'American Express', type: 'credit' },
      { name: 'Debit Card', type: 'debit' }
    ])
  }

  // Add some sample transactions if none exist
  if (await db.transactions.count() === 0) {
    const cats = await db.categories.toArray()
    const subs = await db.subcategories.toArray()
    const accounts = await db.accounts.toArray()
    
    const sampleTransactions = [
      {
        date: '2024-12-15',
        description: 'Grocery shopping at Whole Foods',
        amount: 127.50,
        currency: 'USD',
        fxToBase: 1,
        amountBase: 127.50,
        type: 'expense' as const,
        categoryId: cats.find(c => c.name === 'Groceries')?.id,
        subcategoryId: subs.find(s => s.name === 'Supermarket')?.id,
        accountId: accounts.find(a => a.name === 'Chase Sapphire')?.id
      },
      {
        date: '2024-12-14',
        description: 'Coffee at Starbucks',
        amount: 5.75,
        currency: 'USD',
        fxToBase: 1,
        amountBase: 5.75,
        type: 'expense' as const,
        categoryId: cats.find(c => c.name === 'Restaurants')?.id,
        subcategoryId: subs.find(s => s.name === 'Coffee Shops')?.id,
        accountId: accounts.find(a => a.name === 'Debit Card')?.id
      },
      {
        date: '2024-12-13',
        description: 'Monthly salary',
        amount: 5000,
        currency: 'USD',
        fxToBase: 1,
        amountBase: 5000,
        type: 'income' as const,
        categoryId: cats.find(c => c.name === 'Income')?.id,
        subcategoryId: subs.find(s => s.name === 'Salary')?.id,
        accountId: accounts.find(a => a.name === 'Chase Checking')?.id
      },
      {
        date: '2024-12-12',
        description: 'Gas station fill-up',
        amount: 45.20,
        currency: 'USD',
        fxToBase: 1,
        amountBase: 45.20,
        type: 'expense' as const,
        categoryId: cats.find(c => c.name === 'Transportation')?.id,
        subcategoryId: subs.find(s => s.name === 'Gas')?.id,
        accountId: accounts.find(a => a.name === 'Chase Sapphire')?.id
      },
      {
        date: '2024-12-11',
        description: 'Netflix subscription',
        amount: 15.99,
        currency: 'USD',
        fxToBase: 1,
        amountBase: 15.99,
        type: 'expense' as const,
        categoryId: cats.find(c => c.name === 'Subscriptions')?.id,
        subcategoryId: subs.find(s => s.name === 'Netflix')?.id,
        accountId: accounts.find(a => a.name === 'Chase Checking')?.id
      }
    ]

    await db.transactions.bulkAdd(sampleTransactions.filter(t => t.categoryId))
  }

  // Add sample budgets if none exist
  if (await db.budgets.count() === 0) {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const cats = await db.categories.toArray()
    
    const sampleBudgets = [
      { month: currentMonth, categoryId: cats.find(c => c.name === 'Groceries')?.id, amountBase: 500 },
      { month: currentMonth, categoryId: cats.find(c => c.name === 'Restaurants')?.id, amountBase: 300 },
      { month: currentMonth, categoryId: cats.find(c => c.name === 'Transportation')?.id, amountBase: 200 },
      { month: currentMonth, categoryId: cats.find(c => c.name === 'Entertainment')?.id, amountBase: 150 },
      { month: currentMonth, categoryId: cats.find(c => c.name === 'Subscriptions')?.id, amountBase: 100 }
    ]

    await db.budgets.bulkAdd(sampleBudgets.filter(b => b.categoryId))
  }
}