import { useEffect, useRef, useCallback, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Native-app-style bottom sheet overlay.
 * Slides up from bottom, backdrop tap to close, drag handle for gesture dismiss.
 * Mobile-only pattern -- on desktop, callers should render inline instead.
 */
export function BottomSheet({ open, onClose, title, children, className = '' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Touch gesture handling for drag-to-dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return
    const deltaY = e.touches[0].clientY - startY.current
    // Only allow dragging down
    if (deltaY > 0) {
      currentY.current = deltaY
      sheetRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return
    isDragging.current = false
    // If dragged more than 100px down, dismiss
    if (currentY.current > 100) {
      onClose()
    }
    // Reset position
    sheetRef.current.style.transform = ''
    currentY.current = 0
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-[vt-fade-in_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col animate-[vt-slide-in-up_300ms_cubic-bezier(0.05,0.7,0.1,1.0)] ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-5 pb-3 border-b border-border">
            <h3 className="text-lg font-bold text-text">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
