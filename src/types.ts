export type ThemeMode = "light" | "dark";
export type Priority = "Low" | "Medium" | "High";
export type TaskStatusFilter = "all" | "active" | "done";
export type TaskSortBy = "deadline" | "priority" | "createdAt";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  done: boolean;
  completedAt: string | null;
  tags: string[];
}

export interface StreakState {
  current: number;
  best: number;
  historyDates: string[];
  lastDate: string | null;
  dailyCompletions: Record<string, number>;
}

export interface SettingsState {
  theme: ThemeMode;
}

export interface AppState {
  tasks: Task[];
  streak: StreakState;
  settings: SettingsState;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  deadline: string | null;
  tags: string[];
}

export interface UpdateTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  deadline: string | null;
  tags: string[];
}

export type ToastTone = "success" | "info" | "danger";

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}
