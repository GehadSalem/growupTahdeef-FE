import axios from 'axios';

// إنشاء نسخة مخصصة من axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

// interceptor للطلبات
api.interceptors.request.use(
  (config) => {
    // استخراج التوكن من localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // تنظيف التوكن إذا كان يحتوي على البادئة
      const cleanToken = token.startsWith('yoursecretkey__') 
        ? token.replace('yoursecretkey__', '') 
        : token;
      
      // إضافة التوكن إلى الهيدر
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor للردود
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة أخطاء المصادقة
    if (error.response?.status === 401) {
      // إعادة توجيه إلى صفحة تسجيل الدخول إذا كان الخطأ 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;