import { NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { ensureDefaults } from './db'

export default function App() {
  useEffect(() => {
    ensureDefaults()
    if ('storage' in navigator && 'persist' in navigator.storage) {
      // @ts-ignore
      navigator.storage.persist && navigator.storage.persist()
    }
  }, [])
  const link = (to: string, label: string) => (
    <NavLink to={to} className={({isActive}) => `px-3 py-2 rounded-lg ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>{label}</NavLink>
  )
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="desktop-sidebar">
        <div className="p-4 border-b">
          <div className="font-bold">Intelligent Budget</div>
          <div className="text-sm text-slate-500">by JLRM</div>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          {link('/', 'Dashboard')}
          {link('/transactions', 'Transactions')}
          {link('/budgets', 'Budgets')}
          {link('/categories', 'Categories')}
          {link('/subcategories', 'Subcategories')}
          {link('/accounts', 'Payment Methods')}
          {link('/import-export', 'Import/Export')}
          {link('/report', 'Report (PDF)')}
          {link('/settings', 'Settings')}
        </nav>
      </aside>
      <div className="content">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container-xl py-4 flex items-center justify-between">
            <div>
              <h1 className="h1">Personal Finance Dashboard</h1>
              <p className="text-slate-500 text-sm">Track by category & subcategory, payment methods, and budgets vs actuals.</p>
            </div>
          </div>
        </header>
        <main className="container-xl my-6"><Outlet /></main>
        <nav className="sticky-nav">
          <NavLink to="/" className="btn">Dashboard</NavLink>
          <NavLink to="/transactions" className="btn">Tx</NavLink>
          <NavLink to="/budgets" className="btn">Budgets</NavLink>
          <NavLink to="/import-export" className="btn">Import</NavLink>
          <NavLink to="/settings" className="btn">Settings</NavLink>
        </nav>
      </div>
    </div>
  )
}
