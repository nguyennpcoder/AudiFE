import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import '../../styles/Header.css';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <img src={logo} alt="Audi Logo" className="logo" />
          </Link>
        </div>
        
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
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
            <li className="nav-item">
              <Link to="/rs-etron">RS e-tron</Link>
            </li>
            <li className="nav-item">
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
            <li className="nav-item">
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
            <li className="nav-item">
              <Link to="/dealership">Đại Lý</Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-actions">
          <Link to="/test-drive" className="button-outline">Lái Thử</Link>
          
          {isAuthenticated ? (
            <div className="user-menu">
              <div 
                className="user-info" 
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                {firebaseUser?.photoURL ? (
                  <img 
                    src={firebaseUser.photoURL} 
                    alt="Profile" 
                    className="user-avatar"
                  />
                ) : (
                  <div className="default-avatar">
                    {getDisplayName().charAt(0)}
                  </div>
                )}
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
            <Link to="/login" className="login-button">Đăng Nhập myAudi</Link>
          )}
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span className="toggle-icon"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;