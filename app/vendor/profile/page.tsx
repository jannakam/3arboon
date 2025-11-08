"use client";

import { useState, useEffect } from "react";
import { User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/lib/storage";
import { VendorProfile } from "@/lib/types";

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<VendorProfile>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedProfile = storage.getVendorProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
    
    // Load theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Trigger storage event for cross-component theme updates
    window.dispatchEvent(new Event("storage"));
    
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveVendorProfile(profile);
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-xl truncate">{profile.name || "Vendor"}</CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="John Doe"
                className="text-sm h-9"
                required
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="businessName" className="text-xs sm:text-sm">Business Name</Label>
              <Input
                id="businessName"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                placeholder="My Business LLC"
                className="text-sm h-9"
                required
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="john@example.com"
                className="text-sm h-9"
                required
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="text-sm h-9"
              />
            </div>
            <Button type="submit" variant="ghost" className="w-full h-9 text-sm sm:text-base sm:h-10 border border-input">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Theme Switcher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm sm:text-base font-medium">Theme</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {theme === "light" ? "Light mode" : "Dark mode"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 sm:h-10 sm:w-10 border border-input"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

