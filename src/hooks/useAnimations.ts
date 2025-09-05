import { useEffect, useRef, useState } from 'react';

// ================================================
// CUSTOM ANIMATION HOOKS
// ================================================

/**
 * Hook for intersection observer animations
 * Triggers animations when elements come into view
 */
export const useIntersectionAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isVisible };
};

/**
 * Hook for staggered animations
 * Creates sequential animation delays for list items
 */
export const useStaggeredAnimation = (itemCount: number, delay = 100) => {
  const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setAnimatedItems(prev => new Set(prev).add(i));
      }, i * delay);
      timeouts.push(timeout);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [itemCount, delay]);

  const getAnimationDelay = (index: number) => 
    animatedItems.has(index) ? '0ms' : `${index * delay}ms`;

  return { getAnimationDelay, isAnimated: (index: number) => animatedItems.has(index) };
};

/**
 * Hook for scroll-based animations
 * Tracks scroll position and provides animation states
 */
export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollY = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', updateScrollY, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollY);
  }, []);

  return { scrollY, scrollDirection };
};

/**
 * Hook for particle animations
 * Creates floating particle effects
 */
export const useParticleAnimation = (particleCount = 20) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount]);

  return canvasRef;
};

/**
 * Hook for morphing shapes
 * Creates dynamic shape transformations
 */
export const useMorphingShape = (shapes: string[], interval = 3000) => {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentShapeIndex(prev => (prev + 1) % shapes.length);
        setIsTransitioning(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [shapes.length, interval]);

  return { 
    currentShape: shapes[currentShapeIndex], 
    isTransitioning,
    currentIndex: currentShapeIndex
  };
};

/**
 * Hook for text typing animation
 * Creates typewriter effect for text
 */
export const useTypewriter = (text: string, speed = 100) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
};

/**
 * Hook for 3D card tilt effect
 * Creates mouse-following 3D tilt animation
 */
export const useCardTilt = (maxTilt = 15) => {
  const [transform, setTransform] = useState('');
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateX = (e.clientY - centerY) / (rect.height / 2) * maxTilt;
      const rotateY = -(e.clientX - centerX) / (rect.width / 2) * maxTilt;
      
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
    };

    const handleMouseLeave = () => {
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  return { elementRef, transform };
};

/**
 * Hook for ripple effect
 * Creates material design ripple animation
 */
export const useRipple = () => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now()
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  return { ripples, createRipple };
};

// ================================================
// ANIMATION UTILITIES
// ================================================

export const animationPresets = {
  fadeInUp: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
  fadeInDown: 'fadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
  fadeInLeft: 'fadeInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
  fadeInRight: 'fadeInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
  scaleIn: 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both',
  slideUp: 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
  bounce: 'bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
  pulse: 'pulse 2s ease-in-out infinite',
  glow: 'glow 2s ease-in-out infinite alternate'
};

export const easingFunctions = {
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

export const createStaggerDelay = (index: number, baseDelay = 100) => ({
  animationDelay: `${index * baseDelay}ms`
});

export const createCustomAnimation = (
  keyframes: Record<string, Record<string, string | number>>,
  options: {
    duration?: string;
    timingFunction?: string;
    delay?: string;
    iterationCount?: string;
    direction?: string;
    fillMode?: string;
  } = {}
) => {
  const {
    duration = '1s',
    timingFunction = 'ease',
    delay = '0s',
    iterationCount = '1',
    direction = 'normal',
    fillMode = 'both'
  } = options;

  return `${duration} ${timingFunction} ${delay} ${iterationCount} ${direction} ${fillMode}`;
};
