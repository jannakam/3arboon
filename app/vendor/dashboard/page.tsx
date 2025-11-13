"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, CheckCircle2, Clock, Package, DollarSign, TrendingUp, AlertCircle, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/lib/storage";
import { Order } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function VendorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    totalAmount: "",
    advancePercentage: "",
    serviceType: "",
    productionDeadlineDays: "",
  });

  const isFormValid = () => {
    return (
      formData.clientName.trim() !== "" &&
      formData.clientPhone.trim() !== "" &&
      formData.serviceType.trim() !== "" &&
      formData.totalAmount !== "" &&
      parseFloat(formData.totalAmount) > 0 &&
      formData.advancePercentage !== "" &&
      parseFloat(formData.advancePercentage) >= 0 &&
      parseFloat(formData.advancePercentage) <= 100 &&
      formData.productionDeadlineDays !== "" &&
      parseInt(formData.productionDeadlineDays) > 0
    );
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.clientName.toLowerCase().includes(query) ||
        order.clientPhone.includes(query) ||
        order.serviceType.toLowerCase().includes(query) ||
        order.id.includes(query)
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Sort orders
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "deadline") {
        // Sort by estimated deadline (createdAt + productionStartDate + deadline days)
        const getDeadline = (order: Order) => {
          if (!order.productionStartDate || !order.productionDeadlineDays) return Infinity;
          const startDate = new Date(order.productionStartDate);
          return startDate.getTime() + (order.productionDeadlineDays * 24 * 60 * 60 * 1000);
        };
        return getDeadline(a) - getDeadline(b);
      }
      return 0;
    });
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, sortBy, searchQuery]);

  const loadOrders = () => {
    setOrders(storage.getOrders());
  };

  const calculateEarnings = () => {
    const totalEarnings = orders
      .filter(o => o.status === "final_payment_done")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    const pendingEarnings = orders
      .filter(o => o.status === "in_production" || o.status === "final_payment_pending")
      .reduce((sum, o) => sum + o.remainingAmount, 0);
    
    const reservedFunds = orders
      .filter(o => o.status === "payment_reserved")
      .reduce((sum, o) => sum + o.advanceAmount, 0);
    
    const activeOrders = orders.filter(
      o => o.status !== "final_payment_done"
    ).length;
    
    return { totalEarnings, pendingEarnings, reservedFunds, activeOrders };
  };

  const earnings = calculateEarnings();

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(formData.totalAmount);
    const advancePercentage = parseFloat(formData.advancePercentage);
    const advanceAmount = (totalAmount * advancePercentage) / 100;
    const remainingAmount = totalAmount - advanceAmount;

    const vendor = storage.getVendorProfile();
    
    // Auto-generate terms from form data
    const generatedTerms = `SERVICE AGREEMENT

Service Provider: ${vendor?.businessName || vendor?.name || "Vendor"}
Service Type: ${formData.serviceType}
Client: ${formData.clientName}

PAYMENT STRUCTURE:
• Total Project Cost: $${totalAmount.toFixed(2)}
• Advance Payment (${advancePercentage}%): $${advanceAmount.toFixed(2)}
• Remaining Balance: $${remainingAmount.toFixed(2)}

TIMELINE:
• Production will be completed within ${formData.productionDeadlineDays} days from the start date
• Client will be notified upon completion with proof of work

PAYMENT TERMS:
1. The advance payment of $${advanceAmount.toFixed(2)} will be held in escrow by the platform
2. Funds will be released to the service provider once production officially begins
3. The remaining payment of $${remainingAmount.toFixed(2)} is due upon completion and delivery
4. Client will receive photographic or documentary proof before final payment is required

CANCELLATION & REFUNDS:
• If the service provider cancels before starting production, the full advance payment will be refunded
• If the client cancels after production has started, refund terms will be negotiated between parties
• The platform facilitates payment holding but does not mediate disputes beyond the escrow service

PLATFORM LIABILITY DISCLAIMER:
The 3ARBOON platform provides payment holding services only. By using this service, both parties acknowledge and agree that:

1. The platform is not responsible for the quality, completion, or delivery of services
2. The platform is not liable for any disputes, damages, or losses arising from the service agreement
3. Users are responsible for verifying the legitimacy and capabilities of their transaction partners
4. The platform does not guarantee outcomes and serves solely as a payment intermediary
5. Any misuse of this platform, including fraud or misrepresentation, is the sole responsibility of the offending party
6. The platform reserves the right to hold funds in case of reported disputes until resolution

By proceeding, both parties agree to these terms and acknowledge their understanding of the platform's limited role as a payment escrow service.`;

    const order: Order = {
      id: Date.now().toString(),
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      totalAmount,
      advancePercentage,
      advanceAmount,
      remainingAmount,
      serviceType: formData.serviceType,
      productionDeadlineDays: parseInt(formData.productionDeadlineDays),
      terms: generatedTerms,
      status: "pending_payment",
      vendorName: vendor?.name || "Vendor",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientConsent: false,
    };

    storage.saveOrder(order);
    storage.addNotification({
      id: Date.now().toString(),
      orderId: order.id,
      message: `New payment link created for ${order.clientName}`,
      createdAt: new Date().toISOString(),
      read: false,
    });

    const link = `${window.location.origin}/client/${order.id}`;
    navigator.clipboard.writeText(link);

    toast({
      title: "Payment link created!",
      description: "Link copied to clipboard",
    });

    setFormData({
      clientName: "",
      clientPhone: "",
      totalAmount: "",
      advancePercentage: "",
      serviceType: "",
      productionDeadlineDays: "",
    });
    setIsDialogOpen(false);
    loadOrders();
  };

  const copyLink = (orderId: string) => {
    const link = `${window.location.origin}/client/${orderId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Payment link copied to clipboard",
    });
  };

  const openLink = (orderId: string) => {
    const link = `${window.location.origin}/client/${orderId}`;
    window.open(link, '_blank');
  };

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

  const handleStartProduction = (order: Order) => {
    const updatedOrder = {
      ...order,
      status: "in_production" as const,
      productionStartDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveOrder(updatedOrder);
    storage.addNotification({
      id: Date.now().toString(),
      orderId: order.id,
      message: `Production started for order ${order.clientName}`,
      createdAt: new Date().toISOString(),
      read: false,
    });
    toast({
      title: "Production started",
      description: "Payment has been released",
    });
    loadOrders();
  };

  const handleCompleteOrder = (order: Order) => {
    router.push(`/vendor/complete/${order.id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full sm:w-auto border border-input">
              <Plus className="h-4 w-4 mr-2" />
              Create Payment Link
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[92vh] overflow-y-auto">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-lg sm:text-xl">Create Payment Link</DialogTitle>
              <DialogDescription className="text-sm">
                Fill in the details to generate a payment link for your client
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLink} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="John Doe"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-sm">Client Phone</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="h-10"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType" className="text-sm">Service Type</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  placeholder="Web Development"
                  className="h-10"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="totalAmount" className="text-sm truncate block">Total ($)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    placeholder="1000"
                    className="h-10 w-full"
                    required
                  />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="advancePercentage" className="text-sm truncate block">Advance (%)</Label>
                  <Input
                    id="advancePercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.advancePercentage}
                    onChange={(e) => setFormData({ ...formData, advancePercentage: e.target.value })}
                    placeholder="50"
                    className="h-10 w-full"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productionDeadlineDays" className="text-sm">Deadline (Days)</Label>
                <Input
                  id="productionDeadlineDays"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.productionDeadlineDays}
                  onChange={(e) => setFormData({ ...formData, productionDeadlineDays: e.target.value })}
                  placeholder="14"
                  className="h-10"
                  required
                />
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Terms will be auto-generated from the info above.
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={!isFormValid()}
                className={`w-full h-10 ${
                  isFormValid() 
                    ? "bg-primary/20 border-primary/30 text-primary/60 dark:text-primary hover:bg-primary/30" 
                    : "bg-transparent border-input text-muted-foreground"
                } border`}
              >
                Generate Link
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 dark:text-green-400">
              ${earnings.totalEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
              ${earnings.pendingEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Reserved Funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
              ${earnings.reservedFunds.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500 dark:text-gray-300">
              {earnings.activeOrders}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <div className="space-y-3">
        {/* Status Filters - Horizontally Scrollable */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "active:bg-muted",
                statusFilter === "all" && "bg-muted"
              )}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("pending_payment")}
              className={cn(
                "active:bg-muted",
                statusFilter === "pending_payment" && "bg-muted"
              )}
            >
              Pending
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("payment_reserved")}
              className={cn(
                "active:bg-muted",
                statusFilter === "payment_reserved" && "bg-muted"
              )}
            >
              Reserved
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("in_production")}
              className={cn(
                "active:bg-muted",
                statusFilter === "in_production" && "bg-muted"
              )}
            >
              In Progress
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("final_payment_done")}
              className={cn(
                "active:bg-muted",
                statusFilter === "final_payment_done" && "bg-muted"
              )}
            >
              Completed
            </Button>
          </div>
        </div>
        
        {/* Search and Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, phone, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground flex-shrink-0 focus-visible:outline-none focus-visible:border-secondary-foreground/50 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Closest Deadline</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {orders.length === 0 
                ? "No orders yet. Create your first payment link to get started."
                : "No orders match the current filter."}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{order.clientName}</CardTitle>
                    <CardDescription>{order.clientPhone}</CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Service</p>
                    <p className="font-medium text-sm sm:text-base">{order.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Total Amount</p>
                    <p className="font-medium text-sm sm:text-base">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Advance ({order.advancePercentage}%)</p>
                    <p className="font-medium text-sm sm:text-base">${order.advanceAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Remaining</p>
                    <p className="font-medium text-sm sm:text-base">${order.remainingAmount.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs sm:text-sm">Created</p>
                    <p className="font-medium text-sm sm:text-base">{format(new Date(order.createdAt), "PPp")}</p>
                  </div>
                  {order.productionStartDate && order.productionDeadlineDays && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs sm:text-sm">Deadline</p>
                      <p className="font-medium text-sm sm:text-base">
                        {format(
                          new Date(new Date(order.productionStartDate).getTime() + order.productionDeadlineDays * 24 * 60 * 60 * 1000),
                          "PPp"
                        )}
                      </p>
                    </div>
                  )}
                  {!order.productionStartDate && order.productionDeadlineDays && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs sm:text-sm">Production Timeline</p>
                      <p className="font-medium text-sm sm:text-base">{order.productionDeadlineDays} days once started</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">

                    <Button variant="ghost" size="sm" onClick={() => copyLink(order.id)} className="flex-1 border border-input">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openLink(order.id)} className="w-1/6 border border-input">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {order.status === "payment_reserved" && (
                    <Button size="sm" onClick={() => handleStartProduction(order)} className="w-full bg-primary/20 border-primary/30 text-primary/80 dark:text-primary hover:bg-primary/30 border">
                      <Package className="h-4 w-4 mr-2" />
                      Start Production
                    </Button>
                  )}

                  {order.status === "in_production" && (
                    <Button size="sm" onClick={() => handleCompleteOrder(order)} className="w-full bg-primary/20 border-primary/30 text-primary/80 dark:text-primary hover:bg-primary/30 border">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}

                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

