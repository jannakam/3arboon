"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { storage } from "@/lib/storage";
import { VendorNav } from "@/components/vendor-nav";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!storage.isLoggedIn()) {
      router.push("/login");
      return;
    }

    // Check if vendor has a subscription plan
    const profile = storage.getVendorProfile();
    const hasSubscription = profile?.subscriptionPlan !== null && profile?.subscriptionPlan !== undefined;

    // If on subscribe page, allow access
    if (pathname === "/vendor/subscribe") {
      return;
    }

    // If no subscription and not on subscribe page, redirect to subscribe
    if (!hasSubscription) {
      router.push("/vendor/subscribe");
    }
  }, [router, pathname]);

  if (!mounted) {
    return null;
  }

  if (!storage.isLoggedIn()) {
    return null;
  }

  // Don't show nav on subscribe page
  if (pathname === "/vendor/subscribe") {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen">
      <VendorNav />
      <main className="container mx-auto p-4 pb-20">{children}</main>
    </div>
  );
}

