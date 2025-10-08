import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import '../../styles/RS7Performance.css';
import bannerJpg from '@rs7/banner.avif';
import bannerAvif from '@rs7/banner.avif';
import engineImg from '@rs7/engine.avif';
import diffImg from '@rs7/differential.avif';
import brakesImg from '@rs7/brakes.avif';
import exhaustImg from '@rs7/exhaust.jpg';
import frontImg from '@rs7/front-3-4.avif';
import hudImg from '@rs7/hud.jpg';
import cockpitImg from '@rs7/cockpit.jpg';
import mmiImg from '@rs7/mmi.jpg';
import engineSoundImg from '@rs7/rs7-engine.mp3';


const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.2]);
  const fade = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const scaleBg = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.18]), { stiffness: 140, damping: 30 });
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="rs7-hero">
      <motion.div className="rs7-hero-overlay" style={{ opacity: fade }} />
      <picture>
        <source srcSet={bannerAvif} type="image/avif" />
        <motion.img src={bannerJpg} alt="2026 Audi RS 7 performance" className="rs7-hero-bg" style={{ scale: scaleBg }} />
      </picture>
      <motion.div className="rs7-hero-content" style={{ y: titleY, opacity: titleOpacity }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="rs7-hero-heading"
        >
          <motion.span className="badge">New</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05 }}
          >
            2026 Audi RS 7 performance
          </motion.h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}>
          The scene stealer. 621 HP. 627 lb-ft. 0–60 mph in 3.3s.
        </motion.p>
        <div className="rs7-cta">
          <a href="#performance" className="btn btn-primary">Performance</a>
          <a href="#technology" className="btn btn-outline">Technology</a>
        </div>
      </motion.div>
      <motion.div className="rs7-progress" style={{ scaleX: progressScaleX }} />
    </section>
  );
};

const EngineSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };
    const onEnd = () => setPlaying(false);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const setupAudioGraph = () => {
    if (audioContextRef.current) return; // already set
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85;
    const source = ctx.createMediaElementSource(audioRef.current!);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);

      // soft glow backdrop
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
      gradient.addColorStop(0, 'rgba(229, 9, 20, 0.12)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // concentric smooth rings with subtle glow
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.33;
      const segments = 96;

      ctx.save();
      ctx.translate(centerX, centerY);
      for (let ring = 0; ring < 6; ring++) {
        const ringOpacity = 0.10 + ring * 0.10;
        ctx.strokeStyle = `rgba(255,255,255,${ringOpacity})`;
        ctx.shadowBlur = 8 + ring * 2;
        ctx.shadowColor = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const idx = Math.floor(t * bufferLength);
          const amp = dataArray[idx] / 255;
          const wobble = Math.sin((t + ring * 0.12) * Math.PI * 2) * 4;
          const jitter = (amp - 0.5) * 14 * (1 - ring * 0.1) + wobble;
          const angle = t * Math.PI * 2 + ring * 0.08;
          const radius = baseRadius + ring * 18 + jitter;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const stopVisualizer = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      stopVisualizer();
    } else {
      setupAudioGraph();
      audio.play();
      drawVisualizer();
    }
    setPlaying(!playing);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const p = Number(e.target.value);
    audio.currentTime = (p / 100) * duration;
    setProgress(p);
  };

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="engine-sound">
      <div className="engine-card">
        <canvas ref={canvasRef} className="engine-visualizer" width={680} height={510} />
      </div>
      <div className="engine-card" style={{ padding: 18 }}>
        <div className="engine-sound-content">
        <h3>Hear the performance</h3>
        <p>
          RS-specific sport exhaust with twin oval tailpipes. Weight-saving insulation removal for a more visceral experience.
        </p>
        <div className="engine-sound-controls">
          <button className={`btn ${playing ? 'btn-danger' : 'btn-primary'}`} onClick={toggle}>
            {playing ? 'Pause' : 'Play'} RS 7 engine
          </button>
          <div className="time-row">
            <span>{fmt(currentTime)}</span>
            <input type="range" min={0} max={100} value={progress} onChange={onSeek} />
            <span>{fmt(duration)}</span>
          </div>
        </div>
        <div className="engine-sound-thumb">
          <img src={exhaustImg} alt="RS 7 sport exhaust" />
        </div>
        <audio ref={audioRef} src={engineSoundImg} preload="auto" />
        </div>
      </div>
    </div>
  );
};

const SpecCard = ({ title, value, sub }: { title: string; value: string; sub?: string }) => {
  const [displayValue, setDisplayValue] = useState<string>(value);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        // animate numeric part if present
        const match = value.match(/([0-9]+)([\.\,]?[0-9]*)/);
        if (match) {
          const numeric = parseFloat(match[0].replace(/\,/g, ''));
          const tail = value.replace(match[0], '');
          const start = performance.now();
          const duration = 900;
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const curr = Math.round(numeric * eased);
            setDisplayValue(`${curr.toLocaleString()}${tail}`);
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <motion.div ref={nodeRef} className="spec-card" whileHover={{ y: -6, boxShadow: '0 14px 40px rgba(0,0,0,.45)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="spec-title">{title}</div>
      <div className="spec-value">{displayValue}</div>
      {sub && <div className="spec-sub">{sub}</div>}
    </motion.div>
  );
};

const PerformanceSection = () => (
  <section id="performance" className="rs7-section">
    <motion.div className="section-head" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
      <h2>Performance</h2>
      <p>V8 biturbo power with RS-tuned adaptive air suspension and sport rear differential.</p>
    </motion.div>
    <motion.div className="spec-grid" initial="hidden" whileInView="show" viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      {[
        { t: 'Engine', v: '4.0L V8', s: 'Twin-turbo' },
        { t: 'Power', v: '621 HP' },
        { t: 'Torque', v: '627 lb-ft' },
        { t: '0–60 mph', v: '3.3 s' },
      ].map((it) => (
        <motion.div key={it.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <SpecCard title={it.t} value={it.v} sub={(it as any).s} />
        </motion.div>
      ))}
    </motion.div>
    <div className="media-row">
      {[engineImg, diffImg, brakesImg].map((src, idx) => (
        <motion.div
          key={idx}
          className="tilt-card"
          initial={{ opacity: 0, y: 20, rotateX: -6 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 * idx }}
          whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }}
        >
          <img src={src as string} alt={`perf-${idx}`} />
          <div className="tilt-glow" />
        </motion.div>
      ))}
    </div>
    <EngineSound />
  </section>
);

const Gallery = () => (
  <section className="rs7-gallery">
    {['g1','g2','g3','g4','g5','g6'].map((name, i) => (
      <motion.div key={name} className="gallery-item" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} whileHover={{ y: -6 }}>
        <div className="gallery-frame">
          <img src={`${frontImg}`} alt={`RS 7 ${name}`} />
          <div className="gallery-caption">
            <span>RS 7 Detail</span>
          </div>
        </div>
      </motion.div>
    ))}
  </section>
);

const TechnologySection = () => (
  <section id="technology" className="rs7-section">
    <motion.div className="section-head" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
      <h2>Technology</h2>
      <p>Head-up display, Audi virtual cockpit plus, MMI touch response, Bang & Olufsen sound.</p>
    </motion.div>
    <div className="media-row">
      {[hudImg, cockpitImg, mmiImg].map((src, idx) => (
        <motion.div key={idx} className="tech-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.06 * idx }} whileHover={{ y: -4 }}>
          <img src={src as string} alt={`tech-${idx}`} />
          <div className="tech-overlay">
            <span className="dot" />
            <div className="copy">
              <strong>Precision tech</strong>
              <small>Designed for focus at any speed</small>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default function RS7Performance() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="rs7-page">
      <HeroSection />
      <PerformanceSection />
      <Gallery />
      <TechnologySection />
    </div>
  );
}


