import { useState, useEffect } from "react";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ProfileData } from "@/lib/types";
import api from "../../utils/api";

// المكونات الفرعية
import { ReferralIntro } from "@/components/referral/ReferralIntro";
import { ReferralStats } from "@/components/referral/ReferralStats";
import { ReferralCodeSection } from "@/components/referral/ReferralCodeSection";
import { EmailInviteForm } from "@/components/referral/EmailInviteForm";
import { HowItWorks } from "@/components/referral/HowItWorks";
import { ReferralFAQ } from "@/components/referral/ReferralFAQ";

export default function Referral() {
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState<ProfileData | null>(null);
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(true);

  // جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await api.get("/user/profile");
        const data = response.data;
        setReferralData(data);

        const baseUrl = window.location.origin;
        setReferralLink(`${baseUrl}/signup?ref=${data.referralCode}`);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل بيانات الإحالة");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [navigate]);

  // نسخ رابط الإحالة
  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("تم نسخ رابط الإحالة بنجاح");
    }
  };

  // مشاركة رابط الإحالة
  const shareReferralLink = () => {
    if (!referralLink || !referralData) return;

    if (navigator.share) {
      navigator
        .share({
          title: "انضم إلى تطبيق GrowUp",
          text: `انضم إلي في تطبيق GrowUp مع شهر مجاني عند التسجيل! استخدم رمز الإحالة: ${referralData.referralCode}`,
          url: referralLink,
        })
        .catch(() => {
          toast.error("حدث خطأ أثناء مشاركة الرابط");
        });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        جاري تحميل البيانات...
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        تعذر تحميل بيانات المستخدم.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="نظام الإحالة" showBackButton />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* بطاقة نظام الإحالة الرئيسية */}
          <Card className="mb-6 shadow-md border-0 overflow-hidden">
            <ReferralIntro />

            <CardContent className="pt-6">
              <div className="grid gap-6">
                {/* إحصائيات الإحالة */}
                <ReferralStats referralData={referralData} />

                {/* قسم رمز الإحالة ورابط المشاركة */}
                <ReferralCodeSection
                  referralData={referralData}
                  referralLink={referralLink}
                  copyReferralLink={copyReferralLink}
                  shareReferralLink={shareReferralLink}
                />

                {/* فاصل */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-gray-500">أو</span>
                  </div>
                </div>

                {/* نموذج دعوة عبر البريد الإلكتروني */}
                <EmailInviteForm />
              </div>
            </CardContent>
          </Card>

          {/* قسم كيفية عمل برنامج الإحالة */}
          <HowItWorks />

          {/* قسم الأسئلة الشائعة */}
          <ReferralFAQ />
        </div>
      </div>
    </div>
  );
}
