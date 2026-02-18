import clsx from "clsx";
import type { Task } from "../types";
import { formatDateKey, formatDateTimeFromISO, toDateKeyFromISO } from "../utils/date";

interface TaskHistoryProps {
  tasks: Task[];
}

const priorityClassMap: Record<Task["priority"], string> = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Medium: "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-100",
  High: "bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-100"
};

const priorityLabelMap: Record<Task["priority"], string> = {
  Low: "Низкий",
  Medium: "Средний",
  High: "Высокий"
};

export const TaskHistory = ({ tasks }: TaskHistoryProps): JSX.Element => {
  const completedTasks = [...tasks]
    .filter((task) => Boolean(task.completedAt))
    .sort((a, b) => {
      const left = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const right = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return right - left;
    });

  if (completedTasks.length === 0) {
    return (
      <section className="surface-panel animate-fadeIn p-6">
        <h2 className="font-display text-xl font-semibold">История задач</h2>
        <p className="mt-2 text-sm muted-text">
          Здесь появятся выполненные задачи с точной датой и временем завершения.
        </p>
      </section>
    );
  }

  const groupedByDate: Record<string, Task[]> = {};
  for (const task of completedTasks) {
    const completedAt = task.completedAt;
    if (!completedAt) {
      continue;
    }
    const dateKey = toDateKeyFromISO(completedAt);
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(task);
  }

  const dateGroups = Object.entries(groupedByDate).sort(([left], [right]) => (left < right ? 1 : -1));

  return (
    <section className="surface-panel animate-slideUp p-4 [animation-delay:160ms]">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">История задач</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Выполнено: {completedTasks.length}
        </span>
      </header>

      <div className="grid gap-4">
        {dateGroups.map(([dateKey, items]) => (
          <article key={dateKey} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <header className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{formatDateKey(dateKey)}</h3>
              <span className="text-xs muted-text">{items.length} задач</span>
            </header>

            <ul className="grid gap-2">
              {items.map((task) => {
                if (!task.completedAt) {
                  return null;
                }

                return (
                  <li
                    key={`${task.id}-${task.completedAt}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/70"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="text-xs muted-text">{formatDateTimeFromISO(task.completedAt)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          priorityClassMap[task.priority]
                        )}
                      >
                        {priorityLabelMap[task.priority]}
                      </span>
                      {!task.done ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          Переоткрыта
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
