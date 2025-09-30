// frontend/audi/src/components/sections/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Button, message } from 'antd';
import { useNotification } from '../../context/NotificationContext';
import '../../styles/ProductDetail.css';
import PromotionBanner from './PromotionBanner';
import VehicleRating from './VehicleRating';
import { KhuyenMai } from '../../services/marketingService';


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
  moTa: string;
  duongDanAnh: string;
  giaThem: number;
  laMacDinh?: boolean;
  mauSac?: string;
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

// Define a type for the interior image response
interface HinhAnhTheoNoiThatDTO {
  id: number;
  idMau: number;
  idNoiThat: number;
  tenNoiThat?: string;
  duongDanAnh: string;
  loaiHinh: string;
  viTri?: number;
  idMauSac?: number;
}

// Thêm interface cho bánh xe
interface BanhXeOption {
  id: number;
  ten: string;
  moTa: string;
  kichThuoc: string;
  chatLieu: string;
  giaThem: number;
  duongDanAnh: string;
  laMacDinh?: boolean;
}

// const BACKEND_URL = 'https://audivn.onrender.com';
const BACKEND_URL = 'http://localhost:8080';
const FALLBACK_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+No image</dGV4dD48L3N2Zz4=";

interface LegacyInteriorOption {
  id: number;
  ten: string;
  mauSac: string;
  duongDanAnh: string;
}

const ProductDetail: React.FC<{}> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // State declarations
  const [product, setProduct] = useState<MauXe | null>(null);
  const [dongXe, setDongXe] = useState<string>('');
  const [parsedSpecs, setParsedSpecs] = useState<any>(null);
  const [thongSoKyThuat, setThongSoKyThuat] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [outOfStockNotified, setOutOfStockNotified] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('exterior');
  const [selectedColor, setSelectedColor] = useState<MauSac | null>(null);
  const [selectedInteriorOption, setSelectedInteriorOption] = useState<number>(0);
  const [activeColorTab, setActiveColorTab] = useState(0);
  const [activeInteriorTab, setActiveInteriorTab] = useState(0);
  const [productImages, setProductImages] = useState<HinhAnhXe[]>([]);
  const [availableColors, setAvailableColors] = useState<MauSac[]>([]);
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
  
  // Add state for default color
  const [defaultColor, setDefaultColor] = useState<MauSac | null>(null);
  const [interiorError, setInteriorError] = useState<string | null>(null);
  
  // Define fallback options with the legacy interface
  const interiorFallbackOptions: LegacyInteriorOption[] = [
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

  // Thêm state cho khuyến mãi
  const [selectedPromotion, setSelectedPromotion] = useState<KhuyenMai | null>(null);

  // Thêm state cho bánh xe
  const [banhXeOptions, setBanhXeOptions] = useState<BanhXeOption[]>([]);
  const [selectedBanhXe, setSelectedBanhXe] = useState<BanhXeOption | null>(null);
  const [banhXeImages, setBanhXeImages] = useState<HinhAnhXe[]>([]);
  const [banhXeError, setBanhXeError] = useState<string | null>(null);
  const [activeBanhXeTab, setActiveBanhXeTab] = useState(0); // Thêm state này

  // Add new states for wheel comparison functionality
  const [compareWheelMode, setCompareWheelMode] = useState<boolean>(false);
  const [compareWheel, setCompareWheel] = useState<BanhXeOption | null>(null);
  const [compareWheelImages, setCompareWheelImages] = useState<HinhAnhXe[]>([]);
  const [previousWheel, setPreviousWheel] = useState<BanhXeOption | null>(null);
  const [showCompareWheelButton, setShowCompareWheelButton] = useState<boolean>(true);
  const [defaultWheel, setDefaultWheel] = useState<BanhXeOption | null>(null);
  const [wheelSliderPosition, setWheelSliderPosition] = useState<number>(50);
  const [isDraggingWheel, setIsDraggingWheel] = useState<boolean>(false);
  // Track which exterior color id the current wheel images were loaded for
  const [lastWheelColorId, setLastWheelColorId] = useState<number | null>(null);
  // Animation states for wheel images (similar to exterior/interior)
  const [wheelFadeState, setWheelFadeState] = useState<'fade-in' | 'fade-out' | null>('fade-in');
  const [wheelSlideDirection, setWheelSlideDirection] = useState<'slide-left' | 'slide-right' | null>(null);

  // Add state for wheel image navigation
  const [activeWheelTab, setActiveWheelTab] = useState(0);

  // Add wheel navigation functions (similar to exterior/interior)
  const nextWheelImage = () => {
    if (banhXeImages.length <= 1) return;
    
    setWheelFadeState('fade-out');
    setWheelSlideDirection('slide-left');
    
    setTimeout(() => {
      const newIndex = activeWheelTab < banhXeImages.length - 1 ? activeWheelTab + 1 : 0;
      setActiveWheelTab(newIndex);
      setWheelFadeState('fade-in');
    }, 280);
  };

  const prevWheelImage = () => {
    if (banhXeImages.length <= 1) return;
    
    setWheelFadeState('fade-out');
    setWheelSlideDirection('slide-right');
    
    setTimeout(() => {
      const newIndex = activeWheelTab > 0 ? activeWheelTab - 1 : banhXeImages.length - 1;
      setActiveWheelTab(newIndex);
      setWheelFadeState('fade-in');
    }, 280);
  };

  // Đưa trang về đầu khi mới vào và kiểm tra nếu sản phẩm hết hàng
  useEffect(() => {
    // Luôn luôn cuộn lên đầu trang khi component được mount
    window.scrollTo(0, 0);
  }, []);

  // Kiểm tra trạng thái sản phẩm khi đã load xong
  useEffect(() => {
    if (!isLoading && product && !product.conHang && !outOfStockNotified) {
      // Hiển thị thông báo và chuyển hướng về trang models
      setOutOfStockNotified(true);
      showNotification('error', "Rất tiếc, mẫu này vừa hết hàng. Quý khách vui lòng quay lại sau hoặc chọn mẫu khác.", "", 3000);
      setTimeout(() => {
        navigate('/models');
      }, 1000);
    }
  }, [product, isLoading, navigate, showNotification, outOfStockNotified]);

  const [noiThatOptions, setNoiThatOptions] = useState<NoiThatOption[]>([]);
  const [selectedNoiThat, setSelectedNoiThat] = useState<NoiThatOption | null>(null);

  // Add this function to fetch interior options
  const fetchNoiThatOptions = async (mauXeId: string, exteriorColorId?: number) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/noi-that/mau-xe/${mauXeId}`);
      setNoiThatOptions(response.data);

      const defaultOption = response.data.find((option: NoiThatOption) => option.laMacDinh);
      if (defaultOption) {
        setSelectedNoiThat(defaultOption);
        if (exteriorColorId) {
          // Luôn gọi handleNoiThatSelect để lấy ảnh đúng với màu ngoại thất hiện tại (kể cả là màu mặc định)
          await handleNoiThatSelect(defaultOption, selectedColor?.id || exteriorColorId);
        }
      } else if (response.data.length > 0) {
        setSelectedNoiThat(response.data[0]);
        if (exteriorColorId) {
          await handleNoiThatSelect(response.data[0], selectedColor?.id || exteriorColorId);
        }
      }
    } catch (error) {
      console.error('Error fetching noi that options:', error);
    }
  };

  // Thêm function để fetch bánh xe options
  const fetchBanhXeOptions = async (mauXeId: string, exteriorColorId?: number) => {
    try {
      // Sử dụng đúng endpoint: /api/v1/mau-xe/{idMau}/banh-xe
      const response = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/${mauXeId}/banh-xe`);
      console.log('Banh xe options response:', response.data);
      setBanhXeOptions(response.data);

      const defaultOption = response.data.find((option: BanhXeOption) => option.laMacDinh);
      if (defaultOption) {
        setDefaultWheel(defaultOption);
        setSelectedBanhXe(defaultOption);
        // Gọi handleBanhXeSelect để load ảnh bánh xe đúng với màu ngoại thất
        if (exteriorColorId) {
          await handleBanhXeSelect(defaultOption, exteriorColorId);
        }
      } else if (response.data.length > 0) {
        setDefaultWheel(response.data[0]);
        setSelectedBanhXe(response.data[0]);
        // Gọi handleBanhXeSelect để load ảnh bánh xe đúng với màu ngoại thất
        if (exteriorColorId) {
          await handleBanhXeSelect(response.data[0], exteriorColorId);
        }
      }
    } catch (error) {
      console.error('Error fetching banh xe options:', error);
      // Thử fallback nếu API không hoạt động
      try {
        console.log('Trying fallback to general banh xe API');
        const fallbackResponse = await axios.get(`${BACKEND_URL}/api/v1/banh-xe`);
        console.log('Fallback banh xe response:', fallbackResponse.data);
        setBanhXeOptions(fallbackResponse.data);
        
        if (fallbackResponse.data.length > 0) {
          setDefaultWheel(fallbackResponse.data[0]);
          setSelectedBanhXe(fallbackResponse.data[0]);
          if (exteriorColorId) {
            await handleBanhXeSelect(fallbackResponse.data[0], exteriorColorId);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  // Update useEffect to select default color that matches with hinh_anh_xe images
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch product details
        const productResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/${id}`);
        setProduct(productResponse.data);
        setSelectedModelId(parseInt(id as string));

        // Fetch interior options
        await fetchNoiThatOptions(id as string);

        // Fetch bánh xe options
        await fetchBanhXeOptions(id as string);

        // Set dong xe information
        setDongXe(productResponse.data.tenDong);

        // Parse technical specifications
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

        // Lấy ảnh chuẩn từ bảng hinh_anh_xe
        const imagesResponse = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`);
        console.log("Standard images:", imagesResponse.data);
        setProductImages(imagesResponse.data);
        
        // Xử lý ảnh tiêu chuẩn
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
        
        // Luôn hiển thị ảnh từ hinh_anh_xe trước
        setNgoaiThatImages(ngoaiThat);
        setNoiThatImages(noiThat);
        setChiTietImages(chiTiet);

        // Lấy các màu cho mẫu xe này
        const colorsResponse = await axios.get(`${BACKEND_URL}/api/v1/mau-sac/mau-xe/${id}`);
        console.log("Available colors for model ID", id, ":", colorsResponse.data);
        setAvailableColors(colorsResponse.data);
        
        // Xác định màu mặc định dựa trên ID mẫu xe theo yêu cầu
        let defaultColorName = "";
        switch(id) {
          case "1":
            defaultColorName = "Trắng Băng";  // Giữ nguyên theo yêu cầu
            break;
          case "2":
            defaultColorName = "Trắng Băng";
            break;
          case "3":
            defaultColorName = "Xám Pebble";
            break;
          case "4":
            defaultColorName = "Trắng Arkona";
            break;
          case "5":
            defaultColorName = "Trắng Arkona";
            break;
          case "6":
            defaultColorName = "Bạc Florett";
            break;
          case "7":
            defaultColorName = "Bạc Florett";
            break;
          case "8":
            defaultColorName = "Bạc Florett";
            break;
          case "9":
            defaultColorName = "Xám Nardo";
            break;
          case "10":
            defaultColorName = "Trắng Băng";
            break;
          case "11":
            defaultColorName = "Bạc Florett";
            break;
          case "12":
            defaultColorName = "Bạc Florett";
            break;
          default:
            defaultColorName = "";
        }

        console.log("Default color name for model", id, ":", defaultColorName);
        
        // Tìm màu mặc định trong danh sách màu
        let defaultColorFound = null;
        
        // Tìm màu theo tên chính xác
        if (id === "1") {
          // Cho ID 1, tìm màu "Trắng Băng" và dùng nó trực tiếp
          defaultColorFound = colorsResponse.data.find((color: MauSac) => 
            color.ten === "Trắng Băng");
          console.log("Using Trắng Băng for model 1:", defaultColorFound);
        } else {
          defaultColorFound = colorsResponse.data.find((color: MauSac) => 
            color.ten === defaultColorName);
        }
        
        // Các màu thay thế cho từng ID khi màu chính không có sẵn
        if (!defaultColorFound) {
          console.log(`Default color "${defaultColorName}" not found, searching for fallback`);
          
          // Xử lý fallback cho từng ID cụ thể
          if (id === "1" || id === "2" || id === "10") {
            // Nếu không tìm thấy Trắng Băng, dùng Trắng Arkona thay thế
            defaultColorFound = colorsResponse.data.find((color: MauSac) => 
              color.ten === "Trắng Arkona");
            console.log(`Using fallback color "Trắng Arkona" for model ${id}`);
          }
        }
        
        // Nếu vẫn không tìm thấy, thử tìm màu có giá trị giaThem = 0
        if (!defaultColorFound) {
          console.log("Fallback color not found, checking for color with giaThem = 0");
          defaultColorFound = colorsResponse.data.find((color: MauSac) => 
            Number(color.giaThem) === 0);
        }
        
        console.log("Default color found:", defaultColorFound);
        
        // Nếu vẫn không tìm được màu mặc định, dùng màu đầu tiên
        if (!defaultColorFound && colorsResponse.data.length > 0) {
          console.log("No default color found, using first available color");
          defaultColorFound = colorsResponse.data[0];
        }
        
        // Cài đặt màu mặc định và LOAD ảnh của màu mặc định ngay
        if (defaultColorFound) {
          setDefaultColor(defaultColorFound);
          setSelectedColor(defaultColorFound);
          // Gọi loadColorImages() ngay để lấy tất cả ảnh của màu mặc định
          await loadColorImages(defaultColorFound);
          
          // Gọi lại fetchNoiThatOptions và fetchBanhXeOptions với màu mặc định
          await fetchNoiThatOptions(id as string, defaultColorFound.id);
          await fetchBanhXeOptions(id as string, defaultColorFound.id);
        } else if (colorsResponse.data.length > 0) {
          setDefaultColor(colorsResponse.data[0]);
          setSelectedColor(colorsResponse.data[0]);
          // Gọi loadColorImages() nếu không tìm thấy màu mặc định
          await loadColorImages(colorsResponse.data[0]);
          
          // Gọi lại fetchNoiThatOptions và fetchBanhXeOptions với màu đầu tiên
          await fetchNoiThatOptions(id as string, colorsResponse.data[0].id);
          await fetchBanhXeOptions(id as string, colorsResponse.data[0].id);
        }

        // Fetch similar car models
        if (productResponse.data.idDong) {
          try {
            const similarModelsResponse = await axios.get(
              `${BACKEND_URL}/api/v1/mau-xe/dong-xe/${productResponse.data.idDong}`
            );
            
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
    if (selectedColor && selectedNoiThat) {
      handleNoiThatSelect(selectedNoiThat, selectedColor.id);
    }
  }, [selectedColor]);

  // Sửa lại useEffect cho bánh xe - chỉ trigger khi màu thay đổi, không trigger khi selectedBanhXe thay đổi
  useEffect(() => {
    if (selectedColor && selectedBanhXe) {
      console.log('useEffect: Loading wheel for color change', {
        color: selectedColor.ten,
        wheel: selectedBanhXe.ten
      });
      // Chỉ gọi khi màu thay đổi, không gọi khi bánh xe thay đổi
      handleBanhXeSelect(selectedBanhXe, selectedColor.id);
    }
  }, [selectedColor]); // Chỉ dependency vào selectedColor

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
      console.log('Using direct URL:', imagePath);
      return imagePath;
    } else if (imagePath.startsWith('/uploads/')) {
      // For uploads directory, use the correct static file path
      console.log('Using uploads URL:', `${BACKEND_URL}${imagePath}`);
      return `${BACKEND_URL}${imagePath}`;
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
    
    // Add noi that price if selected
    if (selectedNoiThat) {
      total += selectedNoiThat.giaThem;
    }

    // Add banh xe price if selected
    if (selectedBanhXe) {
      total += selectedBanhXe.giaThem;
    }
    
    return total;
  };

  // Enhanced nextExteriorImage function with better performance
  const nextExteriorImage = () => {
    if (ngoaiThatImages.length <= 1) return;
    
    // Use the slide direction state for animation
    setExteriorFadeState('fade-out');
    setExteriorSlideDirection('slide-left');
    
    // Reduced timeout for more responsiveness
    setTimeout(() => {
      const newIndex = currentImageIndex < ngoaiThatImages.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentImageIndex(newIndex);
      setExteriorFadeState('fade-in');
    }, 280); // Faster transition
  };

  // Enhanced prevExteriorImage function with better performance
  const prevExteriorImage = () => {
    if (ngoaiThatImages.length <= 1) return;
    
    // Use the slide direction state for animation
    setExteriorFadeState('fade-out');
    setExteriorSlideDirection('slide-right');
    
    // Reduced timeout for more responsiveness
    setTimeout(() => {
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : ngoaiThatImages.length - 1;
      setCurrentImageIndex(newIndex);
      setExteriorFadeState('fade-in');
    }, 280); // Faster transition
  };

  // Enhanced nextInteriorImage function with better performance
  const nextInteriorImage = () => {
    if (noiThatImages.length <= 1) return;
    
    // Use the slide direction state for animation
    setInteriorFadeState('fade-out');
    setInteriorSlideDirection('slide-left');
    
    // Reduced timeout for more responsiveness
    setTimeout(() => {
      const newIndex = activeInteriorTab < noiThatImages.length - 1 ? activeInteriorTab + 1 : 0;
      setActiveInteriorTab(newIndex);
      setInteriorFadeState('fade-in');
    }, 280); // Faster transition
  };

  // Enhanced prevInteriorImage function with better performance
  const prevInteriorImage = () => {
    if (noiThatImages.length <= 1) return;
    
    // Use the slide direction state for animation
    setInteriorFadeState('fade-out');
    setInteriorSlideDirection('slide-right');
    
    // Reduced timeout for more responsiveness
    setTimeout(() => {
      const newIndex = activeInteriorTab > 0 ? activeInteriorTab - 1 : noiThatImages.length - 1;
      setActiveInteriorTab(newIndex);
      setInteriorFadeState('fade-in');
    }, 280); // Faster transition
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
  const [isLoadingColorImages, setIsLoadingColorImages] = useState(false);
  const handleColorSelect = async (color: MauSac) => {
    console.log('Color Select - Start', {
      selectedColor: selectedColor?.ten,
      newColor: color.ten,
      currentNoiThat: selectedNoiThat?.ten,
      noiThatOptions: noiThatOptions.map(opt => opt.ten),
      currentBanhXe: selectedBanhXe?.ten,
      banhXeOptions: banhXeOptions.map(opt => opt.ten)
    });

    // Start loading state
    setIsLoadingColorImages(true);

    if (selectedColor) setPreviousColor(selectedColor);

    setSelectedColor(color);

    if (compareMode) setCompareMode(false);
    
    // Reset wheel comparison when color changes
    if (compareWheelMode) {
      setCompareWheelMode(false);
      setCompareWheel(null);
      setCompareWheelImages([]);
    }

    try {
      // 1. Load color-specific images from hinh_anh_xe_theo_mau
      const colorImagesResponse = await axios.get(
        `${BACKEND_URL}/api/v1/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${color.id}`
      );

      // Sort images by position
      const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };

      // Process the images by type
      const ngoaiThat = colorImagesResponse.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'ngoai_that')
        .sort(sortByPosition);

      const noiThat = colorImagesResponse.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that')
        .sort(sortByPosition);

      const chiTiet = colorImagesResponse.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'chi_tiet')
        .sort(sortByPosition);

      // Update exterior and interior images together
      if (ngoaiThat.length > 0) {
        setNgoaiThatImages(ngoaiThat);
      }

      // Luôn set lại noiThatImages bằng ảnh nội thất đúng màu ngoại thất
      setNoiThatImages(noiThat);

      // Update detail images
      if (chiTiet.length > 0) {
        setChiTietImages(chiTiet);
      }

      // Reset image indexes
      setCurrentImageIndex(0);
      setActiveInteriorTab(0);

      setIsLoadingColorImages(false);

      // Gọi lại handleNoiThatSelect cho option nội thất đang chọn
      if (selectedNoiThat) {
        await handleNoiThatSelect(selectedNoiThat, color.id);
      }

      // KHÔNG gọi handleBanhXeSelect ở đây nữa, để useEffect xử lý
      // useEffect sẽ tự động gọi handleBanhXeSelect khi selectedColor thay đổi

    } catch (error) {
      console.error('Error in handleColorSelect:', error);
      // Fallback to default images if color-specific images fail
      await loadColorImages(color);
      
      // End loading state
      setIsLoadingColorImages(false);
    }

    console.log('Color Select - End', {
      finalSelectedColor: color?.ten,
      finalSelectedNoiThat: selectedNoiThat?.ten,
      finalSelectedBanhXe: selectedBanhXe?.ten
    });
  };
  
  const loadColorImages = async (color: MauSac, skipInteriorUpdate: boolean = false) => {
    try {
      // Fallback to default images if color-specific images fail
      const imagesResponse = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`);
  
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
  
      // Update exterior images
      if (ngoaiThat.length > 0) {
        setNgoaiThatImages(ngoaiThat);
      }
  
      // Update interior images only if not skipped
      if (!skipInteriorUpdate && noiThat.length > 0) {
        setNoiThatImages(noiThat);
      }
  
      // Update detail images
      if (chiTiet.length > 0) {
        setChiTietImages(chiTiet);
      }
  
      // Reset image indexes
      setCurrentImageIndex(0);
      setActiveInteriorTab(0);

      // KHÔNG gọi handleBanhXeSelect ở đây nữa, để useEffect xử lý
      // useEffect sẽ tự động gọi handleBanhXeSelect khi selectedColor thay đổi
  
    } catch (error) {
      console.error('Error in loadColorImages:', error);
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

  // Add function to handle noi that selection with image loading
  const handleNoiThatSelect = async (noiThat: NoiThatOption, colorId?: number) => {
    const exteriorColorId = colorId || selectedColor?.id;
    
    // Nếu option đang chọn đã là selected, thì không làm gì cả
    if (selectedNoiThat?.id === noiThat.id) return;

    try {
      // 1. Thử fetch ảnh nội thất đúng với màu ngoại thất hiện tại (kể cả option mặc định)
      const specificColorInteriorUrl = `${BACKEND_URL}/api/v1/hinh-anh-theo-noi-that/mau-xe/${id}/noi-that/${noiThat.id}?mauSacNgoaiId=${exteriorColorId}`;
      const specificColorResponse = await axios.get(specificColorInteriorUrl);

      const sortByPosition = (a: HinhAnhTheoNoiThatDTO, b: HinhAnhTheoNoiThatDTO) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };

      const specificInteriorImages = specificColorResponse.data
        .filter((img: HinhAnhTheoNoiThatDTO) => img.loaiHinh === 'noi_that')
        .sort(sortByPosition)
        .map((img: HinhAnhTheoNoiThatDTO) => ({
          id: img.id,
          idMauXe: img.idMau,
          duongDanAnh: img.duongDanAnh,
          loaiHinh: img.loaiHinh,
          viTri: img.viTri
        }));

      if (specificInteriorImages.length > 0) {
        setNoiThatImages(removeDuplicateImages(specificInteriorImages));
        setSelectedNoiThat(noiThat);
        setActiveInteriorTab(0); // <-- Đảm bảo reset về 0
        setInteriorError(null); // Clear error if successful
        return;
      }

      // 2. Nếu không có ảnh theo màu ngoại thất, fallback về ảnh mặc định của option nội thất này (không truyền màu)
      const defaultInteriorUrl = `${BACKEND_URL}/api/v1/hinh-anh-theo-noi-that/mau-xe/${id}/noi-that/${noiThat.id}`;
      const defaultInteriorResponse = await axios.get(defaultInteriorUrl);
      const defaultInteriorImages = defaultInteriorResponse.data
        .filter((img: HinhAnhTheoNoiThatDTO) => img.loaiHinh === 'noi_that')
        .sort(sortByPosition)
        .map((img: HinhAnhTheoNoiThatDTO) => ({
          id: img.id,
          idMauXe: img.idMau,
          duongDanAnh: img.duongDanAnh,
          loaiHinh: img.loaiHinh,
          viTri: img.viTri
        }));

      if (defaultInteriorImages.length > 0) {
        setNoiThatImages(removeDuplicateImages(defaultInteriorImages));
        setSelectedNoiThat(noiThat);
        setActiveInteriorTab(0);
        setInteriorError(null); // Clear error if successful
        return;
      }

      // 3. Nếu không, fallback về ảnh nội thất từ màu ngoại thất hiện tại
      if (exteriorColorId) {
        const colorInteriorUrl = `${BACKEND_URL}/api/v1/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${exteriorColorId}`;
        const colorInteriorResponse = await axios.get(colorInteriorUrl);
        const colorInteriorImages = colorInteriorResponse.data
          .filter((img: HinhAnhXe) => img.loaiHinh === 'noi_that')
          .sort((a: HinhAnhXe, b: HinhAnhXe) => {
            if (!a.viTri) return 1;
            if (!b.viTri) return -1;
            return a.viTri - b.viTri;
          });

        if (colorInteriorImages.length > 0) {
          setNoiThatImages(removeDuplicateImages(colorInteriorImages));
          setSelectedNoiThat(noiThat);
          setActiveInteriorTab(0);
          setInteriorError(null); // Clear error if successful
          return;
        }
      }

      // Nếu tất cả đều fail
      setInteriorError(`Mẫu xe này không hỗ trợ màu nội thất "${noiThat.ten}". Vui lòng chọn tùy chọn khác.`);
    } catch (error) {
      console.error('Error in handleNoiThatSelect:', error);
    }
  };

  // Thêm function để handle bánh xe selection
  const handleBanhXeSelect = async (banhXe: BanhXeOption, colorId?: number) => {
    const exteriorColorId = colorId || selectedColor?.id;
    
    console.log('handleBanhXeSelect called:', {
      wheel: banhXe?.ten,
      colorId: exteriorColorId,
      currentSelectedBanhXe: selectedBanhXe?.ten
    });
    
    // Only skip if both wheel and color are unchanged
    if (selectedBanhXe?.id === banhXe.id && exteriorColorId === lastWheelColorId) {
      console.log('Same wheel and color as last load, skipping');
      return;
    }

    // Set previous wheel before changing
    if (selectedBanhXe) setPreviousWheel(selectedBanhXe);

    // Reset wheel comparison when wheel changes
    if (compareWheelMode) {
      setCompareWheelMode(false);
      setCompareWheel(null);
      setCompareWheelImages([]);
    }

    try {
      // Start fade out transition
      setWheelFadeState('fade-out');
      setWheelSlideDirection('slide-left');

      // Thử fetch ảnh bánh xe đúng với màu ngoại thất hiện tại
      const specificColorBanhXeUrl = `${BACKEND_URL}/api/v1/mau-xe/${id}/banh-xe/${banhXe.id}/hinh-anh/mau-sac/${exteriorColorId}`;
      console.log('Fetching wheel images from:', specificColorBanhXeUrl);
      
      const specificColorResponse = await axios.get(specificColorBanhXeUrl);
      console.log('Specific color wheel response:', specificColorResponse.data);

      // Kiểm tra xem response.data có phải là array không
      if (Array.isArray(specificColorResponse.data) && specificColorResponse.data.length > 0) {
        const sortByPosition = (a: any, b: any) => {
          if (!a.viTri) return 1;
          if (!b.viTri) return -1;
          return a.viTri - b.viTri;
        };

        const specificBanhXeImages = specificColorResponse.data
          .filter((img: any) => img.loaiHinh === 'banh_xe')
          .sort(sortByPosition)
          .map((img: any) => ({
            id: img.id,
            idMauXe: img.idMau,
            duongDanAnh: img.duongDanAnh,
            loaiHinh: img.loaiHinh,
            viTri: img.viTri
          }));

        if (specificBanhXeImages.length > 0) {
          console.log('Found specific color wheel images:', specificBanhXeImages.length);
          // Use setTimeout to create smooth transition
          setTimeout(() => {
            setBanhXeImages(removeDuplicateImages(specificBanhXeImages));
            setSelectedBanhXe(banhXe);
            setBanhXeError(null);
            if (exteriorColorId) setLastWheelColorId(exteriorColorId);
            setWheelFadeState('fade-in');
            setActiveWheelTab(0); // Reset to first image
          }, 280);
          return;
        }
      }

      // Fallback về ảnh mặc định của bánh xe này
      const defaultBanhXeUrl = `${BACKEND_URL}/api/v1/mau-xe/${id}/banh-xe/${banhXe.id}/hinh-anh`;
      console.log('Fetching default wheel images from:', defaultBanhXeUrl);
      
      const defaultBanhXeResponse = await axios.get(defaultBanhXeUrl);
      console.log('Default wheel response:', defaultBanhXeResponse.data);
      
      // Kiểm tra xem response.data có phải là array không
      if (Array.isArray(defaultBanhXeResponse.data) && defaultBanhXeResponse.data.length > 0) {
        const sortByPosition = (a: any, b: any) => {
          if (!a.viTri) return 1;
          if (!b.viTri) return -1;
          return a.viTri - b.viTri;
        };

        const defaultBanhXeImages = defaultBanhXeResponse.data
          .filter((img: any) => img.loaiHinh === 'banh_xe')
          .sort(sortByPosition)
          .map((img: any) => ({
            id: img.id,
            idMauXe: img.idMau,
            duongDanAnh: img.duongDanAnh,
            loaiHinh: img.loaiHinh,
            viTri: img.viTri
          }));

        if (defaultBanhXeImages.length > 0) {
          console.log('Found default wheel images:', defaultBanhXeImages.length);
          // Use setTimeout to create smooth transition
          setTimeout(() => {
            setBanhXeImages(removeDuplicateImages(defaultBanhXeImages));
            setSelectedBanhXe(banhXe);
            setBanhXeError(null);
            if (exteriorColorId) setLastWheelColorId(exteriorColorId);
            setWheelFadeState('fade-in');
            setActiveWheelTab(0); // Reset to first image
          }, 280);
          return;
        }
      }

      // Nếu không có ảnh, thử lấy ảnh từ bảng hinh_anh_xe với loaiHinh = 'banh_xe'
      console.log('Trying fallback to general wheel images');
      const fallbackResponse = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`);
      
      if (Array.isArray(fallbackResponse.data)) {
        const fallbackWheelImages = fallbackResponse.data
          .filter((img: any) => img.loaiHinh === 'banh_xe')
          .sort((a: any, b: any) => {
            if (!a.viTri) return 1;
            if (!b.viTri) return -1;
            return a.viTri - b.viTri;
          });

        if (fallbackWheelImages.length > 0) {
          console.log('Found fallback wheel images:', fallbackWheelImages.length);
          setTimeout(() => {
            setBanhXeImages(removeDuplicateImages(fallbackWheelImages));
            setSelectedBanhXe(banhXe);
            setBanhXeError(null);
            if (exteriorColorId) setLastWheelColorId(exteriorColorId);
            setWheelFadeState('fade-in');
            setActiveWheelTab(0);
          }, 280);
          return;
        }
      }

      setBanhXeError(`Mẫu xe này không hỗ trợ bánh xe "${banhXe.ten}". Vui lòng chọn tùy chọn khác.`);
    } catch (error) {
      console.error('Error in handleBanhXeSelect:', error);
      // Log thêm thông tin để debug
      if (error && typeof error === 'object' && 'response' in error) {
        console.log('Error response:', (error as any).response?.data);
        console.log('Error status:', (error as any).response?.status);
      }
      
      // Thử fallback cuối cùng
      try {
        console.log('Trying final fallback to general wheel images');
        const finalFallbackResponse = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${id}`);
        
        if (Array.isArray(finalFallbackResponse.data)) {
          const finalWheelImages = finalFallbackResponse.data
            .filter((img: any) => img.loaiHinh === 'banh_xe')
            .sort((a: any, b: any) => {
              if (!a.viTri) return 1;
              if (!b.viTri) return -1;
              return a.viTri - b.viTri;
            });

          if (finalWheelImages.length > 0) {
            console.log('Found final fallback wheel images:', finalWheelImages.length);
            setTimeout(() => {
              setBanhXeImages(removeDuplicateImages(finalWheelImages));
              setSelectedBanhXe(banhXe);
              setBanhXeError(null);
              if (exteriorColorId) setLastWheelColorId(exteriorColorId);
              setWheelFadeState('fade-in');
              setActiveWheelTab(0);
            }, 280);
            return;
          }
        }
      } catch (finalError) {
        console.error('Final fallback also failed:', finalError);
      }
      
      setBanhXeError(`Không thể tải hình ảnh bánh xe "${banhXe.ten}". Vui lòng thử lại sau.`);
    }
  };

  // Handler to reset to default color
  // Modify the resetToDefaultColor function
const resetToDefaultColor = async () => {
  if (defaultColor) {
    // KHÔNG setIsLoadingColorImages(true) ở đây!
    try {
      await handleColorSelect(defaultColor);
      await fetchNoiThatOptions(id as string, defaultColor.id);
      await fetchBanhXeOptions(id as string, defaultColor.id);
      if (compareMode) {
        setCompareMode(false);
      }
      setIsLoadingColorImages(false); // Đảm bảo tắt loading
    } catch (error) {
      console.error('Error resetting to default color:', error);
      setIsLoadingColorImages(false);
    }
  }
};

  useEffect(() => {
    if (selectedNoiThat && selectedColor) {
      handleNoiThatSelect(selectedNoiThat, selectedColor.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!product || !selectedPromotion) return calculateTotalPrice();
    
    let discountedPrice = calculateTotalPrice();
    
    switch (selectedPromotion.loaiGiamGia) {
      case 'phan_tram':
        discountedPrice = discountedPrice * (1 - selectedPromotion.giaTriGiam / 100);
        break;
      case 'so_tien_co_dinh':
        discountedPrice = Math.max(0, discountedPrice - selectedPromotion.giaTriGiam);
        break;
      case 'tuy_chon_mien_phi':
        // For free options, subtract the option price if applicable
        if (selectedNoiThat && selectedNoiThat.giaThem > 0) {
          discountedPrice -= selectedNoiThat.giaThem;
        }
        break;
    }
    
    return Math.max(0, discountedPrice);
  };

  // Update handleCompareWheel to ensure same color for both sides
  const handleCompareWheel = async (wheel: BanhXeOption) => {
    // If already comparing with this wheel, turn off comparison
    if (compareWheelMode && compareWheel?.id === wheel.id) {
      setCompareWheelMode(false);
      setCompareWheel(null);
      setCompareWheelImages([]);
      return;
    }
    
    setCompareWheel(wheel);
    setCompareWheelMode(true);
    setWheelSliderPosition(50);
    
    try {
      // Load wheel images for the same exterior color (current selected color)
      const currentColorId = selectedColor?.id;
      if (!currentColorId) {
        console.error('No exterior color selected for wheel comparison');
        return;
      }
      
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/mau-xe/${id}/banh-xe/${wheel.id}/hinh-anh/mau-sac/${currentColorId}`
      );
      
      const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };
      
      const wheelImages = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'banh_xe')
        .sort(sortByPosition);
        
      setCompareWheelImages(wheelImages);
      
    } catch (error) {
      console.error("Failed to fetch comparison wheel images:", error);
      setCompareWheelImages([]);
    }
  };

  // Update toggleCompareWheelMode to use same color
  const toggleCompareWheelMode = async () => {
    if (compareWheelMode) {
      setCompareWheelMode(false);
      return;
    }
    
    if (!previousWheel || !selectedBanhXe) {
      return;
    }
    
    setCompareWheelMode(true);
    setCompareWheel(previousWheel);
    setWheelSliderPosition(50);
    
    try {
      // Load previous wheel images with same color (current selected color)
      const currentColorId = selectedColor?.id;
      if (!currentColorId) {
        console.error('No exterior color selected for wheel comparison');
        return;
      }
      
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/mau-xe/${id}/banh-xe/${previousWheel.id}/hinh-anh/mau-sac/${currentColorId}`
      );
      
      const sortByPosition = (a: HinhAnhXe, b: HinhAnhXe) => {
        if (!a.viTri) return 1;
        if (!b.viTri) return -1;
        return a.viTri - b.viTri;
      };
      
      const wheelImages = response.data
        .filter((img: HinhAnhXe) => img.loaiHinh === 'banh_xe')
        .sort(sortByPosition);
        
      setCompareWheelImages(wheelImages);
      
    } catch (error) {
      console.error("Failed to fetch comparison wheel images:", error);
      setCompareWheelImages([]);
    }
  };

  // Add wheel drag handlers
  const handleWheelDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingWheel(true);
  };

  const handleWheelDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingWheel) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - container.left) / container.width) * 100;
    
    const clampedPosition = Math.max(5, Math.min(95, position));
    setWheelSliderPosition(clampedPosition);
  };

  const handleWheelDragEnd = () => {
    setIsDraggingWheel(false);
  };

  // Update useEffect for wheel drag
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDraggingWheel) {
        setIsDraggingWheel(false);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWheel && compareWheelMode) {
        const container = document.querySelector('.wheel-slide-container_details')?.getBoundingClientRect();
        if (container) {
          const position = ((e.clientX - container.left) / container.width) * 100;
          const clampedPosition = Math.max(5, Math.min(95, position));
          setWheelSliderPosition(clampedPosition);
        }
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDraggingWheel, compareWheelMode]);

  // Add reset to default wheel function
  const resetToDefaultWheel = async () => {
    if (defaultWheel) {
      try {
        await handleBanhXeSelect(defaultWheel, selectedColor?.id);
        if (compareWheelMode) {
          setCompareWheelMode(false);
        }
      } catch (error) {
        console.error('Error resetting to default wheel:', error);
      }
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

  // Loại bỏ phần kiểm tra tồn kho
  /*
  if (stockLoading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang kiểm tra thông tin sản phẩm...</p>
      </div>
    );
  }

  if (stockError) {
    return (
      <div className="product-detail-error">
        <Alert 
          message="Lỗi kiểm tra tồn kho" 
          description={stockError}
          type="error"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/models')}>
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  if (!isInStock) {
    return (
      <div className="product-detail-out-of-stock">
        <Alert 
          message="Sản phẩm tạm thời hết hàng" 
          description="Rất tiếc, mẫu này vừa hết hàng. Quý khách vui lòng quay lại sau hoặc chọn mẫu khác."
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/models')}>
            Xem các mẫu khác
          </Button>
        </div>
      </div>
    );
  }
  */
  
  // Sử dụng trạng thái isInStock từ product.conHang
  if (!isInStock) {
    return (
      <div className="product-detail-out-of-stock">
        <Alert 
          message="Sản phẩm tạm thời hết hàng" 
          description="Rất tiếc, mẫu này vừa hết hàng. Quý khách vui lòng quay lại sau hoặc chọn mẫu khác."
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/models')}>
            Xem các mẫu khác
          </Button>
        </div>
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
              {isLoadingColorImages ? (
                <div className="loading-container_details">
                  <div className="spinner_details"></div>
                  <p>Đang tải hình ảnh...</p>
                </div>
              ) : (
                <img 
                  src={imageCache[featuredImage] || getImageUrl(featuredImage)} 
                  alt={product.tenMau} 
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                />
              )}
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
          {isLoadingColorImages ? (
            <div className="loading-container_details">
              <div className="spinner_details"></div>
              <p>Đang tải hình ảnh ngoại thất...</p>
            </div>
          ) : ngoaiThatImages.length > 0 ? (
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
            <div className="color-header">
              <h3>Màu ngoại thất</h3>
              {defaultColor && (
                <button 
                  className="reset-color-button"
                  onClick={resetToDefaultColor}
                  disabled={selectedColor?.id === defaultColor?.id}
                  title="Quay lại màu mặc định"
                >
                  Màu mặc định
                </button>
              )}
            </div>
            <div className="color-swatch-container_details">
              {/* Render default color first */}
              {defaultColor && (
                <div
                  key={defaultColor.id}
                  className={`color-option ${selectedColor?.id === defaultColor.id ? 'selected' : ''} ${compareColor?.id === defaultColor.id ? 'comparing' : ''} default-color`}
                >
                  <button
                    className={`color-swatch_details ${selectedColor?.id === defaultColor.id ? 'selected' : ''} ${compareColor?.id === defaultColor.id ? 'comparing' : ''} default-color`}
                    style={{ 
                      backgroundColor: defaultColor.maHex,
                      backgroundImage: defaultColor.duongDanAnh ? `url(${BACKEND_URL}${defaultColor.duongDanAnh})` : 'none',
                      borderRadius: '15px'
                    }}
                    onClick={() => handleColorSelect(defaultColor)}
                    title={`${defaultColor.ten} (Màu mặc định)`}
                  >
                    {defaultColor.laMetallic && <span className="metallic-badge_details">★</span>}
                    <span className="default-badge">Mặc định</span>
                  </button>
                  <span className="color-name">
                    {defaultColor.ten}
                    <span style={{color: '#d5001c', fontWeight: 'bold'}}> (Mặc định)</span>
                  </span>
                  {defaultColor.giaThem > 0 && (
                    <span className="color-price-text">+{formatPrice(defaultColor.giaThem)}</span>
                  )}
                </div>
              )}
              
              {/* Render remaining colors */}
              {availableColors
                .filter(color => color.id !== defaultColor?.id) // Skip default color as it's already rendered
                .map((color) => {
                  // Debug: Log thông tin màu sắc khi render
                  console.log(`Rendering color ${color.ten}:`, {
                    id: color.id,
                    giaThem: color.giaThem,
                    giaThemType: typeof color.giaThem,
                    giaThemNumber: Number(color.giaThem),
                    shouldShowPrice: Number(color.giaThem) > 0,
                    formattedPrice: formatPrice(color.giaThem)
                  });
                  
                  return (
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
                      {Number(color.giaThem) > 0 && (
                        <span className="color-price-text">+{formatPrice(color.giaThem)}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>
      <section className="fullwidth-section_details">
        <div className="container_details">
          <div className="section-header_details">
            <h2>Bánh xe</h2>
          </div>
        </div>
        <div className="fullwidth-image-container_details">
          {banhXeImages.length > 0 ? (
            <div className="image-carousel_details">
              <button 
                className="carousel-nav_details prev" 
                onClick={prevWheelImage}
                disabled={banhXeImages.length <= 1}
              >
                ◀
              </button>
              
              <div className="image-slideshow_details">
                <div className="slide-container_details">
                  <div className={`slide_details ${wheelFadeState || ''} ${wheelSlideDirection || ''}`}>
                    {/* Wheel comparison button overlay - positioned like exterior */}
                    {showCompareWheelButton && previousWheel && selectedBanhXe && (
                      <button 
                        className={`compare-button-overlay ${compareWheelMode ? 'active' : ''}`}
                        onClick={toggleCompareWheelMode}
                        title={compareWheelMode ? "Hủy so sánh" : "So sánh với bánh xe trước"}
                      >
                        <span className="compare-label">A|B</span>
                      </button>
                    )}
                    
                    {compareWheelMode && compareWheel && compareWheelImages.length > 0 ? (
                      <div 
                        className="compare-slider-container"
                        onMouseDown={handleWheelDragStart}
                        onMouseMove={handleWheelDrag}
                        onMouseUp={handleWheelDragEnd}
                      >
                        {/* Current wheel image - using same color as comparison */}
                        <div className="compare-original" style={{ zIndex: 1 }}>
                          <img 
                            src={imageCache[banhXeImages[activeWheelTab]?.duongDanAnh] || getImageUrl(banhXeImages[activeWheelTab]?.duongDanAnh)} 
                            alt="Bánh xe hiện tại"
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                            className="premium-image"
                          />
                        </div>
                        
                        {/* Comparison wheel image with clip-path - using same color */}
                        <div 
                          className="compare-overlay" 
                          style={{ 
                            clipPath: `inset(0 ${100-wheelSliderPosition}% 0 0)`,
                            zIndex: 2
                          }}
                        >
                          <img 
                            src={imageCache[compareWheelImages[activeWheelTab < compareWheelImages.length ? activeWheelTab : 0]?.duongDanAnh] || 
                                 getImageUrl(compareWheelImages[activeWheelTab < compareWheelImages.length ? activeWheelTab : 0]?.duongDanAnh)} 
                            alt="Bánh xe so sánh"
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                            className="premium-image"
                          />
                        </div>
                        
                        {/* Slider handle */}
                        <div 
                          className="slider-handle"
                          style={{ 
                            left: `${wheelSliderPosition}%`,
                            cursor: isDraggingWheel ? 'grabbing' : 'grab'
                          }}
                        >
                          <div className="slider-divider"></div>
                          <div className="slider-button">
                            <span>◀</span>
                            <span>▶</span>
                          </div>
                        </div>
                        
                        {/* Wheel labels */}
                        <div className="color-labels">
                          <div className="color-label left">{compareWheel?.ten || 'Previous'}</div>
                          <div className="color-label right">{selectedBanhXe?.ten || 'Current'}</div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={imageCache[banhXeImages[activeWheelTab]?.duongDanAnh] || getImageUrl(banhXeImages[activeWheelTab]?.duongDanAnh)} 
                        alt="Bánh xe"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                        className="premium-image"
                      />
                    )}
                  </div>
                </div>
                
                <div className="image-counter_details">
                  {Math.min(activeWheelTab + 1, banhXeImages.length)} / {banhXeImages.length}
                </div>
              </div>
              
              <button 
                className="carousel-nav_details next" 
                onClick={nextWheelImage}
                disabled={banhXeImages.length <= 1}
              >
                ▶
              </button>
            </div>
          ) : (
            <div className="no-image-placeholder_details">Chọn bánh xe để xem hình ảnh</div>
          )}
        </div>
        <div className="container_details">
          <div className="section-content_details">
            <div className="wheels-header">
              <h3>Bánh xe</h3>
              {defaultWheel && (
                <button 
                  className="reset-color-button"
                  onClick={resetToDefaultWheel}
                  disabled={selectedBanhXe?.id === defaultWheel?.id}
                  title="Quay lại bánh xe mặc định"
                >
                  Bánh xe mặc định
                </button>
              )}
            </div>
            
            {banhXeError && (
              <div style={{ color: "red", marginTop: 8, fontWeight: "bold" }}>
                {banhXeError}
              </div>
            )}

            <div className="wheels-swatch-container_details">
              {/* Render default wheel first */}
              {defaultWheel && (
                <div
                  key={defaultWheel.id}
                  className={`wheels-option ${selectedBanhXe?.id === defaultWheel.id ? 'selected' : ''} ${compareWheel?.id === defaultWheel.id ? 'comparing' : ''} default-wheel`}
                >
                  <button
                    className={`wheels-swatch_details ${selectedBanhXe?.id === defaultWheel.id ? 'selected' : ''} ${compareWheel?.id === defaultWheel.id ? 'comparing' : ''} default-wheel`}
                    onClick={() => handleBanhXeSelect(defaultWheel, selectedColor?.id)}
                    title={`${defaultWheel.ten} (Bánh xe mặc định)`}
                  >
                    <img 
                      src={getImageUrl(defaultWheel.duongDanAnh)} 
                      alt={defaultWheel.ten}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '15px'
                      }}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                    />
                    <span className="default-badge">Mặc định</span>
                  </button>
                  <span className="wheels-name">
                    {defaultWheel.ten}
                    <span style={{color: '#d5001c', fontWeight: 'bold'}}> (Mặc định)</span>
                  </span>
                  {defaultWheel.giaThem > 0 && (
                    <span className="wheels-price">+{formatPrice(defaultWheel.giaThem)}</span>
                  )}
                </div>
              )}
              
              {/* Render remaining wheels */}
              {banhXeOptions
                .filter(wheel => wheel.id !== defaultWheel?.id)
                .map((wheel) => (
                  <div
                    key={wheel.id}
                    className={`wheels-option ${selectedBanhXe?.id === wheel.id ? 'selected' : ''} ${compareWheel?.id === wheel.id ? 'comparing' : ''}`}
                  >
                    <button
                      className={`wheels-swatch_details ${selectedBanhXe?.id === wheel.id ? 'selected' : ''} ${compareWheel?.id === wheel.id ? 'comparing' : ''}`}
                      onClick={() => handleBanhXeSelect(wheel, selectedColor?.id)}
                      title={wheel.ten}
                    >
                      <img 
                        src={getImageUrl(wheel.duongDanAnh)} 
                        alt={wheel.ten}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '15px'
                        }}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                      />
                    </button>
                    <span className="wheels-name">{wheel.ten}</span>
                    {wheel.giaThem > 0 && (
                      <span className="wheels-price">+{formatPrice(wheel.giaThem)}</span>
                    )}
                  </div>
                ))}
            </div>

            {selectedBanhXe && (
              <div className="wheels-details_details">
                <p><strong>Kích thước:</strong> {selectedBanhXe.kichThuoc}</p>
                <p><strong>Chất liệu:</strong> {selectedBanhXe.chatLieu}</p>
                <p><strong>Mô tả:</strong> {selectedBanhXe.moTa}</p>
                {selectedBanhXe.giaThem > 0 && (
                  <p><strong>Giá thêm:</strong> {formatPrice(selectedBanhXe.giaThem)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Updated Interior Section with NoiThat options */}
      <section className="fullwidth-section_details">
        <div className="container_details">
          <div className="section-header_details">
            <h2>Nội thất</h2>
          </div>
        </div>
        <div className="fullwidth-image-container_details">
          {isLoadingColorImages ? (
            <div className="loading-container_details">
              <div className="spinner_details"></div>
              <p>Đang tải hình ảnh nội thất...</p>
            </div>
          ) : noiThatImages.length > 0 ? (
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
                    <img 
                      src={imageCache[noiThatImages[activeInteriorTab]?.duongDanAnh] || getImageUrl(noiThatImages[activeInteriorTab]?.duongDanAnh)} 
                      alt={`${product.tenMau} interior`}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                      className="premium-image"
                    />
                  </div>
                </div>
                
                <div className="image-counter_details">
                  {Math.min(activeInteriorTab + 1, noiThatImages.length)} / {noiThatImages.length}
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
              {selectedNoiThat ? (
                <h3>{selectedNoiThat.ten}</h3>
              ) : (
                <h3>Ghế: Đen, Bảng điều khiển: Đen, Thảm: Đen, Trần: Đen</h3>
              )}
              
              {interiorError && (
                <div style={{ color: "red", marginTop: 8, fontWeight: "bold" }}>
                  {interiorError}
                </div>
              )}

              <div className="interior-options-container_details">
                {noiThatOptions.length > 0 ? (
                  noiThatOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`interior-option_details ${selectedNoiThat?.id === option.id ? 'selected' : ''}`}
                      onClick={() => handleNoiThatSelect(option, selectedColor?.id)}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: selectedNoiThat?.id === option.id ? '2px solid #d5001c' : '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                    >
                      {/* Use thumbnail image for selection */}
                      <img 
                        src={getImageUrl(option.duongDanAnh)} 
                        alt={option.ten}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
                      />
                      
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        padding: '5px',
                        fontSize: '10px',
                        color: 'white'
                      }}>
                        <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {option.ten.split(',')[0]}
                        </p>
                        {option.giaThem > 0 && (
                          <p style={{ margin: 0, color: '#ff9999', fontSize: '9px' }}>+{formatPrice(option.giaThem)}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback options if no interior options are available
                  interiorFallbackOptions.map((option, index) => (
                    <button
                      key={option.id}
                      className={`interior-option_details ${selectedInteriorOption === index ? 'selected' : ''}`}
                      style={{ backgroundColor: option.mauSac }}
                      onClick={() => setSelectedInteriorOption(index)}
                      title={option.ten}
                    />
                  ))
                )}
              </div>
              
              {selectedNoiThat && selectedNoiThat.moTa && (
                <p className="interior-description">{selectedNoiThat.moTa}</p>
              )}
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
              <h3>
                {product.tenMau} 
                {selectedColor && ` - ${selectedColor.ten}`}
                {selectedNoiThat && ` + ${selectedNoiThat.ten.split(',')[0]}`}
                {selectedBanhXe && ` + ${selectedBanhXe.ten}`}
              </h3>
              <p>{formatPrice(calculateTotalPrice())}</p>
            </div>
            
            <div className="action-buttons_details">
              <button 
                className="btn-config_details"
                onClick={() => {
                  if (!isInStock) {
                    showNotification('error', "Rất tiếc, mẫu này vừa hết hàng. Quý khách vui lòng quay lại sau hoặc chọn mẫu khác.");
                    return;
                  }
                  navigate(`/configure/${product.id}`);
                }}
              >
                Cấu hình xe
              </button>
              <button className="btn-test-drive_details">Đặt lịch lái thử</button>
            </div>
          </div>
        </div>
      </section>

      {product && (
        <PromotionBanner
          mauXeId={product.id}
          tongGiaTri={product.giaCoban}
          onSelectPromotion={setSelectedPromotion}
        />
      )}

      {selectedPromotion && (
        <div style={{ 
          background: '#f6ffed', 
          padding: '16px', 
          borderRadius: '8px', 
          marginTop: '16px' 
        }}>
          <div style={{ fontWeight: 600, color: '#52c41a' }}>
            Giá sau khuyến mãi: {formatPrice(calculateDiscountedPrice())}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Tiết kiệm: {formatPrice(product.giaCoban - calculateDiscountedPrice())}
          </div>
        </div>
      )}

      {/* Vehicle Rating Section */}
      <VehicleRating 
        mauXeId={product.id} 
        tenMauXe={product.tenMau}
        onRatingSubmit={() => {
          // Refresh any data if needed after rating submission
          console.log('Rating submitted for vehicle:', product.tenMau);
        }}
      />
      
    </div>
  );
};

export default ProductDetail;

function removeDuplicateImages(images: HinhAnhXe[]): HinhAnhXe[] {
  const seen = new Set();
  return images.filter(img => {
    // Ưu tiên dùng id nếu có
    const key = img.id ? String(img.id) : (img.duongDanAnh || '').toLowerCase().split('?')[0].trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

//Khi bạn chọn màu ngoại thất (ví dụ: Đỏ), ảnh nội thất và ngoại thất đều đúng với màu Đỏ.
//Khi bạn chọn một option nội thất khác, ảnh nội thất cũng đúng với màu Đỏ.
//Nhưng khi bạn chọn lại option nội thất mặc định (ô đầu tiên), ảnh nội thất lại nhảy về ảnh của màu mặc định (Trắng Băng), thay vì ảnh nội thất đúng với màu Đỏ.
