import type { TaskSortBy, TaskStatusFilter } from "../types";

interface TaskToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  statusFilter: TaskStatusFilter;
  onStatusFilterChange: (status: TaskStatusFilter) => void;
  sortBy: TaskSortBy;
  onSortChange: (sortBy: TaskSortBy) => void;
  onAddTask: () => void;
}

const statusOptions: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" }
];

export const TaskToolbar = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onAddTask
}: TaskToolbarProps): JSX.Element => {
  return (
    <section className="surface-panel mb-5 animate-slideUp p-4 [animation-delay:120ms]">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block md:max-w-sm md:flex-1">
          <span className="sr-only">Поиск задач</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск по названию..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition placeholder:text-slate-400 hover:border-brand-300 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500"
          />
        </label>

        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-600 active:translate-y-0"
        >
          + Add task
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/70 md:w-auto">
          {statusOptions.map((option) => {
            const isActive = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium muted-text">
          Sort:
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as TaskSortBy)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm transition hover:border-brand-300 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created date</option>
          </select>
        </label>
      </div>
    </section>
  );
};
