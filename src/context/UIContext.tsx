'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ModalState =
  | { type: "productForm"; productId?: number }
  | { type: "consumptionForm"; recordId?: number }
  | null;

type ToastTone = "success" | "warning" | "critical" | "info";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type UIContextValue = {
  modal: ModalState;
  toasts: Toast[];
  openProductForm: (productId?: number) => void;
  openConsumptionForm: (recordId?: number) => void;
  closeModal: () => void;
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

const createToastId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function UIProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const openProductForm = useCallback((productId?: number) => {
    setModal({ type: "productForm", productId });
  }, []);

  const openConsumptionForm = useCallback((recordId?: number) => {
    setModal({ type: "consumptionForm", recordId });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = createToastId();
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast],
  );

  const value = useMemo<UIContextValue>(
    () => ({
      modal,
      toasts,
      openProductForm,
      openConsumptionForm,
      closeModal,
      showToast,
      dismissToast,
    }),
    [modal, toasts, openProductForm, openConsumptionForm, closeModal, showToast, dismissToast],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex max-w-sm flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const toneClass =
          toast.tone === "success"
            ? "border-status-success/30 bg-status-success/10 text-status-success"
            : toast.tone === "warning"
            ? "border-status-warning/30 bg-status-warning/10 text-status-warning"
            : toast.tone === "critical"
            ? "border-status-critical/30 bg-status-critical/10 text-status-critical"
            : "border-border-subtle bg-surface text-primary";
        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-surface ${toneClass}`}
          >
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-xs font-semibold text-primary-muted hover:text-primary"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        );
      })}
    </div>
  );
}

