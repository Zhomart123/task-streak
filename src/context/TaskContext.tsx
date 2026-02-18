import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren
} from "react";
import type {
  AppState,
  CreateTaskInput,
  SaveDailyReviewInput,
  ThemeMode,
  UpdateTaskInput
} from "../types";
import { loadAppState, saveAppState, applyThemeClass } from "../utils/storage";
import { taskReducer } from "./taskReducer";

interface TaskContextValue {
  state: AppState;
  addTask: (input: CreateTaskInput) => void;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
  saveDailyReview: (input: SaveDailyReviewInput) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);

const buildId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

const sanitizeTags = (tags: string[]): string[] => {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
};

export const TaskProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [state, dispatch] = useReducer(taskReducer, undefined, loadAppState);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    applyThemeClass(state.settings.theme);
  }, [state.settings.theme]);

  const addTask = useCallback((input: CreateTaskInput) => {
    const now = new Date().toISOString();

    dispatch({
      type: "ADD_TASK",
      task: {
        id: buildId(),
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        priority: input.priority,
        deadline: input.deadline,
        createdAt: now,
        updatedAt: now,
        done: false,
        completedAt: null,
        tags: sanitizeTags(input.tags)
      }
    });
  }, []);

  const updateTask = useCallback((id: string, input: UpdateTaskInput) => {
    dispatch({
      type: "UPDATE_TASK",
      id,
      updates: {
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        priority: input.priority,
        deadline: input.deadline,
        tags: sanitizeTags(input.tags)
      }
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "DELETE_TASK", id });
  }, []);

  const toggleTaskDone = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_TASK_DONE", id });
  }, []);

  const saveDailyReview = useCallback(
    (input: SaveDailyReviewInput) => {
      const now = new Date().toISOString();
      const existing = state.reviews.find((review) => review.date === input.date);

      dispatch({
        type: "UPSERT_DAILY_REVIEW",
        review: {
          id: existing?.id ?? buildId(),
          date: input.date,
          wins: input.wins.trim(),
          blockers: input.blockers.trim(),
          nextFocus: input.nextFocus.trim(),
          createdAt: existing?.createdAt ?? now,
          updatedAt: now
        }
      });
    },
    [state.reviews]
  );

  const setTheme = useCallback((theme: ThemeMode) => {
    dispatch({ type: "SET_THEME", theme });
  }, []);

  const value = useMemo<TaskContextValue>(
    () => ({
      state,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskDone,
      saveDailyReview,
      setTheme
    }),
    [state, addTask, updateTask, deleteTask, toggleTaskDone, saveDailyReview, setTheme]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
