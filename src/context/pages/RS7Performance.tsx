import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import '../../styles/RS7Performance.css';
import '../../styles/HeroBanner.css';
import bannerJpg from '@rs7/banner.avif';
import bannerAvif from '@rs7/banner.avif';
// removed gallery and technology images
// removed engine sound audio import


const BACKEND_URL = 'http://localhost:8080';

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
          <motion.span className="badge">Mới</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05 }}
          >
            2026 Audi RS 7 Performance
          </motion.h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}>
          Kẻ đánh cắp mọi ánh nhìn. 621 HP. 627 lb-ft. 0–60 mph trong 3.3 giây.
        </motion.p>
        <div className="rs7-cta">
          <a href="#performance" className="btn btn-primary">Hiệu năng</a>
          <a href="#mau-ngoai-that" className="btn btn-outline">Màu ngoại thất</a>
        </div>
      </motion.div>
      <motion.div className="rs7-progress" style={{ scaleX: progressScaleX }} />
    </section>
  );
};

// EngineSound component removed per request

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
      <h2>Hiệu năng</h2>
      <p>Động cơ V8 biturbo, treo khí nén RS tinh chỉnh và vi sai sau thể thao.</p>
    </motion.div>
    <motion.div className="spec-grid" initial="hidden" whileInView="show" viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      {[
        { t: 'Động cơ', v: '4.0L V8', s: 'Twin‑turbo' },
        { t: 'Công suất', v: '621 HP' },
        { t: 'Mô‑men xoắn', v: '627 lb‑ft' },
        { t: '0–60 mph', v: '3.3 s' },
      ].map((it) => (
        <motion.div key={it.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <SpecCard title={it.t} value={it.v} sub={(it as any).s} />
        </motion.div>
      ))}
    </motion.div>
    {/* phần nội dung khác đã được gỡ theo yêu cầu */}
  </section>
);

type MauSac = { id: number; ten: string; maHex?: string; duongDanAnh?: string; giaThem?: number; laMetallic?: boolean };
type HinhAnhXe = { id: number; duongDanAnh: string };

const DesignShowcase = () => {
  const [images, setImages] = useState<{ duongDanAnh: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [colors, setColors] = useState<MauSac[]>([]);
  const [defaultColor, setDefaultColor] = useState<MauSac | null>(null);
  const [selected, setSelected] = useState<MauSac | null>(null);
  const MODEL_ID = 12;

  useEffect(() => {
    const init = async () => {
      try {
        const colorRes = await fetch(`${BACKEND_URL}/api/v1/mau-sac/mau-xe/${MODEL_ID}`);
        const list: MauSac[] = await colorRes.json();
        setColors(list);
        const def = list.find(c => c.ten === 'Bạc Florett') || list[0] || null;
        setDefaultColor(def);
        setSelected(def);
      } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    const load = async (colorId?: number) => {
      try {
        if (!colorId) return;
        const res = await fetch(`${BACKEND_URL}/api/v1/hinh-anh-theo-mau/mau-xe/${MODEL_ID}/mau-sac/${colorId}`);
        const data: HinhAnhXe[] = await res.json();
        setImages(data || []);
        setIdx(0);
      } catch {}
    };
    if (selected?.id) load(selected.id);
  }, [selected]);

  const toFull = (p?: string) => (p ? `${BACKEND_URL}${p}` : '');
  const next = () => setIdx((p) => (images.length ? (p + 1) % images.length : 0));
  const prev = () => setIdx((p) => (images.length ? (p - 1 + images.length) % images.length : 0));

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="rs7-showcase">
        <div className="rs7-showcase-viewer">
          {images[idx] && (
            <motion.div
              key={idx}
              className="rs7-showcase-bg"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ backgroundImage: `url(${toFull(images[idx].duongDanAnh)})` }}
            />
          )}
          {images.length > 1 && (
            <div className="rs7-showcase-arrows">
              <div className="rs7-arrow-zone left" onClick={prev} aria-label="Trước">
                <button className="rs7-arrow"><span>‹</span></button>
              </div>
              <div className="rs7-arrow-zone right" onClick={next} aria-label="Sau">
                <button className="rs7-arrow"><span>›</span></button>
              </div>
            </div>
          )}
          <div className="rs7-showcase-dots">
            {images.map((_, i) => (
              <span key={i} className={i === idx ? 'active' : ''} onClick={() => setIdx(i)} />
            ))}
          </div>
        </div>

        <div className="rs7-showcase-info">
          <h3>Thiết kế đẹp mắt.</h3>
          <p>RS 7 Sportback kết hợp sự tiện nghi của sedan, tính thực dụng của wagon và vẻ ngoài coupe. Không gian rộng rãi cùng phong cách thể thao sang trọng.</p>
        </div>

        <div className="rs7-swatch-bar">
          {defaultColor && (
            <button
              key={`def-${defaultColor.id}`}
              className={`swatch ${selected?.id === defaultColor.id ? 'selected' : ''}`}
              style={{ backgroundColor: defaultColor.maHex, backgroundImage: defaultColor.duongDanAnh ? `url(${toFull(defaultColor.duongDanAnh)})` : 'none' }}
              title={`${defaultColor.ten} (Mặc định)`}
              onClick={() => setSelected(defaultColor)}
            />
          )}
          {colors.filter(c => c.id !== defaultColor?.id).map((c) => (
            <button
              key={c.id}
              className={`swatch ${selected?.id === c.id ? 'selected' : ''}`}
              style={{ backgroundColor: c.maHex, backgroundImage: c.duongDanAnh ? `url(${toFull(c.duongDanAnh)})` : 'none' }}
              title={c.ten}
              onClick={() => setSelected(c)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Gallery and Technology sections removed per request

export default function RS7Performance() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="rs7-page">
      <HeroSection />
      <PerformanceSection />
      <DesignShowcase />
      <DesignGallery />
      <AudioShowcase />
    </div>
  );
}

// Bộ sưu tập thiết kế nội/ngoại thất đơn giản 5 ảnh, bạn có thể thay URL sau
const DesignGallery = () => {
  const slides = [
    {
      src: new URL('../../assets/rs7/design1.jpg', import.meta.url).href,
      title: 'Chi tiết ngoại thất.',
      desc:
        'RS 7 performance sở hữu các chi tiết ngoại thất màu xám mờ như viền cửa sổ, ốp gương và các điểm nhấn trang trí tinh tế.',
    },
    {
      src: new URL('../../assets/rs7/design2.avif', import.meta.url).href,
      title: 'Gói carbon mờ.',
      desc:
        'Tùy chọn gói Carbon mờ mang đến các chi tiết carbon bên ngoài và ốp gương. Đi kèm gói Black optic và mâm 22 inch 5 chấu chữ Y sơn đen mờ.',
    },
    {
      src: new URL('../../assets/rs7/design3.avif', import.meta.url).href,
      title: 'Gói RS Design plus – Xanh.',
      desc:
        'Vô lăng và cần số bọc Alcantara với chỉ khâu xanh tương phản, ốp trang trí carbon dệt chéo điểm nhấn xanh và dây an toàn màu xanh.',
    },
    {
      src: new URL('../../assets/rs7/design4.jpg', import.meta.url).href,
      title: 'Gói Executive.',
      desc:
        'Trang bị màn hình hiển thị trên kính lái, hỗ trợ đỗ xe từ xa, ghế sau sưởi, cửa hít tự động và bề mặt da mở rộng trên bảng táp-lô, bệ tì tay, ốp túi khí và bệ trung tâm.',
    },
    {
      src: new URL('../../assets/rs7/design5.avif', import.meta.url).href,
      title: 'Mâm xe thể thao.',
      desc:
        'RS 7 performance trang bị tiêu chuẩn mâm 21 inch hoặc tùy chọn mâm 22 inch 5 chấu chữ Y với ba kiểu hoàn thiện, đi kèm lốp mùa hè 285/30 R22.',
    },
  ];
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setIdx((p) => (p + 1) % slides.length);

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="design-gallery">
        <div className="design-frame">
          <motion.img
            key={idx}
            src={slides[idx].src}
            alt={`Thiết kế ${idx + 1}`}
            initial={{ opacity: 0, y: 8, scale: 1.01 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="design-header">
          <h3>Thiết kế</h3>
          <div className="design-pager">
            <button onClick={prev} aria-label="Trang trước" className="pager-arrow">‹</button>
            {slides.map((_, i) => (
              <button key={i} className={`num ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)}>{i + 1}</button>
            ))}
            <button onClick={next} aria-label="Trang sau" className="pager-arrow">›</button>
          </div>
        </div>
        <div className="design-caption">
          <motion.h4
            key={`title-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            style={{ margin: '0 0 6px', color: '#fff', fontSize: 18 }}
          >
            {slides[idx].title}
          </motion.h4>
          <motion.p
            key={`desc-${idx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            {slides[idx].desc}
          </motion.p>
        </div>
      </div>
    </section>
  );
};

// Audio showcase with circular visualizer
const AudioShowcase = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => setTime((t) => ({ ...t, dur: a.duration || 0 }));
    const onTime = () => setTime({ cur: a.currentTime, dur: a.duration || 0 });
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
    };
  }, []);

  const setup = () => {
    if (ctxRef.current) return;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;
    const src = ctx.createMediaElementSource(audioRef.current!);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = src;
  };

  const draw = () => {
    const canvas = canvasRef.current; const analyser = analyserRef.current; if (!canvas || !analyser) return;
    const g = canvas.getContext('2d'); if (!g) return;
    const w = canvas.width, h = canvas.height; g.clearRect(0,0,w,h);
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    // compute amplitude ~ average
    let sum = 0; for (let i=0;i<data.length;i++) sum += data[i];
    const amp = sum / data.length / 255; // 0..1

    // global time for idle spin
    const t = performance.now() / 1000;
    const baseSpeed = 0.3; // rad/s idle
    const spin = t * (baseSpeed + (playing ? amp * 3.2 : 0.2));
    const scale = playing ? 1.0 + amp * 0.25 : 0.9 + Math.sin(t*0.6)*0.01;

    g.save();
    g.translate(w/2, h/2);
    g.rotate(spin);
    g.scale(scale, scale);

    // ring points
    const radius = Math.min(w,h)*0.28;
    const segments = 48;
    for (let pass=0; pass<4; pass++){
      g.beginPath();
      g.strokeStyle = `rgba(255,255,255,${0.7 - pass*0.15})`;
      g.lineWidth = 1 + pass*0.2;
      for (let i=0;i<=segments;i++){
        const a = (i/segments) * Math.PI*2;
        // slight jitter by freq bins
        const idx = Math.floor((i/segments) * data.length);
        const jitter = (data[idx]/255 - 0.5) * (playing ? 10 : 3) * (1 - pass*0.15);
        const r = radius + jitter + pass*6;
        const x = Math.cos(a)*r; const y = Math.sin(a)*r;
        if (i===0) g.moveTo(x,y); else g.lineTo(x,y);
      }
      g.stroke();
    }
    g.restore();

    rafRef.current = requestAnimationFrame(draw);
  };

  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (playing){ a.pause(); setPlaying(false); if (rafRef.current) cancelAnimationFrame(rafRef.current); }
    else { setup(); a.play(); setPlaying(true); draw(); }
  };

  const fmt = (v:number) => {
    const m = Math.floor(v/60); const s = Math.floor(v%60).toString().padStart(2,'0'); return `${m}:${s}`;
  };

  return (
    <section className="rs7-section rs7-audio">
      <div className="audio-wrap">
        <h2>Khi bạn nghe, bạn sẽ biết.</h2>
        <div className="audio-visual">
          <canvas ref={canvasRef} width={560} height={420} />
        </div>
        <div className="audio-controls">
          <button className="audio-btn" onClick={toggle}>{playing ? 'Tạm dừng' : 'Phát'}</button>
          <div className="time">{fmt(time.cur)} / {fmt(time.dur)}</div>
        </div>
        <audio ref={audioRef} src={new URL('../../assets/rs7/rs7-engine.mp3', import.meta.url).href} preload="auto" />
      </div>
    </section>
  );
};


