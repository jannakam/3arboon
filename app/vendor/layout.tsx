"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { VendorNav } from "@/components/vendor-nav";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!storage.isLoggedIn()) {
      router.push("/login");
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  if (!storage.isLoggedIn()) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <VendorNav />
      <main className="container mx-auto p-4 pb-20">{children}</main>
    </div>
  );
}

