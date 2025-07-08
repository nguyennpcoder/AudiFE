import { Link } from 'react-router-dom';
import '../../styles/Footer.css';
import logoAudi from '../../assets/logo.svg';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setAnimate(true);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  return (
    <footer className={`footer${animate ? ' footer-animate-up' : ''}`} ref={footerRef}>
      <div className="footer-main">
        <div className={`footer-logo-disclaimer${animate ? ' footer-animate-item footer-animate-item-1' : ''}`}>
          <Link to="/">
            <img src={logoAudi} alt="Audi Logo" className="footer-logo" />
          </Link>
          <p className="disclaimer">
            Audi Việt Nam nỗ lực đảm bảo tính chính xác của thông tin trên các trang thông tin xe. Các mẫu xe được hiển thị chỉ nhằm mục đích minh họa và có thể bao gồm các tính năng không có sẵn ở mẫu xe tại Việt Nam. Vì lỗi có thể xảy ra hoặc tính khả dụng có thể thay đổi, vui lòng liên hệ đại lý để biết thông tin chi tiết và thông số kỹ thuật mẫu xe hiện tại.
          </p>
        </div>

        <div className="footer-navigation">
          <div className={`footer-nav-column${animate ? ' footer-animate-item footer-animate-item-2' : ''}`}>
            <h3>Khám Phá</h3>
            <ul>
              <li><Link to="/models">Các Mẫu Xe</Link></li>
              <li><Link to="/audi-sport">Audi Sport</Link></li>
            </ul>
          </div>

          <div className={`footer-nav-column${animate ? ' footer-animate-item footer-animate-item-3' : ''}`}>
            <h3>Hỗ Trợ</h3>
            <ul>
              <li><Link to="/contact">Liên Hệ</Link></li>
              <li><Link to="/help">Trợ Giúp</Link></li>
            </ul>
          </div>

          <div className={`footer-nav-column${animate ? ' footer-animate-item footer-animate-item-4' : ''}`}>
            <h3>Theo Dõi Chúng Tôi</h3>
            <div className="social-icons">
              <a href="https://facebook.com/audi" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com/audi" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com/audi" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`footer-copyright${animate ? ' footer-animate-item footer-animate-item-4' : ''}`}>
        <p>© 2023 Audi Việt Nam. Đã đăng ký bản quyền.</p>
      </div>

     
    </footer>
  );
};

export default Footer;