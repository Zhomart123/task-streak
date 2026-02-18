import type { AppState, ThemeMode } from "../types";

export const createDefaultState = (theme: ThemeMode): AppState => {
  return {
    tasks: [],
    streak: {
      current: 0,
      best: 0,
      historyDates: [],
      lastDate: null,
      dailyCompletions: {}
    },
    settings: {
      theme
    }
  };
};
