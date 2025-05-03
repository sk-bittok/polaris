'use client';

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  if (theme === "dark") {
    return (
      <Button variant="outline" size="icon" onClick={() => setTheme("light")}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90" />
      </Button>
    )
  }

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme("dark")}>
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-270 transition-all dark:rotate-0 scale-100" />
    </Button>
  )

}
