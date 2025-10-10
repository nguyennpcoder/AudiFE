import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
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
      <FeaturesPager />
      <TechnologyPager />
      <DriverAssistPager />
      <ShopSection />
      <SimilarModels />
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

// Audio showcase with Three.js 3D bass‑reactive torus visualizer
const AudioShowcase = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  // three.js refs
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const barsRef = useRef<any>(null);
  const glowBarsRef = useRef<any>(null);
  const clockRef = useRef<any>(null);

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
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.86;
    const src = ctx.createMediaElementSource(audioRef.current!);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = src;
  };

  const initThree = () => {
    if (!mountRef.current || rendererRef.current) return;
    const mount = mountRef.current;
    const renderer = new (THREE as any).WebGLRenderer({ antialias: true, alpha: true });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = (THREE as any).ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mount.appendChild(renderer.domElement);

    const scene = new (THREE as any).Scene();
    const camera = new (THREE as any).PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.22, 2.2);
    scene.add(camera);

    // lights
    const ambient = new (THREE as any).AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new (THREE as any).DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 4, 2);
    scene.add(dir);

    // instanced bars around a torus path
    const bars = 320;
    const geom = new (THREE as any).BoxGeometry(0.012, 0.012, 0.24);
    const mat = new (THREE as any).MeshStandardMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.35, emissive: new (THREE as any).Color('#ffffff'), emissiveIntensity: 0.06 });
    (mat as any).vertexColors = true;
    const inst = new (THREE as any).InstancedMesh(geom, mat, bars);
    inst.instanceMatrix.setUsage((THREE as any).DynamicDrawUsage);
    inst.instanceColor = new (THREE as any).InstancedBufferAttribute(new Float32Array(bars*3), 3);
    scene.add(inst);

    // soft glow duplicate with additive blending
    const glowMat = new (THREE as any).MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, blending: (THREE as any).AdditiveBlending, depthWrite: false });
    const glowInst = new (THREE as any).InstancedMesh(geom.clone(), glowMat, bars);
    glowInst.instanceMatrix.setUsage((THREE as any).DynamicDrawUsage);
    scene.add(glowInst);

    // ring path
    const radius = 0.78;
    const matrix = new (THREE as any).Matrix4();
    const pos = new (THREE as any).Vector3();
    const quat = new (THREE as any).Quaternion();
    const scale = new (THREE as any).Vector3();
    for (let i=0;i<bars;i++){
      const a = (i/bars) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius * 0.26; // more subtle tilt
      const z = 0;
      pos.set(x,y,z);
      const up = new (THREE as any).Vector3(0,0,1);
      const dirVec = new (THREE as any).Vector3(x, y, 0).normalize();
      const tangent = new (THREE as any).Vector3(-Math.sin(a), Math.cos(a), 0).normalize();
      const normal = up.clone().cross(tangent).normalize();
      const look = new (THREE as any).Matrix4().lookAt(new (THREE as any).Vector3(0,0,0), tangent, normal);
      quat.setFromRotationMatrix(look);
      scale.set(1, 1, 1);
      matrix.compose(pos, quat, scale);
      inst.setMatrixAt(i, matrix);
      glowInst.setMatrixAt(i, matrix);
      // set gradient color per angle (Audi red to white)
      const hue = 0.0 + 0.02 * Math.sin(a * 2.0); // slight play around red
      const col = new (THREE as any).Color().setHSL(hue, 0.85, 0.6);
      inst.setColorAt(i, col);
    }
    inst.instanceMatrix.needsUpdate = true;
    glowInst.instanceMatrix.needsUpdate = true;

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    barsRef.current = inst;
    glowBarsRef.current = glowInst;
    clockRef.current = new (THREE as any).Clock();

    const resize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(260, rect.height || rect.width * 0.75);
      rendererRef.current.setSize(width, height, false);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    (renderer as any)._rsz = ro;
  };

  const draw = () => {
    const renderer = rendererRef.current; const scene = sceneRef.current; const camera = cameraRef.current; const inst = barsRef.current; const analyser = analyserRef.current; if (!renderer || !scene || !camera || !inst || !analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // compute averages
    const bassEnd = Math.max(4, Math.floor(data.length*0.08));
    const midsEnd = Math.max(bassEnd+1, Math.floor(data.length*0.35));
    const mean = (s:number,e:number) => {
      let sum=0; for (let i=s;i<e;i++) sum += data[i]; return (sum / Math.max(1,e-s))/255;
    };
    const bass = mean(0,bassEnd);
    const mids = mean(bassEnd,midsEnd);
    const highs = mean(midsEnd,data.length);

    const t = clockRef.current ? clockRef.current.getElapsedTime() : performance.now()/1000;
    const mat = inst.material as any;
    mat.emissiveIntensity = 0.18 + bass*0.55 + highs*0.18;

    const tmp = new (THREE as any).Matrix4();
    const pos = new (THREE as any).Vector3();
    const quat = new (THREE as any).Quaternion();
    const scl = new (THREE as any).Vector3();
    for (let i=0;i<inst.count;i++){
      inst.getMatrixAt(i, tmp);
      tmp.decompose(pos, quat, scl);
      const idx = Math.floor((i/inst.count) * data.length);
      const v = data[idx]/255;
      const height = 0.22 + (v*0.8 + bass*0.7 + mids*0.25) * 0.85; // Z scale
      scl.set(0.9 + highs*0.08, 0.9 + highs*0.08, height);
      const qSpin = new (THREE as any).Quaternion().setFromAxisAngle(new (THREE as any).Vector3(0,0,1), Math.sin(t*0.4 + i*0.02) * 0.015);
      quat.multiply(qSpin);
      tmp.compose(pos, quat, scl);
      inst.setMatrixAt(i, tmp);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (glowBarsRef.current){
      const gtmp = new (THREE as any).Matrix4();
      const gpos = new (THREE as any).Vector3();
      const gquat = new (THREE as any).Quaternion();
      const gscl = new (THREE as any).Vector3();
      for (let i=0;i<inst.count;i++){
        inst.getMatrixAt(i, gtmp);
        gtmp.decompose(gpos, gquat, gscl);
        const idx = Math.floor((i/inst.count) * data.length);
        const v = data[idx]/255;
        const height = 0.24 + (v*0.9 + bass*0.7 + mids*0.3) * 1.0;
        gscl.set((0.98 + highs*0.06), (0.98 + highs*0.06), height*1.06);
        gtmp.compose(gpos, gquat, gscl);
        glowBarsRef.current.setMatrixAt(i, gtmp);
      }
      glowBarsRef.current.instanceMatrix.needsUpdate = true;
    }

    camera.position.x = Math.sin(t*0.2) * 0.08;
    camera.position.y = 0.24 + Math.sin(t*0.3) * 0.02 + bass*0.04;
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
    rafRef.current = requestAnimationFrame(draw);
  };

  const toggle = async () => {
    const a = audioRef.current; if (!a) return;
    if (playing){
      a.pause();
      setPlaying(false);
      if (rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    } else {
      setup();
      initThree();
      if (ctxRef.current && ctxRef.current.state === 'suspended'){
        try { await ctxRef.current.resume(); } catch {}
      }
      try { await a.play(); } catch {}
      setPlaying(true);
      if (!rafRef.current) draw();
    }
  };

  // full cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current){ cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      const a = audioRef.current;
      try { if (a) a.pause(); } catch {}
      try {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (ctxRef.current && ctxRef.current.state !== 'closed') ctxRef.current.close();
      } catch {}

      if (rendererRef.current){
        const inst = barsRef.current;
        const ginst = glowBarsRef.current;
        if (inst){
          try { inst.geometry.dispose(); } catch {}
          try { (inst.material as any).dispose(); } catch {}
        }
        if (ginst){
          try { ginst.geometry.dispose(); } catch {}
          try { (ginst.material as any).dispose(); } catch {}
        }
        try { rendererRef.current.dispose(); } catch {}
        const ro: ResizeObserver | undefined = (rendererRef.current as any)._rsz;
        if (ro && mountRef.current){ try { ro.unobserve(mountRef.current); } catch {} }
        if (rendererRef.current.domElement.parentNode){
          try { rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement); } catch {}
        }
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      barsRef.current = null;
      glowBarsRef.current = null;
      clockRef.current = null;
    };
  }, []);

  const fmt = (v:number) => {
    const m = Math.floor(v/60); const s = Math.floor(v%60).toString().padStart(2,'0'); return `${m}:${s}`;
  };

  return (
    <section className="rs7-section rs7-audio">
      <div className="audio-wrap">
        <h2>Khi bạn nghe, bạn sẽ biết.</h2>
        <div className="audio-visual">
          <div ref={mountRef} style={{ width: '100%', maxWidth: 680, aspectRatio: '16 / 10' }} />
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



// Pager images only (VN)
const FeaturesPager = () => {
  const slides = [
    { src: new URL('../../assets/rs7/feat1.avif', import.meta.url).href, title: 'Sức mạnh V8.', desc: 'Động cơ 4.0L V8 twin‑turbo cho công suất 621 HP, tăng tốc 0–60 mph trong 3,3 giây.' },
    { src: new URL('../../assets/rs7/feat2.avif', import.meta.url).href, title: 'Hệ treo khí nén RS tinh chỉnh.', desc: 'Độ êm ái và khả năng kiểm soát được hiệu chỉnh riêng cho RS 7 performance.' },
    { src: new URL('../../assets/rs7/feat3.avif', import.meta.url).href, title: 'Vi sai sau thể thao.', desc: 'Phân bổ mô‑men giữa hai bánh sau, tăng độ bám và sự linh hoạt khi vào cua.' },
    { src: new URL('../../assets/rs7/feat4.avif', import.meta.url).href, title: 'Nghe hiệu năng.', desc: 'Cách âm giảm để mang lại trải nghiệm âm thanh động cơ phấn khích hơn.' },
    { src: new URL('../../assets/rs7/feat5.avif', import.meta.url).href, title: 'Ống xả RS.', desc: 'Tùy chọn ống xả RS với chụp đen, âm thanh đậm chất Audi.' },
  ];
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setIdx((p) => (p + 1) % slides.length);

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="design-gallery">
        <div className="design-frame">
          <motion.img
            key={`feat-${idx}`}
            src={slides[idx].src}
            alt={`Tính năng ${idx + 1}`}
            initial={{ opacity: 0, y: 8, scale: 1.01 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="design-header">
          <h3>{slides[idx].title}</h3>
          <div className="design-pager">
            <button onClick={prev} aria-label="Trang trước" className="pager-arrow">‹</button>
            {slides.map((_, i) => (
              <button key={i} className={`num ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)}>{i + 1}</button>
            ))}
            <button onClick={next} aria-label="Trang sau" className="pager-arrow">›</button>
          </div>
        </div>
        <div className="design-caption">
          <motion.p
            key={`feat-desc-${idx}`}
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

// Technology pager (VN)
const TechnologyPager = () => {
  const slides = [
    { src: new URL('../../assets/rs7/technology1.avif', import.meta.url).href, title: 'Audi virtual cockpit plus.', desc: 'Cụm đồng hồ kỹ thuật số 12,3" hiển thị sắc nét, tuỳ biến theo chế độ RS mới.' },
    { src: new URL('../../assets/rs7/technology2.avif', import.meta.url).href, title: 'Kết nối như smartphone.', desc: 'Apple CarPlay/Android Auto không dây giúp truy cập nhạc, bản đồ, tin nhắn…' },
    { src: new URL('../../assets/rs7/technology3.avif', import.meta.url).href, title: 'Âm thanh Bang & Olufsen.', desc: 'Hệ thống 3D với nhiều loa bố trí chiến lược cùng bộ xử lý âm thanh tiên tiến.' },
    { src: new URL('../../assets/rs7/technology4.avif', import.meta.url).href, title: 'Audi connect CARE.', desc: 'Tính năng an toàn, dịch vụ từ xa và bảo mật tích hợp giúp bạn yên tâm hơn.' },
    { src: new URL('../../assets/rs7/technology5.avif', import.meta.url).href, title: 'Head‑up display.', desc: 'Hiển thị thông tin quan trọng trên kính lái, bổ sung chế độ RS chuyên biệt.' },
  ];
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setIdx((p) => (p + 1) % slides.length);

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="design-gallery">
       
        <div className="design-frame">
          <motion.img
            key={`tech-${idx}`}
            src={slides[idx].src}
            alt={`Công nghệ ${idx + 1}`}
            initial={{ opacity: 0, y: 8, scale: 1.01 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="design-header">
          <h3>Công nghệ</h3>
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
            key={`tech-title-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            style={{ margin: '0 0 6px', color: '#fff', fontSize: 18 }}
          >
            {slides[idx].title}
          </motion.h4>
          <motion.p
            key={`tech-desc-${idx}`}
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

// Driver Assistance pager (VN)
const DriverAssistPager = () => {
  const slides = [
    { src: new URL('../../assets/rs7/drive1.avif', import.meta.url).href, title: 'Hệ thống camera toàn cảnh.', desc: 'Phóng to/thu nhỏ Virtual 360, chuyển góc nhìn 3D ngay từ ghế lái.' },
    { src: new URL('../../assets/rs7/drive2.avif', import.meta.url).href, title: 'Hỗ trợ đỗ xe từ xa plus.', desc: 'Tự động đưa xe vào/ra chỗ đỗ vuông góc hoặc song song, thao tác từ điện thoại.' },
    { src: new URL('../../assets/rs7/drive3.avif', import.meta.url).href, title: 'Ga tự động thích ứng kèm giữ làn.', desc: 'Duy trì khoảng cách, giữ xe ở trung tâm làn nhờ nhận biết tay lái.' },
    { src: new URL('../../assets/rs7/drive4.avif', import.meta.url).href, title: 'Cảnh báo chệch làn.', desc: 'Cảnh báo bằng hình ảnh và âm thanh khi xe lệch khỏi làn dự định.' },
    { src: new URL('../../assets/rs7/drive5.avif', import.meta.url).href, title: 'Hỗ trợ quan sát ban đêm.', desc: 'Camera nhiệt phát hiện người đi bộ/động vật lớn và hiển thị lên bảng đồng hồ.' },
  ];
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setIdx((p) => (p + 1) % slides.length);

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="design-gallery">
        <div className="design-frame">
          <motion.img
            key={`assist-${idx}`}
            src={slides[idx].src}
            alt={`Hỗ trợ người lái ${idx + 1}`}
            initial={{ opacity: 0, y: 8, scale: 1.01 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="design-header">
          <h3>Hỗ trợ người lái</h3>
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
            key={`assist-title-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            style={{ margin: '0 0 6px', color: '#fff', fontSize: 18 }}
          >
            {slides[idx].title}
          </motion.h4>
          <motion.p
            key={`assist-desc-${idx}`}
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

// Shop section (VN)
const ShopSection = () => {
  const items = [
    { title: 'Cấu hình & Báo giá', href: '#', icon: '🚗' },
    { title: 'Xem ưu đãi', href: '#', icon: '💸' },
    { title: 'Tìm xe có sẵn', href: '#', icon: '🛒' },
    { title: 'Liên hệ đại lý', href: '#', icon: '📞' },
    { title: 'Nhận tin Audi', href: '#', icon: '📰' },
    { title: 'Xem video hướng dẫn', href: '#', icon: '🎬' },
  ];

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="shop-head">
        <h2 style={{ color:'#fff', marginTop:0, marginBottom:18 }}>Mua sắm RS 7 performance</h2>
      </div>
      <div className="shop-grid">
        {items.map((it) => (
          <a key={it.title} className="shop-card" href={it.href}>
            <span className="shop-icon" aria-hidden>{it.icon}</span>
            <span className="shop-title">{it.title}</span>
            <span className="shop-arrow">›</span>
          </a>
        ))}
      </div>
    </section>
  );
};

// Similar models section
const SimilarModels = () => {
  const items = [
    {
      src: new URL('../../assets/rs7/similar1.avif', import.meta.url).href,
      tagline: 'Biểu tượng. Nâng tầm.',
      name: 'Audi RS 6 Avant performance',
      cta: 'Khám phá RS 6 Avant performance',
      href: '#',
    },
    {
      src: new URL('../../assets/rs7/similar2.avif', import.meta.url).href,
      tagline: 'Vượt trội. Linh hoạt.',
      name: 'Audi RS Q8 performance',
      cta: 'Khám phá RS Q8 performance',
      href: '#',
    },
    {
      src: new URL('../../assets/rs7/similar3.avif', import.meta.url).href,
      tagline: 'Công suất tối đa. Hiệu năng tối đa.',
      name: 'Audi RS e‑tron GT performance',
      cta: 'Khám phá RS e‑tron GT performance',
      href: '#',
    },
  ];

  return (
    <section className="rs7-section rs7-section-wide">
      <div className="shop-head">
        <h2 style={{ color:'#fff', marginTop:0, marginBottom:18 }}>Khám phá các mẫu tương tự</h2>
      </div>
      <div className="similar-grid">
        {items.map((it) => (
          <a key={it.name} className="similar-card" href={it.href}>
            <img src={it.src} alt={it.name} />
            <div className="similar-overlay" />
            <div className="similar-caption">
              <div className="tagline">{it.tagline}</div>
              <div className="name">{it.name}</div>
              <div className="cta">{it.cta} <span>›</span></div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
