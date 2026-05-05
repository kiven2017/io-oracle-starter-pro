import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, children, className = '' }) {
  if (!open) {
    return null
  }

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[120]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 h-full w-full cursor-default bg-[#020617]/72 backdrop-blur-md"
        onMouseDown={onClose}
      />
      <div className="pointer-events-none relative flex min-h-screen items-end justify-center p-0 pt-10 md:items-center md:p-6">
        <div
          className={`modal-panel pointer-events-auto relative w-full max-h-[calc(100vh-0.75rem)] overflow-y-auto overscroll-contain rounded-t-[1.8rem] md:max-h-[calc(100vh-2rem)] md:rounded-[inherit] ${className}`.trim()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
