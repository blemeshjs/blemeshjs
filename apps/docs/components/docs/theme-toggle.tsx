"use client"

import { useEffect, useState } from "react"
import { LaptopMinimal, Moon, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = mounted ? (isDark ? "Light" : "Dark") : "Theme"
  const ariaLabel = mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="gap-2 rounded-full border-border/70 bg-card/65 px-3 text-[0.82rem] text-muted-foreground hover:text-foreground"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {mounted ? (
        isDark ? <SunMedium className="size-3.5" /> : <Moon className="size-3.5" />
      ) : (
        <LaptopMinimal className="size-3.5" />
      )}
      <span>{label}</span>
      <LaptopMinimal className="size-3.5 text-muted-foreground/70" />
    </Button>
  )
}