import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi, LoginForm } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/Auth.css';
// Import logo for Audi
import logo from '../assets/logo.svg';
// Import video for background
import backgroundVideo from '../assets/videoaudi.mp4';
// Replace antd message with our notification
import { message as antdMessage } from 'antd';
// Import Firebase authentication functions
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithGithub,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithCredential
} from '../services/firebaseService';
// Import linkWithCredential function
import { linkWithCredential } from 'firebase/auth';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<any>(null);
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login: authLogin, setFirebaseUser } = useAuth();
  const { pendingMessage, clearPendingMessage, showNotification } = useNotification();

  useEffect(() => {
    // Kiểm tra URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const registerSuccess = urlParams.get('registerSuccess');
    
    if (registerSuccess === 'true') {
      const successMsg = 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.';
      setSuccessMessage(successMsg);
      
      // Use the custom notification for bottom-right display
      showNotification('success', successMsg);
      
      // Xóa parameter khỏi URL để tránh hiển thị lại khi refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [showNotification]);

  useEffect(() => {
    // Thêm log để debug
    console.log("Pending message:", pendingMessage);
    
    if (pendingMessage) {
      // Sử dụng timeout để đảm bảo UI đã render
      setTimeout(() => {
        // Thêm type assertion để tránh lỗi TypeScript
        (antdMessage as any)[pendingMessage.type](pendingMessage.content);
        clearPendingMessage();
      }, 300);
    }
  }, [pendingMessage, clearPendingMessage]);

  useEffect(() => {
    const message = localStorage.getItem('registerSuccessMessage');
    if (message) {
      setSuccessMessage(message);
      antdMessage.success(message);
      localStorage.removeItem('registerSuccessMessage');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginApi(formData);
      console.log("Full login API response:", response);
      
      if (response.success) {
        // Ensure the role is exactly as expected
        console.log("Raw user role from API:", response.role);
        
        // Store the response with login function
        authLogin(response);
        
        // Create success message
        const successMessage = 'Đăng nhập thành công!';
        
        // Store the message in localStorage to be displayed after navigation
        localStorage.setItem('loginSuccessMessage', successMessage);
        console.log("Setting loginSuccessMessage in localStorage:", successMessage);
        
        // Ensure localStorage has been updated
        const currentUser = localStorage.getItem('user');
        console.log("User in localStorage after login:", currentUser);
        
        // Force a direct state check from the database
        if (response.role === 'quan_tri') {
          // For admin users, immediately navigate to dashboard
          console.log("Admin user detected, navigating to dashboard");
          navigate('/admin/dashboard', { replace: true });
        } else {
          // For regular users, navigate to home
          console.log("Regular user detected, navigating to home");
          navigate('/', { replace: true });
        }
      } else {
        // Thay đổi ở đây: Hiển thị thông báo lỗi thân thiện hơn
        const errorMessage = 'Đăng nhập thất bại, hãy kiểm tra lại thông tin email hoặc mật khẩu';
        setError(errorMessage);
        // Show error notification
        antdMessage.error(errorMessage);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
      console.error(err);
      // Show error notification
      antdMessage.error('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError('');
    
    try {
      let userCredential;
      
      // If we have a pending credential and the user selected one of the linked providers
      if (pendingCredential && linkedProviders.includes(provider)) {
        // Sign in with the correct provider first
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
            throw new Error('Phương thức đăng nhập không được hỗ trợ');
        }
        
        // Then link the pending credential
        if (userCredential && userCredential.user) {
          try {
            // Use the imported linkWithCredential function
            await linkWithCredential(userCredential.user, pendingCredential);
            console.log("Account linking success");
            
            // Reset the pending state
            setPendingCredential(null);
            setPendingEmail('');
            setLinkedProviders([]);
            
            // Proceed with login
            setFirebaseUser(userCredential.user);
            
            // Show success notification
            antdMessage.success('Tài khoản liên kết thành công!');
            
            // Save the success message to localStorage so it can be displayed after navigation
            localStorage.setItem('loginSuccessMessage', 'Tài khoản liên kết thành công!');
            
            // Delay để đảm bảo thông báo hiển thị trước khi chuyển trang
            setTimeout(() => {
              navigate('/');
            }, 1000);
            return;
          } catch (linkError) {
            console.error("Error linking accounts:", linkError);
            // Continue with normal login flow if linking fails
          }
        }
      } else {
        // Normal login flow
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
            throw new Error('Phương thức đăng nhập không được hỗ trợ');
        }
      }
      
      if (userCredential && userCredential.user) {
        console.log(`Đăng nhập thành công với ${provider}`, userCredential.user);
        
        // Set the firebase user
        setFirebaseUser(userCredential.user);
        
        // Show success notification
        antdMessage.success(`Đăng nhập thành công với ${provider}!`);
        
        // Save the success message to localStorage so it can be displayed after navigation
        localStorage.setItem('loginSuccessMessage', `Đăng nhập thành công với ${provider}!`);
        
        // Delay để đảm bảo thông báo hiển thị trước khi chuyển trang
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error: any) {
      console.error(`Lỗi đăng nhập với ${provider}:`, error);
      
      // Handle account-exists-with-different-credential error
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        const credential = error.customData?.credential;
        
        if (email && credential) {
          // Store the pending credential
          setPendingCredential(credential);
          setPendingEmail(email);
          
          try {
            // Find the providers for the email
            const methods = await fetchSignInMethodsForEmail(email);
            setLinkedProviders(methods.map(m => {
              if (m === 'google.com') return 'google';
              if (m === 'facebook.com') return 'facebook';
              if (m === 'github.com') return 'github';
              return m;
            }).filter(m => m === 'google' || m === 'facebook' || m === 'github'));
            
            if (methods && methods.length > 0) {
              // Guide the user about which provider to use
              if (methods.includes('google.com')) {
                setError(`Email ${email} đã được đăng ký với Google. Vui lòng sử dụng nút Google bên dưới để đăng nhập và liên kết tài khoản của bạn.`);
              } else if (methods.includes('github.com')) {
                setError(`Email ${email} đã được đăng ký với Github. Vui lòng sử dụng nút Github bên dưới để đăng nhập và liên kết tài khoản của bạn.`);
              } else if (methods.includes('facebook.com')) {
                setError(`Email ${email} đã được đăng ký với Facebook. Vui lòng sử dụng nút Facebook bên dưới để đăng nhập và liên kết tài khoản của bạn.`);
              } else if (methods.includes('password')) {
                setError(`Email ${email} đã được đăng ký với mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu.`);
              } else {
                setError(`Email ${email} đã được đăng ký với phương thức khác (${methods.join(', ')}). Vui lòng sử dụng phương thức đó để đăng nhập.`);
              }
            } else {
              setError(`Không thể đăng nhập với ${provider}. Vui lòng thử lại sau.`);
            }
          } catch (err) {
            console.error('Error getting sign in methods:', err);
            setError(`Không thể đăng nhập với ${provider}. Vui lòng thử lại sau.`);
          }
        } else {
          // More detailed error info
          setError(`Không thể truy xuất email từ tài khoản ${provider}. Hãy kiểm tra quyền riêng tư hoặc thử phương thức đăng nhập khác.`);
        }
      } else if (error.code === 'auth/invalid-credential') {
        setError(`Lỗi xác thực với ${provider}. Token không hợp lệ hoặc đã hết hạn. Vui lòng thử đăng xuất khỏi ${provider} và đăng nhập lại.`);
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Đăng nhập bị hủy. Vui lòng thử lại.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Đã có cửa sổ đăng nhập khác đang mở. Vui lòng đóng và thử lại.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Cửa sổ đăng nhập bị chặn. Vui lòng cho phép cửa sổ popup và thử lại.');
      } else {
        setError(`Không thể đăng nhập với ${provider}: ${error.message || 'Vui lòng thử lại sau.'}`);
      }
      
      // Show error notification
      antdMessage.error(error.message || `Đăng nhập thất bại! Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left video section */}
      <div className="auth-video-background">
        <video autoPlay muted loop>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="auth-video-overlay">
          <div className="auth-video-content">
            <h1>Chào mừng đến với Audi</h1>
            <p>
              Khám phá thế giới xe sang trọng, hiệu suất vượt trội và công nghệ tiên tiến.
              Đăng nhập để trải nghiệm đặc quyền dành riêng cho khách hàng Audi.
            </p>
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className="auth-form-section">
        <div className="auth-logo">
          <img src={logo} alt="Audi Logo" />
        </div>
        <div className="auth-form-container">
          <h2>Đăng Nhập</h2>
          <p>Vui lòng đăng nhập để trải nghiệm đầy đủ dịch vụ của Audi</p>
          
          {/* Thêm hiển thị thông báo từ trang đăng ký nếu có */}
          {successMessage && (
            <div className="auth-success">
              {successMessage}
            </div>
          )}
          
          {pendingEmail && (
            <div className="auth-message">
              <p>Đang liên kết tài khoản cho email: {pendingEmail}</p>
              <p>Vui lòng chọn cách đăng nhập đã được liệt kê để tiếp tục.</p>
            </div>
          )}
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Nhập email của bạn"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
              </button>
            </div>
            
            <div className="social-login">
              <p>Hoặc đăng nhập với</p>
              <div className="social-buttons">
                <button 
                  type="button" 
                  className="social-button google"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                >
                  <i className="fab fa-google"></i>
                  <span>Login with Google</span>
                </button>
                <button 
                  type="button" 
                  className="social-button facebook"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={loading}
                >
                  <i className="fab fa-facebook-f"></i>
                  <span>Login with Facebook</span>
                </button>
                <button 
                  type="button" 
                  className="social-button github"
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                >
                  <i className="fab fa-github"></i>
                  <span>Login with GitHub</span>
                </button>
              </div>
            </div>
            
            <div className="auth-links">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
              <Link to="/register">Chưa có tài khoản? Đăng ký ngay</Link>
            </div>
          </form>

          {/* Nút trở về trang chủ màu xanh dương đậm */}
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

export default Login;
