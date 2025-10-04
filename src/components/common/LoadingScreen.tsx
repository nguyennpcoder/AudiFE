import React from 'react';
import '../../styles/LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="audi-logo-container">
          <div className="audi-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <div className="ring ring-4"></div>
          </div>
        </div>
        <div className="loading-text">
          <span className="letter" style={{ animationDelay: '0s' }}>L</span>
          <span className="letter" style={{ animationDelay: '0.1s' }}>o</span>
          <span className="letter" style={{ animationDelay: '0.2s' }}>a</span>
          <span className="letter" style={{ animationDelay: '0.3s' }}>d</span>
          <span className="letter" style={{ animationDelay: '0.4s' }}>i</span>
          <span className="letter" style={{ animationDelay: '0.5s' }}>n</span>
          <span className="letter" style={{ animationDelay: '0.6s' }}>g</span>
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

