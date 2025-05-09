import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi, RegisterForm } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/Auth.css';
import logo from '../assets/logo.svg';
// Import video for background
import backgroundVideo from '../assets/videoaudi.mp4';
// Import message từ antd
import { message as antdMessage } from 'antd';

// Import Firebase authentication functions
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithGithub 
} from '../services/firebaseService';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Việt Nam'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setFirebaseUser } = useAuth();
  const { setPendingMessage } = useNotification();

  // Khởi tạo message config khi component mount
  useEffect(() => {
    antdMessage.config({
      top: 100,
      duration: 3,
      maxCount: 3,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      antdMessage.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      antdMessage.error('Số điện thoại không hợp lệ');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await registerApi(formData);
      
      if (response.success) {
        // Hiển thị thông báo ngay tại trang hiện tại
        antdMessage.success('Đăng ký thành công!');
        
        // Chuyển hướng với tham số trên URL thay vì sử dụng context
        setTimeout(() => {
          navigate('/login?registerSuccess=true');
        }, 1500);
      } else {
        setError(response.message);
        antdMessage.error(response.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
      console.error(err);
      antdMessage.error('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: string) => {
    setLoading(true);
    setError('');
    
    try {
      let userCredential;
      
      switch (provider) {
        case 'google':
          userCredential = await signInWithGoogle();
          break;
        case 'facebook':
          userCredential = await signInWithFacebook();
          break;
        case 'github':
          userCredential = await signInWithGithub();
          break;
        default:
          throw new Error('Phương thức đăng ký không được hỗ trợ');
      }
      
      if (userCredential && userCredential.user) {
        setFirebaseUser(userCredential.user);
        
        // Create a success message for social login
        const successMessage = `Đăng nhập thành công với ${provider}!`;
        
        // Show immediate notification
        antdMessage.success(successMessage);
        
        // Store the message in localStorage to be displayed on home page
        localStorage.setItem('loginSuccessMessage', successMessage);
        
        // Delay navigation to ensure the notification is seen
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error: any) {
      setError(`Không thể đăng ký với ${provider}. Vui lòng thử lại sau.`);
      antdMessage.error(`Đăng ký với ${provider} thất bại: ${error.message || 'Đã xảy ra lỗi'}`);
    } finally {
      setLoading(false);
    }
  };

  // Danh sách các tỉnh thành phố Việt Nam
  const vietnamProvinces = [
    "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "An Giang",
    "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre",
    "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng",
    "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai",
    "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng",
    "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình",
    "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi",
    "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình",
    "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh",
    "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  return (
    <div className="auth-container">
      {/* Left video section */}
      <div className="auth-video-background">
        <video autoPlay muted loop>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="auth-video-overlay">
          <div className="auth-video-content">
            <h1>Tham gia cùng Audi</h1>
            <p>
              Trở thành thành viên của cộng đồng Audi để nhận những ưu đãi độc quyền,
              cập nhật mới nhất về sản phẩm và dịch vụ cao cấp dành riêng cho bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Form section - more compact layout */}
      <div className="auth-form-section">
        <div className="auth-logo">
          <img src={logo} alt="Audi Logo" />
        </div>
        <div className="auth-form-container">
          <h2>Đăng Ký Tài Khoản</h2>
          <p>Tạo tài khoản để khám phá thế giới Audi</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Personal Info - combined in one row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lastName">Họ</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Họ" />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">Tên</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Tên" />
              </div>
            </div>
            
            {/* Contact Info - combined in one row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Số điện thoại" pattern="[0-9]{10,15}" />
              </div>
            </div>
            
            {/* Address */}
            <div className="form-group">
              <label htmlFor="address">Địa chỉ</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" />
            </div>
            
            {/* City and Province */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Thành phố</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Thành phố" />
              </div>
              <div className="form-group">
                <label htmlFor="province">Tỉnh</label>
                <select id="province" name="province" value={formData.province} onChange={handleChange}>
                  <option value="">Chọn tỉnh/thành phố</option>
                  {vietnamProvinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Postal Code and Country */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Mã bưu điện</label>
                <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Mã bưu điện" />
              </div>
              <div className="form-group">
                <label htmlFor="country">Quốc gia</label>
                <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} placeholder="Quốc gia" />
              </div>
            </div>
            
            {/* Password and Confirm */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Mật khẩu" minLength={6} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={handleChange} required placeholder="Xác nhận mật khẩu" />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
              </button>
            </div>
            
            <div className="social-login">
              <p>Hoặc đăng ký với</p>
              <div className="social-buttons">
                <button type="button" className="social-button google" onClick={() => handleSocialRegister('google')} disabled={loading}>
                  <i className="fab fa-google"></i>
                  <span>Đăng ký với Google</span>
                </button>
                <button type="button" className="social-button facebook" onClick={() => handleSocialRegister('facebook')} disabled={loading}>
                  <i className="fab fa-facebook-f"></i>
                  <span>Đăng ký với Facebook</span>
                </button>
                <button type="button" className="social-button github" onClick={() => handleSocialRegister('github')} disabled={loading}>
                  <i className="fab fa-github"></i>
                  <span>Đăng ký với GitHub</span>
                </button>
              </div>
            </div>
            
            <div className="auth-links">
              <Link to="/login">Đã có tài khoản? Đăng nhập ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;