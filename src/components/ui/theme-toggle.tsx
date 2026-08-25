'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  // Which icon shows is decided in CSS off the `dark` class on <html>, not
  // from `resolvedTheme`. On the server that value is undefined, so branching
  // on it in render makes the server emit one glyph and the client another —
  // a hydration mismatch. Rendering both and letting the cascade pick keeps
  // the markup identical on both sides.
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </Button>
  )
}
