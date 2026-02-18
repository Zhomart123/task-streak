import { useEffect, useRef, useState } from "react";
import type { Task, UpdateTaskInput } from "../types";
import { getMinDeadlineKey, isDeadlineAllowed } from "../utils/date";

interface TaskFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  task: Task | null;
  onClose: () => void;
  onSubmit: (input: UpdateTaskInput) => void;
}

const focusableSelector =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

const parseTags = (raw: string): string[] => {
  return [...new Set(raw.split(",").map((tag) => tag.trim()).filter(Boolean))];
};

export const TaskFormModal = ({
  isOpen,
  mode,
  task,
  onClose,
  onSubmit
}: TaskFormModalProps): JSX.Element | null => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [tagsRaw, setTagsRaw] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setDeadline(task?.deadline ?? "");
    setPriority(task?.priority ?? "Medium");
    setTagsRaw(task?.tags.join(", ") ?? "");
    setError("");
  }, [isOpen, task]);

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

  const minDeadline = getMinDeadlineKey();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError("Введите название задачи.");
      return;
    }

    if (deadline && !isDeadlineAllowed(deadline)) {
      setError(`Дедлайн не может быть раньше ${minDeadline}.`);
      return;
    }

    onSubmit({
      title: normalizedTitle,
      description: description.trim(),
      priority,
      deadline: deadline || null,
      tags: parseTags(tagsRaw)
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
          aria-labelledby="task-modal-title"
          className="surface-strong w-full max-w-xl animate-slideUp p-5"
        >
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="task-modal-title" className="font-display text-2xl font-semibold">
                {mode === "create" ? "Новая задача" : "Редактирование задачи"}
              </h2>
              <p className="mt-1 text-sm muted-text">Заполни поля и сохрани изменения.</p>
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
              Название *
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="название задач"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Описание
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Опционально"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Дедлайн
                <input
                  type="date"
                  value={deadline}
                  min={minDeadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Приоритет
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as Task["priority"])}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="Low">Низкий</option>
                  <option value="Medium">Средний</option>
                  <option value="High">Высокий</option>
                </select>
              </label>
            </div>

            <label className="grid gap-1.5 text-sm font-medium">
              Теги
              <input
                value={tagsRaw}
                onChange={(event) => setTagsRaw(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
                placeholder="работа, фокус, здоровье"
              />
            </label>

            {error ? (
              <p role="alert" className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
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
                {mode === "create" ? "Добавить задачу" : "Сохранить"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
};
