// frontend/audi/src/pages/Models.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../../styles/Models.css';
import VehicleRatingSummary from '../../../components/common/VehicleRatingSummary';
import { cachedFetchJson } from '../../../utils/apiCache';
import {
  DEFAULT_CAR_IMAGE,
  applyImageFallback,
  getVehicleImageUrl,
} from '../../../utils/media';

const BACKEND_URL = 'http://localhost:8080';
const LIST_CACHE_TTL = 5 * 60 * 1000;
const IMAGE_CACHE_TTL = 30 * 60 * 1000;

interface HinhAnhXe {
  id: number;
  idMauXe: number;
  duongDanAnh: string;
  loaiHinh: string;
  viTri?: number;
}

interface AnhDaiDienMauXe {
  idMauXe: number;
  duongDanAnh: string;
}

interface DongXe {
  id: number;
  ten: string;
  moTa: string;
  phanLoai: string;
  duongDanAnh: string;
}

interface MauXe {
  id: number;
  idDong: number;
  tenDong: string;
  tenMau: string;
  namSanXuat: number;
  giaCoban: number;
  moTa: string;
  thongSoKyThuat: string;
  conHang: boolean;
  ngayRaMat: string;
  duongDanAnh?: string;
}

// Từ điển dịch tiếng Việt
const translations = {
  'All models': 'Tất cả mẫu xe',
  'Models': 'Mẫu xe',
  'Body type': 'Kiểu dáng',
  'All': 'Tất cả',
  'Sportback': 'Sportback',
  'SUV': 'SUV',
  'Sedan': 'Sedan',
  'Starting at': 'Bắt đầu từ',
  'Explore': 'Khám phá',
  'Build': 'Tùy chỉnh',
  'Available': 'Có sẵn',
  'Coming Soon': 'Sắp ra mắt',
  'New': 'Mới'
};

const translate = (key: string): string => {
  return translations[key as keyof typeof translations] || key;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

/** Run async work with a small concurrency limit so the API is not flooded. */
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  });

  await Promise.all(runners);
  return results;
}

const ModelsPage: React.FC = () => {
  const [dongXeList, setDongXeList] = useState<DongXe[]>([]);
  const [mauXeMap, setMauXeMap] = useState<Record<number, MauXe[]>>({});
  const [primaryImages, setPrimaryImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    const fetchDongXeAndMauXe = async () => {
      setLoading(true);

      try {
        // Two independent endpoints in parallel. The old code made one request
        // per body type (and then one per model) in sequence.
        const [dongXe, mauXe] = await Promise.all([
          cachedFetchJson<DongXe[]>('dong-xe', LIST_CACHE_TTL, async () => {
            const response = await axios.get(`${BACKEND_URL}/api/v1/dong-xe`);
            return response.data;
          }),
          cachedFetchJson<MauXe[]>('mau-xe:tom-tat', LIST_CACHE_TTL, async () => {
            // Fast path: lightweight projection, no colour/option collections.
            try {
              const response = await axios.get(
                `${BACKEND_URL}/api/v1/mau-xe/danh-sach/tom-tat`,
                { timeout: 15000 }
              );
              if (Array.isArray(response.data) && response.data.length > 0) {
                return response.data as MauXe[];
              }
            } catch {
              // Older backend without the summary endpoint: use the full list.
            }

            const response = await axios.get(`${BACKEND_URL}/api/v1/mau-xe`, {
              timeout: 30000,
            });
            return response.data;
          }),
        ]);

        if (cancelled) return;

        const grouped: Record<number, MauXe[]> = {};
        for (const model of mauXe) {
          if (!grouped[model.idDong]) grouped[model.idDong] = [];
          grouped[model.idDong].push(model);
        }

        setDongXeList(dongXe);
        setMauXeMap(grouped);
        setLoading(false);

        // Render the cards immediately; images stream in afterwards.
        void loadPrimaryImages(mauXe, isCancelled);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        if (!cancelled) setLoading(false);
      }
    };

    fetchDongXeAndMauXe();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPrimaryImages = async (models: MauXe[], isCancelled: () => boolean) => {
    try {
      // New bulk endpoint: one request returns the cover image of every model.
      const list = await cachedFetchJson<AnhDaiDienMauXe[]>(
        'model-cover-images',
        IMAGE_CACHE_TTL,
        async () => {
          const response = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/danh-sach/dai-dien`, {
            timeout: 20000,
          });
          return response.data;
        }
      );

      if (isCancelled()) return;

      const imageMap: Record<number, string> = {};
      for (const item of list || []) {
        if (item?.idMauXe && item?.duongDanAnh) {
          imageMap[item.idMauXe] = item.duongDanAnh;
        }
      }

      // An empty result is suspicious (the backend may still be deploying the
      // endpoint), so use the existing per-model endpoint as a fallback.
      if (Object.keys(imageMap).length > 0) {
        setPrimaryImages(imageMap);
        return;
      }
    } catch {
      // Bulk endpoint not available yet: fall through.
    }

    try {
      const pairs = await mapWithLimit(models, 6, async (model) => {
        try {
          const images = await cachedFetchJson<HinhAnhXe[]>(
            `model-images:${model.id}`,
            IMAGE_CACHE_TTL,
            async () => {
              const response = await axios.get(
                `${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${model.id}`,
                { timeout: 20000 }
              );
              return response.data;
            }
          );

          const exterior = images.find((image) => image.loaiHinh === 'ngoai_that');
          const cover = exterior || images[0];
          return [model.id, cover?.duongDanAnh || ''] as const;
        } catch {
          return [model.id, ''] as const;
        }
      });

      if (isCancelled()) return;

      const imageMap: Record<number, string> = {};
      for (const [id, path] of pairs) {
        if (path) imageMap[id] = path;
      }
      setPrimaryImages(imageMap);
    } catch (error) {
      console.error('Không thể tải ảnh xe:', error);
    }
  };

  const bodyTypeFilters = useMemo(
    () => Array.from(new Set(dongXeList.map((item) => item.phanLoai))).filter(Boolean),
    [dongXeList]
  );

  const filteredData = useMemo(() => {
    if (selectedModel) return dongXeList.filter((dongXe) => dongXe.ten === selectedModel);
    if (selectedBodyType) return dongXeList.filter((dongXe) => dongXe.phanLoai === selectedBodyType);
    return dongXeList;
  }, [dongXeList, selectedModel, selectedBodyType]);

  // Hàm lấy url ảnh giống FeaturedProducts
  const getProductImageUrl = (productId: number): string => {
    const path = primaryImages[productId];
    return path ? getVehicleImageUrl(path) : DEFAULT_CAR_IMAGE;
  };

  // Hàm xử lý click filter
  const handleModelFilter = (model: string | null) => {
    setSelectedModel(selectedModel === model ? null : model);
    setSelectedBodyType(null);

    setTimeout(() => {
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleBodyTypeFilter = (bodyType: string | null) => {
    setSelectedBodyType(selectedBodyType === bodyType ? null : bodyType);
    setSelectedModel(null);

    setTimeout(() => {
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Kiểm tra trạng thái xe
  const getCarStatus = (mauXe: MauXe): string => {
    if (!mauXe.conHang) return translate('Coming Soon');
    const currentYear = new Date().getFullYear();
    if (mauXe.namSanXuat === currentYear) return translate('New');
    return translate('Available');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="models-container">
      {/* Sidebar filter */}
      <aside className="models-sidebar">
        <h3>{translate('All models')}</h3>

        {/* Models Filter */}
        <div className="filter-section">
          <div className="filter-title">{translate('Models')}</div>
          <div className="filter-grid">
            {dongXeList.map(dongXe => {
              // Nếu đã chọn body type, chỉ các model thuộc body type đó sáng
              const isDisabled = selectedBodyType && dongXe.phanLoai !== selectedBodyType;
              const isActive = selectedModel === dongXe.ten;
              return (
                <button
                  key={dongXe.id}
                  className={`filter-button${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
                  onClick={() => handleModelFilter(dongXe.ten)}
                  disabled={!!isDisabled}
                >
                  {dongXe.ten}
                </button>
              );
            })}
            <button
              className={`filter-button${!selectedModel ? ' active' : ''}`}
              onClick={() => handleModelFilter(null)}
            >
              {translate('All')}
            </button>
          </div>
        </div>

        {/* Body Type Filter */}
        <div className="filter-section">
          <div className="filter-title">{translate('Body type')}</div>
          <div className="filter-grid">
            {bodyTypeFilters.map(type => {
              // Nếu đã chọn model, chỉ body type của model đó sáng
              let isDisabled = false;
              if (selectedModel) {
                const selectedDongXe = dongXeList.find(d => d.ten === selectedModel);
                isDisabled = selectedDongXe ? selectedDongXe.phanLoai !== type : false;
              }
              const isActive = selectedBodyType === type;
              return (
                <button
                  key={type}
                  className={`filter-button${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`}
                  onClick={() => handleBodyTypeFilter(type)}
                  disabled={!!isDisabled}
                >
                  {translate(type)}
                </button>
              );
            })}
            <button
              className={`filter-button${!selectedBodyType ? ' active' : ''}`}
              onClick={() => handleBodyTypeFilter(null)}
            >
              {translate('All')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="models-main" ref={mainRef}>
        {filteredData.map(dongXe => (
          <section key={dongXe.id} className="models-section">
            <h2 className="section-title">{dongXe.ten}</h2>
            <div className="models-grid">
              {(mauXeMap[dongXe.id] || []).map((mauXe, index) => {
                const status = getCarStatus(mauXe);
                return (
                  <div key={mauXe.id} className="car-card" style={{
                    animationDelay: `${index * 0.08}s`
                  }}>
                    <div className="car-image-container">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={getProductImageUrl(mauXe.id)}
                        alt={mauXe.tenMau}
                        className="car-image"
                        onError={(e) => applyImageFallback(e, DEFAULT_CAR_IMAGE)}
                      />
                      {status === translate('New') && (
                        <div className="car-badge">{status}</div>
                      )}
                    </div>

                    <div className="car-content">
                      <div className="car-title">{mauXe.tenMau}</div>
                      <div className="car-price">
                        {translate('Starting at')} {formatPrice(mauXe.giaCoban)} VNĐ
                      </div>

                      {/* Vehicle Rating Summary (lazy: only loads when visible) */}
                      <div className="car-rating">
                        <VehicleRatingSummary
                          mauXeId={mauXe.id}
                          showCount={true}
                          size="large"
                        />
                      </div>

                      <div className="car-buttons">
                        <Link to={`/product/${mauXe.id}`} className="models-btn-primary">
                          {translate('Explore')}
                        </Link>
                        <Link to={`/configure/${mauXe.id}`} className="models-btn-secondary">
                          {translate('Build')}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Thêm placeholder nếu không đủ 3 xe */}
              {(() => {
                const cars = mauXeMap[dongXe.id] || [];
                const placeholders = (3 - (cars.length % 3)) % 3;
                return Array.from({ length: placeholders }).map((_, idx) => (
                  <div className="card-placeholder" key={`placeholder-${idx}`}></div>
                ));
              })()}
            </div>
          </section>
        ))}

        {filteredData.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#666',
            fontSize: '1.2rem'
          }}>
            Không tìm thấy mẫu xe nào phù hợp với bộ lọc của bạn.
          </div>
        )}
      </main>
    </div>
  );
};

export default ModelsPage;
