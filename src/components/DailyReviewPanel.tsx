import type { DailyReview } from "../types";
import { addDaysToDateKey, formatDateKey } from "../utils/date";

interface DailyReviewPanelProps {
  reviews: DailyReview[];
  todayKey: string;
  onOpenReview: () => void;
}

export const DailyReviewPanel = ({
  reviews,
  todayKey,
  onOpenReview
}: DailyReviewPanelProps): JSX.Element => {
  const reviewByDate = new Map<string, DailyReview>(reviews.map((review) => [review.date, review]));
  const todayReview = reviewByDate.get(todayKey) ?? null;
  const lastReview = reviews[0] ?? null;

  const weekDays = Array.from({ length: 7 }, (_, index) => addDaysToDateKey(todayKey, index - 6));

  return (
    <section className="surface-panel animate-slideUp p-4 [animation-delay:180ms]">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold">Ежедневный Обзор</h2>
          <p className="mt-1 text-sm muted-text">
            Фиксируй результат дня и задавай фокус на завтра.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenReview}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          {todayReview ? "Редактировать обзор" : "Завершить день"}
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {weekDays.map((dateKey) => {
          const hasReview = reviewByDate.has(dateKey);
          return (
            <span
              key={dateKey}
              title={formatDateKey(dateKey)}
              className={`h-2.5 w-8 rounded-full ${hasReview ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}`}
            />
          );
        })}
      </div>

      {lastReview ? (
        <div className="grid gap-3">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] muted-text">
              Последний обзор: {formatDateKey(lastReview.date)}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Что получилось:</span> {lastReview.wins || "Нет записи"}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">Фокус на завтра:</span>{" "}
              {lastReview.nextFocus || "Не указан"}
            </p>
          </article>

          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] muted-text">Последние обзоры</p>
            <ul className="grid gap-2">
              {reviews.slice(0, 5).map((review) => (
                <li key={review.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900/70">
                  <span className="font-semibold">{formatDateKey(review.date)}:</span>{" "}
                  {review.wins || review.nextFocus || review.blockers || "Нет заметок"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm muted-text dark:border-slate-700">
          Пока нет обзоров. Начни с первого вечернего чек-ина.
        </div>
      )}
    </section>
  );
};
