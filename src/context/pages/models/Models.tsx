// frontend/audi/src/pages/Models.tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../../../styles/Models.css';
const BACKEND_URL = 'http://localhost:8080';
import rs7Image from '../../../assets/rs7.jpeg'; // Đường dẫn đúng với project bạn

const FALLBACK_IMAGE = rs7Image;

interface HinhAnhXe {
  id: number;
  idMauXe: number;
  duongDanAnh: string;
  loaiHinh: string;
  viTri?: number;
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
  duongDanAnh?: string; // Thêm nếu có ảnh
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

// Hàm format giá tiền
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

// Hàm animation cho cards
const useCardAnimation = (isVisible: boolean) => {
  const [animationClass, setAnimationClass] = useState('');
  
  useEffect(() => {
    if (isVisible) {
      setAnimationClass('car-card');
    }
  }, [isVisible]);
  
  return animationClass;
};

const ModelsPage: React.FC = () => {
  const [dongXeList, setDongXeList] = useState<DongXe[]>([]);
  const [mauXeMap, setMauXeMap] = useState<Record<number, MauXe[]>>({});
  const [loading, setLoading] = useState(true);
  const [productImagesMap, setProductImagesMap] = useState<Record<number, HinhAnhXe[]>>({});
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const [bodyTypeFilters, setBodyTypeFilters] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<DongXe[]>([]);
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDongXeAndMauXe = async () => {
      setLoading(true);
      try {
        const dongXeRes = await axios.get(`${BACKEND_URL}/api/v1/dong-xe`);
        setDongXeList(dongXeRes.data);
        setFilteredData(dongXeRes.data);

        // Lấy các giá trị phan_loai duy nhất
        const uniqueBodyTypes = Array.from(new Set(dongXeRes.data.map((item: DongXe) => item.phanLoai))) as string[];
        setBodyTypeFilters(uniqueBodyTypes);

        const mauXeMapTemp: Record<number, MauXe[]> = {};
        const imagesMap: Record<number, HinhAnhXe[]> = {};

        for (const dongXe of dongXeRes.data) {
          const mauXeRes = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/dong-xe/${dongXe.id}`);
          const mauXeList = mauXeRes.data;

          // Lấy ảnh cho từng mẫu xe (dùng API giống FeaturedProducts)
          await Promise.all(
            mauXeList.map(async (mauXe: MauXe) => {
              try {
                const imgRes = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${mauXe.id}`);
                imagesMap[mauXe.id] = imgRes.data || [];
              } catch {
                imagesMap[mauXe.id] = [];
              }
            })
          );

          mauXeMapTemp[dongXe.id] = mauXeList;
        }
        setMauXeMap(mauXeMapTemp);
        setProductImagesMap(imagesMap);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      }
      setLoading(false);
    };
    fetchDongXeAndMauXe();
  }, []);

  // Effect để xử lý filter với animation
  useEffect(() => {
    setIsFilterAnimating(true);
    
    const timer = setTimeout(() => {
      const filtered = dongXeList.filter(dongXe => {
        if (selectedModel) return dongXe.ten === selectedModel;
        if (selectedBodyType) return dongXe.phanLoai === selectedBodyType;
        return true;
      });
      setFilteredData(filtered);
      setIsFilterAnimating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedModel, selectedBodyType, dongXeList]);

  // Hàm lấy url ảnh giống FeaturedProducts
  const getProductImageUrl = (productId: number): string => {
    try {
      const productImages = productImagesMap[productId];
      if (productImages && productImages.length > 0) {
        const exteriorImages = productImages.filter(img => img.loaiHinh === 'ngoai_that');
        const targetImage = exteriorImages.length > 0 ? exteriorImages[0] : productImages[0];
        if (targetImage && targetImage.duongDanAnh) {
          return `${BACKEND_URL}${targetImage.duongDanAnh}`;
        }
      }
      return FALLBACK_IMAGE;
    } catch {
      return FALLBACK_IMAGE;
    }
  };

  // Hàm xử lý click filter
  const handleModelFilter = (model: string | null) => {
    setSelectedModel(selectedModel === model ? null : model);
    setSelectedBodyType(null);

    // Scroll lên đầu phần main
    setTimeout(() => {
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // delay nhỏ để đảm bảo render xong
  };

  const handleBodyTypeFilter = (bodyType: string | null) => {
    setSelectedBodyType(selectedBodyType === bodyType ? null : bodyType);
    setSelectedModel(null);

    // Scroll lên đầu phần main
    setTimeout(() => {
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
                // Tìm model đã chọn
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
        {isFilterAnimating && (
          <div className="loading-container" style={{ minHeight: '200px' }}>
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {!isFilterAnimating && filteredData.map(dongXe => (
          <section key={dongXe.id} className="models-section">
            <h2 className="section-title">{dongXe.ten}</h2>
            <div className="models-grid">
              {(mauXeMap[dongXe.id] || []).map((mauXe, index) => {
                const status = getCarStatus(mauXe);
                return (
                  <div key={mauXe.id} className="car-card" style={{
                    animationDelay: `${index * 0.1}s`
                  }}>
                    <div className="car-image-container">
                      <img
                        src={getProductImageUrl(mauXe.id)}
                        alt={mauXe.tenMau}
                        className="car-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                      {status === translate('New') && (
                        <div className="car-badge">{status}</div>
                      )}
                    </div>
                    
                    <div className="car-content">
                      <div className="car-title">{mauXe.tenMau}</div>
                      {/* <div className="car-subtitle">{dongXe.ten}</div> */}
                      <div className="car-price">
                        {translate('Starting at')} {formatPrice(mauXe.giaCoban)} VNĐ
                      </div>
                      
                      <div className="car-buttons">
                        <button className="models-btn-primary">
                          {translate('Explore')}
                        </button>
                        <button className="models-btn-secondary">
                          {translate('Build')}
                        </button>
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
        
        {!isFilterAnimating && filteredData.length === 0 && (
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