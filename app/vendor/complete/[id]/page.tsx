"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/lib/storage";
import { Order } from "@/lib/types";

export default function CompleteOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  useEffect(() => {
    const orderId = params.id as string;
    const foundOrder = storage.getOrder(orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [params.id]);

  const handleAddPhoto = () => {
    // Using hardcoded placeholder images
    const placeholderImages = [
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400",
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setSelectedPhotos([...selectedPhotos, randomImage]);
  };

  const handleComplete = () => {
    if (!order) return;

    const updatedOrder = {
      ...order,
      status: "final_payment_pending" as const,
      completionDate: new Date().toISOString(),
      completionPhotos: selectedPhotos,
      updatedAt: new Date().toISOString(),
    };
    
    storage.saveOrder(updatedOrder);
    storage.addNotification({
      id: Date.now().toString(),
      orderId: order.id,
      message: `Order completed for ${order.clientName}. Awaiting final payment.`,
      createdAt: new Date().toISOString(),
      read: false,
    });

    toast({
      title: "Order completed!",
      description: "Client will receive final payment link",
    });

    router.push("/vendor/dashboard");
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button variant="ghost" onClick={() => router.back()} size="sm">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Complete Order</CardTitle>
          <CardDescription className="text-sm">
            Upload proof photos and mark the order as complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-sm sm:text-base">Order Details</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Client</p>
                <p className="font-medium text-sm sm:text-base">{order.clientName}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Service</p>
                <p className="font-medium text-sm sm:text-base">{order.serviceType}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-sm sm:text-base">${order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Remaining Amount</p>
                <p className="font-medium text-sm sm:text-base">${order.remainingAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="font-medium text-sm sm:text-base">Completion Photos</h3>
              <Button variant="ghost" size="sm" onClick={handleAddPhoto} className="w-full sm:w-auto border border-input">
                Add Photo
              </Button>
            </div>
            
            {selectedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {selectedPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={photo}
                      alt={`Proof ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center text-muted-foreground text-xs sm:text-sm">
                Click "Add Photo" to add completion proof photos
              </div>
            )}
          </div>

          <Button
            onClick={handleComplete}
            disabled={selectedPhotos.length === 0}
            className={`w-full h-10 ${
              selectedPhotos.length > 0
                ? "bg-primary/20 border-primary/30 text-primary hover:bg-primary/30"
                : "bg-transparent border-input text-muted-foreground"
            } border`}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

