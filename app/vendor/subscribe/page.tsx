"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/lib/storage";
import { SubscriptionPlan } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function SubscribePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    // Load current plan if exists
    const profile = storage.getVendorProfile();
    if (profile?.subscriptionPlan) {
      setCurrentPlan(profile.subscriptionPlan);
      setSelectedPlan(profile.subscriptionPlan);
    }
  }, []);

  const packages = [
    {
      id: "package_a" as SubscriptionPlan,
      name: "Package A",
      tag: null,
      features: [
        "1% per e-Pay transaction",
        "Access to payment insights",
        "Access to different payment methods",
        "15,000 KWD daily limit",
        "30,000 KWD monthly limit",
      ],
      colorClass: "bg-teal-500/10 border-teal-500/15 dark:bg-teal-900/20 dark:border-teal-500/30",
      accentClass: "text-teal-600 dark:text-teal-200",
      checkClass: "text-teal-500 dark:text-teal-200",
      buttonClass: "bg-teal-500/20 border-teal-500/30 text-teal-600 dark:bg-teal-900/30 dark:border-teal-500/40 dark:text-teal-200 hover:bg-teal-500/30 dark:hover:bg-teal-900/40",
      ringClass: "ring-2 ring-teal-500/50",
    },
    {
      id: "package_b" as SubscriptionPlan,
      name: "Package B",
      tag: "Recommended",
      features: [
        "250 fils per e-Pay transaction",
        "1% per 3arboon transaction",
        "25,000 KWD daily limit",
        "50,000 KWD monthly limit",
        "Access to payment insights",
        "Access to different payment methods",
      ],
      colorClass: "bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-500/30",
      accentClass: "text-amber-600 dark:text-amber-200",
      checkClass: "text-amber-500 dark:text-amber-200",
      buttonClass: "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:bg-amber-900/30 dark:border-amber-500/40 dark:text-amber-200 hover:bg-amber-500/30 dark:hover:bg-amber-900/40",
      badgeClass: "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:bg-amber-900/30 dark:border-amber-500/50 dark:text-amber-200",
      ringClass: "ring-2 ring-amber-500/50",
    },
    {
      id: "package_c" as SubscriptionPlan,
      name: "Package C",
      tag: null,
      features: [
        "350 fils per e-Pay transaction",
        "1% per 3arboon transaction",
        "40,000 KWD daily limit",
        "100,000 KWD monthly limit",
        "Access to payment insights",
        "Access to different payment methods",
      ],
      colorClass: "bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-500/30",
      accentClass: "text-rose-600 dark:text-rose-200",
      checkClass: "text-rose-500 dark:text-rose-200",
      buttonClass: "bg-rose-500/20 border-rose-500/30 text-rose-600 dark:bg-rose-900/30 dark:border-rose-500/40 dark:text-rose-200 hover:bg-rose-500/30 dark:hover:bg-rose-900/40",
      ringClass: "ring-2 ring-rose-500/50",
    },
  ];

  const handleSubscribe = (planId: SubscriptionPlan) => {
    const profile = storage.getVendorProfile();
    if (profile) {
      storage.saveVendorProfile({
        ...profile,
        subscriptionPlan: planId,
      });
      
      const isUpdate = currentPlan !== null;
      toast({
        title: isUpdate ? "Subscription updated" : "Subscription activated",
        description: `You've ${isUpdate ? "updated to" : "subscribed to"} ${packages.find(p => p.id === planId)?.name}`,
      });
      
      // Check if we came from profile page
      const returnPath = sessionStorage.getItem("subscription_return");
      sessionStorage.removeItem("subscription_return");
      
      if (returnPath) {
        router.push(returnPath);
      } else {
        router.push("/vendor/dashboard");
      }
    }
  };

  const handleBack = () => {
    const returnPath = sessionStorage.getItem("subscription_return");
    if (returnPath) {
      router.push(returnPath);
    } else {
      router.push("/vendor/dashboard");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="px-4 max-w-2xl py-6 sm:py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="border border-input text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">
              {currentPlan ? "Change Your Plan" : "Choose Your Plan"}
            </h1>
            <p className="text-muted-foreground">
              {currentPlan 
                ? "Select a different subscription plan to update your current package"
                : "Select a subscription plan to access the dashboard"}
            </p>
          </div>

        <div className="space-y-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                "relative transition-all cursor-pointer hover:shadow-lg",
                pkg.colorClass,
                selectedPlan === pkg.id && pkg.ringClass
              )}
              onClick={() => setSelectedPlan(pkg.id)}
            >
              {pkg.tag && (
                <div className="absolute -top-3 right-4">
                  <Badge className={pkg.badgeClass || "bg-primary/20 border-primary/40 text-primary dark:bg-primary/30 dark:border-primary/50 dark:text-primary-foreground"}>
                    {pkg.tag}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className={cn("text-xl sm:text-2xl", pkg.accentClass)}>{pkg.name}</CardTitle>
                <CardDescription>Select this plan to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", pkg.checkClass)} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(pkg.id);
                  }}
                  disabled={currentPlan === pkg.id}
                  className={cn(
                    "w-full border",
                    currentPlan === pkg.id 
                      ? "bg-muted border-input text-muted-foreground cursor-not-allowed opacity-50"
                      : pkg.buttonClass
                  )}
                >
                  {currentPlan && currentPlan === pkg.id ? "Current Plan" : currentPlan ? "Switch to This Plan" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

