"use client";

import { useEffect, useState } from "react";
import { ClientToaster } from "./client-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage, default to dark mode
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const resolvedTheme = storedTheme ?? "dark";

    if (!storedTheme) {
      localStorage.setItem("theme", resolvedTheme);
    }

    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {children}
      <ClientToaster />
    </>
  );
}

