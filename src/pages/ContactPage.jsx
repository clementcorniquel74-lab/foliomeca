import { useState } from 'react'
import { CheckCircle2, Loader2, Mail, AlertTriangle, Users, Bug, CreditCard, HelpCircle } from 'lucide-react'
import { useSupportRequests } from '../hooks/useFeedback'
import { useLanguage } from '../context/LanguageContext'
import Header from '../components/layout/Header'

const SUBJECTS = [
  { value: 'client', icon: Users, key: 'subjectClient' },
  { value: 'bug', icon: Bug, key: 'subjectBug' },
  { value: 'account', icon: CreditCard, key: 'subjectAccount' },
  { value: 'other', icon: HelpCircle, key: 'subjectOther' }
]

const SUPPORT_EMAIL = 'support@foliomeca.app'

export default function ContactPage() {
  const { t } = useLanguage()
  const { addRequest } = useSupportRequests()
  const [subject, setSubject] = useState('client')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!message.trim()) {
      setError(t('contact.errorRequired'))
      return
    }
    setLoading(true)
    const { error } = await addRequest({ subject, message: message.trim() })
    setLoading(false)
    if (error) setError(error.message)
    else {
      setSent(true)
      setMessage('')
    }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <Header title={t('nav.contact')} />

      <div className="hidden md:block mb-6">
        <h1 className="font-display font-bold text-2xl tracking-wide">{t('contact.title')}</h1>
        <p className="text-base-400 text-sm mt-1">{t('contact.subtitle')}</p>
      </div>

      {sent ? (
        <div className="card p-8 text-center mt-4 md:mt-0">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
          <p className="font-semibold text-base-100">{t('contact.thanksTitle')}</p>
          <p className="text-sm text-base-400 mt-1 mb-5">{t('contact.thanksBody')}</p>
          <button onClick={() => setSent(false)} className="btn-secondary mx-auto">{t('contact.sendAnother')}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-5 mt-4 md:mt-0 space-y-5">
          <div>
            <label className="label">{t('contact.subjectLabel')}</label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map(({ value, icon: Icon, key }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSubject(value)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    subject === value ? 'border-mecha bg-mecha/10 text-mecha-light' : 'border-base-600 text-base-300 hover:border-base-500'
                  }`}
                >
                  <Icon size={15} />
                  {t(`contact.${key}`)}
                </button>
              ))}
            </div>
          </div>

          {subject === 'client' && (
            <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{t('contact.emergencyNote')}</span>
            </div>
          )}

          <div>
            <label className="label">{t('contact.messageLabel')}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="input resize-none"
              placeholder={t('contact.messagePlaceholder')}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t('contact.submit')}
          </button>
        </form>
      )}

      <div className="card p-4 mt-4 flex items-center gap-3">
        <Mail size={16} className="text-tech shrink-0" />
        <p className="text-xs text-base-400">
          {t('contact.directEmail')} <a href={`mailto:${SUPPORT_EMAIL}`} className="text-tech hover:text-tech-light font-medium">{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </div>
  )
}
