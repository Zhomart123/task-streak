import type { AppState, DailyReview, Task, ThemeMode } from "../types";
import { toDateKeyFromISO } from "../utils/date";
import { deriveStreak, incrementDailyCompletions } from "../utils/streak";

export type TaskAction =
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; id: string; updates: Partial<Omit<Task, "id" | "createdAt">> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "TOGGLE_TASK_DONE"; id: string }
  | { type: "UPSERT_DAILY_REVIEW"; review: DailyReview }
  | { type: "SET_THEME"; theme: ThemeMode };

const refreshStreak = (state: AppState): AppState => {
  return {
    ...state,
    streak: deriveStreak(state.streak)
  };
};

export const taskReducer = (state: AppState, action: TaskAction): AppState => {
  switch (action.type) {
    case "ADD_TASK": {
      return refreshStreak({
        ...state,
        tasks: [action.task, ...state.tasks]
      });
    }

    case "UPDATE_TASK": {
      const now = new Date().toISOString();
      return refreshStreak({
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.id) {
            return task;
          }
          return {
            ...task,
            ...action.updates,
            updatedAt: now
          };
        })
      });
    }

    case "DELETE_TASK": {
      return refreshStreak({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id)
      });
    }

    case "TOGGLE_TASK_DONE": {
      const targetTask = state.tasks.find((task) => task.id === action.id);
      if (!targetTask) {
        return state;
      }

      const now = new Date().toISOString();
      const nextDone = !targetTask.done;
      let nextStreak = deriveStreak(state.streak);

      if (nextDone) {
        const todayKey = toDateKeyFromISO(now);
        const previousCompletionDate = targetTask.completedAt
          ? toDateKeyFromISO(targetTask.completedAt)
          : null;

        if (todayKey !== previousCompletionDate) {
          const dailyCompletions = incrementDailyCompletions(state.streak.dailyCompletions, todayKey);
          nextStreak = deriveStreak({
            dailyCompletions,
            historyDates: [...state.streak.historyDates, todayKey],
            best: state.streak.best
          });
        }
      }

      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.id) {
            return task;
          }
          return {
            ...task,
            done: nextDone,
            completedAt: nextDone ? now : task.completedAt,
            updatedAt: now
          };
        }),
        streak: nextStreak
      };
    }

    case "UPSERT_DAILY_REVIEW": {
      const existingIndex = state.reviews.findIndex((review) => review.date === action.review.date);
      let nextReviews = [...state.reviews];

      if (existingIndex >= 0) {
        nextReviews[existingIndex] = action.review;
      } else {
        nextReviews.unshift(action.review);
      }

      nextReviews = nextReviews.sort((left, right) => right.date.localeCompare(left.date));

      return {
        ...state,
        reviews: nextReviews
      };
    }

    case "SET_THEME": {
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.theme
        }
      };
    }

    default: {
      return state;
    }
  }
};
