import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { ProtectedRoute } from '@/components/router/ProtectedRoute';
import { RoleGuard } from '@/components/router/RoleGuard';
import { CartDrawer } from '@/components/organisms/CartDrawer/CartDrawer';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));

const MenuPage = lazy(() => import('@/pages/MenuPage').then(m => ({ default: m.MenuPage })));

const OrdersPage = lazy(() => import('@/pages/OrdersPage'));

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

const InventoryPage = lazy(() => import('@/pages/InventoryPage'));

const AdminWorkshopsPage = lazy(() => import('@/pages/AdminWorkshopsPage'));
const WorkshopsPublicPage = lazy(() => import('@/pages/WorkshopsPublicPage'));

const EmployeesPage = lazy(() => import('@/pages/EmployeesPage'));
const TablesPage = lazy(() => import('@/pages/TablesPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gradient-mesh" />
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartDrawer />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Redirige la raíz a la carta pública */}
            <Route path="/" element={<Navigate to="/menu" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Carta y talleres públicos */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/workshops-public" element={<WorkshopsPublicPage />} />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['EMPLOYEE', 'ADMIN']}>
                    <OrdersPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <DashboardPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['EMPLOYEE', 'ADMIN']}>
                    <InventoryPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workshops"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminWorkshopsPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <EmployeesPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']}>
                    <ProductsPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <TablesPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AnalyticsPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 252, 248, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            color: '#3D2C2C',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}