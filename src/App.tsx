import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './context/pages/Home';
import Login from './context/pages/Login';
import Register from './context/pages/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import MyAudi from './context/pages/MyAudi';
import AdminDashboard from './context/pages/admin/Dashboard';
import UserManagement from './context/pages/admin/UserManagement';
import ProductManagement from './context/pages/admin/ProductManagement';
import { useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';
import OrderManagement from './context/pages/admin/OrderManagement';
import { ConfigProvider } from 'antd';
import { NotificationProvider } from './context/NotificationContext';
import ProductDetail from './components/sections/ProductDetail';

import ModelsPage from './context/pages/models/Models';
import ForgotPassword from './context/pages/ForgotPassword';
import { ThemeProvider } from './context/ThemeContext';
import LoadingAnimation from './components/common/LoadingAnimation';
import AdminLayout from './context/pages/admin/AdminLayout';
import MarketingManagement from './context/pages/admin/MarketingManagement';
import Profile from './context/pages/admin/Profile';
import BlogManagement from './context/pages/admin/BlogManagement';
import BlogList from './context/pages/Blog/BlogList';
import BlogDetail from './context/pages/Blog/BlogDetail';
import ChangePassword from './context/pages/ChangePassword';
import DealershipPage from './context/pages/Dealership/index';
import VehicleConfigurator from './context/pages/VehicleConfigurator';
import QuotationDetail from './context/pages/QuotationDetail';
import OrderForm from './context/pages/OrderForm';
import PaymentSuccess from './context/pages/PaymentSuccess';
import PaymentCancel from './context/pages/PaymentCancel';


import UserOrderManagement from './context/pages/admin/UserOrderManagement';
import MyOrders from './context/pages/MyOrders';
import MyAccount from './context/pages/MyAccount';
import ErrorBoundary from './components/common/ErrorBoundary';
import DealershipManagement from './context/pages/admin/DealershipManagement';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isValidating } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownIntro, setHasShownIntro] = useState(false);
  
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const adminRoutes = [
    '/admin', 
    '/admin/dashboard', 
    '/admin/users', 
    '/admin/products',
    '/admin/orders',
    '/admin/dealers',
    '/admin/inventory',
    '/admin/marketing',
    '/admin/blog',
    '/admin/support',
    '/admin/settings'
  ];
  
  const shouldShowHeader = !authRoutes.includes(location.pathname) && !adminRoutes.includes(location.pathname);
  const shouldShowFooter = !authRoutes.includes(location.pathname) && !adminRoutes.includes(location.pathname);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Redirect to admin dashboard if user is admin
  useEffect(() => {
    console.log('Current Auth State:', { isAuthenticated, userRole: user?.role, currentPath: location.pathname });
    
    // Kiểm tra không phân biệt chữ hoa/thường
    if (isAuthenticated && user?.role && user.role.toUpperCase() === 'QUAN_TRI' && location.pathname === '/') {
      console.log('Redirecting admin to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  const handleAnimationComplete = () => {
    setIsLoading(false);
    setHasShownIntro(true);
  };

  // Kiểm tra xem có phải là lần đầu load trang hay không
  const isFirstLoad = !sessionStorage.getItem('hasLoadedBefore');
  const isFromLogin = sessionStorage.getItem('fromLogin') === 'true';
  const skipIntro = sessionStorage.getItem('skipIntro') === 'true';
  
  // Show loading when validating token
  if (isValidating) {
    return <LoadingAnimation onAnimationComplete={() => {}} />;
  }

  // Chỉ hiện animation khi:
  // 1. Đang ở trang chủ (/)
  // 2. Không phải admin route
  // 3. Là lần đầu load (F5 hoặc mở tab mới)
  // 4. Chưa hiển thị intro trong session này
  // 5. Không có flag bỏ qua
  if (isLoading && 
      location.pathname === "/" && 
      !isAdminRoute && 
      isFirstLoad && 
      !hasShownIntro && 
      !isFromLogin && 
      !skipIntro) {
    return <LoadingAnimation onAnimationComplete={handleAnimationComplete} />;
  }

  // Đánh dấu đã load lần đầu
  if (isFirstLoad) {
    sessionStorage.setItem('hasLoadedBefore', 'true');
  }

  // Xóa các flag khi đã load xong
  if (isFromLogin || skipIntro) {
    sessionStorage.removeItem('fromLogin');
    sessionStorage.removeItem('skipIntro');
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
        },
      }}
    >
      <ThemeProvider>
        <NotificationProvider>
          <div className="app-container">
            {shouldShowHeader && <Header />}
            <main className={`main-content ${!shouldShowHeader ? 'auth-page' : ''}`}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/myaudi" element={
                  <ProtectedRoute>
                    <MyAudi />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <AdminDashboard />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                {/* Thêm route quản lý người dùng */}
                <Route path="/admin/users" element={
                   <ThemeProvider>
                     <AdminLayout>
                       <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                         <UserManagement />
                       </RoleBasedRoute>
                     </AdminLayout>
                   </ThemeProvider>
                } />

                {/* Thêm route quản lý sản phẩm */}
                <Route path="/admin/products" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <ProductManagement />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                {/* Thêm các route khác */}
                <Route path="/admin/orders" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                          <OrderManagement />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/dealers" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <DealershipManagement />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/inventory" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <div className="admin-placeholder">
                          <h2>Trang quản lý tồn kho đang phát triển</h2>
                        </div>
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/marketing" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <MarketingManagement />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/blog" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <BlogManagement />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/support" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <div className="admin-placeholder">
                          <h2>Trang quản lý hỗ trợ đang phát triển</h2>
                        </div>
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/settings" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <div className="admin-placeholder">
                          <h2>Trang cài đặt hệ thống đang phát triển</h2>
                        </div>
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/profile" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <Profile />
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                {/* Default redirect to admin dashboard for admin users */}
                <Route path="/admin" element={
                  <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                } />

                <Route path="/product/:id" element={<ProductDetail />} />
               
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                } />
                <Route path="/dealership" element={<DealershipPage />} />
                <Route path="/dealership/:id" element={<DealershipPage />} />
                <Route path="/configure/:id" element={<VehicleConfigurator />} />
                <Route path="/quotation/:configId" element={<QuotationDetail />} />
                <Route path="/order/:configId" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <OrderForm />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <UserOrderManagement />
                  </ProtectedRoute>
                } />
                <Route path="/myaudi/orders" element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                } />
                <Route path="/myaudi/account" element={
                  <ProtectedRoute>
                    <MyAccount />
                  </ProtectedRoute>
                } />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
              </Routes>
            </main>
            {shouldShowFooter && <Footer />}
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;