// frontend/audi/src/components/sections/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
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

// Define interface for interior options
interface NoiThatOption {
  id: number;
  ten: string;
  mauSac: string; // Hex color
  duongDanAnh: string;
}

// Update SimilarModel interface
interface SimilarModel {
  id: number;
  tenMau: string;
  tenDong: string;
  giaCoban: number;
  selected?: boolean;
}

// const BACKEND_URL = 'https://audivn.onrender.com';
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
  const [selectedInteriorOption, setSelectedInteriorOption] = useState<number>(0);
  const [parsedSpecs, setParsedSpecs] = useState<any>(null);
  const [activeColorTab, setActiveColorTab] = useState(0);
  const [activeInteriorTab, setActiveInteriorTab] = useState(0);
  const [dongXe, setDongXe] = useState<string>('');
  const [thongSoKyThuat, setThongSoKyThuat] = useState<any>(null);
  const [ngoaiThatImages, setNgoaiThatImages] = useState<HinhAnhXe[]>([]);
  const [noiThatImages, setNoiThatImages] = useState<HinhAnhXe[]>([]);
  const [chiTietImages, setChiTietImages] = useState<HinhAnhXe[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  // Add state for similar models and selected model
  const [similarModels, setSimilarModels] = useState<SimilarModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [showMagnifier, setShowMagnifier] = useState<boolean>(false);
  const [magnifierPosition, setMagnifierPosition] = useState({
    x: 0,
    y: 0,
    backgroundX: 0,
    backgroundY: 0
  });
  // Thêm state mới để quản lý hướng chuyển ảnh
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  // Thay đổi state để quản lý vị trí của slideshow
  const [slidePosition, setSlidePosition] = useState(0);
  // Replace the single fadeState with separate states for exterior and interior
  const [exteriorFadeState, setExteriorFadeState] = useState<'fade-in' | 'fade-out' | null>('fade-in');
  const [interiorFadeState, setInteriorFadeState] = useState<'fade-in' | 'fade-out' | null>('fade-in');
  
  // Add slide direction states
  const [exteriorSlideDirection, setExteriorSlideDirection] = useState<'slide-left' | 'slide-right' | null>(null);
  const [interiorSlideDirection, setInteriorSlideDirection] = useState<'slide-left' | 'slide-right' | null>(null);
  
  // Predefined interior options (since we don't have an API for these)
  const interiorOptions: NoiThatOption[] = [
    { id: 1, ten: 'Black', mauSac: '#1e1e1e', duongDanAnh: '' },
    { id: 2, ten: 'Brown', mauSac: '#4d3629', duongDanAnh: '' },
    { id: 3, ten: 'Gray', mauSac: '#3a3a3a', duongDanAnh: '' },
    { id: 4, ten: 'Dark Gray', mauSac: '#2a2a2a', duongDanAnh: '' },
    { id: 5, ten: 'Red', mauSac: '#6b2b2b', duongDanAnh: '' },
  ];

  // Đưa trang về đầu khi mới vào
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
        setSelectedModelId(parseInt(id as string));

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
        const imagesData = imagesResponse.data;
        setProductImages(imagesData);
        
        // Phân loại và sắp xếp hình ảnh theo vị trí
        const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
          if (!a.viTri) return 1;
          if (!b.viTri) return -1;
          return a.viTri - b.viTri;
        };
        
        const ngoaiThat = imagesData
          .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
          .sort(sortByPosition);
          
        const noiThat = imagesData
          .filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that')
          .sort(sortByPosition);
          
        const chiTiet = imagesData
          .filter((img: HinhAnhXe) => img.loaiHinh === 'chi_tiet')
          .sort(sortByPosition);
        
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

        // Fetch similar car models (from same series)
        if (productResponse.data.idDong) {
          try {
            const similarModelsResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/dong-xe/${productResponse.data.idDong}`);
            
            // Map models with selected status
            const mappedModels = similarModelsResponse.data.map((model: any) => ({
              id: model.id,
              tenMau: model.tenMau,
              tenDong: model.tenDong || productResponse.data.tenDong,
              giaCoban: model.giaCoban,
              selected: model.id == id
            }));
            
            setSimilarModels(mappedModels);
          } catch(e) {
            console.error('Failed to fetch similar models:', e);
          }
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

  useEffect(() => {
    const loadImagesAsBase64 = async () => {
      if (productImages.length > 0) {
        const newImageCache: Record<string, string> = {};
        
        // Process exterior images
        for (const img of ngoaiThatImages) {
          if (img.duongDanAnh) {
            newImageCache[img.duongDanAnh] = await fetchImageAsBase64(img.duongDanAnh) as string;
          }
        }
        
        // Process interior images
        for (const img of noiThatImages) {
          if (img.duongDanAnh) {
            newImageCache[img.duongDanAnh] = await fetchImageAsBase64(img.duongDanAnh) as string;
          }
        }
        
        // Process detail images
        for (const img of chiTietImages) {
          if (img.duongDanAnh) {
            newImageCache[img.duongDanAnh] = await fetchImageAsBase64(img.duongDanAnh) as string;
          }
        }
        
        setImageCache(newImageCache);
      }
    };
    
    if (productImages.length > 0) {
      loadImagesAsBase64();
    }
  }, [ngoaiThatImages, noiThatImages, chiTietImages]);

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
    
    // Log to debug
    console.log('Original image path:', imagePath);
    
    // Handle local asset paths that start with /src/assets
    if (imagePath.startsWith('/src/assets/')) {
      // For local assets in the src directory, use direct import
      const assetName = imagePath.split('/').pop();
      console.log('Local asset detected:', assetName);
      
      // Use a hardcoded import from assets folder
      try {
        // We'll use a dynamic import approach but with specific mappings
        if (assetName === 'audi-q4.jpg') return '/src/assets/audi-q4.jpg';
        if (assetName === 'rs7.jpeg') return '/src/assets/rs7.jpeg';
        if (assetName === 'audi-r8.jpg') return '/src/assets/audi-r8.jpg';
        if (assetName === 'audi-a7.jpg') return '/src/assets/audi-a7.jpg';
        if (assetName === 'audi-rs5.jpg') return '/src/assets/audi-rs5.jpg';
        if (assetName === 'rs-etron-gt.jpg') return '/src/assets/rs-etron-gt.jpg';
        
        // Add more mappings as needed
        
        // If no match is found, return the original path
        return imagePath;
      } catch (e) {
        console.error('Error loading local asset:', e);
        return FALLBACK_IMAGE;
      }
    }
    
    // Handle regular URLs
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else if (imagePath.startsWith('/')) {
      console.log('Using backend URL with provided path:', `${BACKEND_URL}${imagePath}`);
      return `${BACKEND_URL}${imagePath}`;
    } else {
      console.log('Using backend URL with added slash:', `${BACKEND_URL}/${imagePath}`);
      return `${BACKEND_URL}/${imagePath}`;
    }
  };

  // Add Base64 image conversion function similar to what's in ProductManagement.tsx
  const fetchImageAsBase64 = async (url: string) => {
    if (!url) return FALLBACK_IMAGE;
    
    try {
      const response = await fetch(url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`, {
        method: 'GET',
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to fetch image:", e);
      return FALLBACK_IMAGE;
    }
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

  // Enhanced nextExteriorImage function
  const nextExteriorImage = () => {
    if (ngoaiThatImages.length <= 1) return;
    
    setExteriorFadeState('fade-out');
    setExteriorSlideDirection('slide-left');
    
    setTimeout(() => {
      const newIndex = currentImageIndex < ngoaiThatImages.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentImageIndex(newIndex);
      setExteriorFadeState('fade-in');
    }, 400);
  };

  // Enhanced prevExteriorImage function
  const prevExteriorImage = () => {
    if (ngoaiThatImages.length <= 1) return;
    
    setExteriorFadeState('fade-out');
    setExteriorSlideDirection('slide-right');
    
    setTimeout(() => {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : ngoaiThatImages.length - 1;
      setCurrentImageIndex(newIndex);
      setExteriorFadeState('fade-in');
    }, 400);
  };

  // Enhanced nextInteriorImage function
  const nextInteriorImage = () => {
    if (noiThatImages.length <= 1) return;
    
    setInteriorFadeState('fade-out');
    setInteriorSlideDirection('slide-left');
    
    setTimeout(() => {
      const newIndex = activeInteriorTab < noiThatImages.length - 1 ? activeInteriorTab + 1 : 0;
      setActiveInteriorTab(newIndex);
      setInteriorFadeState('fade-in');
    }, 400);
  };

  // Enhanced prevInteriorImage function
  const prevInteriorImage = () => {
    if (noiThatImages.length <= 1) return;
    
    setInteriorFadeState('fade-out');
    setInteriorSlideDirection('slide-right');
    
    setTimeout(() => {
      const newIndex = activeInteriorTab > 0 ? activeInteriorTab - 1 : noiThatImages.length - 1;
      setActiveInteriorTab(newIndex);
      setInteriorFadeState('fade-in');
    }, 400);
  };

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setCurrentImageIndex(0);
  };

  // Add function to handle model selection
  const handleModelSelect = (modelId: number) => {
    // Navigate to the selected model's page
    window.location.href = `/product/${modelId}`;
  };

  // Completely revised handleImageZoom for perfectly smooth movement
  const handleImageZoom = (e: React.MouseEvent<HTMLImageElement>, tab: string) => {
    // Get the bounding rectangle of target image
    const targetRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate mouse position in the image
    const x = e.clientX - targetRect.left;
    const y = e.clientY - targetRect.top;
    
    // Calculate position as percentage (for background position)
    const backgroundX = (x / targetRect.width) * 100;
    const backgroundY = (y / targetRect.height) * 100;
    
    // Calculate magnifier position - centered on cursor
    const magnifierWidth = 180;
    const magnifierHeight = 180;
    const magnifierHalfWidth = magnifierWidth / 2;
    const magnifierHalfHeight = magnifierHeight / 2;
    
    // For positioning the magnifier (don't constrain to image borders for smoother movement)
    const magnifierX = x - magnifierHalfWidth;
    const magnifierY = y - magnifierHalfHeight;
    
    setMagnifierPosition({
      x: magnifierX,
      y: magnifierY,
      backgroundX,
      backgroundY
    });
  };

  // Add this useEffect hook after the existing useEffect hooks
  useEffect(() => {
    // Only proceed if selectedColor exists and we have the product id
    if (selectedColor && id) {
      // Reset current indexes when color changes
      setCurrentImageIndex(0);
      setActiveInteriorTab(0);
      
      // Set fade and slide states for transition effects
      setExteriorFadeState('fade-out');
      setInteriorFadeState('fade-out');
      
      // Slight delay before loading new images to allow for fade out animation
      setTimeout(() => {
        // Fetch images specifically for this model
        axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`)
          .then(response => {
            const imagesData = response.data;
            
            // Sort images by type and position
            const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
              if (!a.viTri) return 1;
              if (!b.viTri) return -1;
              return a.viTri - b.viTri;
            };
            
            const ngoaiThat = imagesData
              .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
              .sort(sortByPosition);
              
            const noiThat = imagesData
              .filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that')
              .sort(sortByPosition);
            
            // Update the state with the fresh images
            setNgoaiThatImages(ngoaiThat);
            setNoiThatImages(noiThat);
            
            // Fade the images back in
            setExteriorFadeState('fade-in');
            setInteriorFadeState('fade-in');
          })
          .catch(error => {
            console.error("Failed to fetch images for selected color:", error);
          });
      }, 300); // Small delay for transition effect
    }
  }, [selectedColor, id]); // Run effect when selected color changes

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

  // Get featured image for display
  const featuredImage = 
    ngoaiThatImages.length > 0 ? ngoaiThatImages[0]?.duongDanAnh : 
    productImages.length > 0 ? productImages[0]?.duongDanAnh : 
    FALLBACK_IMAGE;

  // Get current active images based on tab
  const currentImages = activeTab === 'exterior' 
    ? ngoaiThatImages 
    : activeTab === 'interior' 
      ? noiThatImages 
      : chiTietImages;
      
  const currentImage = currentImages.length > 0 
    ? currentImages[currentImageIndex]?.duongDanAnh 
    : FALLBACK_IMAGE;

  return (
    <div className="product-detail-page_details">
      {/* Hero section với tên xe, thông báo và hình ảnh chính */}
      <div className="product-hero_details">
        <div className="container_details">
          <div className="hero-header_details">
            <h1>{product.namSanXuat} {product.tenMau}</h1>
            
            {/* Notice box - Sử dụng mô tả từ database */}
            <div className="notice-box_details">
              <h4>Notice</h4>
              <p>{product.moTa || 'Không có thông tin mô tả.'}</p>
            </div>
          </div>

          <div className="hero-content_details">
            <div className="price-info_details">
              <h3>Base</h3>
              <p>Starting at {formatPrice(product.giaCoban)}</p>
              
              {/* Update model-selector to display all similar models */}
              <div className="model-selector_details">
                {similarModels.map((model) => (
                  <div 
                    key={model.id}
                    className={`model-option_details ${model.id === selectedModelId ? 'selected' : ''}`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="checkbox-container_details">
                      <span className={`checkbox-indicator_details ${model.id === selectedModelId ? 'visible' : ''}`}></span>
                    </div>
                    <div className="model-info_details">
                      <h4>{model.tenMau} {model.tenDong && `(${model.tenDong})`}</h4>
                      <p>{formatPrice(model.giaCoban)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hero-image_details">
              <img 
                src={imageCache[featuredImage] || getImageUrl(featuredImage)} 
                alt={product.tenMau} 
                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Updated Exterior Section with enhanced transitions */}
      <section className="fullwidth-section_details">
        <div className="container_details">
          <div className="section-header_details">
            <h2>Ngoại thất</h2>
          </div>
        </div>
        <div className="fullwidth-image-container_details">
          {ngoaiThatImages.length > 0 ? (
            <div className="image-carousel_details">
              <button 
                className="carousel-nav_details prev" 
                onClick={prevExteriorImage}
              >
                ◀
              </button>
              
              <div className="image-slideshow_details">
                <div className="slide-container_details">
                  <div className={`slide_details ${exteriorFadeState || ''} ${exteriorSlideDirection || ''}`}>
                    <div className="image-magnifier-container_details">
                      <img 
                        src={imageCache[ngoaiThatImages[currentImageIndex]?.duongDanAnh] || getImageUrl(ngoaiThatImages[currentImageIndex]?.duongDanAnh)} 
                        alt={`${product.tenMau} exterior`}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                        onMouseMove={(e) => handleImageZoom(e, 'exterior')}
                        onMouseEnter={() => { setShowMagnifier(true); setActiveTab('exterior'); }}
                        onMouseLeave={() => setShowMagnifier(false)}
                        className="premium-image"
                      />
                      {showMagnifier && activeTab === 'exterior' && (
                        <div 
                          className="image-magnifier_details"
                          style={{
                            left: `${magnifierPosition.x}px`,
                            top: `${magnifierPosition.y}px`
                          }}
                        >
                          <div 
                            className="magnifier-content_details"
                            style={{
                              backgroundImage: `url(${imageCache[ngoaiThatImages[currentImageIndex]?.duongDanAnh] || getImageUrl(ngoaiThatImages[currentImageIndex]?.duongDanAnh)})`,
                              backgroundPosition: `${magnifierPosition.backgroundX}% ${magnifierPosition.backgroundY}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="image-counter_details">
                  {currentImageIndex + 1} / {ngoaiThatImages.length}
                </div>
              </div>
              
              <button 
                className="carousel-nav_details next" 
                onClick={nextExteriorImage}
              >
                ▶
              </button>
            </div>
          ) : (
            <div className="no-image-placeholder_details">No exterior image available</div>
          )}
        </div>
        <div className="container_details">
          <div className="section-content_details">
            <h3>Màu ngoại thất</h3>
            <div className="color-swatch-container_details">
              {availableColors.map((color) => (
                <button
                  key={color.id}
                  className={`color-swatch_details ${selectedColor?.id === color.id ? 'selected' : ''}`}
                  style={{ backgroundColor: color.maHex }}
                  onClick={() => setSelectedColor(color)}
                  title={color.ten}
                >
                  {color.laMetallic && <span className="metallic-badge_details">★</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Updated Interior Section with enhanced transitions */}
      <section className="fullwidth-section_details">
        <div className="container_details">
          <div className="section-header_details">
            <h2>Nội thất</h2>
          </div>
        </div>
        <div className="fullwidth-image-container_details">
          {noiThatImages.length > 0 ? (
            <div className="image-carousel_details">
              <button 
                className="carousel-nav_details prev" 
                onClick={prevInteriorImage}
              >
                ◀
              </button>
              
              <div className="image-slideshow_details">
                <div className="slide-container_details">
                  <div className={`slide_details ${interiorFadeState || ''} ${interiorSlideDirection || ''}`}>
                    <div className="image-magnifier-container_details">
                      <img 
                        src={imageCache[noiThatImages[activeInteriorTab]?.duongDanAnh] || getImageUrl(noiThatImages[activeInteriorTab]?.duongDanAnh)} 
                        alt={`${product.tenMau} interior`}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                        onMouseMove={(e) => handleImageZoom(e, 'interior')}
                        onMouseEnter={() => { setShowMagnifier(true); setActiveTab('interior'); }}
                        onMouseLeave={() => setShowMagnifier(false)}
                        className="premium-image"
                      />
                      {showMagnifier && activeTab === 'interior' && (
                        <div 
                          className="image-magnifier_details"
                          style={{
                            left: `${magnifierPosition.x}px`,
                            top: `${magnifierPosition.y}px`
                          }}
                        >
                          <div 
                            className="magnifier-content_details"
                            style={{
                              backgroundImage: `url(${imageCache[noiThatImages[activeInteriorTab]?.duongDanAnh] || getImageUrl(noiThatImages[activeInteriorTab]?.duongDanAnh)})`,
                              backgroundPosition: `${magnifierPosition.backgroundX}% ${magnifierPosition.backgroundY}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="image-counter_details">
                  {activeInteriorTab + 1} / {noiThatImages.length}
                </div>
              </div>
              
              <button 
                className="carousel-nav_details next" 
                onClick={nextInteriorImage}
              >
                ▶
              </button>
            </div>
          ) : (
            <div className="no-image-placeholder_details">No interior image available</div>
          )}
        </div>
        <div className="container_details">
          <div className="section-content_details">
            <div className="interior-info_details">
              <h3>Ghế: Đen, Bảng điều khiển: Đen, Thảm: Đen, Trần: Đen</h3>
              <div className="interior-options-container_details">
                {interiorOptions.map((option, index) => (
                  <button
                    key={option.id}
                    className={`interior-option_details ${selectedInteriorOption === index ? 'selected' : ''}`}
                    style={{ backgroundColor: option.mauSac }}
                    onClick={() => setSelectedInteriorOption(index)}
                    title={option.ten}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Chi tiết kỹ thuật section */}
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
              <h3>{product.tenMau} {selectedColor && `- ${selectedColor.ten}`}</h3>
              <p>{formatPrice(calculateTotalPrice())}</p>
            </div>
            
            <div className="action-buttons_details">
              <button className="btn-config_details">Cấu hình xe</button>
              <button className="btn-test-drive_details">Đặt lịch lái thử</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;