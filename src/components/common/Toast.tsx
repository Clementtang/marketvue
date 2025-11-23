import { useEffect, useState } from 'react';
import { useToast, type ToastMessage } from '../../contexts/ToastContext';
import { TOAST_COLORS } from '../../config/chartTheme';

/**
 * Icons for different toast types
 */
const ToastIcons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/**
 * Single Toast Item Component
 */
function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const colors = TOAST_COLORS[toast.type];

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle close with exit animation
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        transform transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ backgroundColor: colors.bg }}
    >
      {/* Icon */}
      <div style={{ color: colors.icon }}>
        {ToastIcons[toast.type]}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium" style={{ color: colors.text }}>
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.icon }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 * Renders all active toasts in a fixed position
 */
export function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={() => hideToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
