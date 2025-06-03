"use client";

import { useEffect, useState } from "react";
import api from "../../../utils/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SubscriptionPlansTable } from "@/components/admin/SubscriptionPlansTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { RefundsTable } from "@/components/admin/RefundsTable";
import { SubscriptionChart } from "@/components/admin/SubscriptionChart";
import { RevenueMetrics } from "@/components/admin/RevenueMetrics";

export default function SubscriptionsPage() {
  const [selectedTab, setSelectedTab] = useState("plans");

  const [stats, setStats] = useState<{
    totalRevenue: number;
    conversionRate: number;
    retentionRate: number;
    revenueChange: number;
    conversionChange: number;
    retentionChange: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/dashboard/summary");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <AdminHeader 
          heading="الاشتراكات والمدفوعات" 
          text="إدارة خطط الاشتراك، عرض وتحليل المدفوعات" 
        />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>إجمالي الإيرادات</CardTitle>
              <CardDescription>هذا الشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `${stats.totalRevenue} ج.م` : "جارٍ التحميل..."}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className={`inline-flex items-center ${stats?.revenueChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stats ? `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%` : ""}
                </span>{" "}
                مقارنة بالشهر السابق
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>معدل التحويل</CardTitle>
              <CardDescription>مستخدمين مجاني → مدفوع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `${stats.conversionRate}%` : "جارٍ التحميل..."}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className={`inline-flex items-center ${stats?.conversionChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stats ? `${stats.conversionChange >= 0 ? "+" : ""}${stats.conversionChange}%` : ""}
                </span>{" "}
                مقارنة بالشهر السابق
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>معدل الاحتفاظ</CardTitle>
              <CardDescription>تجديد الاشتراكات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `${stats.retentionRate}%` : "جارٍ التحميل..."}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <span className={`inline-flex items-center ${stats?.retentionChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stats ? `${stats.retentionChange >= 0 ? "+" : ""}${stats.retentionChange}%` : ""}
                </span>{" "}
                مقارنة بالشهر السابق
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الاشتراكات</CardTitle>
            <CardDescription>
              مقارنة بين الخطط الشهرية والسنوية
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <SubscriptionChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>مؤشرات الإيرادات</CardTitle>
            <CardDescription>تحليل أداء الإيرادات عبر الزمن</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueMetrics />
          </CardContent>
        </Card>

        <Tabs 
          defaultValue="plans" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">خطط الاشتراك</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
            <TabsTrigger value="refunds">طلبات الاسترداد</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-4">
            <SubscriptionPlansTable />
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-4">
            <PaymentsTable />
          </TabsContent>
          
          <TabsContent value="refunds" className="space-y-4">
            <RefundsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
