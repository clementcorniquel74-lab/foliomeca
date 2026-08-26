import { useEffect, useState } from 'react'
import { X, Share, PlusSquare, Download } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const DISMISS_KEY = 'foliomeca_install_prompt_dismissed_at'
const DISMISS_DAYS = 7

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !window.MSStream
}

function wasDismissedRecently() {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const elapsedDays = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24)
  return elapsedDays < DISMISS_DAYS
}

export default function InstallPWAPrompt() {
  const { t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState('android')

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return

    if (isIOS()) {
      setPlatform('ios')
      const timer = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(timer)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPlatform('android')
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 md:bottom-6 md:right-6 md:left-auto z-50 p-3 md:p-0 md:w-96 animate-slide-up">
      <div className="card p-4 flex items-start gap-3 mb-16 md:mb-0 border-mecha/30">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mecha to-tech flex items-center justify-center shrink-0">
          <Download size={18} className="text-base-950" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5">{t('pwaPrompt.title')}</p>
          {platform === 'ios' ? (
            <p className="text-xs text-base-300 leading-relaxed">
              {t('pwaPrompt.iosStepShare')} <Share size={12} className="inline -mt-0.5" /> {t('pwaPrompt.iosStepAdd')}
              {' '}<PlusSquare size={12} className="inline -mt-0.5" /> {t('pwaPrompt.iosHint')}
            </p>
          ) : (
            <p className="text-xs text-base-300 leading-relaxed">
              {t('pwaPrompt.androidHint')}
            </p>
          )}
          {platform === 'android' && (
            <button onClick={handleInstall} className="btn-primary mt-3 w-full text-sm py-2">
              {t('pwaPrompt.installButton')}
            </button>
          )}
        </div>
        <button onClick={dismiss} className="text-base-400 hover:text-base-100 p-1 -mt-1 -mr-1">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
