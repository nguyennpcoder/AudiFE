import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isValidating, login } = useAuth();
  const [restoring, setRestoring] = useState<boolean>(false);

  // Tự khôi phục phiên từ localStorage cho flow đăng nhập local (không Firebase)
  useEffect(() => {
    const maybeRestoreSession = async () => {
      if (!isAuthenticated && !isValidating) {
        const storedUserStr = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const authMode = localStorage.getItem('authMode');
        if (storedUserStr && storedToken && authMode === 'local') {
          try {
            setRestoring(true);
            const storedUser = JSON.parse(storedUserStr);
            if (storedUser && !storedUser.token) {
              storedUser.token = storedToken;
            }
            login(storedUser);
            // Đợi state cập nhật
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (e) {
            // Nếu lỗi parse, xóa dữ liệu hỏng để tránh vòng lặp
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          } finally {
            setRestoring(false);
          }
        }
      }
    };
    maybeRestoreSession();
  }, [isAuthenticated, isValidating, login]);

  // Chờ App khởi tạo trạng thái đăng nhập (khôi phục từ localStorage/Firebase)
  if (isValidating || restoring) {
    return (
      <div className="auth-loading">
        <i className="fas fa-circle-notch"></i> Đang tải...
      </div>
    );
  }

  // Chỉ redirect khi chắc chắn đã kiểm tra xong và không đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;