import { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { adminRoutes } from './admin-routes';
import { Loading } from '@/components/shared/Loading';

// ======================
// Import Pages
// ======================
// Core pages (eager-loaded)
import OnboardingScreen from '@/pages/OnboardingScreen';
import Login from '@/pages/Login';
import Menu from '@/pages/Menu';
import NotFound from '@/pages/NotFound';
import Subscription from '@/pages/Subscription';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import Referral from '@/pages/Referral';
import Logout from '@/pages/Logout';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Contact from '@/pages/Contact';

// Legal pages
import LegalMenu from '@/pages/legal/LegalMenu';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import RefundPolicy from '@/pages/legal/RefundPolicy';

// Lazy-loaded pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const SelfDevelopment = lazy(() => import('@/pages/SelfDevelopment'));
const BreakHabits = lazy(() => import('@/pages/BreakHabits'));
const FinancialPlanning = lazy(() => import('@/pages/FinancialPlanning'));
const MajorGoals = lazy(() => import('@/pages/MajorGoals'));

// ======================
// Protected Route Wrapper
// ======================
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin'; // Optional role-based access
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  
  // No token → Redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Role-based access control
  // (Assumes you store user roles in localStorage/JWT)
  const userRole = localStorage.getItem('userRole'); // Replace with your role check logic
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/not-authorized" replace />; // Or a 403 page
  }

  return <>{children}</>;
};

// ======================
// Layout Wrapper (with Sidebar)
// ======================
const withSidebar = (Component: React.ComponentType) => (
  <>
    <AppSidebar />
    <div className="flex-1">
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </div>
  </>
);

// ======================
// Route Definitions
// ======================
export const appRoutes: RouteObject[] = [
  // —— PUBLIC ROUTES (No token required) ——
  { path: '/', element: <OnboardingScreen /> },
  { 
    path: '/login', 
    element: localStorage.getItem('token') ? (
      <Navigate to="/dashboard-app" replace />
    ) : (
      <Login />
    ),
  },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/legal', element: <LegalMenu /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/terms-of-service', element: <TermsOfService /> },
  { path: '/refund-policy', element: <RefundPolicy /> },
  { path: '/contact', element: <Contact /> },

  // —— PROTECTED ROUTES (Token required) ——
  { 
    path: '/dashboard-app', 
    element: (
      <ProtectedRoute>
        {withSidebar(Dashboard)}
      </ProtectedRoute>
    ),
  },
  { 
    path: '/self-development', 
    element: (
      <ProtectedRoute>
        {withSidebar(SelfDevelopment)}
      </ProtectedRoute>
    ),
  },
  { 
    path: '/break-habits', 
    element: (
      <ProtectedRoute>
        {withSidebar(BreakHabits)}
      </ProtectedRoute>
    ),
  },
  { 
    path: '/financial-planning', 
    element: (
      <ProtectedRoute>
        {withSidebar(FinancialPlanning)}
      </ProtectedRoute>
    ),
  },
  { 
    path: '/major-goals', 
    element: (
      <ProtectedRoute>
        {withSidebar(MajorGoals)}
      </ProtectedRoute>
    ),
  },
  { 
    path: '/subscription', 
    element: (
      <ProtectedRoute>
        <Subscription />
      </ProtectedRoute>
    ),
  },
  { 
    path: '/profile', 
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  { 
    path: '/notifications', 
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  { 
    path: '/referral', 
    element: (
      <ProtectedRoute>
        <Referral />
      </ProtectedRoute>
    ),
  },
  { path: '/logout', element: <Logout /> },

  // —— ADMIN ROUTES (Token + Admin role required) ——
  ...adminRoutes.map(route => ({
    ...route,
    element: (
      <ProtectedRoute requiredRole="admin">
        {route.element}
      </ProtectedRoute>
    ),
  })),

  // —— 404 FALLBACK ——
  { path: '*', element: <NotFound /> },
];