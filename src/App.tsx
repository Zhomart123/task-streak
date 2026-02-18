import { useCallback, useMemo, useState } from "react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Dashboard } from "./components/Dashboard";
import { TaskFormModal } from "./components/TaskFormModal";
import { TaskHistory } from "./components/TaskHistory";
import { TaskList } from "./components/TaskList";
import { TaskToolbar } from "./components/TaskToolbar";
import { ThemeToggle } from "./components/ThemeToggle";
import { ToastContainer } from "./components/ToastContainer";
import { useTaskContext } from "./hooks/useTaskContext";
import type { Priority, Task, TaskSortBy, TaskStatusFilter, ToastMessage, UpdateTaskInput } from "./types";
import { diffDateKeys, getTodayKey } from "./utils/date";
import { getCompletionsForLastDays } from "./utils/streak";

const priorityWeight: Record<Priority, number> = {
  Low: 1,
  Medium: 2,
  High: 3
};

const compareByCreatedAt = (a: Task, b: Task): number => {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

const compareByDeadline = (a: Task, b: Task): number => {
  if (a.deadline && b.deadline) {
    const diff = diffDateKeys(a.deadline, b.deadline);
    if (diff !== 0) {
      return diff;
    }
    return compareByCreatedAt(a, b);
  }
  if (a.deadline && !b.deadline) {
    return -1;
  }
  if (!a.deadline && b.deadline) {
    return 1;
  }
  return compareByCreatedAt(a, b);
};

const compareByPriority = (a: Task, b: Task): number => {
  const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
  if (diff !== 0) {
    return diff;
  }
  return compareByDeadline(a, b);
};

const createToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const App = (): JSX.Element => {
  const { state, addTask, updateTask, deleteTask, toggleTaskDone, setTheme } = useTaskContext();
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [sortBy, setSortBy] = useState<TaskSortBy>("deadline");
  const [query, setQuery] = useState("");
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: string, tone: ToastMessage["tone"] = "success") => {
    const toast: ToastMessage = { id: createToastId(), message, tone };
    setToasts((prev) => [...prev, toast]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const todayKey = getTodayKey();
  const completedToday = state.streak.dailyCompletions[todayKey] ?? 0;
  const completed7Days = getCompletionsForLastDays(state.streak.dailyCompletions, 7, todayKey);
  const activeCount = state.tasks.filter((task) => !task.done).length;
  const doneCount = state.tasks.length - activeCount;

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = state.tasks.filter((task) => {
      const statusMatched =
        statusFilter === "all" ||
        (statusFilter === "active" && !task.done) ||
        (statusFilter === "done" && task.done);

      const queryMatched = normalizedQuery
        ? task.title.toLowerCase().includes(normalizedQuery)
        : true;

      return statusMatched && queryMatched;
    });

    switch (sortBy) {
      case "priority":
        return filtered.sort(compareByPriority);
      case "createdAt":
        return filtered.sort(compareByCreatedAt);
      case "deadline":
      default:
        return filtered.sort(compareByDeadline);
    }
  }, [state.tasks, statusFilter, query, sortBy]);

  const openCreateTaskModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = (input: UpdateTaskInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input);
      pushToast("Задача обновлена", "info");
    } else {
      addTask(input);
      pushToast("Задача добавлена", "success");
    }
    closeTaskModal();
  };

  const handleToggleDone = (task: Task) => {
    toggleTaskDone(task.id);
    if (task.done) {
      pushToast("Задача снова в active", "info");
    } else {
      pushToast("Задача выполнена. Streak обновлен!", "success");
    }
  };

  const handleDeleteIntent = (task: Task) => {
    setDeletingTask(task);
  };

  const handleDeleteConfirm = () => {
    if (!deletingTask) {
      return;
    }
    deleteTask(deletingTask.id);
    pushToast("Задача удалена", "danger");
    setDeletingTask(null);
  };

  const toggleTheme = () => {
    setTheme(state.settings.theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/20" />
        <div className="absolute -right-28 top-44 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl dark:bg-accent-500/20" />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="animate-fadeIn">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              Productive Habit Tracker
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">TaskStreak</h1>
            <p className="mt-1 text-sm muted-text">
              Отмечай задачи каждый день и не ломай streak.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="surface-panel px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-wide muted-text">Last completed date</p>
              <p className="mt-0.5 text-sm font-semibold">{state.streak.lastDate ?? "еще нет"}</p>
            </div>
            <ThemeToggle theme={state.settings.theme} onToggle={toggleTheme} />
          </div>
        </header>

        <Dashboard
          currentStreak={state.streak.current}
          bestStreak={state.streak.best}
          completedToday={completedToday}
          completed7Days={completed7Days}
          activeCount={activeCount}
          doneCount={doneCount}
        />

        <TaskToolbar
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onAddTask={openCreateTaskModal}
        />

        <TaskList
          tasks={visibleTasks}
          onToggleDone={handleToggleDone}
          onEdit={openEditTaskModal}
          onDelete={handleDeleteIntent}
        />

        <TaskHistory tasks={state.tasks} />
      </main>

      <TaskFormModal
        isOpen={isTaskModalOpen}
        mode={editingTask ? "edit" : "create"}
        task={editingTask}
        onClose={closeTaskModal}
        onSubmit={handleTaskSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        title="Удалить задачу?"
        message={
          deletingTask
            ? `Задача "${deletingTask.title}" будет удалена без возможности восстановления.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTask(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default App;
