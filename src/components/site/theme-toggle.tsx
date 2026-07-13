"use client";

import { useEffect } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export function ThemeToggle() {
  useEffect(() => {
    const stored = window.localStorage.getItem("vibelytix-theme");
    document.documentElement.dataset.theme = stored === "light" ? "light" : "dark";
  }, []);

  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("vibelytix-theme", next);
  }

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <span className="theme-icon theme-icon-sun"><SunIcon /></span>
      <span className="theme-icon theme-icon-moon"><MoonIcon /></span>
    </button>
  );
}
