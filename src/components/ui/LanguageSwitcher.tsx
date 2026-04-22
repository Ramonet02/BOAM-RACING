"use client";

/**
 * LanguageSwitcher — three-button inline selector (ES · EN · CA) that
 * adapts its colour to the current navbar state (dark text on scrolled
 * sand bg vs. light text on transparent bg over the hero).
 */

import { useLocale } from "@/i18n/LanguageProvider";
import { LOCALES, LOCALE_LABELS } from "@/i18n/translations";

interface LanguageSwitcherProps {
  /** When the navbar is scrolled, text should be dark on sand bg. */
  onLight?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  onLight = false,
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  const activeClass = onLight
    ? "text-[var(--color-text-primary)]"
    : "text-[var(--color-text-light)]";
  const inactiveClass = onLight
    ? "text-[var(--color-text-primary)]/40 hover:text-[var(--color-text-primary)]/75"
    : "text-[var(--color-text-light)]/40 hover:text-[var(--color-text-light)]/75";
  const sepClass = onLight
    ? "text-[var(--color-text-primary)]/20"
    : "text-[var(--color-text-light)]/20";

  return (
    <div
      className={`flex items-center gap-1 font-mono text-[10px] tracking-[2px] font-semibold ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map((l, i) => (
        <div key={l} className="flex items-center gap-1">
          {i > 0 && <span className={sepClass}>·</span>}
          <button
            type="button"
            onClick={() => setLocale(l)}
            className={`px-1 py-0.5 transition-colors cursor-pointer ${
              locale === l ? activeClass : inactiveClass
            }`}
            aria-label={`Switch language to ${LOCALE_LABELS[l]}`}
            aria-pressed={locale === l}
          >
            {LOCALE_LABELS[l]}
          </button>
        </div>
      ))}
    </div>
  );
}
