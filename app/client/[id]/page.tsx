"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Clock, Package, DollarSign, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { storage } from "@/lib/storage";
import { Order } from "@/lib/types";
import { format } from "date-fns";
import logoLight from "@/assets/3ARBOON.png";
import logoDark from "@/assets/3ARBOON_white.png";

export default function ClientOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingFinalPayment, setProcessingFinalPayment] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
  }, []);

  const loadOrder = () => {
    const orderId = params.id as string;
    const foundOrder = storage.getOrder(orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  };

  const handleInitialPayment = async () => {
    if (!order) return;
    
    setProcessingPayment(true);
    // Simulate payment processing
    setTimeout(() => {
      const updatedOrder = {
        ...order,
        advancePaymentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveOrder(updatedOrder);
      storage.addNotification({
        id: Date.now().toString(),
        orderId: order.id,
        message: `${order.clientName} made advance payment of $${order.advanceAmount.toFixed(2)}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
      setProcessingPayment(false);
      loadOrder();
    }, 2000);
  };

  const handleAgreeTerms = () => {
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: "payment_reserved" as const,
      clientConsent: true,
      updatedAt: new Date().toISOString(),
    };
    storage.saveOrder(updatedOrder);
    storage.addNotification({
      id: Date.now().toString(),
      orderId: order.id,
      message: `${order.clientName} agreed to terms. Payment reserved.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    loadOrder();
  };

  const handleFinalPayment = async () => {
    if (!order) return;
    
    setProcessingFinalPayment(true);
    // Simulate payment processing
    setTimeout(() => {
      const updatedOrder = {
        ...order,
        status: "final_payment_done" as const,
        finalPaymentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveOrder(updatedOrder);
      storage.addNotification({
        id: Date.now().toString(),
        orderId: order.id,
        message: `${order.clientName} completed final payment of $${order.remainingAmount.toFixed(2)}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
      setProcessingFinalPayment(false);
      loadOrder();
    }, 2000);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<Order["status"], { label: string; className: string }> = {
      pending_payment: { 
        label: "Pending Payment", 
        className: "bg-gray-400/10 border-gray-400/15 text-gray-500 dark:bg-blue-900/80 dark:border-blue-500 dark:text-white" 
      },
      payment_reserved: { 
        label: "Payment Reserved", 
        className: "bg-yellow-500/10 border-yellow-500/15 text-yellow-600 dark:bg-orange-900/80 dark:border-orange-500 dark:text-white" 
      },
      in_production: { 
        label: "In Production", 
        className: "bg-orange-500/10 border-orange-500/15 text-orange-600 dark:bg-orange-900/80 dark:border-orange-500 dark:text-white" 
      },
      completed: { 
        label: "Completed", 
        className: "bg-green-500/10 border-green-500/15 text-green-600 dark:bg-green-900/80 dark:border-green-500 dark:text-white" 
      },
      final_payment_pending: { 
        label: "Final Payment Pending", 
        className: "bg-gray-400/10 border-gray-400/15 text-gray-500 dark:bg-blue-900/80 dark:border-blue-500 dark:text-white" 
      },
      final_payment_done: { 
        label: "Paid", 
        className: "bg-green-500/10 border-green-500/15 text-green-600 dark:bg-green-900/80 dark:border-green-500 dark:text-white" 
      },
    };
    const config = variants[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-2xl mx-auto p-4 space-y-4 sm:space-y-6 py-8 sm:py-12">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 pt-4">
          <div className="h-16 sm:h-20 w-52 sm:w-64 relative">
            <Image 
              src={theme === "dark" ? logoDark : logoLight}
              alt="3ARBOON" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Secure Payment System</p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          {getStatusBadge(order.status)}
        </div>

        {/* Actionable Items - Payment Flow */}
        {order.status === "pending_payment" && !order.advancePaymentDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Make Advance Payment</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Pay ${order.advanceAmount.toFixed(2)} to proceed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInitialPayment}
                disabled={processingPayment}
                className={`w-full h-10 sm:h-11 ${
                  !processingPayment
                    ? "bg-primary/20 border-primary/30 text-primary/60 dark:text-primary hover:bg-primary/30"
                    : "bg-transparent border-input text-muted-foreground"
                } border`}
              >
                {processingPayment ? "Processing..." : `Pay $${order.advanceAmount.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {order.status === "pending_payment" && order.advancePaymentDate && !order.clientConsent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Review Agreement</CardTitle>
              <CardDescription className="text-sm">Please review the terms to proceed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full h-10 sm:h-11 text-sm sm:text-base border border-input">
                    <FileText className="h-4 w-4 mr-2" />
                    View Terms & Conditions
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[92vh] overflow-y-auto">
                  <DialogHeader className="pr-8">
                    <DialogTitle className="text-lg sm:text-xl">Terms & Conditions</DialogTitle>
                    <DialogDescription className="text-sm">
                      Please read carefully before agreeing
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 sm:space-y-6">
                    <div className="bg-muted p-4 sm:p-5 rounded-lg max-h-[40vh] overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{order.terms}</p>
                    </div>

                    <div className="space-y-4 border-t pt-4 sm:pt-5">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms-dialog"
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                          className="mt-1"
                        />
                        <Label
                          htmlFor="terms-dialog"
                          className="text-xs sm:text-sm leading-relaxed cursor-pointer"
                        >
                          I have read and agree to the terms and conditions stated above. I understand that
                          the advance payment of ${order.advanceAmount.toFixed(2)} will be
                          held in escrow until production begins, and the remaining payment is due upon completion.
                        </Label>
                      </div>

                      <Button
                        onClick={() => {
                          handleAgreeTerms();
                          setTermsDialogOpen(false);
                        }}
                        disabled={!agreedToTerms}
                        className={`w-full h-10 sm:h-11 ${
                          agreedToTerms 
                            ? "bg-primary/20 border-primary/30 text-primary/60 dark:text-primary hover:bg-primary/30" 
                            : "bg-transparent border-input text-muted-foreground"
                        } border`}
                      >
                        Agree & Reserve Payment
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                Click above to review the complete terms and conditions
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "final_payment_pending" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Final Payment</CardTitle>
              <CardDescription className="text-sm">
                Your order is complete. Please make the final payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.completionPhotos && order.completionPhotos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm sm:text-base">Completion Proof</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {order.completionPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                        <img
                          src={photo}
                          alt={`Completion ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleFinalPayment}
                disabled={processingFinalPayment}
                className={`w-full h-10 sm:h-11 ${
                  !processingFinalPayment
                    ? "bg-primary/20 border-primary/30 text-primary/60 dark:text-primary hover:bg-primary/30"
                    : "bg-transparent border-input text-muted-foreground"
                } border`}
              >
                {processingFinalPayment
                  ? "Processing..."
                  : `Pay Final Amount $${order.remainingAmount.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimelineItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="Order Created"
                date={order.createdAt}
                completed
              />
              <TimelineItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="Advance Payment Made"
                date={order.advancePaymentDate}
                completed={!!order.advancePaymentDate}
              />
              <TimelineItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="Terms Agreed"
                date={order.clientConsent ? order.updatedAt : undefined}
                completed={order.clientConsent}
              />
              <TimelineItem
                icon={<Package className="h-4 w-4" />}
                title="Production Started"
                date={order.productionStartDate}
                completed={!!order.productionStartDate}
              />
              <TimelineItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="Production Completed"
                date={order.completionDate}
                completed={!!order.completionDate}
              />
              <TimelineItem
                icon={<DollarSign className="h-4 w-4" />}
                title="Final Payment"
                date={order.finalPaymentDate}
                completed={!!order.finalPaymentDate}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium text-sm sm:text-base truncate">{order.vendorName}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Service</p>
                <p className="font-medium text-sm sm:text-base truncate">{order.serviceType}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-sm sm:text-base">${order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Advance Payment</p>
                <p className="font-medium text-sm sm:text-base">${order.advanceAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Remaining Payment</p>
                <p className="font-medium text-sm sm:text-base">${order.remainingAmount.toFixed(2)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {order.createdAt && (
              <div className="pt-4 border-t text-sm">
                <p className="text-xs sm:text-sm text-muted-foreground">Created</p>
                <p className="font-medium text-sm sm:text-base">{format(new Date(order.createdAt), "PPp")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TimelineItem({
  icon,
  title,
  date,
  completed,
}: {
  icon: React.ReactNode;
  title: string;
  date?: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div
        className={`flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 flex-shrink-0 ${
          completed
            ? "bg-primary/20 border-primary/30 text-primary"
            : "border-primary/10 text-primary/30"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <p className={`font-medium text-sm sm:text-base ${!completed && "text-muted-foreground"}`}>
          {title}
        </p>
        {date && (
          <p className="text-xs text-muted-foreground break-words">
            {format(new Date(date), "PPp")}
          </p>
        )}
      </div>
    </div>
  );
}

