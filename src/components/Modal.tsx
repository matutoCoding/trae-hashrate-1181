import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  hideCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  hideCloseButton = false,
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose, closeOnEsc]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn(
          'absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => closeOnOverlayClick && onClose()}
      />

      <div
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-rice shadow-2xl transition-all duration-300',
          open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-ink"
              >
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'rounded-lg p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors',
                  !title && 'ml-auto',
                )}
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-ink/10 bg-white/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
