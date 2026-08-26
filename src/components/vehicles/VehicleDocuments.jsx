import { useRef, useState } from 'react'
import { FileText, Upload, Trash2, Loader2, FolderLock, Image as ImageIcon } from 'lucide-react'
import { useDocuments } from '../../hooks/useDocuments'
import { useLanguage } from '../../context/LanguageContext'

export default function VehicleDocuments({ vehicleId }) {
  const { t } = useLanguage()
  const { documents, loading, addDocument, deleteDocument } = useDocuments(vehicleId)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await addDocument(file, file.name)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <FolderLock size={18} className="text-tech" /> {t('maintenance.documents')}
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-sm py-2"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {t('maintenance.addDocument')}
        </button>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
      </div>

      <p className="text-xs text-base-500 mb-3">
        {t('maintenance.documentsHint')}
      </p>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-mecha" size={20} /></div>
      ) : documents.length === 0 ? (
        <div className="card p-6 text-center">
          <FolderLock size={24} className="mx-auto text-base-600 mb-2" />
          <p className="text-sm text-base-400">{t('maintenance.noDocuments')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => {
            const isImage = doc.mime_type?.startsWith('image/')
            return (
              <div key={doc.id} className="card p-3 flex items-center gap-3">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-lg bg-base-800 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  {isImage ? (
                    <img src={doc.file_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={18} className="text-tech" />
                  )}
                </a>
                <a href={doc.file_url} target="_blank" rel="noreferrer" className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-base-500 flex items-center gap-1">
                    {isImage ? <ImageIcon size={11} /> : <FileText size={11} />}
                    {isImage ? t('maintenance.image') : t('maintenance.document')}
                  </p>
                </a>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-base-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
