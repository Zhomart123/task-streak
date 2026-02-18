const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const formatDayWord = (value: number): string => {
  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "день";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "дня";
  }
  return "дней";
};

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string): Date => {
  if (!DATE_KEY_REGEX.test(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const isValidDateKey = (value: string): boolean => {
  if (!DATE_KEY_REGEX.test(value)) {
    return false;
  }

  try {
    const parsed = parseDateKey(value);
    return toDateKey(parsed) === value;
  } catch {
    return false;
  }
};

export const toDateKeyFromISO = (isoDate: string): string => {
  return toDateKey(new Date(isoDate));
};

export const getTodayKey = (): string => {
  return toDateKey(new Date());
};

export const diffDateKeys = (fromDateKey: string, toDateKeyValue: string): number => {
  const fromTime = parseDateKey(fromDateKey).getTime();
  const toTime = parseDateKey(toDateKeyValue).getTime();
  return Math.round((toTime - fromTime) / DAY_MS);
};

export const addDaysToDateKey = (dateKey: string, amount: number): string => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
};

export const getMinDeadlineKey = (): string => {
  return addDaysToDateKey(getTodayKey(), -365);
};

export const isDeadlineAllowed = (deadline: string): boolean => {
  if (!isValidDateKey(deadline)) {
    return false;
  }
  return diffDateKeys(getMinDeadlineKey(), deadline) >= 0;
};

export type DeadlineTone = "neutral" | "warning" | "danger" | "positive";

export interface DeadlineMeta {
  label: string;
  tone: DeadlineTone;
}

export const getDeadlineMeta = (deadline: string | null, done: boolean): DeadlineMeta => {
  if (!deadline) {
    return { label: "Без дедлайна", tone: "neutral" };
  }

  const diff = diffDateKeys(getTodayKey(), deadline);
  if (!done) {
    if (diff < 0) {
      const days = Math.abs(diff);
      return { label: `Просрочено на ${days} ${formatDayWord(days)}`, tone: "danger" };
    }
    if (diff === 0) {
      return { label: "Дедлайн сегодня", tone: "warning" };
    }
    if (diff === 1) {
      return { label: "Дедлайн завтра", tone: "warning" };
    }
    return { label: `Через ${diff} ${formatDayWord(diff)}`, tone: "neutral" };
  }

  if (diff < 0) {
    return { label: `Закрыто с дедлайном ${Math.abs(diff)} ${formatDayWord(diff)} назад`, tone: "positive" };
  }
  if (diff === 0) {
    return { label: "Закрыто в дедлайн", tone: "positive" };
  }
  return { label: "Закрыто до дедлайна", tone: "positive" };
};

export const isTaskOverdue = (deadline: string | null, done: boolean): boolean => {
  if (!deadline || done) {
    return false;
  }
  return diffDateKeys(deadline, getTodayKey()) > 0;
};

export const formatDateKey = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short"
  };

  if (date.getFullYear() !== currentYear) {
    options.year = "numeric";
  }

  return new Intl.DateTimeFormat("ru-RU", options).format(date);
};
