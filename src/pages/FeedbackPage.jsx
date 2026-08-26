import { useState } from 'react'
import { CheckCircle2, Lightbulb, Bug, Heart, Loader2, MessageSquareHeart } from 'lucide-react'
import { useFeedback } from '../hooks/useFeedback'
import { useLanguage } from '../context/LanguageContext'
import Header from '../components/layout/Header'
import { formatDate } from '../utils/formatters'

const TYPES = [
  { value: 'suggestion', icon: Lightbulb, key: 'typeSuggestion' },
  { value: 'bug', icon: Bug, key: 'typeBug' },
  { value: 'compliment', icon: Heart, key: 'typeCompliment' }
]

export default function FeedbackPage() {
  const { t, lang } = useLanguage()
  const { items, addFeedback } = useFeedback()
  const [type, setType] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!message.trim()) {
      setError(t('feedback.errorRequired'))
      return
    }
    setLoading(true)
    const { error } = await addFeedback({ type, message: message.trim() })
    setLoading(false)
    if (error) setError(error.message)
    else {
      setSent(true)
      setMessage('')
    }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <Header title={t('nav.feedback')} />

      <div className="hidden md:block mb-6">
        <h1 className="font-display font-bold text-2xl tracking-wide">{t('feedback.title')}</h1>
        <p className="text-base-400 text-sm mt-1">{t('feedback.subtitle')}</p>
      </div>

      {sent ? (
        <div className="card p-8 text-center mt-4 md:mt-0">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
          <p className="font-semibold text-base-100">{t('feedback.thanksTitle')}</p>
          <p className="text-sm text-base-400 mt-1 mb-5">{t('feedback.thanksBody')}</p>
          <button onClick={() => setSent(false)} className="btn-secondary mx-auto">{t('feedback.sendAnother')}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-5 mt-4 md:mt-0 space-y-5">
          <div>
            <label className="label">{t('feedback.typeLabel')}</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(({ value, icon: Icon, key }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all ${
                    type === value ? 'border-tech bg-tech/10 text-tech-light' : 'border-base-600 text-base-300 hover:border-base-500'
                  }`}
                >
                  <Icon size={18} />
                  {t(`feedback.${key}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t('feedback.messageLabel')}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="input resize-none"
              placeholder={t('feedback.messagePlaceholder')}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t('feedback.submit')}
          </button>
        </form>
      )}

      {items.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <MessageSquareHeart size={15} className="text-tech" /> {t('feedback.recentTitle')}
          </h2>
          <div className="space-y-2">
            {items.map((f) => (
              <div key={f.id} className="card p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-tech-light capitalize">{t(`feedback.type${f.type.charAt(0).toUpperCase()}${f.type.slice(1)}`)}</span>
                  <span className="text-xs text-base-500">{formatDate(f.created_at, lang)}</span>
                </div>
                <p className="text-sm text-base-300">{f.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
