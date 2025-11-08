"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { storage } from "@/lib/storage";
import { Notification } from "@/lib/types";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setNotifications(storage.getNotifications());
  };

  const handleMarkAllRead = () => {
    storage.markAllNotificationsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) {
      storage.clearAllNotifications();
      loadNotifications();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {notifications.some((n) => !n.read) && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="flex-1 sm:flex-none border border-input">
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="flex-1 sm:flex-none border border-input">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              No notifications yet
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "opacity-60" : ""}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), "PPp")}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 bg-primary/60 dark:bg-primary rounded-full flex-shrink-0 mt-2 ring-2 ring-primary/20" />
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

