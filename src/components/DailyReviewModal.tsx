import { useEffect, useRef, useState } from "react";
import type { DailyReview, SaveDailyReviewInput } from "../types";
import { formatDateKey } from "../utils/date";

interface DailyReviewModalProps {
  isOpen: boolean;
  dateKey: string;
  existingReview: DailyReview | null;
  onClose: () => void;
  onSubmit: (input: SaveDailyReviewInput) => void;
}

const focusableSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export const DailyReviewModal = ({
  isOpen,
  dateKey,
  existingReview,
  onClose,
  onSubmit
}: DailyReviewModalProps): JSX.Element | null => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setWins(existingReview?.wins ?? "");
    setBlockers(existingReview?.blockers ?? "");
    setNextFocus(existingReview?.nextFocus ?? "");
    setError("");
  }, [isOpen, existingReview]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(focusableSelector);
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previousFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasContent = wins.trim() || blockers.trim() || nextFocus.trim();
    if (!hasContent) {
      setError("Добавь хотя бы одну заметку, чтобы сохранить обзор.");
      return;
    }

    onSubmit({
      date: dateKey,
      wins,
      blockers,
      nextFocus
    });
  };

  return (
    <div className="fixed inset-0 z-40 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          className="surface-strong w-full max-w-2xl animate-slideUp p-5"
        >
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="review-modal-title" className="font-display text-2xl font-semibold">
                Ежедневный Обзор
              </h2>
              <p className="mt-1 text-sm muted-text">{formatDateKey(dateKey)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-2.5 py-1 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            >
              Esc
            </button>
          </header>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-1.5 text-sm font-medium">
              Что получилось сегодня?
              <textarea
                value={wins}
                onChange={(event) => setWins(event.target.value)}
                className="min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Успехи, прогресс, закрытые задачи..."
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Что мешало?
              <textarea
                value={blockers}
                onChange={(event) => setBlockers(event.target.value)}
                className="min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Блокеры, отвлечения, риски..."
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Фокус на завтра
              <textarea
                value={nextFocus}
                onChange={(event) => setNextFocus(event.target.value)}
                className="min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Главные 1-2 приоритета"
              />
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
              >
                {error}
              </p>
            ) : null}

            <footer className="mt-1 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-100"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                {existingReview ? "Обновить обзор" : "Сохранить обзор"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
};
