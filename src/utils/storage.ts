import { createDefaultState } from "../context/defaultState";
import type { AppState, Priority, Task, ThemeMode } from "../types";
import { getTodayKey, isValidDateKey, toDateKeyFromISO } from "./date";
import { deriveStreak, normalizeDailyCompletions } from "./streak";

const STORAGE_KEY = "taskstreak_state";
const STORAGE_VERSION = 2;

interface PersistedEnvelope {
  version: number;
  state: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isIsoLike = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }
  return !Number.isNaN(new Date(value).getTime());
};

const sanitizePriority = (value: unknown): Priority => {
  if (value === "Low" || value === "Medium" || value === "High") {
    return value;
  }
  return "Medium";
};

const sanitizeTheme = (value: unknown, fallback: ThemeMode): ThemeMode => {
  if (value === "light" || value === "dark") {
    return value;
  }
  return fallback;
};

const inferSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const buildTaskId = (index: number): string => {
  return `task-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`;
};

const sanitizeTask = (value: unknown, index: number): Task | null => {
  if (!isObject(value)) {
    return null;
  }

  const titleRaw = typeof value.title === "string" ? value.title.trim() : "";
  if (!titleRaw) {
    return null;
  }

  const createdAt = isIsoLike(value.createdAt) ? value.createdAt : new Date().toISOString();
  const updatedAt = isIsoLike(value.updatedAt) ? value.updatedAt : createdAt;
  const completedAt = isIsoLike(value.completedAt) ? value.completedAt : null;

  const tags = Array.isArray(value.tags)
    ? [...new Set(value.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean))]
    : [];

  const deadline = typeof value.deadline === "string" && isValidDateKey(value.deadline) ? value.deadline : null;

  return {
    id: typeof value.id === "string" && value.id ? value.id : buildTaskId(index),
    title: titleRaw,
    description: typeof value.description === "string" ? value.description.trim() : "",
    priority: sanitizePriority(value.priority),
    deadline,
    createdAt,
    updatedAt,
    done: Boolean(value.done),
    completedAt,
    tags
  };
};

const deriveDailyCompletionsFromTasks = (tasks: Task[]): Record<string, number> => {
  const dailyCompletions: Record<string, number> = {};

  for (const task of tasks) {
    if (!task.completedAt) {
      continue;
    }
    const completionDate = toDateKeyFromISO(task.completedAt);
    dailyCompletions[completionDate] = (dailyCompletions[completionDate] ?? 0) + 1;
  }

  return dailyCompletions;
};

const migrateUnknownState = (unknownState: unknown, fallbackTheme: ThemeMode): AppState => {
  if (!isObject(unknownState)) {
    return createDefaultState(fallbackTheme);
  }

  const tasksRaw = Array.isArray(unknownState.tasks) ? unknownState.tasks : [];
  const tasks = tasksRaw
    .map((taskRaw, index) => sanitizeTask(taskRaw, index))
    .filter((task): task is Task => task !== null);

  const streakRaw = isObject(unknownState.streak) ? unknownState.streak : {};
  const rawDailyCompletions = isObject(streakRaw.dailyCompletions)
    ? normalizeDailyCompletions(streakRaw.dailyCompletions)
    : {};
  const fallbackDaily = deriveDailyCompletionsFromTasks(tasks);
  const dailyCompletions =
    Object.keys(rawDailyCompletions).length > 0 ? rawDailyCompletions : fallbackDaily;

  const historyDates = Array.isArray(streakRaw.historyDates)
    ? streakRaw.historyDates.filter((value): value is string => typeof value === "string")
    : [];

  const bestRaw = Number(streakRaw.best);
  const best = Number.isFinite(bestRaw) ? Math.max(0, Math.floor(bestRaw)) : 0;

  const settingsRaw = isObject(unknownState.settings) ? unknownState.settings : {};
  const theme = sanitizeTheme(settingsRaw.theme, fallbackTheme);

  return {
    tasks,
    streak: deriveStreak(
      {
        dailyCompletions,
        historyDates,
        best
      },
      getTodayKey()
    ),
    settings: {
      theme
    }
  };
};

const parseEnvelope = (raw: string): PersistedEnvelope | null => {
  try {
    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) {
      return null;
    }

    if (typeof parsed.version === "number" && "state" in parsed) {
      return {
        version: parsed.version,
        state: parsed.state
      };
    }

    return {
      version: 1,
      state: parsed
    };
  } catch {
    return null;
  }
};

export const getPersistedTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const fallback = inferSystemTheme();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }

  const envelope = parseEnvelope(raw);
  if (!envelope) {
    return fallback;
  }

  const migrated = migrateUnknownState(envelope.state, fallback);
  return migrated.settings.theme;
};

export const applyThemeClass = (theme: ThemeMode): void => {
  if (typeof document === "undefined") {
    return;
  }

  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

export const loadAppState = (): AppState => {
  if (typeof window === "undefined") {
    return createDefaultState("light");
  }

  const fallbackTheme = inferSystemTheme();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultState(fallbackTheme);
  }

  const envelope = parseEnvelope(raw);
  if (!envelope) {
    return createDefaultState(fallbackTheme);
  }

  return migrateUnknownState(envelope.state, fallbackTheme);
};

export const saveAppState = (state: AppState): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = JSON.stringify({
      version: STORAGE_VERSION,
      state
    });
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    return;
  }
};
