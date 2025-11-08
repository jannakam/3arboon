"use client";

import { useEffect, useState } from "react";
import { ClientToaster } from "./client-toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
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

