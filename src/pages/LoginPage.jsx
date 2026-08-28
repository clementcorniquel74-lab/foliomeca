import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  FolderOpen,
  Receipt,
  TrendingUp,
  Gauge,
  Wrench
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { isLocalMode } from '../lib/localMode'
import LanguageSwitch from '../components/layout/LanguageSwitch'

export default function LoginPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { session, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const formCardRef = useRef(null)

  if (session) return <Navigate to="/" replace />

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName })
      if (error) setError(error.message)
      else setMessage(t('login.signupSuccess'))
    } else {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const handleViewDemo = () => {
    navigate('/demo')
  }

  const scrollToSignup = () => {
    setMode('signup')
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const features = [
    { icon: FolderOpen, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { icon: Receipt, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { icon: TrendingUp, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') }
  ]

  const mockupItems = [t('landing.mockupItem1'), t('landing.mockupItem2'), t('landing.mockupItem3')]

  return (
    <div className="bg-base-950">
      <section className="min-h-screen flex items-center justify-center bg-base-950 px-4 py-10 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-mecha/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-tech/10 blur-3xl" />

        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitch />
        </div>

        <div className="w-full max-w-sm relative animate-fade-in">
          {isLocalMode && (
            <div className="mb-5 text-center text-xs text-tech-light bg-tech/10 border border-tech/25 rounded-lg px-3 py-2">
              {t('login.localModeActive')}
            </div>
          )}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="FolioMeca" className="w-20 h-20 rounded-full shadow-glow mb-4" />
            <h1 className="font-display font-bold text-2xl tracking-wide">FolioMeca</h1>
            <p className="text-base-400 text-sm mt-2 text-center">
              {t('login.tagline')}
            </p>
          </div>

          <div ref={formCardRef} className="card p-6 scroll-mt-10">
            <div className="flex bg-base-800 rounded-lg p-1 mb-6">
              <button
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'signin' ? 'bg-base-700 text-base-100' : 'text-base-400'}`}
              >
                {t('login.signIn')}
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'signup' ? 'bg-base-700 text-base-100' : 'text-base-400'}`}
              >
                {t('login.signUp')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label">{t('login.fullName')}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="input pl-9"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">{t('login.email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="input pl-9"
                    placeholder="vous@exemple.fr"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('login.password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="input pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {message && (
                <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{message}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'signup' ? t('login.createAccount') : t('login.signInButton')}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-base-700" />
              <span className="text-xs text-base-400">{t('common.or')}</span>
              <div className="flex-1 h-px bg-base-700" />
            </div>

            <button onClick={handleGoogle} className="btn-secondary w-full">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09A6.96 6.96 0 015.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A10.98 10.98 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('login.continueWithGoogle')}
            </button>

            <button onClick={handleViewDemo} className="btn-ghost w-full mt-3 text-sm">
              <PlayCircle size={16} />
              {t('login.viewDemo')}
            </button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-base-500 mt-6">
            <ShieldCheck size={14} className="text-tech shrink-0" />
            {t('login.privacyNote')}
          </p>
        </div>
      </section>

      <section className="px-4 py-20 border-t border-base-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-fade-in">
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-wide">
              {t('landing.sectionTitle')}
            </h2>
            <p className="text-base-400 mt-3">
              {t('landing.sectionSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 flex flex-col items-start">
                <div className="w-11 h-11 rounded-xl bg-mecha/15 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-mecha-light" />
                </div>
                <h3 className="font-semibold text-base-100 mb-2">{title}</h3>
                <p className="text-sm text-base-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-16">
            <div className="card p-5 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-base-100">{t('landing.mockupVehicle')}</p>
                  <span className="badge-auto mt-1">Auto</span>
                </div>
                <div className="flex items-center gap-1.5 text-tech-light text-sm font-medium">
                  <Gauge size={16} />
                  {t('landing.mockupMileage')}
                </div>
              </div>
              <div className="h-px bg-base-700 mb-4" />
              <p className="text-xs font-medium text-base-400 uppercase tracking-wide mb-3">
                {t('landing.mockupHistoryTitle')}
              </p>
              <ul className="space-y-2.5">
                {mockupItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-base-200">
                    <Wrench size={14} className="text-mecha shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-display font-semibold text-xl sm:text-2xl mb-5">
              {t('landing.ctaTitle')}
            </h3>
            <button onClick={scrollToSignup} className="btn-primary px-6 py-3 text-base">
              {t('landing.ctaButton')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
