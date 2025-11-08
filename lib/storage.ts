import { Order, Notification, VendorProfile } from "./types";

const ORDERS_KEY = "escrow_orders";
const NOTIFICATIONS_KEY = "escrow_notifications";
const VENDOR_KEY = "escrow_vendor";
const AUTH_KEY = "escrow_auth";

export const storage = {
  // Auth
  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AUTH_KEY) === "true";
  },

  login: (username: string): void => {
    localStorage.setItem(AUTH_KEY, "true");
    // Initialize vendor profile if doesn't exist
    if (!storage.getVendorProfile()) {
      storage.saveVendorProfile({
        name: username,
        email: `${username}@example.com`,
        phone: "",
        businessName: "My Business",
      });
    }
  },

  logout: (): void => {
    localStorage.removeItem(AUTH_KEY);
  },

  // Orders
  getOrders: (): Order[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getOrder: (id: string): Order | null => {
    const orders = storage.getOrders();
    return orders.find((o) => o.id === id) || null;
  },

  saveOrder: (order: Order): void => {
    const orders = storage.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  // Notifications
  getNotifications: (): Notification[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addNotification: (notification: Notification): void => {
    const notifications = storage.getNotifications();
    notifications.unshift(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  markNotificationRead: (id: string): void => {
    const notifications = storage.getNotifications();
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  },

  markAllNotificationsRead: (): void => {
    const notifications = storage.getNotifications();
    notifications.forEach((n) => (n.read = true));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  clearAllNotifications: (): void => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  },

  // Vendor Profile
  getVendorProfile: (): VendorProfile | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(VENDOR_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveVendorProfile: (profile: VendorProfile): void => {
    localStorage.setItem(VENDOR_KEY, JSON.stringify(profile));
  },
};

