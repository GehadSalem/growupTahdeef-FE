import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<{
    type: string;
    message: string;
  } | null>(null);

  // تحقق من وجود مستخدم مسجل الدخول عند تحميل المكون
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      const user: UserData = JSON.parse(userData);
      redirectBasedOnRole(user.role);
    }
  }, [navigate]);

  // دالة مساعدة للتوجيه بناءً على الصلاحية
  const redirectBasedOnRole = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard-app');
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch(`http://localhost:3000/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("فشل المصادقة مع الخادم");
      }

      const { user: userData, token } = await response.json();
      
      // تخزين بيانات المستخدم والرمز
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في GrowUp!",
      });

      // التوجيه بناءً على صلاحية المستخدم
      redirectBasedOnRole(userData.role);
    } catch (error) {
      console.error("خطأ في تسجيل الدخول عبر Google:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (!email || !password || (!isLogin && !name)) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال جميع الحقول المطلوبة",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin ? { email, password } : { email, password, name };

      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        handleAuthErrors(errorData);
        throw new Error(errorData.message || "فشل عملية المصادقة");
      }

      const { user: userData, token } = await response.json();
      
      // تخزين بيانات المستخدم والرمز
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: isLogin ? "تم تسجيل الدخول بنجاح" : "تم إنشاء الحساب بنجاح",
        description: isLogin ? "مرحباً بك مجدداً!" : "مرحباً بك في GrowUp!",
      });

      // التوجيه بناءً على صلاحية المستخدم
      redirectBasedOnRole(userData.role);
    } catch (error) {
      console.error("خطأ في المصادقة:", error);
      if (!authError) {
        toast({
          title: "خطأ",
          description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // دالة مساعدة لمعالجة أخطاء المصادقة
  const handleAuthErrors = (errorData: any) => {
    if (errorData.errorType === "user_not_found") {
      setAuthError({
        type: "user_not_found",
        message: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني. هل ترغب في إنشاء حساب جديد؟",
      });
    } else if (errorData.errorType === "invalid_password") {
      setAuthError({
        type: "invalid_password",
        message: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
      });
    } else if (errorData.errorType === "email_exists") {
      setAuthError({
        type: "email_exists",
        message: "البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.",
      });
    } else {
      setAuthError({
        type: "general_error",
        message: errorData.message || "حدث خطأ أثناء محاولة تسجيل الدخول",
      });
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError(null);
  };

  return (
    <div className="min-h-screen w-full bg-growup-light">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-lg">
          <Logo size="lg" className="mx-auto mb-8" />

          <div className="bg-white rounded-xl shadow-md p-8 w-full">
            <h1 className="text-2xl font-bold font-cairo mb-6 text-center">
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </h1>

            <Button
              type="button"
              variant="outline"
              className="w-full mb-4 gap-2"
              onClick={signInWithGoogle}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLogin ? "تسجيل الدخول باستخدام Google" : "التسجيل باستخدام Google"}
            </Button>

            <div className="relative my-6">
              <hr className="border-gray-300" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-gray-500 font-cairo">
                أو
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authError && (
                <div className={`p-3 rounded-md ${
                  authError.type === "user_not_found" ? "bg-blue-50 text-blue-800" : 
                  authError.type === "email_exists" ? "bg-yellow-50 text-yellow-800" : 
                  "bg-red-50 text-red-800"
                } font-cairo text-sm`}>
                  {authError.message}
                  {authError.type === "user_not_found" && (
                    <div className="text-center mt-2">
                      <button
                        onClick={toggleAuthMode}
                        className="text-growup hover:underline font-cairo"
                        disabled={isLoading}
                      >
                        إنشاء حساب جديد
                      </button>
                    </div>
                  )}
                  {authError.type === "email_exists" && (
                    <div className="text-center mt-2">
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-growup hover:underline font-cairo"
                        disabled={isLoading}
                      >
                        تسجيل الدخول
                      </button>
                    </div>
                  )}
                  {authError.type === "invalid_password" && (
                    <div className="text-left mt-2">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-growup hover:underline font-cairo"
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-right block font-cairo">
                    الاسم
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    dir="rtl"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-right block font-cairo">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-right"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-right block font-cairo">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              {isLogin && (
                <div className="text-left">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-growup hover:underline font-cairo"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-growup hover:bg-growup-dark text-white h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -mr-1 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="mr-2">جاري التحميل...</span>
                  </span>
                ) : isLogin ? (
                  "تسجيل الدخول"
                ) : (
                  "إنشاء الحساب"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={toggleAuthMode}
              className="text-growup hover:underline font-cairo"
              disabled={isLoading}
            >
              {isLogin ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل الدخول"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}