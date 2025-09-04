import React, { useEffect, useRef } from 'react';
import introVideo from '../../assets/intro.mp4'; // Đường dẫn tới video của bạn
import '../../styles/LoadingAnimation.css';

interface LoadingAnimationProps {
  onAnimationComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onAnimationComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Nếu muốn tự động bỏ qua sau X giây (phòng trường hợp video lỗi), có thể setTimeout ở đây
    // const timer = setTimeout(onAnimationComplete, 10000); // Ví dụ 10s
    // return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="la-loading-container" style={{ background: 'black' }}>
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={onAnimationComplete}
        className="la-intro-video"
        controls={false} // Không cần controls cho intro
      />
    </div>
  );
};

export default LoadingAnimation;
