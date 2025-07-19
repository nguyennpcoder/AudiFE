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
    
    // First check if Firebase user has a photo URL (for social login)
    if (firebaseUser?.photoURL && firebaseUser.photoURL.trim() !== '') {
      console.log('Using Firebase photoURL:', firebaseUser.photoURL);
      return firebaseUser.photoURL;
    }
    
    // Then check if local user has an avatar (for regular login)
    if (user?.avatar && user.avatar.trim() !== '') {
      // If user.avatar is already processed by buildAvatarUrl during login, use it directly
      // If it's a full URL, use it as is
      if (/^https?:\/\//.test(user.avatar) || user.avatar.startsWith('/')) {
        console.log('Using user avatar directly:', user.avatar);
        return user.avatar;
      } else {
        // Otherwise, process it through buildAvatarUrl
        const builtUrl = buildAvatarUrl(user.avatar);
        console.log('Using buildAvatarUrl result:', builtUrl);
        return builtUrl;
      }
    }
    
    // Fallback to default avatar
    console.log('Using default avatar');
    return '/avatar-default.png';
  };

  const avatarUrl = getAvatarUrl();
  console.log('=== Final avatar URL ===:', avatarUrl);

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
                    console.log('Avatar failed to load, using default');
                    const target = e.currentTarget;
                    if (target.src !== '/avatar-default.png') {
                      target.src = '/avatar-default.png';
                    }
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully:', avatarUrl);
                  }}
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