
import React from 'react';

interface AnimatedPageProps {
  animation?: 'center' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

const animationClass = {
  center: 'admin-animate-center',
  bottom: 'admin-animate-bottom',
  left: 'admin-animate-left',
  right: 'admin-animate-right',
};

const AnimatedPage: React.FC<AnimatedPageProps> = ({ animation = 'center', children }) => (
  <div className={animationClass[animation]}>
    {children}
  </div>
);

export default AnimatedPage;