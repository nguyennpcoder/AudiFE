import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/MyAudi.css';

const MyAudi: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="myaudi-container">
      <div className="myaudi-header">
        <h1>myAudi</h1>
        <p>Chào mừng bạn quay trở lại, {user?.fullName}</p>
      </div>
      
      <div className="myaudi-cards">
        <div className="myaudi-card">
          <div className="card-icon">
            <i className="fa fa-user"></i>
          </div>
          <h3>Thông tin cá nhân</h3>
          <p>Quản lý thông tin cá nhân</p>
          <a href="/myaudi/profile">Xem thông tin</a>
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