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
import DealershipPage from './context/pages/Dealership';
import ModelsPage from './context/pages/models/Models';
import ForgotPassword from './context/pages/ForgotPassword';
import { ThemeProvider } from './context/ThemeContext';
import LoadingAnimation from './components/common/LoadingAnimation';
import AdminLayout from './context/pages/admin/AdminLayout';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
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
  };

  // Chỉ hiện animation khi KHÔNG phải admin
  if (isLoading && location.pathname === "/" && !isAdminRoute) {
    return <LoadingAnimation onAnimationComplete={handleAnimationComplete} />;
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
                        <div className="admin-placeholder">
                          <h2>Trang quản lý đại lý đang phát triển</h2>
                        </div>
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
                        <div className="admin-placeholder">
                          <h2>Trang quản lý marketing đang phát triển</h2>
                        </div>
                      </RoleBasedRoute>
                    </AdminLayout>
                  </ThemeProvider>
                } />

                <Route path="/admin/blog" element={
                  <ThemeProvider>
                    <AdminLayout>
                      <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                        <div className="admin-placeholder">
                          <h2>Trang quản lý bài viết đang phát triển</h2>
                        </div>
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

                {/* Default redirect to admin dashboard for admin users */}
                <Route path="/admin" element={
                  <RoleBasedRoute allowedRoles={['QUAN_TRI']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                } />

                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/dealership" element={<DealershipPage />} />
                <Route path="/dealership/:id" element={<DealershipPage />} />
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
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