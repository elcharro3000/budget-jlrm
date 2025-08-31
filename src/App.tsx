import { NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { ensureDefaults } from './db'
import { Toaster } from 'react-hot-toast'
import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  FolderOpen, 
  Tags, 
  Wallet, 
  Download, 
  FileText, 
  Settings,
  TrendingUp
} from 'lucide-react'

export default function App() {
  useEffect(() => {
    ensureDefaults()
    if ('storage' in navigator && 'persist' in navigator.storage) {
      // @ts-ignore
      navigator.storage.persist && navigator.storage.persist()
    }
  }, [])

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/categories', label: 'Categories', icon: FolderOpen },
    { to: '/subcategories', label: 'Subcategories', icon: Tags },
    { to: '/accounts', label: 'Payment Methods', icon: Wallet },
    { to: '/import-export', label: 'Import/Export', icon: Download },
    { to: '/report', label: 'Report (PDF)', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]

  const mobileNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/import-export', label: 'Import', icon: Download },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            borderRadius: '12px'
          }
        }}
      />
      
      <aside className="desktop-sidebar">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg gradient-text">Intelligent Budget</div>
              <div className="text-sm text-white/60">by JLRM</div>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink 
              key={to}
              to={to} 
              className={({isActive}) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'primary-gradient text-white shadow-lg' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="content">
        <header className="glass border-b border-white/10 sticky top-0 z-30 backdrop-blur-xl">
          <div className="container-xl py-6">
            <h1 className="h1">Personal Finance Dashboard</h1>
            <p className="text-white/60 text-sm mt-1">
              Track expenses, manage budgets, and achieve your financial goals
            </p>
          </div>
        </header>
        
        <main className="container-xl my-8">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>

        <nav className="sticky-nav">
          {mobileNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink 
              key={to}
              to={to} 
              className={({isActive}) => `
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive ? 'text-blue-400' : 'text-white/70'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}