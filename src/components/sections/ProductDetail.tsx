// frontend/audi/src/components/sections/ProductDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ProductDetail.css';

// Define interfaces for our data types
interface MauXe {
  id: number;
  idDong: number;
  tenDong: string;
  tenMau: string;
  namSanXuat: number;
  giaCoban: number;
  moTa: string;
  thongSoKyThuat: any; // Will parse from JSON string
  conHang: boolean;
  ngayRaMat: string;
}

interface HinhAnhXe {
  id: number;
  idMauXe: number;
  duongDanAnh: string;
  loaiHinh: string;
  viTri?: number;
}

interface MauSac {
  id: number;
  ten: string;
  maHex: string;
  laMetallic: boolean;
  duongDanAnh: string;
  giaThem: number;
}

const BACKEND_URL = 'http://localhost:8080';
const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+No image</dGV4dD48L3N2Zz4=";

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<MauXe | null>(null);
    const [productImages, setProductImages] = useState<HinhAnhXe[]>([]);
    const [availableColors, setAvailableColors] = useState<MauSac[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('exterior');
    const [selectedColor, setSelectedColor] = useState<MauSac | null>(null);
    const [parsedSpecs, setParsedSpecs] = useState<any>(null);
    const [activeColorTab, setActiveColorTab] = useState(0);
    const [activeInteriorTab, setActiveInteriorTab] = useState(0);
    const [dongXe, setDongXe] = useState<string>('');
    const [thongSoKyThuat, setThongSoKyThuat] = useState<any>(null);
    const [ngoaiThatImages, setNgoaiThatImages] = useState<HinhAnhXe[]>([]);
    const [noiThatImages, setNoiThatImages] = useState<HinhAnhXe[]>([]);
    const [chiTietImages, setChiTietImages] = useState<HinhAnhXe[]>([]);
  
    // Thêm useEffect này để đưa trang về đầu khi mới vào
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
    
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch product details
        const productResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/${id}`);
        setProduct(productResponse.data);

        // Lấy thông tin dòng xe từ product
        setDongXe(productResponse.data.tenDong);

        // Parse technical specifications from JSON string
        if (productResponse.data.thongSoKyThuat) {
          try {
            const specs = typeof productResponse.data.thongSoKyThuat === 'string' 
              ? JSON.parse(productResponse.data.thongSoKyThuat) 
              : productResponse.data.thongSoKyThuat;
            
            setParsedSpecs(specs);
            setThongSoKyThuat(specs);
          } catch (e) {
            console.error('Failed to parse technical specifications:', e);
          }
        }

        // Fetch product images
        const imagesResponse = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`);
        setProductImages(imagesResponse.data);
        
        // Phân loại hình ảnh
        const ngoaiThat = imagesResponse.data.filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that');
        const noiThat = imagesResponse.data.filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that');
        const chiTiet = imagesResponse.data.filter((img: HinhAnhXe) => img.loaiHinh === 'chi_tiet');
        
        setNgoaiThatImages(ngoaiThat);
        setNoiThatImages(noiThat);
        setChiTietImages(chiTiet);

        // Fetch available colors for this model
        const colorsResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-sac/mau-xe/${id}`);
        setAvailableColors(colorsResponse.data);
        
        // Set first color as selected by default if colors exist
        if (colorsResponse.data.length > 0) {
          setSelectedColor(colorsResponse.data[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details. Please try again later.');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Format price with VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get appropriate image URL for display
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return FALLBACK_IMAGE;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      return `${BACKEND_URL}${imagePath}`;
    }
  };

  // Filter images by type (exterior, interior, etc.)
  const getImagesByType = (type: string) => {
    return productImages.filter(img => img.loaiHinh === type);
  };

  // Calculate total price including selected color and options
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let total = product.giaCoban;
    
    // Add color price if a color is selected
    if (selectedColor) {
      total += selectedColor.giaThem;
    }
    
    return total;
  };

  if (isLoading) {
    return (
      <div className="loading-container_details">
        <div className="spinner_details"></div>
        <p>Đang tải thông tin xe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container_details">
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <Link to="/" className="back-button_details">Quay lại trang chủ</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container_details">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Xe bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="back-button_details">Quay lại trang chủ</Link>
      </div>
    );
  }

  // Get featured image for display (first exterior image or first available)
  const featuredImage = 
    ngoaiThatImages.length > 0 ? ngoaiThatImages[0]?.duongDanAnh : 
    productImages.length > 0 ? productImages[0]?.duongDanAnh : 
    FALLBACK_IMAGE;

  return (
    <div className="product-detail-page_details">
      {/* Hero section với tên xe, thông báo và hình ảnh chính */}
      <div className="product-hero_details">
        <div className="container_details">
          <div className="hero-header_details">
            <h1>{product?.namSanXuat} {product?.tenMau}</h1>
            
            {/* Notice box - Sử dụng mô tả từ database */}
            <div className="notice-box_details">
              <h4>Notice</h4>
              <p>{product?.moTa || 'Không có thông tin mô tả.'}</p>
            </div>
          </div>

          <div className="hero-content_details">
            <div className="price-info_details">
              <h3>Base</h3>
              <p>Starting at {formatPrice(product?.giaCoban || 0)}</p>
              
              <div className="model-selector_details">
                <div className="model-option_details selected">
                  <div className="checkbox-container_details">
                    <span className="checkbox-indicator_details"></span>
                  </div>
                  <div className="model-info_details">
                    <h4>{product?.tenMau} {dongXe && `(${dongXe})`}</h4>
                    <p>{formatPrice(product?.giaCoban || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hero-image_details">
              <img 
                src={getImageUrl(featuredImage)} 
                alt={product?.tenMau} 
                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exterior section */}
      <section className="exterior-section_details">
        <div className="container_details">
          <h2>Exterior</h2>
          
          <div className="exterior-image_details">
            <img 
              src={getImageUrl(ngoaiThatImages.length > 0 ? ngoaiThatImages[0]?.duongDanAnh : featuredImage)} 
              alt={`${product?.tenMau} exterior`}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
            />
          </div>
          
          {/* Color selection */}
          <div className="color-selection_details">
            <h3>Exterior colors</h3>
            <div className="color-options_details">
              {availableColors.map((color, index) => (
                <button
                  key={color.id}
                  className={`color-option_details ${selectedColor?.id === color.id ? 'selected' : ''}`}
                  style={{ backgroundColor: color.maHex }}
                  onClick={() => setSelectedColor(color)}
                  title={color.ten}
                >
                  {color.laMetallic && <span className="metallic-indicator_details">★</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interior section */}
      <section className="interior-section_details">
        <div className="container_details">
          <div className="interior-image_details">
            <img 
              src={getImageUrl(noiThatImages.length > 0 ? noiThatImages[0]?.duongDanAnh : '')} 
              alt={`${product?.tenMau} interior`}
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
            />
          </div>

          <div className="interior-options_details">
            <h3>Seats: Black, Dashboard: Black, Carpet: Black, Headliner: Black</h3>
            <div className="interior-color-options_details">
              {/* Placeholder cho nội thất - có thể thay thế bằng dữ liệu thực nếu có */}
              <button className="interior-option_details selected"></button>
              <button className="interior-option_details"></button>
              <button className="interior-option_details"></button>
              <button className="interior-option_details"></button>
              <button className="interior-option_details"></button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Chi tiết kỹ thuật section - Hiển thị thông số kỹ thuật từ DB với format chuẩn */}
      {thongSoKyThuat && (
        <section className="specs-section_details">
          <div className="container_details">
            <h2>Thông số kỹ thuật</h2>
            <div className="specs-grid_details">
              {Object.entries(thongSoKyThuat).map(([key, value]) => {
                // Chuyển đổi key từ dạng "hop_so" thành "Hộp số"
                const formattedKey = key
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
                  .replace(/Hop so/i, 'Hộp số')
                  .replace(/Ma luc/i, 'Mã lực')
                  .replace(/Dong co/i, 'Động cơ')
                  .replace(/Dan dong/i, 'Dẫn động')
                  .replace(/Tang toc/i, 'Tăng tốc');
                
                return (
                  <div key={key} className="spec-item_details">
                    <div className="spec-label_details">{formattedKey}</div>
                    <div className="spec-value_details">{value as React.ReactNode}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Summary section */}
      <section className="summary-section_details">
        <div className="container_details">
          <div className="summary-content_details">
            <div className="model-name_details">
              <h3>{product?.tenMau}</h3>
              <p>{formatPrice(calculateTotalPrice())}</p>
            </div>
            
            <button className="btn-summary_details">Summary</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;