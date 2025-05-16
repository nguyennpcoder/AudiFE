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

// Define a type for the color image response
interface HinhAnhXeTheoMauDTO {
  id: number;
  idMauXe: number;
  tenMauXe?: string;
  idMauSac: number;
  tenMauSac?: string;
  maHex?: string;
  duongDanAnh: string;
  loaiHinh: string;
  viTri?: number;
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

  // Thêm state mới cho tính năng so sánh màu xe
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareColor, setCompareColor] = useState<MauSac | null>(null);
  const [compareImages, setCompareImages] = useState<HinhAnhXe[]>([]);

  // Thêm state mới để quản lý vị trí của thanh trượt
  const [sliderPosition, setSliderPosition] = useState<number>(50); // Giá trị 0-100 đại diện cho phần trăm
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Thêm state để lưu trữ màu trước đó
  const [previousColor, setPreviousColor] = useState<MauSac | null>(null);
  // State cho nút A|B
  const [showCompareButton, setShowCompareButton] = useState<boolean>(true);

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

        // Fetch available colors for this model
        const colorsResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-sac/mau-xe/${id}`);
        setAvailableColors(colorsResponse.data);
        
        // Chỉ load hình ảnh mặc định từ hinh_anh_xe
        const imagesResponse = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`);
        setProductImages(imagesResponse.data);
        
        // Process regular images
        const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
          if (!a.viTri) return 1;
          if (!b.viTri) return -1;
          return a.viTri - b.viTri;
        };
        
        const ngoaiThat = imagesResponse.data
          .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
          .sort(sortByPosition);
          
        const noiThat = imagesResponse.data
          .filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that')
          .sort(sortByPosition);
          
        const chiTiet = imagesResponse.data
          .filter((img: HinhAnhXe) => img.loaiHinh === 'chi_tiet')
          .sort(sortByPosition);
        
        setNgoaiThatImages(ngoaiThat);
        setNoiThatImages(noiThat);
        setChiTietImages(chiTiet);

        // Fetch similar car models (from same series)
        if (productResponse.data.idDong) {
          try {
            const similarModelsResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/dong-xe/${productResponse.data.idDong}`);
            
            // Map models with selected status
            const mappedModels = similarModelsResponse.data.map((model: MauXe) => ({
              id: model.id,
              tenMau: model.tenMau,
              tenDong: model.tenDong || productResponse.data.tenDong,
              giaCoban: model.giaCoban,
              selected: model.id == parseInt(id as string)
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

  // Hàm xử lý khi chọn màu để so sánh
  const handleCompareColor = async (color: MauSac) => {
    // Nếu đang so sánh với màu này rồi, tắt chế độ so sánh
    if (compareMode && compareColor?.id === color.id) {
      setCompareMode(false);
      setCompareColor(null);
      return;
    }
    
    setCompareColor(color);
    setCompareMode(true);
    // Reset slider position to middle
    setSliderPosition(50);
    
    try {
      // Lấy hình ảnh cho màu được chọn để so sánh
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${color.id}`
      );
      
      // Sort images by position
      const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };
      
      // Lọc các hình ảnh ngoại thất
      const ngoaiThat = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
        .sort(sortByPosition);
        
      setCompareImages(ngoaiThat);
      
    } catch (error) {
      console.error("Failed to fetch comparison images:", error);
      setCompareImages([]);
    }
  };

  // Hàm bắt đầu drag
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
  };

  // Hàm xử lý drag
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - container.left) / container.width) * 100;
    
    // Giới hạn trong khoảng 5-95%
    const clampedPosition = Math.max(5, Math.min(95, position));
    setSliderPosition(clampedPosition);
  };

  // Hàm kết thúc drag
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Cài đặt sự kiện toàn trang
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && compareMode) {
        const container = document.querySelector('.slide-container_details')?.getBoundingClientRect();
        if (container) {
          const position = ((e.clientX - container.left) / container.width) * 100;
          const clampedPosition = Math.max(5, Math.min(95, position));
          setSliderPosition(clampedPosition);
        }
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, compareMode]);

  // Hàm xử lý khi người dùng chọn màu xe
  const handleColorSelect = (color: MauSac) => {
    // Lưu màu hiện tại trước khi đổi
    if (selectedColor) {
      setPreviousColor(selectedColor);
    }
    
    // Đặt màu mới được chọn
    setSelectedColor(color);
    
    // Tắt chế độ so sánh khi chọn màu mới
    if (compareMode) {
      setCompareMode(false);
    }
    
    // Load ảnh cho màu mới
    loadColorImages(color);
  };

  // Hàm load ảnh cho màu được chọn
  const loadColorImages = async (color: MauSac) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${color.id}`
      );
      
      // Sort images by position
      const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };
      
      // Process the images by type
      const ngoaiThat = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
        .sort(sortByPosition);
        
      const noiThat = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that')
        .sort(sortByPosition);
        
      const chiTiet = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'chi_tiet')
        .sort(sortByPosition);
      
      // Update the state with the fetched images
      setNgoaiThatImages(ngoaiThat);
      setNoiThatImages(noiThat);
      setChiTietImages(chiTiet);
      setProductImages(response.data);
      
      // Reset image indexes
      setCurrentImageIndex(0);
      setActiveInteriorTab(0);
    } catch (error) {
      console.error("Failed to fetch color-specific images:", error);
      // Fallback logic nếu cần
    }
  };

  // Hàm xử lý khi nhấn nút A|B
  const toggleCompareMode = async () => {
    // Nếu đang ở chế độ so sánh, tắt nó đi
    if (compareMode) {
      setCompareMode(false);
      return;
    }
    
    // Nếu không có màu trước đó hoặc màu hiện tại, không làm gì cả
    if (!previousColor || !selectedColor) {
      return;
    }
    
    // Bật chế độ so sánh
    setCompareMode(true);
    setCompareColor(previousColor);
    setSliderPosition(50);
    
    // Load ảnh của màu trước đó để so sánh
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${previousColor.id}`
      );
      
      // Sort images by position
      const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };
      
      // Lọc các hình ảnh ngoại thất
      const ngoaiThat = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
        .sort(sortByPosition);
        
      setCompareImages(ngoaiThat);
      
    } catch (error) {
      console.error("Failed to fetch comparison images:", error);
      setCompareImages([]);
    }
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
                    {/* Nút A|B nằm đè lên hình ảnh */}
                    {showCompareButton && previousColor && selectedColor && (
                      <button 
                        className={`compare-button-overlay ${compareMode ? 'active' : ''}`}
                        onClick={toggleCompareMode}
                        title={compareMode ? "Hủy so sánh" : "So sánh với màu trước"}
                      >
                        <span className="compare-label">A|B</span>
                      </button>
                    )}
                    
                    {compareMode && compareColor && compareImages.length > 0 ? (
                      <div 
                        className="compare-slider-container"
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDrag}
                        onMouseUp={handleDragEnd}
                      >
                        {/* Hình ảnh hiện tại (màu mới) */}
                        <div className="compare-original" style={{ zIndex: 1 }}>
                          <img 
                            src={imageCache[ngoaiThatImages[currentImageIndex]?.duongDanAnh] || getImageUrl(ngoaiThatImages[currentImageIndex]?.duongDanAnh)} 
                            alt={`${product.tenMau} exterior`}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                            className="premium-image"
                          />
                        </div>
                        
                        {/* Hình ảnh so sánh (màu cũ) với clip-path */}
                        <div 
                          className="compare-overlay" 
                          style={{ 
                            clipPath: `inset(0 ${100-sliderPosition}% 0 0)`,
                            zIndex: 2
                          }}
                        >
                          <img 
                            src={imageCache[compareImages[currentImageIndex < compareImages.length ? currentImageIndex : 0]?.duongDanAnh] || 
                               getImageUrl(compareImages[currentImageIndex < compareImages.length ? currentImageIndex : 0]?.duongDanAnh)} 
                            alt={`${product.tenMau} ${compareColor.ten} exterior`}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                            className="premium-image"
                          />
                        </div>
                        
                        {/* Thanh trượt */}
                        <div 
                          className="slider-handle"
                          style={{ 
                            left: `${sliderPosition}%`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                          }}
                        >
                          <div className="slider-divider"></div>
                          <div className="slider-button">
                            <span>◀</span>
                            <span>▶</span>
                          </div>
                        </div>
                        
                        {/* Nhãn màu sắc */}
                        <div className="color-labels">
                          <div className="color-label left">{compareColor?.ten || 'Previous'}</div>
                          <div className="color-label right">{selectedColor?.ten || 'Current'}</div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={imageCache[ngoaiThatImages[currentImageIndex]?.duongDanAnh] || getImageUrl(ngoaiThatImages[currentImageIndex]?.duongDanAnh)} 
                        alt={`${product.tenMau} exterior`}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                        className="premium-image"
                      />
                    )}
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
              {availableColors.map((color, index) => (
                <div
                  key={color.id}
                  className={`color-option ${selectedColor?.id === color.id ? 'selected' : ''} ${compareColor?.id === color.id ? 'comparing' : ''}`}
                >
                  <button
                    className={`color-swatch_details ${selectedColor?.id === color.id ? 'selected' : ''} ${compareColor?.id === color.id ? 'comparing' : ''}`}
                    style={{ 
                      backgroundColor: color.maHex,
                      backgroundImage: color.duongDanAnh ? `url(${BACKEND_URL}${color.duongDanAnh})` : 'none',
                      borderRadius: '15px'
                    }}
                    onClick={() => handleColorSelect(color)}
                    title={color.ten}
                  >
                    {color.laMetallic && <span className="metallic-badge_details">★</span>}
                  </button>
                  <span className="color-name">{color.ten}</span>
                  {color.giaThem > 0 && (
                    <span className="color-price">+{formatPrice(color.giaThem)}</span>
                  )}
                </div>
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
                        className="premium-image"
                      />
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