"use client";

import { useEffect, useState } from "react";
import { Toaster as ToasterComponent } from "@/components/ui/toaster";

export function ClientToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ToasterComponent />;
}

