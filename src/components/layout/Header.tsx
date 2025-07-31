import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import '../../styles/Header.css';
import { useAuth } from '../../context/AuthContext';

import { FaUserCircle } from 'react-icons/fa';
import { buildAvatarUrl } from '../../services/authService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, firebaseUser, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    // Redirect to home page after logout
    navigate('/');
    // Close the menu
    setIsUserMenuOpen(false);
  };

  // Determine display name for the user
  const getDisplayName = () => {
    // Check if we have a Firebase user with a display name
    if (firebaseUser?.displayName) {
      // Check if this is a Facebook login
      const isFacebookLogin = firebaseUser.providerData?.some(
        provider => provider.providerId === 'facebook.com'
      );

      // For Facebook login without email, add the prefix
      if (isFacebookLogin && !firebaseUser.email) {
        return `${firebaseUser.displayName}`;
      }
      
      return firebaseUser.displayName;
    }
    
    // Fallback to user.fullName from context if available
    if (user?.fullName) {
      return user.fullName;
    }
    
    // Otherwise, show email or fallback to "Tài khoản"
    return user?.email || 'Tài khoản';
  };

  // Get avatar URL with improved logic
  const getAvatarUrl = () => {
    console.log('=== Avatar Debug Info ===');
    console.log('firebaseUser:', firebaseUser);
    console.log('firebaseUser?.photoURL:', firebaseUser?.photoURL);
    console.log('user:', user);
    console.log('user?.avatar:', user?.avatar);
    
    // Check if this is a Google login
    const isGoogleLogin = firebaseUser?.providerData?.some(
      provider => provider.providerId === 'google.com'
    );
    
    console.log('Is Google login:', isGoogleLogin);
    
    // Priority 1: Use Firebase photoURL if available (for social logins)
    if (firebaseUser?.photoURL && firebaseUser.photoURL.trim() !== '') {
      console.log('Using Firebase photoURL:', firebaseUser.photoURL);
      
      // For Google URLs, handle CORS issue
      if (firebaseUser.photoURL.includes('googleusercontent.com')) {
        // Use a simple CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(firebaseUser.photoURL)}`;
        console.log('Using CORS proxy for Google avatar:', proxyUrl);
        return proxyUrl;
      }
      
      return firebaseUser.photoURL;
    }
    
    // Priority 2: Use user.avatar if it's a full URL (from Google, Facebook, etc.)
    if (user?.avatar && user.avatar.trim() !== '') {
      if (/^https?:\/\//.test(user.avatar)) {
        console.log('Using user avatar (full URL):', user.avatar);
        
        // Handle Google URLs in user.avatar as well
        if (user.avatar.includes('googleusercontent.com')) {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(user.avatar)}`;
          console.log('Using CORS proxy for stored Google avatar:', proxyUrl);
          return proxyUrl;
        }
        
        return user.avatar;
      }
      
      // If it starts with /, it's a relative path
      if (user.avatar.startsWith('/')) {
        console.log('Using user avatar (relative path):', user.avatar);
        return user.avatar;
      }
      
      // Otherwise, process it through buildAvatarUrl
      const builtUrl = buildAvatarUrl(user.avatar);
      console.log('Using buildAvatarUrl result:', builtUrl);
      return builtUrl;
    }
    
    // Priority 3: Check if we have a stored user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Stored user from localStorage:', parsedUser);
        if (parsedUser.avatar && parsedUser.avatar.trim() !== '') {
          if (/^https?:\/\//.test(parsedUser.avatar)) {
            console.log('Using stored user avatar (full URL):', parsedUser.avatar);
            
            // Handle Google URLs in stored user
            if (parsedUser.avatar.includes('googleusercontent.com')) {
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(parsedUser.avatar)}`;
              console.log('Using CORS proxy for stored Google avatar:', proxyUrl);
              return proxyUrl;
            }
            
            return parsedUser.avatar;
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    // Fallback to default avatar
    console.log('Using default avatar');
    return '/avatar-default.png';
  };

  // Debug function to test avatar loading
  const testAvatarUrl = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log('Avatar URL is valid:', url);
        resolve(true);
      };
      img.onerror = () => {
        console.log('Avatar URL is invalid:', url);
        resolve(false);
      };
      img.src = url;
    });
  };

  const avatarUrl = getAvatarUrl();
  console.log('=== Final avatar URL ===:', avatarUrl);
  
  // Test the avatar URL
  testAvatarUrl(avatarUrl);

  return (
    <header className="header header-animate-down">
      <div className="header-container">
        <div className="logo-container header-animate-item header-animate-item-1">
          <Link to="/">
            <img src={logo} alt="Audi Logo" className="logo" />
          </Link>
        </div>
        
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''} header-animate-item header-animate-item-2`}>
          <ul className="nav-list">
            <li className="nav-item nav-animate-item nav-animate-item-1">
              <Link to="/models">Các Mẫu Xe</Link>
              <div className="dropdown-menu">
                <div className="dropdown-column">
                  <h3>Sedan</h3>
                  <ul>
                    <li><Link to="/models/a4">A4</Link></li>
                    <li><Link to="/models/a6">A6</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>SUV</h3>
                  <ul>
                    <li><Link to="/models/q5">Q5</Link></li>
                    <li><Link to="/models/q7">Q7</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>Hiệu Suất Cao</h3>
                  <ul>
                    <li><Link to="/models/rs7">RS7</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>Xe Điện</h3>
                  <ul>
                    <li><Link to="/models/e-tron-gt">e-tron GT</Link></li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="nav-item nav-animate-item nav-animate-item-2">
              <Link to="/rs-etron">RS e-tron</Link>
            </li>
            <li className="nav-item nav-animate-item nav-animate-item-3">
              <Link to="/services">Dịch Vụ</Link>
              <div className="dropdown-menu">
                <div className="dropdown-column">
                  <h3>Bảo Dưỡng</h3>
                  <ul>
                    <li><Link to="/services/maintenance">Đặt Lịch Bảo Dưỡng</Link></li>
                    <li><Link to="/services/warranty">Bảo Hành</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>Tài Chính</h3>
                  <ul>
                    <li><Link to="/services/finance/installment">Kế Hoạch Trả Góp</Link></li>
                    <li><Link to="/services/finance/options">Tùy Chọn Tài Chính</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>Hỗ Trợ</h3>
                  <ul>
                    <li><Link to="/services/support/help">Trợ Giúp</Link></li>
                    <li><Link to="/services/support/contact">Liên Hệ</Link></li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="nav-item nav-animate-item nav-animate-item-4">
              <Link to="/discover">Khám Phá</Link>
              <div className="dropdown-menu">
                <div className="dropdown-column">
                  <h3>Tin Tức</h3>
                  <ul>
                    <li><Link to="/discover/news">Tin Mới Nhất</Link></li>
                    <li><Link to="/discover/events">Sự Kiện</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>Công Nghệ</h3>
                  <ul>
                    <li><Link to="/discover/technology/innovations">Đổi Mới</Link></li>
                    <li><Link to="/discover/technology/electric">Điện Hóa</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h3>Khuyến Mãi</h3>
                  <ul>
                    <li><Link to="/discover/promotions/current">Ưu Đãi Hiện Tại</Link></li>
                    <li><Link to="/discover/promotions/special">Ưu Đãi Đặc Biệt</Link></li>
                  </ul>
                </div>
              </div>
            </li>
            <li className="nav-item nav-animate-item nav-animate-item-5">
              <Link to="/dealership">Đại Lý</Link>
            </li>
            <li className="nav-item">
              <Link to="/blog">Tin tức</Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-actions header-animate-item header-animate-item-3">
          <Link to="/test-drive" className="button-outline user-action-animate user-action-animate-1">
            Lái Thử
          </Link>
          
          {isAuthenticated ? (
            <div className="user-menu user-action-animate user-action-animate-2">
              <div 
                className="user-info" 
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="user-avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ccc'
                  }}
                  onError={(e) => {
                    console.log('Avatar failed to load:', avatarUrl);
                    console.log('Error event:', e);
                    const target = e.currentTarget;
                    if (target.src !== '/avatar-default.png') {
                      console.log('Falling back to default avatar');
                      target.src = '/avatar-default.png';
                    }
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully:', avatarUrl);
                  }}
                  // Remove crossOrigin for proxy URLs
                  crossOrigin={avatarUrl.includes('allorigins.win') ? undefined : "anonymous"}
                />
                <span className="user-name">
                  {getDisplayName()} <span className="dropdown-arrow">▼</span>
                </span>
              </div>
              
              <div className={`user-dropdown-menu ${isUserMenuOpen ? 'visible' : ''}`}
                   onMouseEnter={() => setIsUserMenuOpen(true)}
                   onMouseLeave={() => setIsUserMenuOpen(false)}>
                <ul>
                  <li><Link to="/myaudi">Tài khoản của tôi</Link></li>
                  <li><Link to="/myaudi/orders">Đơn hàng của tôi</Link></li>
                  <li><Link to="/myaudi/testdrives">Lịch lái thử</Link></li>
                  <li><Link to="/myaudi/favorites">Xe yêu thích</Link></li>
                  <li>
                    <button onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-button user-action-animate user-action-animate-2">
              Đăng Nhập myAudi
            </Link>
          )}
        </div>
        
        <button className="mobile-menu-toggle header-animate-item header-animate-item-3" onClick={toggleMenu}>
          <span className="toggle-icon"></span>
        </button>
      </div>
    </header>
    
  );
};

export default Header;