"use client";

import { useEffect } from "react";
import { useUiStore } from "@/lib/ui-store";

export function LanguageSync() {
  const language = useUiStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.body.dataset.appLanguage = language;
  }, [language]);

  return null;
}
