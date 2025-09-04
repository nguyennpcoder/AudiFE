import '../../styles/HeroBanner.css';
import { useEffect, useState } from 'react';

interface HeroBannerProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
  price: string;
  id?: number;
  description?: string;
  cta: {
    primary: { text: string; link: string };
    secondary: { text: string; link: string };
  };
  specs: {
    power: { value: string; subtext: string };
    battery: { value: string; subtext: string };
    acceleration: { value: string; subtext: string };
  };
  totalModels: number;
  currentIndex: number;
  onDotClick: (index: number) => void;
}

const HeroBanner = ({
  backgroundImage,
  title,
  subtitle,
  price,
  description,
  cta,
  specs,
  totalModels,
  currentIndex,
  onDotClick
}: HeroBannerProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(backgroundImage);
  
  useEffect(() => {
    setIsTransitioning(true);
    
    const transitionTimeout = setTimeout(() => {
      setCurrentBackground(backgroundImage);
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(transitionTimeout);
  }, [backgroundImage]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      onDotClick((currentIndex + 1) % totalModels);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, totalModels, onDotClick]);
  
  const isElectric = title.toLowerCase().includes('e-tron');

  return (
    <div 
      className={`hb-hero-banner ${isTransitioning ? 'transitioning' : ''}`} 
      style={{ 
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="hb-hero-dots">
        {Array.from({ length: totalModels }).map((_, index) => (
          <span 
            key={index} 
            className={`hb-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onDotClick(index)}
            aria-label={`Xem mẫu xe ${index + 1}`}
          ></span>
        ))}
      </div>
      
      <div className="hb-hero-content">
        <h1 className="hb-hero-title hb-hero-bounce-in hb-hero-bounce-in-1">{title}</h1>
        <p className="hb-hero-subtitle hb-hero-bounce-in hb-hero-bounce-in-2">{subtitle}</p>
        <p className="hb-hero-price hb-hero-bounce-in hb-hero-bounce-in-3">{price}</p>
        {description && <p className="hb-hero-description hb-hero-bounce-in hb-hero-bounce-in-4">{description}</p>}
        
        <div className="hb-hero-cta hb-hero-bounce-in hb-hero-bounce-in-5">
          <a href={cta.primary.link} className="hb-btn-primary">{cta.primary.text}</a>
          <a href={cta.secondary.link} className="hb-btn-secondary">{cta.secondary.text}</a>
        </div>
      </div>
      
      <div className="hb-hero-specs" key={backgroundImage + currentIndex}>
        <div className="hb-spec-item">
          <h3>Công Suất</h3>
          <div className="hb-spec-value">{specs.power.value}</div>
          <div className="hb-spec-subtext">{specs.power.subtext}</div>
        </div>
        
        <div className="hb-spec-item">
          <h3>{isElectric ? 'Dung Lượng Pin' : ' Động cơ'}</h3>
          <div className="hb-spec-value">{specs.battery.value}</div>
          <div className="hb-spec-subtext">{specs.battery.subtext}</div>
        </div>
        
        <div className="hb-spec-item">
          <h3>Tăng Tốc 0-100</h3>
          <div className="hb-spec-value">{specs.acceleration.value}</div>
          <div className="hb-spec-subtext">{specs.acceleration.subtext}</div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;