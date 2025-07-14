import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo.svg';
import '../../styles/LoadingAnimation.css';

interface LoadingAnimationProps {
  onAnimationComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onAnimationComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Giảm thời gian animation từ 3s xuống 1.5s
    const timer = setTimeout(() => {
      setIsAnimating(false);
      // Giảm delay transition từ 500ms xuống 200ms
      setTimeout(() => {
        onAnimationComplete();
      }, 200);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className={`loading-container ${isAnimating ? 'animating' : 'fade-out'}`}>
      <div className="loading-background">
        <div className="logo-container">
          <img 
            src={logo} 
            alt="Audi Logo" 
            className="audi-logo"
          />
          <div className="loading-text">AUDI</div>
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;