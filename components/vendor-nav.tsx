"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function VendorNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    setTheme(savedTheme);

    // Listen for theme changes
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
      setTheme(currentTheme);
    };

    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  const handleLogout = () => {
    storage.logout();
    router.push("/login");
  };

  const unreadCount = storage.getNotifications().filter((n) => !n.read).length;

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Image 
            src={theme === "dark" ? "/3ARBOON_white.png" : "/3ARBOON.png"}
            alt="3ARBOON" 
            width={100}
            height={26}
            className="h-5 sm:h-6 w-auto"
            priority
          />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                "active:bg-muted",
                pathname === "/vendor/dashboard" && "bg-muted"
              )}
            >
              <Link href="/vendor/dashboard">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                "relative active:bg-muted",
                pathname === "/vendor/notifications" && "bg-muted"
              )}
            >
              <Link href="/vendor/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-primary/60 dark:bg-primary rounded-full" />
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={cn(
                "active:bg-muted",
                pathname === "/vendor/profile" && "bg-muted"
              )}
            >
              <Link href="/vendor/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="active:bg-muted">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

