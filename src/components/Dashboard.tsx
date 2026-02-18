interface DashboardProps {
  currentStreak: number;
  bestStreak: number;
  completedToday: number;
  completed7Days: number;
  activeCount: number;
  doneCount: number;
}

const formatDays = (value: number): string => {
  if (value === 1) {
    return "день";
  }
  if (value >= 2 && value <= 4) {
    return "дня";
  }
  return "дней";
};

export const Dashboard = ({
  currentStreak,
  bestStreak,
  completedToday,
  completed7Days,
  activeCount,
  doneCount
}: DashboardProps): JSX.Element => {
  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
      <article className="surface-strong animate-slideUp p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">
          Текущий Streak
        </p>
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-bold leading-none">{currentStreak}</span>
          <span className="pb-1 text-sm font-semibold muted-text">{formatDays(currentStreak)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-brand-50 px-3 py-2 dark:bg-brand-900/40">
            <p className="text-xs uppercase tracking-wide text-brand-700 dark:text-brand-200">Лучший</p>
            <p className="mt-1 font-semibold">{bestStreak}</p>
          </div>
          <div className="rounded-xl bg-brand-50 px-3 py-2 dark:bg-brand-900/40">
            <p className="text-xs uppercase tracking-wide text-brand-700 dark:text-brand-200">Сегодня</p>
            <p className="mt-1 font-semibold">{completedToday} задач</p>
          </div>
        </div>
      </article>

      <article className="surface-panel animate-slideUp p-5 [animation-delay:60ms]">
        <p className="text-xs uppercase tracking-[0.16em] muted-text">За 7 дней</p>
        <p className="mt-3 font-display text-3xl font-bold">{completed7Days}</p>
        <p className="mt-1 text-sm muted-text">выполнений</p>
      </article>

      <article className="surface-panel animate-slideUp p-5 [animation-delay:120ms]">
        <p className="text-xs uppercase tracking-[0.16em] muted-text">Активные</p>
        <p className="mt-3 font-display text-3xl font-bold">{activeCount}</p>
        <p className="mt-1 text-sm muted-text">задач</p>
      </article>

      <article className="surface-panel animate-slideUp p-5 [animation-delay:180ms]">
        <p className="text-xs uppercase tracking-[0.16em] muted-text">Выполнено</p>
        <p className="mt-3 font-display text-3xl font-bold">{doneCount}</p>
        <p className="mt-1 text-sm muted-text">всего</p>
      </article>
    </section>
  );
};
