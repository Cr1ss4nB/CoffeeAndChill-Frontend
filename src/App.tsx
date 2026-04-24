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

const MenuPage = lazy(() => import('@/pages/MenuPage').then(m => ({ default: m.MenuPage })));

const OrdersPage = lazy(() => import('@/pages/OrdersPage'));

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const WorkshopsPage = lazy(() => import('@/pages/WorkshopsPage'));

const EmployeesPage = lazy(() => import('@/pages/EmployeesPage'));
const QRManagementPage = lazy(() => import('@/pages/QRManagementPage'));
const TablesPage = lazy(() => import('@/pages/TablesPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const IngredientsPage = lazy(() => import('@/pages/IngredientsPage'));

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
            {/* Redirige la raíz a login en lugar de /404 */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/403" element={<Navigate to="/menu" replace />} />

            {/* Carta pública: accesible sin autenticación */}
            <Route path="/menu" element={<MenuPage />} />

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
                  <WorkshopsPage />
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
              path="/ingredients"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']}>
                    <IngredientsPage />
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
              path="/qr"
              element={
                <ProtectedRoute>
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <QRManagementPage />
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