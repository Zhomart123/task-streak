import type { StreakState } from "../types";
import { addDaysToDateKey, diffDateKeys, getTodayKey, isValidDateKey } from "./date";

interface StreakDraft {
  dailyCompletions: Record<string, number>;
  historyDates: string[];
  best: number;
}

const toPositiveInt = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.floor(parsed);
};

export const normalizeDailyCompletions = (raw: Record<string, unknown>): Record<string, number> => {
  const entries = Object.entries(raw);
  const normalized: Record<string, number> = {};

  for (const [dateKey, count] of entries) {
    if (!isValidDateKey(dateKey)) {
      continue;
    }
    const safeCount = toPositiveInt(count);
    if (safeCount > 0) {
      normalized[dateKey] = safeCount;
    }
  }

  return normalized;
};

export const normalizeHistoryDates = (dates: string[]): string[] => {
  return [...new Set(dates.filter((item) => isValidDateKey(item)))].sort();
};

export const calculateBestStreak = (historyDates: string[]): number => {
  if (historyDates.length === 0) {
    return 0;
  }

  let best = 1;
  let run = 1;

  for (let index = 1; index < historyDates.length; index += 1) {
    const prev = historyDates[index - 1];
    const current = historyDates[index];
    const gap = diffDateKeys(prev, current);

    if (gap === 1) {
      run += 1;
    } else {
      run = 1;
    }

    if (run > best) {
      best = run;
    }
  }

  return best;
};

export const calculateCurrentStreak = (historyDates: string[], todayKey: string): number => {
  if (historyDates.length === 0) {
    return 0;
  }

  const lastDate = historyDates[historyDates.length - 1];
  const distanceFromToday = diffDateKeys(lastDate, todayKey);

  if (distanceFromToday > 1) {
    return 0;
  }

  let run = 1;
  for (let index = historyDates.length - 1; index > 0; index -= 1) {
    const prev = historyDates[index - 1];
    const current = historyDates[index];
    const gap = diffDateKeys(prev, current);

    if (gap === 1) {
      run += 1;
    } else {
      break;
    }
  }

  return run;
};

export const deriveStreak = (draft: StreakDraft, todayKey: string = getTodayKey()): StreakState => {
  const dailyCompletions = normalizeDailyCompletions(draft.dailyCompletions);
  const mergedHistory = normalizeHistoryDates([
    ...draft.historyDates,
    ...Object.keys(dailyCompletions)
  ]);

  const current = calculateCurrentStreak(mergedHistory, todayKey);
  const calculatedBest = calculateBestStreak(mergedHistory);
  const best = Math.max(draft.best, calculatedBest);
  const lastDate = mergedHistory.length > 0 ? mergedHistory[mergedHistory.length - 1] : null;

  return {
    current,
    best,
    historyDates: mergedHistory,
    lastDate,
    dailyCompletions
  };
};

export const incrementDailyCompletions = (
  dailyCompletions: Record<string, number>,
  dateKey: string
): Record<string, number> => {
  return {
    ...dailyCompletions,
    [dateKey]: (dailyCompletions[dateKey] ?? 0) + 1
  };
};

export const getCompletionsForLastDays = (
  dailyCompletions: Record<string, number>,
  days: number,
  todayKey: string = getTodayKey()
): number => {
  let total = 0;

  for (let offset = 0; offset < days; offset += 1) {
    const dateKey = addDaysToDateKey(todayKey, -offset);
    total += dailyCompletions[dateKey] ?? 0;
  }

  return total;
};
