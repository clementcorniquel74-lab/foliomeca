import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-base-900 border border-base-700 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up`}>
        <div className="sticky top-0 bg-base-900/95 backdrop-blur border-b border-base-700/60 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-lg tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-base-400 hover:text-base-100 p-1.5 rounded-lg hover:bg-base-800 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
