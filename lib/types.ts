export type OrderStatus = 
  | "pending_payment" 
  | "payment_reserved" 
  | "in_production" 
  | "completed" 
  | "final_payment_pending"
  | "final_payment_done";

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  totalAmount: number;
  advancePercentage: number;
  advanceAmount: number;
  remainingAmount: number;
  serviceType: string;
  terms: string;
  productionDeadlineDays: number;
  status: OrderStatus;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
  clientConsent: boolean;
  advancePaymentDate?: string;
  productionStartDate?: string;
  completionDate?: string;
  completionPhotos?: string[];
  finalPaymentDate?: string;
}

export interface Notification {
  id: string;
  orderId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type SubscriptionPlan = "package_a" | "package_b" | "package_c" | null;

export interface VendorProfile {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  subscriptionPlan?: SubscriptionPlan;
}

