import clsx from "clsx";
import type { Task } from "../types";
import { formatDateKey, getDeadlineMeta, isTaskOverdue } from "../utils/date";

interface TaskCardProps {
  task: Task;
  onToggleDone: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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

const deadlineToneClasses = {
  neutral: "text-slate-600 dark:text-slate-300",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-rose-700 dark:text-rose-300",
  positive: "text-emerald-700 dark:text-emerald-300"
} as const;

export const TaskCard = ({ task, onToggleDone, onEdit, onDelete }: TaskCardProps): JSX.Element => {
  const deadlineMeta = getDeadlineMeta(task.deadline, task.done);
  const overdue = isTaskOverdue(task.deadline, task.done);

  return (
    <article
      className={clsx(
        "surface-panel animate-slideUp p-4 transition hover:-translate-y-0.5 hover:shadow-md",
        overdue && "border-accent-300 bg-accent-50/40 dark:border-accent-700 dark:bg-accent-900/20"
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className={clsx(
              "truncate text-base font-semibold text-slate-900 dark:text-slate-100",
              task.done && "text-slate-500 line-through dark:text-slate-400"
            )}
          >
            {task.title}
          </h3>
          {task.description ? <p className="mt-1 line-clamp-2 text-sm muted-text">{task.description}</p> : null}
        </div>

        <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold", priorityClassMap[task.priority])}>
          {priorityLabelMap[task.priority]}
        </span>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={clsx("font-medium", deadlineToneClasses[deadlineMeta.tone])}>{deadlineMeta.label}</span>
        {task.deadline ? (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {formatDateKey(task.deadline)}
          </span>
        ) : null}
        {task.tags.map((tag) => (
          <span
            key={`${task.id}-${tag}`}
            className="rounded-md bg-brand-50 px-2 py-1 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
          >
            #{tag}
          </span>
        ))}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <button
          type="button"
          onClick={() => onToggleDone(task)}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
            task.done
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              : "bg-brand-500 text-white hover:bg-brand-600"
          )}
        >
          {task.done ? "Вернуть в активные" : "Выполнить"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:text-brand-300"
          >
            Редактировать
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
          >
            Удалить
          </button>
        </div>
      </footer>
    </article>
  );
};
