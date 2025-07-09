import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { quenMatKhauApi, resetMatKhauApi } from '../services/authService';
import '../styles/Auth.css';
import logo from '../assets/logo.svg';
import backgroundVideo from '../assets/audivideo.mp4';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'input' | 'reset'>('input');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (step === 'input') {
        // Gửi yêu cầu quên mật khẩu
        const response = await quenMatKhauApi(emailOrPhone, method);
        
        if (response.success) {
          message.success(response.message);
          setStep('reset');
        } else {
          setError(response.message);
          message.error(response.message);
        }
      } else if (step === 'reset') {
        // Kiểm tra mật khẩu xác nhận
        if (newPassword !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp!');
          message.error('Mật khẩu xác nhận không khớp!');
          return;
        }

        // Kiểm tra độ dài mật khẩu
        if (newPassword.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự!');
          message.error('Mật khẩu phải có ít nhất 6 ký tự!');
          return;
        }

        // Đặt lại mật khẩu
        const response = await resetMatKhauApi(resetToken, newPassword);
        
        if (response.success) {
          message.success(response.message);
          navigate('/login');
        } else {
          setError(response.message);
          message.error(response.message);
        }
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
      {/* Left video section */}
      <div className="auth-video-background auth-animate-right">
        <video autoPlay muted loop>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="auth-video-overlay">
          <div className="auth-video-content">
            <h1>Quên Mật Khẩu</h1>
            <p>
              Chúng tôi sẽ giúp bạn khôi phục tài khoản Audi của mình.
              Chọn phương thức phù hợp để nhận mã xác thực.
            </p>
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className="auth-form-section auth-animate-left">
        <div className="auth-logo">
          <img src={logo} alt="Audi Logo" />
        </div>
        <div className="auth-form-container">
          <h2>Quên Mật Khẩu</h2>
          
          {step === 'input' && (
            <>
              <p>Nhập email hoặc số điện thoại để nhận mã xác thực</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="emailOrPhone">Email hoặc Số điện thoại</label>
                  <input
                    type="text"
                    id="emailOrPhone"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    placeholder="Nhập email hoặc số điện thoại"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phương thức xác thực</label>
                  <div className="method-selection">
                    <label className="method-option">
                      <input
                        type="radio"
                        name="method"
                        value="email"
                        checked={method === 'email'}
                        onChange={(e) => setMethod(e.target.value as 'email' | 'sms')}
                      />
                      <span>Gửi mã qua Email</span>
                    </label>
                    <label className="method-option">
                      <input
                        type="radio"
                        name="method"
                        value="sms"
                        checked={method === 'sms'}
                        onChange={(e) => setMethod(e.target.value as 'email' | 'sms')}
                      />
                      <span>Gửi OTP qua SMS</span>
                    </label>
                  </div>
                </div>
                
                {error && <div className="auth-error">{error}</div>}
                
                <div className="form-actions">
                  <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'GỬI MÃ XÁC THỰC'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <p>Nhập mã xác thực đã được gửi đến {method === 'email' ? 'email' : 'SMS'} của bạn</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="resetToken">Mã xác thực</label>
                  <input
                    type="text"
                    id="resetToken"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    placeholder="Nhập mã xác thực"
                    maxLength={6}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">Mật khẩu mới</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    minLength={6}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    minLength={6}
                  />
                </div>
                
                {error && <div className="auth-error">{error}</div>}
                
                <div className="form-actions">
                  <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'ĐẶT LẠI MẬT KHẨU'}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="auth-links">
            <Link to="/login">Quay lại đăng nhập</Link>
            <Link to="/register">Chưa có tài khoản? Đăng ký ngay</Link>
          </div>

          <div className="back-home-container">
            <Link to="/" className="back-home-button">
              <i className="fas fa-home"></i> TRỞ VỀ TRANG CHỦ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;