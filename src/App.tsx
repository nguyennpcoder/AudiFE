import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import MyAudi from './pages/MyAudi';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import OrderManagement from './pages/admin/OrderManagement';
import { ConfigProvider } from 'antd';
import { NotificationProvider } from './context/NotificationContext';
import ProductDetail from './components/sections/ProductDetail';
import DealershipPage from './pages/Dealership';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
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

  // Redirect to admin dashboard if user is admin
  useEffect(() => {
    console.log('Current Auth State:', { isAuthenticated, userRole: user?.role, currentPath: location.pathname });
    
    // Kiểm tra không phân biệt chữ hoa/thường
    if (isAuthenticated && user?.role && user.role.toUpperCase() === 'QUAN_TRI' && location.pathname === '/') {
      console.log('Redirecting admin to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
        },
      }}
    >
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
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } />

              {/* Thêm route quản lý người dùng */}
              <Route path="/admin/users" element={
                 <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                 <UserManagement />
               </RoleBasedRoute>
              } />

              {/* Thêm route quản lý sản phẩm */}
              <Route path="/admin/products" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <ProductManagement />
                </RoleBasedRoute>
              } />

              {/* Thêm các route khác */}
              <Route path="/admin/orders" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                    <OrderManagement />
                </RoleBasedRoute>
              } />

              <Route path="/admin/dealers" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <div className="admin-placeholder">
                    <h2>Trang quản lý đại lý đang phát triển</h2>
                  </div>
                </RoleBasedRoute>
              } />

              <Route path="/admin/inventory" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <div className="admin-placeholder">
                    <h2>Trang quản lý tồn kho đang phát triển</h2>
                  </div>
                </RoleBasedRoute>
              } />

              <Route path="/admin/marketing" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <div className="admin-placeholder">
                    <h2>Trang quản lý marketing đang phát triển</h2>
                  </div>
                </RoleBasedRoute>
              } />

              <Route path="/admin/blog" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <div className="admin-placeholder">
                    <h2>Trang quản lý bài viết đang phát triển</h2>
                  </div>
                </RoleBasedRoute>
              } />

              <Route path="/admin/support" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <div className="admin-placeholder">
                    <h2>Trang quản lý hỗ trợ đang phát triển</h2>
                  </div>
                </RoleBasedRoute>
              } />

              <Route path="/admin/settings" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <div className="admin-placeholder">
                    <h2>Trang cài đặt hệ thống đang phát triển</h2>
                  </div>
                </RoleBasedRoute>
              } />

              {/* Default redirect to admin dashboard for admin users */}
              <Route path="/admin" element={
                <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } />

              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/dealership" element={<DealershipPage />} />
              <Route path="/dealership/:id" element={<DealershipPage />} />
            </Routes>
          </main>
          {shouldShowFooter && <Footer />}
        </div>
      </NotificationProvider>
    </ConfigProvider>
  );
}

export default App;