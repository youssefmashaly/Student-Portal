import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Single localStorage key used everywhere ───────────────────────────────
export const THEME_KEY = 'projecthub_dark_mode'

// ─── Applies/removes the 'dark' class on <html> immediately ───────────────
export function applyThemeToDom(isDark) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

// ─── Run once synchronously before React renders to prevent flash ──────────
;(function immediateApply() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    applyThemeToDom(JSON.parse(stored) === true)
  } catch {
    applyThemeToDom(false)
  }
})()

// ─── Context ───────────────────────────────────────────────────────────────
const ThemeContext = createContext({
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
})

// ─── Provider ──────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(THEME_KEY)) === true
    } catch {
      return false
    }
  })

  // Every time isDark changes: update DOM + persist
  useEffect(() => {
    applyThemeToDom(isDark)
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(isDark))
    } catch {}
  }, [isDark])

  const setTheme = useCallback((dark) => {
    setIsDark(Boolean(dark))
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeContext)
}

export default ThemeContext