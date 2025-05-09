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
      className={`hero-banner ${isTransitioning ? 'transitioning' : ''}`} 
      style={{ 
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="hero-dots">
        {Array.from({ length: totalModels }).map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onDotClick(index)}
            aria-label={`Xem mẫu xe ${index + 1}`}
          ></span>
        ))}
      </div>
      
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <p className="hero-price">{price}</p>
        {description && <p className="hero-description">{description}</p>}
        
        <div className="hero-cta">
          <a href={cta.primary.link} className="btn-primary">{cta.primary.text}</a>
          <a href={cta.secondary.link} className="btn-secondary">{cta.secondary.text}</a>
        </div>
      </div>
      
      <div className="hero-specs">
        <div className="spec-item">
          <h3>Công Suất</h3>
          <div className="spec-value">{specs.power.value}</div>
          <div className="spec-subtext">{specs.power.subtext}</div>
        </div>
        
        <div className="spec-item">
          <h3>{isElectric ? 'Dung Lượng Pin' : ' Động cơ'}</h3>
          <div className="spec-value">{specs.battery.value}</div>
          <div className="spec-subtext">{specs.battery.subtext}</div>
        </div>
        
        <div className="spec-item">
          <h3>Tăng Tốc 0-100</h3>
          <div className="spec-value">{specs.acceleration.value}</div>
          <div className="spec-subtext">{specs.acceleration.subtext}</div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;