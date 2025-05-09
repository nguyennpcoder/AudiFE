import { useState, useEffect, useRef } from 'react';
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
  // Lưu trữ nội dung hiện tại và nội dung tiếp theo
  const [slides, setSlides] = useState({
    current: {
      image: backgroundImage,
      title: featureTitle,
      description: featureDescription
    },
    next: {
      image: '',
      title: '',
      description: ''
    }
  });
  
  // Hướng chuyển đổi và trạng thái hoạt ảnh
  const [direction, setDirection] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs cho timers
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Cập nhật nội dung hiện tại khi props thay đổi (chỉ khi không đang hoạt ảnh)
  useEffect(() => {
    if (!isAnimating) {
      setSlides(prev => ({
        ...prev,
        current: {
          image: backgroundImage,
          title: featureTitle,
          description: featureDescription
        }
      }));
    }
  }, [backgroundImage, featureTitle, featureDescription, isAnimating]);

  // Xử lý điều hướng
  const handleNavigation = (navigationType: string, callback: () => void) => {
    if (isAnimating) return;
    
    // Tắt các timers đang chạy
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    // Lưu trữ nội dung hiện tại
    const currentSlide = slides.current;
    
    // Gọi callback để thay đổi state ở component cha (cập nhật index)
    callback();
    
    // Đánh dấu đang hoạt ảnh và thiết lập hướng
    setIsAnimating(true);
    setDirection(navigationType);
    
    // Chỉ đặt một timer duy nhất cho hoạt ảnh hoàn thành
    animationTimerRef.current = setTimeout(() => {
      // Cập nhật slide hiện tại thành slide mới từ props
      setSlides({
        current: {
          image: backgroundImage,
          title: featureTitle,
          description: featureDescription
        },
        next: {
          image: '',
          title: '',
          description: ''
        }
      });
      
      // Reset trạng thái hoạt ảnh
      setIsAnimating(false);
      setDirection('');
      
      // Khởi động lại auto-rotate
      startAutoRotate();
    }, 1000); // Khớp với thời gian hoạt ảnh CSS
  };

  const handlePrev = () => {
    handleNavigation('prev', onPrev);
  };

  const handleNext = () => {
    handleNavigation('next', onNext);
  };

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
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
        {/* Slide cơ sở - chỉ hiển thị khi không hoạt ảnh */}
        <div 
          className="feature-slide" 
          style={{ 
            opacity: isAnimating ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <img
            src={slides.current.image}
            alt="Audi car model"
            className="feature-image"
          />
          <div className="feature-info">
            <h2 className="feature-title">{slides.current.title}</h2>
            <p className="feature-description">{slides.current.description}</p>
          </div>
        </div>

        {/* Lớp hoạt ảnh - chỉ hiển thị khi đang hoạt ảnh */}
        {isAnimating && (
          <>
            {/* Slide đi ra */}
            <div className={`feature-slide slide-${direction} animation-layer`}>
              <img
                src={slides.current.image}
                alt="Audi car model transition"
                className="feature-image"
              />
              <div className="feature-info">
                <h2 className="feature-title">{slides.current.title}</h2>
                <p className="feature-description">{slides.current.description}</p>
              </div>
            </div>

            {/* Slide đi vào */}
            <div className={`feature-slide slide-${direction}-prev animation-layer`}>
              <img
                src={backgroundImage}
                alt="Audi car model transition"
                className="feature-image"
              />
              <div className="feature-info">
                <h2 className="feature-title">{featureTitle}</h2>
                <p className="feature-description">{featureDescription}</p>
              </div>
            </div>
          </>
        )}

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