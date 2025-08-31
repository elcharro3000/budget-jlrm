import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, DollarSign, RefreshCw, Save } from 'lucide-react'
import { db } from '@/db'
import { getMXNtoUSD } from '@/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [base, setBase] = useState('USD')
  const [mxn, setMxn] = useState('0.055')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    db.settings.get('settings').then(s => {
      setBase(s?.baseCurrency ?? 'USD')
      setMxn(String(s?.fx?.MXN ?? '0.055'))
    })
  }, [])

  async function save() {
    setIsSaving(true)
    try {
      const s = await db.settings.get('settings') || {
        key: 'settings',
        baseCurrency: 'USD',
        fx: { USD: 1, MXN: 0.055 }
      }
      s.baseCurrency = base
      s.fx.MXN = Number(mxn) || 0.055
      await db.settings.put(s)
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateExchangeRate() {
    setIsUpdating(true)
    try {
      const rate = await getMXNtoUSD()
      setMxn(String(rate))
      const s = await db.settings.get('settings') || {
        key: 'settings',
        baseCurrency: 'USD',
        fx: { USD: 1, MXN: 0.055 }
      }
      s.fx.MXN = rate
      await db.settings.put(s)
      toast.success('Exchange rate updated!')
    } catch {
      toast.error('Could not fetch exchange rate. Check your internet connection.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold gradient-text">Settings</h2>
          <p className="text-white/60 mt-1">Configure your app preferences and currency settings</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="section-title">Currency Settings</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="label">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Base Currency
            </label>
            <select
              className="select"
              value={base}
              onChange={e => setBase(e.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
            </select>
            <p className="text-xs text-white/50 mt-2">
              All amounts will be converted to this currency for calculations
            </p>
          </div>

          <div>
            <label className="label">MXN → USD Exchange Rate</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={mxn}
                onChange={e => setMxn(e.target.value)}
                placeholder="0.055"
              />
              <button
                onClick={updateExchangeRate}
                disabled={isUpdating}
                className="btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-white/50 mt-2">
              1 MXN equals this many USD
            </p>
          </div>

          <div className="flex items-end">
            <button
              onClick={save}
              disabled={isSaving}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="section-title">App Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-2">Version</h4>
            <p className="text-white/60">3.4.4</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Developer</h4>
            <p className="text-white/60">JLRM</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}