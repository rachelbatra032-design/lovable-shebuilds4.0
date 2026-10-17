import { useEffect, useState, useCallback } from "react";
import type { LangCode } from "./knowledge";

const KEY = "kaimaaral-lang";
const listeners = new Set<(l: LangCode) => void>();

export function useLang(): [LangCode, (l: LangCode) => void] {
  const [lang, setLangState] = useState<LangCode>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY) as LangCode | null;
    if (saved) setLangState(saved);
    const fn = (l: LangCode) => setLangState(l);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  const setLang = useCallback((l: LangCode) => {
    window.localStorage.setItem(KEY, l);
    listeners.forEach((fn) => fn(l));
  }, []);
  return [lang, setLang];
}
