"use client";

import { Moon, Sun, Languages } from "lucide-react";
import { useSettings } from "@/components/providers/settings-provider";

export function ThemeLanguageSwitcher() {
  const { theme, toggleTheme, language, setLanguage } = useSettings();

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-card/50 p-1.5 backdrop-blur-md">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-brand-soft hover:text-brand"
        title="Alternar tema"
      >
        {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
      </button>

      <div className="h-4 w-px bg-line mx-1" />

      {/* Language Selector */}
      <div className="flex items-center gap-1">
        {(["pt", "en", "es"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex h-9 min-w-[36px] items-center justify-center rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
              language === lang
                ? "bg-brand text-white shadow-lg shadow-brand/20"
                : "hover:bg-brand-soft hover:text-brand"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
