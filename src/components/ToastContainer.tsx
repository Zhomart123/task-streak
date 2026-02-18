import clsx from "clsx";
import type { ToastMessage } from "../types";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const toastToneClass: Record<ToastMessage["tone"], string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
  info: "border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-100",
  danger: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
};

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps): JSX.Element => {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] grid w-[min(92vw,22rem)] gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "pointer-events-auto animate-toastIn rounded-xl border px-3 py-2.5 text-sm shadow-lg backdrop-blur-sm",
            toastToneClass[toast.tone]
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-md px-1.5 py-0.5 text-xs font-semibold transition hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Закрыть уведомление"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
