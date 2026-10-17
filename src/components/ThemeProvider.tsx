import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      setDark(localStorage.getItem("kaimaaral-theme") === "dark");
    } catch { /* light mode remains available when storage is blocked */ }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  function toggle() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("kaimaaral-theme", next ? "dark" : "light"); } catch { /* session-only preference */ }
  }
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 sm:h-9 sm:w-9" onClick={toggle} aria-label={label} aria-pressed={dark} title={label}>
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}