"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (storage.isLoggedIn()) {
      router.push("/vendor/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return null;
}

