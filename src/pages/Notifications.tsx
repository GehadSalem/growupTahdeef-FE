import React, { useState } from "react";
import { AppHeader } from "@/components/ui/AppHeader";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "تذكير بهدفك اليومي",
      message: "حان الوقت لممارسة القراءة اليومية",
      time: "منذ 10 دقائق",
      read: false,
    },
    {
      id: 2,
      title: "عمل رائع!",
      message: "لقد أكملت 7 أيام متتالية من التأمل",
      time: "منذ 3 ساعات",
      read: false,
    },
    {
      id: 3,
      title: "تحديث في التطبيق",
      message: "تم إضافة ميزات جديدة في تطبيق GrowUp",
      time: "منذ يوم واحد",
      read: true,
    },
  ]);

  const noNotifications = notifications.length === 0;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
    toast.success("تم تحديد جميع الإشعارات كمقروءة");
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <AppHeader title="الإشعارات" showBackButton />

      <div className="px-4 py-6 w-full">
        {noNotifications ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="bg-muted p-6 rounded-full mb-6">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">لا توجد إشعارات</h2>
            <p className="text-muted-foreground mb-6">
              ستظهر هنا كل التنبيهات والتذكيرات المتعلقة بأهدافك
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">كل الإشعارات</h2>
              <Button variant="ghost" className="text-sm" onClick={markAllAsRead}>
                تحديد الكل كمقروء
              </Button>
            </div>

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.read ? "bg-background" : "bg-gray-200" // Using bg-gray-50 (f1f5f9)
                } transition-colors duration-200`} // Smooth background transition
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold ${
                      notification.read ? "text-gray-700" : "text-gray-900" // Darker text for unread
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      notification.read ? "text-muted-foreground" : "text-gray-600"
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-growup mt-1.5"></div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className={`text-xs ${
                    notification.read ? "text-muted-foreground" : "text-gray-500"
                  }`}>
                    {notification.time}
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      <span className="text-xs mr-1">تم</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;