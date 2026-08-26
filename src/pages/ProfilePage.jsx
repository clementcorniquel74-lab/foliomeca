import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, LogOut, Save, Loader2, Upload, ShieldCheck, Coins, Languages, MessageSquareHeart, LifeBuoy, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { CURRENCIES } from '../utils/formatters'
import Header from '../components/layout/Header'
import LanguageSwitch from '../components/layout/LanguageSwitch'

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user, profile, signOut, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [currency, setCurrency] = useState(profile?.currency || 'EUR')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(profile?.avatar_url || null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    let avatar_url = profile?.avatar_url || null

    if (isLocalMode) {
      if (avatarFile) avatar_url = await localDB.fileToDataUrl(avatarFile)
      localDB.write('profile', { id: user.id, email: user.email, full_name: fullName, avatar_url, currency })
      await refreshProfile()
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('vehicle-photos').upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path)
        avatar_url = data.publicUrl
      }
    }

    await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: fullName, avatar_url, currency })
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <Header title={t('nav.profile')} />

      <div className="hidden md:block mb-6">
        <h1 className="font-display font-bold text-2xl tracking-wide">{t('profile.title')}</h1>
        <p className="text-base-400 text-sm mt-1">{t('profile.subtitle')}</p>
      </div>

      <form onSubmit={handleSave} className="card p-5 mt-4 md:mt-0 space-y-5">
        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer group shrink-0">
            <div className="w-16 h-16 rounded-full bg-base-700 flex items-center justify-center text-xl font-semibold overflow-hidden">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : (fullName || user?.email || '?')[0]?.toUpperCase()}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={16} />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
          <div>
            <p className="font-semibold">{fullName || t('profile.mechanic')}</p>
            <p className="text-sm text-base-400">{user?.email}</p>
          </div>
        </div>

        <div>
          <label className="label">{t('profile.fullName')}</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-9" placeholder={t('profile.fullNamePlaceholder')} />
          </div>
        </div>

        <div>
          <label className="label">{t('profile.email')}</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-400" />
            <input value={user?.email || ''} disabled className="input pl-9 opacity-60" />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Coins size={14} /> {t('profile.currency')}</label>
          <div className="grid grid-cols-2 gap-3">
            {CURRENCIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCurrency(c.value)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  currency === c.value ? 'border-mecha bg-mecha/10 text-mecha-light' : 'border-base-600 text-base-300 hover:border-base-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-base-500 mt-1.5">{t('profile.currencyHint')}</p>
        </div>

        <div>
          <label className="label flex items-center gap-1.5"><Languages size={14} /> {t('profile.language')}</label>
          <LanguageSwitch />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? t('profile.saved') : t('common.save')}
        </button>
      </form>

      <div className="card p-4 mt-4 flex items-center gap-3">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
        <p className="text-xs text-base-400">
          {isLocalMode ? t('profile.localModeNote') : t('profile.remoteNote')}
        </p>
      </div>

      <div className="card mt-4 divide-y divide-base-700/60 overflow-hidden">
        <Link to="/avis" className="flex items-center gap-3 p-4 hover:bg-base-800/60 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-tech/10 flex items-center justify-center shrink-0">
            <MessageSquareHeart size={16} className="text-tech" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t('profile.feedbackLink')}</p>
            <p className="text-xs text-base-500">{t('profile.feedbackLinkHint')}</p>
          </div>
          <ChevronRight size={16} className="text-base-500 shrink-0" />
        </Link>
        <Link to="/contact" className="flex items-center gap-3 p-4 hover:bg-base-800/60 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-mecha/10 flex items-center justify-center shrink-0">
            <LifeBuoy size={16} className="text-mecha" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t('profile.contactLink')}</p>
            <p className="text-xs text-base-500">{t('profile.contactLinkHint')}</p>
          </div>
          <ChevronRight size={16} className="text-base-500 shrink-0" />
        </Link>
      </div>

      <button onClick={signOut} className="btn-secondary w-full mt-4 text-red-400 hover:text-red-300">
        <LogOut size={16} /> {t('common.signOut')}
      </button>
    </div>
  )
}
