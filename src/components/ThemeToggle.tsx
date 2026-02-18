import type { ThemeMode } from "../types";

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps): JSX.Element => {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="surface-panel relative inline-flex h-11 w-24 items-center justify-between px-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md"
      aria-label={isDark ? "Включить светлую тему" : "Включить темную тему"}
      title={isDark ? "Светлая тема" : "Темная тема"}
    >
      <span className="text-base" aria-hidden>
        ☀
      </span>
      <span className="text-base" aria-hidden>
        ☾
      </span>
      <span
        className={`absolute top-1 h-9 w-9 rounded-xl bg-brand-500 shadow-md transition-all ${
          isDark ? "left-[3.05rem]" : "left-1"
        }`}
        aria-hidden
      />
    </button>
  );
};
