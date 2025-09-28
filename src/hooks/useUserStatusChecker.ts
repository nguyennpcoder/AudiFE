import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const useUserStatusChecker = () => {
  const { user, logout } = useAuth();

  const checkUserStatus = useCallback(async () => {
    if (!user || !user.token) return;

    try {
      // Gọi API để kiểm tra trạng thái người dùng
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1'}/nguoi-dung/profile`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      // Kiểm tra nếu tài khoản bị khóa (trangThai = false)
      if (response.data.trangThai === false) {
        // Nếu tài khoản bị khóa, tự động đăng xuất người dùng
        logout();
        // Hiển thị thông báo
        alert('Tài khoản của bạn đã bị quản trị viên khóa. Bạn sẽ được đăng xuất.');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // Nếu có lỗi xác thực (401), có thể người dùng đã bị khóa
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      }
    }
  }, [user, logout]);

  useEffect(() => {
    // Chỉ thực hiện kiểm tra nếu có người dùng đang đăng nhập
    if (!user || !user.token) return;

    // Kiểm tra ngay khi component mount
    checkUserStatus();

    // Thiết lập interval để kiểm tra định kỳ mỗi 5 phút
    const interval = setInterval(checkUserStatus, 5 * 60 * 1000);

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [user, checkUserStatus]);
};

export default useUserStatusChecker;