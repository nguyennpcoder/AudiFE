import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { changePasswordApi } from '../../services/authService';
import '../../styles/Auth.css';

const ChangePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await changePasswordApi(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (response.success) {
        // Lưu thông báo thành công vào localStorage (giống như đăng nhập)
        localStorage.setItem('changePasswordSuccessMessage', 'Đổi mật khẩu thành công!');
        
        // Chuyển về trang MyAudi
        navigate('/myaudi');
      } else {
        setError(response.message);
        message.error(response.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>Đổi mật khẩu</h2>
          <p className="auth-subtitle">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
          
          <div className="auth-links">
            <button 
              type="button" 
              className="link-button"
              onClick={() => navigate('/myaudi')}
            >
              Quay lại trang cá nhân
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword; 