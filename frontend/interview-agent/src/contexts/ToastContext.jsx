import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let toastIdSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timeoutsRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const show = useCallback((message, opts = {}) => {
    const id = ++toastIdSeq;
    const toast = {
      id,
      message,
      type: opts.type || 'info',
      duration: typeof opts.duration === 'number' ? opts.duration : 3000,
    };
    setToasts((prev) => [...prev, toast]);
    if (toast.duration > 0) {
      const timeout = setTimeout(() => remove(id), toast.duration);
      timeoutsRef.current.set(id, timeout);
    }
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    show,
    success: (msg, opts) => show(msg, { ...opts, type: 'success' }),
    error: (msg, opts) => show(msg, { ...opts, type: 'error' }),
    info: (msg, opts) => show(msg, { ...opts, type: 'info' }),
    dismiss: remove,
  }), [remove, show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col space-y-2 w-[90vw] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'flex items-start justify-between gap-3 rounded-lg shadow-lg border px-4 py-3 text-sm animate-in fade-in slide-in-from-bottom-2',
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : '',
              t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : '',
              t.type === 'info' ? 'bg-white border-gray-200 text-gray-800' : '',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            <div className="flex-1">{t.message}</div>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
