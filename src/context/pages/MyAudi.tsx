import React from 'react';
import { useAuth } from '../AuthContext';
import '../../styles/MyAudi.css';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useNotification } from '../NotificationContext';

const MyAudi: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // Check for change password success message when component mounts (giống như Home)
  useEffect(() => {
    const changePasswordSuccessMessage = localStorage.getItem('changePasswordSuccessMessage');
    if (changePasswordSuccessMessage) {
      // Use the same notification system as login to display the message
      showNotification('success', changePasswordSuccessMessage);
      // Remove the message from localStorage
      localStorage.removeItem('changePasswordSuccessMessage');
    }
  }, [showNotification]);

  return (
    <div className="myaudi-container">
      <div className="myaudi-header">
        <h1>myAudi</h1>
        <p>Chào mừng bạn quay trở lại, {user?.fullName}</p>
      </div>
      
      <div className="myaudi-cards">
        <div className="myaudi-card">
          <div className="card-icon">
            <i className="fas fa-user"></i>
          </div>
          <h3>Thông tin cá nhân</h3>
          <p>Quản lý thông tin cá nhân</p>
          <Link to="/myaudi/profile" className="card-button">
            Xem thông tin
          </Link>
        </div>
        
        <div className="myaudi-card">
          <div className="card-icon">
            <i className="fas fa-key"></i>
          </div>
          <h3>Đổi mật khẩu</h3>
          <p>Thay đổi mật khẩu tài khoản</p>
          <Link to="/change-password" className="card-button">
            Đổi mật khẩu
          </Link>
        </div>
        
        <div className="myaudi-card">
          <div className="card-icon">
            <i className="fa fa-car"></i>
          </div>
          <h3>Xe của tôi</h3>
          <p>Quản lý xe Audi của bạn</p>
          <a href="/myaudi/cars">Xem danh sách</a>
        </div>
        
        <div className="myaudi-card">
          <div className="card-icon">
            <i className="fa fa-calendar"></i>
          </div>
          <h3>Lịch lái thử</h3>
          <p>Đặt lịch lái thử xe mới</p>
          <a href="/myaudi/testdrives">Đặt lịch</a>
        </div>
        
        <div className="myaudi-card">
          <div className="card-icon">
            <i className="fa fa-heart"></i>
          </div>
          <h3>Xe yêu thích</h3>
          <p>Xem danh sách xe đã lưu</p>
          <a href="/myaudi/favorites">Xem danh sách</a>
        </div>
      </div>
    </div>
  );
};

export default MyAudi;