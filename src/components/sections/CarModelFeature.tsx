import React, { useState, useEffect, useRef } from 'react';
import '../../styles/CarModelFeature.css';

interface CarFeatureProps {
  backgroundImage: string;
  featureTitle: string;
  featureDescription: string;
  totalModels: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}

const CarModelFeature = ({
  backgroundImage,
  featureTitle,
  featureDescription,
  totalModels,
  currentIndex,
  onPrev,
  onNext,
  onDotClick
}: CarFeatureProps) => {
  // Thêm state để quản lý fade effect như trong ProductDetail
  const [fadeState, setFadeState] = useState<'fade-in' | 'fade-out' | null>('fade-in');
  const [slideDirection, setSlideDirection] = useState<'slide-left' | 'slide-right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs cho timers
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Cập nhật nội dung khi props thay đổi (chỉ khi không đang hoạt ảnh)
  useEffect(() => {
    if (!isAnimating) {
      setFadeState('fade-in');
    }
  }, [backgroundImage, featureTitle, featureDescription, isAnimating]);

  // Xử lý điều hướng với logic mượt mà hơn
  const handleNavigation = (navigationType: string, callback: () => void) => {
    if (isAnimating) return;
    
    // Tắt các timers đang chạy
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    // Đánh dấu đang hoạt ảnh và thiết lập hướng
    setIsAnimating(true);
    setFadeState('fade-out');
    setSlideDirection(navigationType === 'next' ? 'slide-left' : 'slide-right');
    
    // Sử dụng timeout ngắn hơn để tránh chớp nháy
    setTimeout(() => {
      // Gọi callback để thay đổi state ở component cha
      callback();
      
      // Reset trạng thái hoạt ảnh
      setFadeState('fade-in');
      setSlideDirection(null);
      
      // Kết thúc animation sau một khoảng thời gian ngắn
      setTimeout(() => {
        setIsAnimating(false);
        // Khởi động lại auto-rotate
        startAutoRotate();
      }, 400); // Khớp với thời gian CSS transition
    }, 280); // Thời gian fade-out
  };

  const handlePrev = () => {
    handleNavigation('prev', onPrev);
  };

  const handleNext = () => {
    handleNavigation('next', onNext);
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex || isAnimating) return;
    const dir = index > currentIndex ? 'next' : 'prev';
    handleNavigation(dir, () => onDotClick(index));
  };

  // Thiết lập auto-rotate
  const startAutoRotate = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    
    autoRotateRef.current = setInterval(() => {
      if (!isAnimating) {
        handleNext();
      }
    }, 5000);
  };

  // Khởi động auto-rotate khi component mount
  useEffect(() => {
    startAutoRotate();
    
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  return (
    <section className="car-model-feature">
      <div className="feature-container">
        {/* Slide container với logic mượt mà */}
        <div className="feature-slideshow">
          <div className={`feature-slide ${fadeState || ''} ${slideDirection || ''}`}>
            <img
              src={backgroundImage}
              alt="Audi car model"
              className="feature-image"
            />
            <div className="feature-info">
              <h2 className="feature-title">{featureTitle}</h2>
              <p className="feature-description">{featureDescription}</p>
            </div>
          </div>
        </div>

        <button
          className="feature-nav-arrow feature-nav-prev"
          onClick={handlePrev}
          aria-label="Xe trước"
          disabled={isAnimating}
        >
          <span>‹</span>
        </button>
        <button
          className="feature-nav-arrow feature-nav-next"
          onClick={handleNext}
          aria-label="Xe tiếp theo"
          disabled={isAnimating}
        >
          <span>›</span>
        </button>

        <div className="feature-indicators">
          {Array.from({ length: totalModels }).map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarModelFeature;