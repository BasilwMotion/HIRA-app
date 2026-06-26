import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export function Modal({ open, onClose, title, subtitle, size = 'md', children, footer }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const maxW = { sm: 'max-w-sm', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-5xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden',
          maxW[size],
          'max-h-[90vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-snug">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={clsx(
              'px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white',
              danger ? 'bg-red-700 hover:bg-red-800' : 'bg-slate-800 hover:bg-slate-900'
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="px-6 py-5">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
    </Modal>
  )
}
