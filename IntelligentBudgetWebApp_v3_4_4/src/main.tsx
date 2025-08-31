import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import TransactionsPage from './pages/TransactionsPage'
import BudgetsPage from './pages/BudgetsPage'
import CategoriesPage from './pages/CategoriesPage'
import SubcategoriesPage from './pages/SubcategoriesPage'
import AccountsPage from './pages/AccountsPage'
import SettingsPage from './pages/SettingsPage'
import ImportExportPage from './pages/ImportExportPage'
import ReportPage from './pages/ReportPage'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Dashboard /> },
    { path: 'transactions', element: <TransactionsPage /> },
    { path: 'budgets', element: <BudgetsPage /> },
    { path: 'categories', element: <CategoriesPage /> },
    { path: 'subcategories', element: <SubcategoriesPage /> },
    { path: 'accounts', element: <AccountsPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'import-export', element: <ImportExportPage /> },
    { path: 'report', element: <ReportPage /> }
  ]}
])

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>)
