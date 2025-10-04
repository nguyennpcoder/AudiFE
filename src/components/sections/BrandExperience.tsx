import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/BrandExperience.css';

const BrandExperience: React.FC = () => {
  const [isVisible, setIsVisible] = useState({
    header: false,
    heritage: false,
    technology: false,
    experience: false,
    cta: false
  });

  const sectionRefs = {
    header: useRef<HTMLDivElement>(null),
    heritage: useRef<HTMLDivElement>(null),
    technology: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    cta: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const section = target.dataset.section as keyof typeof isVisible;
          if (section) {
            setIsVisible(prev => ({ ...prev, [section]: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const technologies = [
    {
      icon: '⚡',
      title: 'Công nghệ Hybrid & Điện',
      description: 'Dẫn đầu trong công nghệ xe điện và hybrid với hiệu suất vượt trội',
      stats: '100% Xe điện đến 2033'
    },
    {
      icon: '🎯',
      title: 'Hệ thống Quattro®',
      description: 'Công nghệ dẫn động 4 bánh thế hệ mới với khả năng bám đường tối ưu',
      stats: '40+ năm kinh nghiệm'
    },
    {
      icon: '🤖',
      title: 'Trợ lý Ảo & AI',
      description: 'Trí tuệ nhân tạo tiên tiến giúp lái xe an toàn và tiện nghi hơn',
      stats: 'Tự động hóa Level 3'
    },
    {
      icon: '💎',
      title: 'Thiết kế Đẳng cấp',
      description: 'Nghệ thuật kết hợp hoàn hảo giữa thẩm mỹ và khí động học',
      stats: 'Giải thưởng Design 2024'
    }
  ];

  const experiences = [
    {
      title: 'Showroom & Trải nghiệm',
      description: 'Khám phá không gian trưng bày hiện đại với công nghệ VR và AR',
      image: '🏢',
      link: '/dealership'
    },
    {
      title: 'Lái thử Miễn phí',
      description: 'Trải nghiệm cảm giác lái xe Audi đích thực trên mọi địa hình',
      image: '🚗',
      link: '/test-drive'
    },
    {
      title: 'Tùy chỉnh xe của bạn',
      description: 'Cá nhân hóa chiếc Audi của bạn với hàng ngàn lựa chọn',
      image: '🎨',
      link: '/models'
    }
  ];

  return (
    <div className="brand-experience-wrapper">
      {/* Header Section */}
      <div 
        ref={sectionRefs.header}
        data-section="header"
        className={`brand-header ${isVisible.header ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="brand-header-content">
            <span className="brand-tagline fade-in-up">Vorsprung durch Technik</span>
            <h1 className="brand-title fade-in-up delay-1">
              Tiên phong trong tương lai
            </h1>
            <p className="brand-subtitle fade-in-up delay-2">
              Hơn 100 năm đổi mới và xuất sắc trong ngành công nghiệp ô tô
            </p>
          </div>
        </div>
      </div>

      {/* Heritage Section */}
      <section 
        ref={sectionRefs.heritage}
        data-section="heritage"
        className={`heritage-section ${isVisible.heritage ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="heritage-grid">
            <div className="heritage-content">
              <span className="section-label">Di sản</span>
              <h2 className="section-title">Hơn một thế kỷ xuất sắc</h2>
              <p className="section-description">
                Từ năm 1909, Audi đã không ngừng đổi mới và phát triển. Với phương châm 
                "Vorsprung durch Technik" (Tiên phong qua Công nghệ), chúng tôi luôn đi 
                đầu trong việc tạo ra những chiếc xe không chỉ đẹp mắt mà còn mang lại 
                hiệu suất vượt trội và trải nghiệm lái xe đỉnh cao.
              </p>
              <div className="heritage-stats">
                <div className="stat-item">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Năm lịch sử</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Thị trường toàn cầu</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2M+</span>
                  <span className="stat-label">Xe bán mỗi năm</span>
                </div>
              </div>
            </div>
            <div className="heritage-visual">
              <div className="rings-container">
                <div className="audi-ring ring-1"></div>
                <div className="audi-ring ring-2"></div>
                <div className="audi-ring ring-3"></div>
                <div className="audi-ring ring-4"></div>
              </div>
              <p className="rings-description">
                Bốn vòng tròn tượng trưng cho sự hợp nhất của bốn nhà sản xuất ô tô
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section 
        ref={sectionRefs.technology}
        data-section="technology"
        className={`technology-section ${isVisible.technology ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Công nghệ</span>
            <h2 className="section-title">Đổi mới không ngừng</h2>
            <p className="section-description">
              Khám phá các công nghệ tiên tiến định hình tương lai của ngành ô tô
            </p>
          </div>

          <div className="technology-grid">
            {technologies.map((tech, index) => (
              <div 
                key={index}
                className="tech-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="tech-icon">{tech.icon}</div>
                <h3 className="tech-title">{tech.title}</h3>
                <p className="tech-description">{tech.description}</p>
                <span className="tech-stats">{tech.stats}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section 
        ref={sectionRefs.experience}
        data-section="experience"
        className={`experience-section ${isVisible.experience ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Trải nghiệm</span>
            <h2 className="section-title">Khám phá thế giới Audi</h2>
          </div>

          <div className="experience-grid">
            {experiences.map((exp, index) => (
              <Link 
                key={index}
                to={exp.link}
                className="experience-card"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="experience-icon">{exp.image}</div>
                <h3 className="experience-title">{exp.title}</h3>
                <p className="experience-description">{exp.description}</p>
                <span className="experience-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={sectionRefs.cta}
        data-section="cta"
        className={`cta-section ${isVisible.cta ? 'visible' : ''}`}
      >
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng trải nghiệm Audi?</h2>
            <p className="cta-description">
              Đặt lịch lái thử hoặc ghé thăm showroom của chúng tôi ngay hôm nay
            </p>
            <div className="cta-buttons">
              <Link to="/test-drive" className="cta-button primary">
                Đặt lịch lái thử
                <span className="button-icon">→</span>
              </Link>
              <Link to="/models" className="cta-button secondary">
                Khám phá dòng xe
                <span className="button-icon">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandExperience;

