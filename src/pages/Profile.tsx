"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

type Subscription = {
  isSubscribed: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: string | null;
};

type ProfileData = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  credits: number;
  referredBy: string | null;
  referralCode: string;
  subscription: Subscription;
};

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://your-api.com/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("فشل في جلب البيانات");

        const data = await res.json();
        setProfileData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "حدث خطأ ما");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!profileData) {
    return <div className="p-8 text-center text-gray-500">لا توجد بيانات للعرض.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">الملف الشخصي</h1>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>الاسم</Label>
              <p>{profileData.name}</p>
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <p>{profileData.email}</p>
            </div>
            <div>
              <Label>الدور</Label>
              <p>{profileData.role}</p>
            </div>
            <div>
              <Label>الرصيد</Label>
              <p>{profileData.credits} نقاط</p>
            </div>
            <div>
              <Label>الكود الخاص بك</Label>
              <p>{profileData.referralCode}</p>
            </div>
            {profileData.referredBy && (
              <div>
                <Label>تمت دعوتك بواسطة</Label>
                <p>{profileData.referredBy}</p>
              </div>
            )}
            <div>
              <Label>الاشتراك</Label>
              <div className="flex items-center gap-2">
                {profileData.subscription?.isSubscribed ? (
                  <>
                    <Badge className="bg-green-600 hover:bg-green-700">مشترك Premium</Badge>
                    <span className="text-sm text-muted-foreground">
                      ينتهي في:{" "}
                      {new Date(
                        profileData.subscription.stripeCurrentPeriodEnd!
                      ).toLocaleDateString("ar-EG")}
                    </span>
                  </>
                ) : (
                  <Badge className="bg-gray-500 hover:bg-gray-600">غير مشترك</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
