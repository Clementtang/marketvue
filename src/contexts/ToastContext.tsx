import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ToastType } from '../config/chartTheme';

/**
 * Toast message interface
 */
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Toast context interface
 */
interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Default toast duration in milliseconds
 */
const DEFAULT_DURATION = 4000;

/**
 * Maximum number of toasts shown at once
 */
const MAX_TOASTS = 5;

/**
 * Toast Provider Component
 * Manages toast state and provides methods to show/hide toasts
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  /**
   * Generate unique ID for toast
   */
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /**
   * Hide a specific toast by ID
   */
  const hideToast = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Show a new toast
   */
  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = DEFAULT_DURATION) => {
      const id = generateId();
      const newToast: ToastMessage = { id, type, message, duration };

      setToasts((prev) => {
        // Remove oldest if exceeding max
        const updated = [...prev, newToast];
        if (updated.length > MAX_TOASTS) {
          const removed = updated.shift();
          if (removed) {
            const timeout = timeoutRefs.current.get(removed.id);
            if (timeout) {
              clearTimeout(timeout);
              timeoutRefs.current.delete(removed.id);
            }
          }
        }
        return updated;
      });

      // Auto-hide after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          hideToast(id);
        }, duration);
        timeoutRefs.current.set(id, timeout);
      }
    },
    [generateId, hideToast]
  );

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast functionality
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
