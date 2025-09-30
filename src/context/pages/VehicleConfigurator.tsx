import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Steps, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Spin, 
  Progress, 
  Alert, 
  Tag, 
  Space 
} from "antd";
import { 
  CarOutlined, 
  BgColorsOutlined, 
  SettingOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  SaveOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  CreditCardOutlined,
  LockOutlined,
  LoginOutlined
} from "@ant-design/icons";
import "../../styles/VehicleConfigurator.css";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import * as cauHinhService from "../../services/cauHinhService"; // Import cauHinhService


const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const BACKEND_URL = 'http://localhost:8080/api/v1';

interface MauXe {
  id: number;
  tenMau: string;
  giaCoban: number;
  moTa: string;
  namSanXuat: number;
  thongSoKyThuat: string;
  hinhAnh?: string;
  conHang?: boolean; // Thêm trường conHang
}

interface MauSac {
  id: number;
  ten: string;
  maHex: string;
  giaThem: number;
  duongDanAnh: string;
  duongDanAnhNoiThat: string;
  laMetallic: boolean;
}

interface TuyChon {
  id: number;
  ten: string;
  moTa: string;
  gia: number;
  danhMuc: string;
}

interface NoiThat {
  id: number;
  ten: string;
  moTa: string;
  giaThem: number;
  duongDanAnh: string;
  laMacDinh?: boolean;
  mauSac?: string;
}

interface BanhXe {
  id: number;
  ten: string;
  moTa: string;
  giaThem: number;
  duongDanAnh: string;
  laMacDinh?: boolean;
  kichThuoc?: string;
}

interface CauHinhTuyChinh {
  id?: number;
  idNguoiDung?: number;
  idMau: number;
  idMauSac: number;
  idNoiThat?: number;
  idBanhXe?: number;
  danhSachIdTuyChon: number[];
  tongGia: number;
  ten?: string;
}

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

interface KhuyenMai {
  id: number;
  ten: string;
  moTa: string;
  giaTriGiam: number;
  loaiGiamGia: 'phan_tram' | 'so_tien_co_dinh' | 'tuy_chon_mien_phi';
  ngayBatDau: string;
  ngayKetThuc: string;
}

const VehicleConfigurator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  useScrollToTop();

  // State declarations
  const [loading, setLoading] = useState(true);
  const [mauXe, setMauXe] = useState<MauXe | null>(null);
  const [danhSachMauSac, setDanhSachMauSac] = useState<MauSac[]>([]);
  const [danhSachTuyChon, setDanhSachTuyChon] = useState<TuyChon[]>([]);
  const [danhSachNoiThat, setDanhSachNoiThat] = useState<NoiThat[]>([]);
  const [danhSachBanhXe, setDanhSachBanhXe] = useState<BanhXe[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedColor, setSelectedColor] = useState<MauSac | null>(null);
  const [selectedTuyChon, setSelectedTuyChon] = useState<number[]>([]);
  const [selectedNoiThat, setSelectedNoiThat] = useState<NoiThat | null>(null);
  const [selectedBanhXe, setSelectedBanhXe] = useState<BanhXe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [luuThanhCong, setLuuThanhCong] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [hinhAnhMauSac, setHinhAnhMauSac] = useState<Record<number, string>>({});
  const [hinhAnhNoiThat, setHinhAnhNoiThat] = useState<Record<number, string>>({});
  const [hinhAnhBanhXe, setHinhAnhBanhXe] = useState<Record<number, string>>({});
  const [hinhAnhMauSacNoiThat, setHinhAnhMauSacNoiThat] = useState<Record<string, string>>({});
  const [activeColorTab, setActiveColorTab] = useState(0);
  const [activeInteriorTab, setActiveInteriorTab] = useState(0);
  const [activeWheelTab, setActiveWheelTab] = useState(0);
  const [colorImages, setColorImages] = useState<{[key: number]: HinhAnhXeTheoMauDTO[]}>({});
  const [interiorImages, setInteriorImages] = useState<{[key: number]: string[]}>({});
  const [wheelImages, setWheelImages] = useState<{[key: number]: string[]}>({});
  const [currentColorImageIndex, setCurrentColorImageIndex] = useState(0);
  const [currentInteriorImageIndex, setCurrentInteriorImageIndex] = useState(0);
  const [currentWheelImageIndex, setCurrentWheelImageIndex] = useState(0);
  const [exteriorFadeState, setExteriorFadeState] = useState<'fade-in' | 'fade-out' | null>(null);
  const [interiorFadeState, setInteriorFadeState] = useState<'fade-in' | 'fade-out' | null>(null);
  const [wheelFadeState, setWheelFadeState] = useState<'fade-in' | 'fade-out' | null>(null);
  const [isInStock, setIsInStock] = useState(true);
  const [previewMode, setPreviewMode] = useState(false); // Thêm state previewMode
  const [orderLoading, setOrderLoading] = useState(false); // Thêm state orderLoading
  const [saving, setSaving] = useState(false); // Thêm state saving
  const [cauHinhHienTai, setCauHinhHienTai] = useState<CauHinhTuyChinh>({ // Thêm state cauHinhHienTai
    idMau: parseInt(id || '0'),
    idMauSac: 0,
    danhSachIdTuyChon: [],
    tongGia: 0
  });
  const [hinhAnhXeTheoMau, setHinhAnhXeTheoMau] = useState<Record<number, HinhAnhXeTheoMauDTO[]>>({}); // Thêm state hinhAnhXeTheoMau
  const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState<KhuyenMai[]>([]); // Thêm state danhSachKhuyenMai
  const [khuyenMai, setKhuyenMai] = useState<KhuyenMai | null>(null); // Thêm state khuyenMai
  const [giaSauKhuyenMai, setGiaSauKhuyenMai] = useState<number>(0); // Thêm state giaSauKhuyenMai
  const [khuyenMaiDuocChon, setKhuyenMaiDuocChon] = useState<KhuyenMai | null>(null); // Thêm state khuyenMaiDuocChon

  // Kiểm tra đăng nhập ngay từ đầu
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      showNotification('warning', 'Vui lòng đăng nhập để cấu hình xe');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Hiển thị màn hình bảo vệ nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="vehicle-configurator-container">
        <div className="auth-required-section">
          <Card className="auth-required-card">
            <div className="auth-required-content">
              <LockOutlined className="auth-required-icon" />
              <Title level={2} className="auth-required-title">
                Yêu cầu đăng nhập
              </Title>
              <Text className="auth-required-description">
                Bạn cần đăng nhập để có thể tùy chỉnh cấu hình xe và lưu các tùy chọn của mình.
              </Text>
              
              <div className="auth-required-actions">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login', { 
                    state: { 
                      from: `/configurator/${id}`,
                      message: 'Vui lòng đăng nhập để tùy chỉnh cấu hình xe'
                    } 
                  })}
                  className="auth-login-btn"
                >
                  Đăng nhập ngay
                </Button>
                
                <Button 
                  size="large"
                  onClick={() => navigate('/')}
                  className="auth-back-btn"
                >
                  Quay về trang chủ
                </Button>
              </div>
              
              <Alert
                message="Lợi ích khi đăng nhập"
                description={
                  <ul className="auth-benefits-list">
                    <li>Lưu và quản lý các cấu hình xe yêu thích</li>
                    <li>So sánh các tùy chọn khác nhau</li>
                    <li>Nhận thông báo về khuyến mãi và ưu đãi</li>
                    <li>Đặt hàng xe với cấu hình đã tùy chỉnh</li>
                  </ul>
                }
                type="info"
                showIcon
                className="auth-benefits-alert"
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Load dữ liệu ban đầu - CHỈ CHẠY KHI ĐÃ ĐĂNG NHẬP
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [id, isAuthenticated]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load mẫu xe
      const mauXeResponse = await axios.get(`${BACKEND_URL}/mau-xe/${id}`);
      setMauXe(mauXeResponse.data);
      
      // Check if product is in stock
      if (!mauXeResponse.data.conHang) {
        setIsInStock(false);
        showNotification('error', "Rất tiếc, mẫu này vừa hết hàng. Quý khách vui lòng quay lại sau hoặc chọn mẫu khác.", "", 2000);
        setTimeout(() => {
          navigate('/models');
        }, 1000);
        return;
      }
      setIsInStock(true);
      
      // Load màu sắc cho mẫu xe cụ thể
      const mauSacResponse = await axios.get(`${BACKEND_URL}/mau-sac/mau-xe/${id}`);
      console.log('Màu sắc loaded:', mauSacResponse.data);
      
      setDanhSachMauSac(mauSacResponse.data);
      
      // Load tùy chọn - Sửa error handling
      try {
        const tuyChonResponse = await axios.get(`${BACKEND_URL}/tuy-chon`);
        console.log('Tùy chọn loaded:', tuyChonResponse.data);
        setDanhSachTuyChon(tuyChonResponse.data);
      } catch (tuyChonError: any) {
        console.error('Lỗi khi load tùy chọn:', tuyChonError);
        
        // Fallback: thử load tùy chọn theo mẫu xe
        try {
          const tuyChonByMauXeResponse = await axios.get(`${BACKEND_URL}/tuy-chon/mau-xe/${id}`);
          console.log('Tùy chọn theo mẫu xe loaded:', tuyChonByMauXeResponse.data);
          setDanhSachTuyChon(tuyChonByMauXeResponse.data);
        } catch (fallbackError) {
          console.error('Fallback cũng thất bại:', fallbackError);
          // Tạo danh sách tùy chọn mặc định
          const defaultTuyChon: TuyChon[] = [
            {
              id: 1,
              ten: "Gói nội thất cao cấp",
              moTa: "Nội thất da cao cấp với đường chỉ tổ ong",
              gia: 5000000,
              danhMuc: "Noi_that"
            },
            {
              id: 2,
              ten: "Gói ngoại thất thể thao",
              moTa: "Bộ kit thể thao cho ngoại thất",
              gia: 3000000,
              danhMuc: "Ngoai_that"
            },
            {
              id: 3,
              ten: "Gói công nghệ tiên tiến",
              moTa: "Hệ thống thông tin giải trí cao cấp",
              gia: 8000000,
              danhMuc: "Cong_nghe"
            }
          ];
          setDanhSachTuyChon(defaultTuyChon);
          showNotification('warning', 'Sử dụng tùy chọn mặc định do lỗi server', '', 3);
        }
      }
      
      // Load nội thất
      try {
        const noiThatResponse = await axios.get(`${BACKEND_URL}/noi-that/mau-xe/${id}`);
        console.log('Nội thất loaded:', noiThatResponse.data);
        setDanhSachNoiThat(noiThatResponse.data);
      } catch (noiThatError: any) {
        console.error('Lỗi khi load nội thất:', noiThatError);
        // Fallback: load tất cả nội thất
        try {
          const allNoiThatResponse = await axios.get(`${BACKEND_URL}/noi-that`);
          setDanhSachNoiThat(allNoiThatResponse.data);
        } catch (fallbackError) {
          console.error('Fallback cũng thất bại:', fallbackError);
          // Tạo danh sách nội thất mặc định
          const defaultNoiThat: NoiThat[] = [
            {
              id: 1,
              ten: "Nội thất da đen cơ bản",
              moTa: "Nội thất da đen với ghế thể thao",
              giaThem: 0,
              duongDanAnh: "/uploads/images/interiors/black_leather_basic.jpg",
              laMacDinh: true
            },
            {
              id: 2,
              ten: "Nội thất da nâu cao cấp",
              moTa: "Nội thất da nâu với đường chỉ tổ ong",
              giaThem: 3000000,
              duongDanAnh: "/uploads/images/interiors/brown_leather_premium.jpg",
              laMacDinh: false
            }
          ];
          setDanhSachNoiThat(defaultNoiThat);
          showNotification('warning', 'Sử dụng nội thất mặc định do lỗi server', '', 3);
        }
      }
      
      // Load bánh xe
      try {
        const banhXeResponse = await axios.get(`${BACKEND_URL}/mau-xe/${id}/banh-xe`);
        console.log('Bánh xe loaded:', banhXeResponse.data);
        setDanhSachBanhXe(banhXeResponse.data);
      } catch (banhXeError: any) {
        console.error('Lỗi khi load bánh xe:', banhXeError);
        // Fallback: load tất cả bánh xe
        try {
          const allBanhXeResponse = await axios.get(`${BACKEND_URL}/banh-xe`);
          setDanhSachBanhXe(allBanhXeResponse.data);
        } catch (fallbackError) {
          console.error('Fallback cũng thất bại:', fallbackError);
          // Tạo danh sách bánh xe mặc định
          const defaultBanhXe: BanhXe[] = [
            {
              id: 1,
              ten: "Bánh xe 19 inch cơ bản",
              moTa: "Bánh xe hợp kim 19 inch với lốp mùa hè",
              giaThem: 0,
              duongDanAnh: "/uploads/images/wheels/19inch_basic.jpg",
              laMacDinh: true,
              kichThuoc: "19 inch"
            },
            {
              id: 2,
              ten: "Bánh xe 20 inch thể thao",
              moTa: "Bánh xe hợp kim 20 inch thiết kế thể thao",
              giaThem: 2500000,
              duongDanAnh: "/uploads/images/wheels/20inch_sport.jpg",
              laMacDinh: false,
              kichThuoc: "20 inch"
            },
            {
              id: 3,
              ten: "Bánh xe 21 inch cao cấp",
              moTa: "Bánh xe hợp kim 21 inch cao cấp với thiết kế đặc biệt",
              giaThem: 5000000,
              duongDanAnh: "/uploads/images/wheels/21inch_premium.jpg",
              laMacDinh: false,
              kichThuoc: "21 inch"
            }
          ];
          setDanhSachBanhXe(defaultBanhXe);
          showNotification('warning', 'Sử dụng bánh xe mặc định do lỗi server', '', 3);
        }
      }
      
      // Load khuyến mãi
      await loadKhuyenMai();
      
      // SỬA: Load hình ảnh cho TẤT CẢ màu sắc ngay từ đầu
      if (mauSacResponse.data.length > 0) {
        const defaultColor = mauSacResponse.data[0];
        setSelectedColor(defaultColor);
        
        // Cập nhật cấu hình hiện tại với màu sắc mặc định
        setCauHinhHienTai(prev => ({
          ...prev,
          idMauSac: defaultColor.id
        }));
        
        // Load hình ảnh cho TẤT CẢ màu sắc cùng lúc
        console.log('Bắt đầu load hình ảnh cho tất cả màu sắc...');
        await loadAllColorImages(mauSacResponse.data);
      }
      
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu:", error);
      showNotification('error', 'Không thể tải dữ liệu cấu hình. Vui lòng thử lại sau.', '', 3);
    } finally {
      setLoading(false);
    }
  };

  // FUNCTION MỚI: Load hình ảnh cho tất cả màu sắc
  const loadAllColorImages = async (danhSachMauSac: MauSac[]) => {
    try {
      console.log(`Loading images for all ${danhSachMauSac.length} colors...`);
      
      // Tạo array các promise để load song song
      const imagePromises = danhSachMauSac.map(async (mauSac) => {
        try {
          console.log(`Loading images for color: ${mauSac.ten} (ID: ${mauSac.id})`);
          
          const response = await axios.get(`${BACKEND_URL}/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${mauSac.id}`);
          
          if (response.data && response.data.length > 0) {
            // Sắp xếp theo vị trí
            const sortedImages = response.data.sort((a: HinhAnhXeTheoMauDTO, b: HinhAnhXeTheoMauDTO) => {
              if (!a.viTri) return 1;
              if (!b.viTri) return -1;
              return a.viTri - b.viTri;
            });
            
            return { colorId: mauSac.id, images: sortedImages };
          } else {
            console.log(`No images found for color: ${mauSac.ten}`);
            return { colorId: mauSac.id, images: [] };
          }
        } catch (error) {
          console.error(`Error loading images for color ${mauSac.ten}:`, error);
          return { colorId: mauSac.id, images: [] };
        }
      });
      
      // Chờ tất cả promise hoàn thành
      const results = await Promise.all(imagePromises);
      
      // Cập nhật state với tất cả hình ảnh
      const newHinhAnhXeTheoMau: { [key: number]: HinhAnhXeTheoMauDTO[] } = {};
      results.forEach(result => {
        newHinhAnhXeTheoMau[result.colorId] = result.images;
      });
      
      setHinhAnhXeTheoMau(newHinhAnhXeTheoMau);
      
      console.log('Đã load xong hình ảnh cho tất cả màu sắc:', newHinhAnhXeTheoMau);
      
    } catch (error) {
      console.error("Lỗi khi load tất cả hình ảnh màu sắc:", error);
      showNotification('warning', 'Có lỗi khi load một số hình ảnh màu sắc', '', 3);
    }
  };

  // Load hình ảnh theo màu sắc - GIỮ LẠI ĐỂ DÙNG KHI CẦN
  const loadColorImages = async (colorId: number) => {
    try {
      console.log(`Loading images for color ID: ${colorId}, model ID: ${id}`);
      
      // Sử dụng đúng API endpoint - BỎ /api/v1
      const response = await axios.get(`${BACKEND_URL}/hinh-anh-theo-mau/mau-xe/${id}/mau-sac/${colorId}`);
      console.log('API Response for color images:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Sắp xếp theo vị trí
        const sortedImages = response.data.sort((a: HinhAnhXeTheoMauDTO, b: HinhAnhXeTheoMauDTO) => {
          if (!a.viTri) return 1;
          if (!b.viTri) return -1;
          return a.viTri - b.viTri;
        });
        
        setHinhAnhXeTheoMau(prev => ({
          ...prev,
          [colorId]: sortedImages
        }));
      } else {
        console.log('No images found for this color');
        setHinhAnhXeTheoMau(prev => ({
          ...prev,
          [colorId]: []
        }));
      }
      
    } catch (error) {
      console.error("Lỗi khi tải hình ảnh màu sắc:", error);
      setHinhAnhXeTheoMau(prev => ({
        ...prev,
        [colorId]: []
      }));
    }
  };

  // Thêm function để load khuyến mãi
  const loadKhuyenMai = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/khuyen-mai/con-hieu-luc`, {
        params: { page: 0, size: 50 }
      });
      setDanhSachKhuyenMai(response.data.khuyenMai || []);
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
      setDanhSachKhuyenMai([]);
    }
  };

  // Tính tổng giá - Sửa để bao gồm nội thất
  const tinhTongGia = async () => {
    try {
      if (!mauXe || !selectedColor) return;
      
      console.log('Đang tính giá với params:', {
        idMauXe: mauXe?.id,
        idMauSac: selectedColor?.id,
        idNoiThat: selectedNoiThat?.id,
        idBanhXe: selectedBanhXe?.id,
        idTuyChon: selectedTuyChon
      });
      
      const response = await axios.get(`${BACKEND_URL}/cau-hinh/tinh-gia`, {
        params: {
          idMauXe: mauXe?.id,
          idMauSac: selectedColor?.id,
          idNoiThat: selectedNoiThat?.id,
          idBanhXe: selectedBanhXe?.id,
          idTuyChon: selectedTuyChon.join(',')
        }
      });
      
      console.log('Response tính giá:', response.data);
      
      const tongGia = response.data;
      setCauHinhHienTai(prev => ({ 
        ...prev, 
        idMau: mauXe.id,
        idMauSac: selectedColor.id,
        idNoiThat: selectedNoiThat?.id,
        idBanhXe: selectedBanhXe?.id,
        danhSachIdTuyChon: selectedTuyChon,
        tongGia 
      }));
      
      // Tính khuyến mãi
      await tinhKhuyenMai(tongGia);
      
    } catch (error: any) {
      console.error("Lỗi khi tính giá:", error);
      
      // Fallback: tính giá thủ công
      let tongGia = mauXe?.giaCoban || 0;
      
      // Cộng giá màu sắc
      const mauSac = danhSachMauSac.find(m => m.id === selectedColor?.id);
      if (mauSac && mauSac.giaThem) {
        tongGia += mauSac.giaThem;
      }
      
      // Cộng giá nội thất
      const noiThat = danhSachNoiThat.find(n => n.id === selectedNoiThat?.id);
      if (noiThat && noiThat.giaThem) {
        tongGia += noiThat.giaThem;
      }
      
      // Cộng giá bánh xe
      const banhXe = danhSachBanhXe.find(b => b.id === selectedBanhXe?.id);
      if (banhXe && banhXe.giaThem) {
        tongGia += banhXe.giaThem;
      }
      
      // Cộng giá tùy chọn
      selectedTuyChon.forEach(tuyChonId => {
        const tuyChon = danhSachTuyChon.find(t => t.id === tuyChonId);
        if (tuyChon && tuyChon.gia) {
          tongGia += tuyChon.gia;
        }
      });
      
      setCauHinhHienTai(prev => ({ 
        ...prev, 
        idMau: mauXe?.id || 0,
        idMauSac: selectedColor?.id || 0,
        idNoiThat: selectedNoiThat?.id,
        idBanhXe: selectedBanhXe?.id,
        danhSachIdTuyChon: selectedTuyChon,
        tongGia 
      }));
      setGiaSauKhuyenMai(tongGia);
      
      showNotification('warning', 'Sử dụng tính giá thủ công do lỗi server', '', 3);
    }
  };

  // Fix function tính khuyến mãi
  const tinhKhuyenMai = async (tongGia: number) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/khuyen-mai/ap-dung`, {
        params: { tongGia }
      });
      
      if (response.data && response.data.coApDung) {
        setKhuyenMai(response.data.khuyenMai);
        
        // Fix logic tính giảm giá - sử dụng đúng enum từ backend
        let giamGia = 0;
        const khuyenMaiData = response.data.khuyenMai;
        switch (khuyenMaiData.loaiGiamGia) {
          case 'phan_tram':
            giamGia = (tongGia * khuyenMaiData.giaTriGiam) / 100;
            break;
          case 'so_tien_co_dinh':
            giamGia = khuyenMaiData.giaTriGiam;
            break;
          case 'tuy_chon_mien_phi':
            giamGia = 0; // Không giảm giá, chỉ miễn phí tùy chọn
            break;
          default:
            giamGia = 0;
        }
        
        const giaSauKhuyenMai = Math.max(0, tongGia - giamGia);
        setGiaSauKhuyenMai(giaSauKhuyenMai);
        
        console.log('Khuyến mãi áp dụng:', {
          loaiKhuyenMai: khuyenMaiData.loaiGiamGia,
          giaTri: khuyenMaiData.giaTriGiam,
          giamGia: giamGia,
          giaSauKhuyenMai: giaSauKhuyenMai
        });
      } else {
        // Không có khuyến mãi phù hợp
        setKhuyenMai(null);
        setGiaSauKhuyenMai(tongGia);
      }
    } catch (error) {
      console.error("Lỗi khi tính khuyến mãi:", error);
      // Nếu có lỗi, set giá sau khuyến mãi = tổng giá
      setGiaSauKhuyenMai(tongGia);
    }
  };

  // Cập nhật cấu hình khi thay đổi - Sửa để bao gồm nội thất
  useEffect(() => {
    if (selectedColor) {
      tinhTongGia();
    }
  }, [selectedColor, selectedTuyChon, selectedNoiThat, selectedBanhXe]);

  // Xử lý chọn màu sắc - SỬA: Không cần load lại hình ảnh nữa
  const handleChonMauSac = async (mauSac: MauSac) => {
    console.log('Chọn màu sắc:', mauSac);
    setSelectedColor(mauSac);
    
    // Cập nhật cấu hình hiện tại
    setCauHinhHienTai(prev => ({
      ...prev,
      idMauSac: mauSac.id
    }));
    
    // BỎ: Không cần load hình ảnh nữa vì đã load sẵn
    // await loadColorImages(mauSac.id);
  };

  // Xử lý chọn tùy chọn
  const handleChonTuyChon = (tuyChonId: number) => {
    setSelectedTuyChon(prev => {
      const danhSachMoi = prev.includes(tuyChonId)
        ? prev.filter(id => id !== tuyChonId)
        : [...prev, tuyChonId];
      
      // Cập nhật cấu hình hiện tại
      setCauHinhHienTai(prevCauHinh => ({
        ...prevCauHinh,
        danhSachIdTuyChon: danhSachMoi
      }));
      
      return danhSachMoi;
    });
  };

  // Xử lý chọn nội thất
  const handleChonNoiThat = (noiThatId: number) => {
    const noiThat = danhSachNoiThat.find(n => n.id === noiThatId) || null;
    setSelectedNoiThat(noiThat);
    
    // Cập nhật cấu hình hiện tại
    setCauHinhHienTai(prev => ({
      ...prev,
      idNoiThat: noiThat?.id
    }));
  };

  const handleChonBanhXe = (banhXeId: number) => {
    const banhXe = danhSachBanhXe.find(b => b.id === banhXeId) || null;
    setSelectedBanhXe(banhXe);
    
    // Cập nhật cấu hình hiện tại
    setCauHinhHienTai(prev => ({
      ...prev,
      idBanhXe: banhXe?.id
    }));
  };

  // Thêm function validation
  const validateCauHinh = () => {
    if (!mauXe || !selectedColor) {
      showNotification('error', "Vui lòng chọn mẫu xe và màu sắc", "", 3);
      return false;
    }
    
    if (!isAuthenticated || !user) {
      showNotification('error', "Vui lòng đăng nhập để lưu cấu hình", "", 3);
      return false;
    }
    
    if (!cauHinhHienTai.tongGia || cauHinhHienTai.tongGia <= 0) {
      showNotification('error', "Vui lòng tính giá trước khi lưu", "", 3);
      return false;
    }
    
    return true;
  };

  // Sửa handleLuuCauHinh
  const handleLuuCauHinh = async () => {
    try {
      // Validation trước
      if (!validateCauHinh()) {
        return null;
      }

      setIsSaving(true);
      
      // Tạo object cấu hình với đầy đủ thông tin
      const cauHinhData = {
        ...cauHinhHienTai,
        idNguoiDung: user!.userId,
        ten: `${mauXe?.tenMau} - ${new Date().toLocaleDateString('vi-VN')}`,
        tongGia: cauHinhHienTai.tongGia,
        // Đảm bảo có đầy đủ thông tin
        idNoiThat: cauHinhHienTai.idNoiThat || undefined,
        idBanhXe: cauHinhHienTai.idBanhXe || undefined,
        danhSachIdTuyChon: cauHinhHienTai.danhSachIdTuyChon || []
      };
      
      console.log('Gửi dữ liệu cấu hình:', cauHinhData);
      
      const response = await cauHinhService.cauHinhService.createCauHinh(cauHinhData);
      
      showNotification('success', "Đã lưu cấu hình thành công!", "", 3);
      return response.id;
    } catch (error: any) {
      console.error("Lỗi khi lưu cấu hình:", error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);
        
        if (error.response.status === 400) {
          const errorMessage = error.response.data.message || 'Dữ liệu không hợp lệ';
          showNotification('error', `Lỗi validation: ${errorMessage}`, "", 3);
        } else if (error.response.status === 401) {
          showNotification('error', 'Vui lòng đăng nhập để sử dụng tính năng này', "", 3);
        } else if (error.response.status === 403) {
          showNotification('error', 'Bạn không có quyền truy cập tính năng này', "", 3);
        } else {
          showNotification('error', `Lỗi server: ${error.response.data.message || 'Không thể lưu cấu hình'}`, "", 3);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        showNotification('error', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng', "", 3);
      } else {
        showNotification('error', 'Lỗi không xác định: ' + error.message, "", 3);
      }
      
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Xuất PDF
  const handleXuatPDF = async () => {
    try {
      // Kiểm tra xem user đã đăng nhập chưa
      if (!isAuthenticated || !user) {
        showNotification('error', "Vui lòng đăng nhập để xuất PDF", "", 3);
        return;
      }

      // Hiển thị loading
      showNotification('info', 'Đang tạo PDF...', "", 0); // Thay "loading" bằng "info"
      
      // Lưu cấu hình trước
      const configId = await handleLuuCauHinh();
      if (!configId) {
        showNotification('error', 'Không thể lưu cấu hình', "", 3);
        return;
      }
      
      // Tạo URL để download PDF
      const pdfUrl = `${BACKEND_URL}/cau-hinh/${configId}/pdf`;
      
      try {
        // Kiểm tra xem có thể truy cập URL không
        const response = await axios.get(pdfUrl, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Tạo blob và download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Tạo link ẩn để download
        const link = document.createElement('a');
        link.href = url;
        link.download = `cau-hinh-xe-${mauXe?.tenMau || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.style.display = 'none';
        
        // Thêm vào DOM và click
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showNotification('success', 'Đã xuất PDF thành công!', "", 3);
        
      } catch (downloadError) {
        console.error("Lỗi khi download PDF:", downloadError);
        
        // Fallback: mở trong tab mới
        window.open(pdfUrl, '_blank');
        showNotification('success', 'Đã mở PDF trong tab mới!', "", 3);
      }
      
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      showNotification('error', 'Không thể xuất PDF: ' + (error as any).message, "", 3);
    }
  };

  // Chia sẻ cấu hình
  const handleChiaSe = async () => {
    try {
      const configId = await handleLuuCauHinh();
      if (configId) {
        const shareUrl = `${window.location.origin}/quotation/${configId}`;
        await navigator.clipboard.writeText(shareUrl);
        showNotification('success', "Đã sao chép link chia sẻ!", "", 3);
      }
    } catch (error) {
      showNotification('error', "Không thể chia sẻ cấu hình", "", 3);
    }
  };

  // Thêm function để retry load data
  const retryLoadData = async () => {
    showNotification('info', 'Đang thử lại...', "", 0); // Thay "loading" bằng "info"
    try {
      await loadInitialData();
      showNotification('success', 'Đã tải lại dữ liệu thành công!', "", 3);
    } catch (error) {
      showNotification('error', 'Không thể tải lại dữ liệu', "", 3);
    }
  };

  // Các bước cấu hình
  const steps = [
    {
      title: 'Chọn màu sắc',
      icon: <BgColorsOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Chọn màu sắc cho xe của bạn</Title>
          <Row gutter={[16, 16]}>
            {danhSachMauSac.map(mauSac => {
              const colorImages = hinhAnhXeTheoMau[mauSac.id] || [];
              const exteriorImages = colorImages.filter(img => img.loaiHinh === 'ngoai_that');
              const mainImage = exteriorImages.length > 0 ? exteriorImages[0] : null;
              
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={mauSac.id}>
                  <Card
                    hoverable
                    className={`color-card ${cauHinhHienTai.idMauSac === mauSac.id ? 'selected' : ''}`}
                    onClick={() => handleChonMauSac(mauSac)}
                  >
                    <div className="color-preview">
                      {mainImage ? (
                        <img 
                          src={`${BACKEND_URL.replace('/api/v1', '')}${mainImage.duongDanAnh}`}
                          alt={`${mauSac.ten} - ${mauXe?.tenMau}`}
                          className="color-car-image"
                          onError={(e) => {
                            console.error('Image failed to load:', mainImage.duongDanAnh);
                            e.currentTarget.style.display = 'none';
                            const colorSwatch = e.currentTarget.nextElementSibling;
                            if (colorSwatch) {
                              colorSwatch.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`color-swatch ${mainImage ? 'hidden' : ''}`}
                        style={{ backgroundColor: mauSac.maHex }}
                      />
                    </div>
                    <div className="color-info">
                      <Text strong style={{ fontSize: '16px' }}>
                        {mauSac.ten}
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        <Space size={8} wrap>
                          <Tag color={mauSac.giaThem > 0 ? 'blue' : 'green'} style={{ margin: 0, padding: '4px 10px', borderRadius: 12 }}>
                            {mauSac.giaThem > 0 
                              ? `+${mauSac.giaThem.toLocaleString('vi-VN')} VNĐ`
                              : 'Miễn phí'}
                          </Tag>
                          {mauSac.laMetallic && (
                            <Tag color="gold" style={{ margin: 0, padding: '4px 10px', borderRadius: 12, color: '#000', fontWeight: 600 }}>
                              Metallic
                            </Tag>
                          )}
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )
    },
    {
      title: 'Chọn tùy chọn',
      icon: <SettingOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Tùy chỉnh các tính năng</Title>
          
          {danhSachTuyChon.length > 0 ? (
            <Row gutter={[16, 16]}>
              {danhSachTuyChon.map(tuyChon => (
                <Col xs={24} sm={12} md={8} key={tuyChon.id}>
                  <Card
                    hoverable
                    className={`option-card ${cauHinhHienTai.danhSachIdTuyChon.includes(tuyChon.id) ? 'selected' : ''}`}
                    onClick={() => handleChonTuyChon(tuyChon.id)}
                  >
                    <div className="option-info">
                      <Text strong>{tuyChon.ten}</Text>
                      <Text type="secondary">{tuyChon.moTa}</Text>
                      <Text className="option-price" style={{ color: '#1890ff' }}>
                        +{tuyChon.gia.toLocaleString('vi-VN')} VNĐ
                      </Text>
                      <Text type="secondary" className="option-category">
                        {tuyChon.danhMuc}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
              <Text>Không có tùy chọn tính năng nào</Text>
              <br />
              <Text type="secondary">Vui lòng kiểm tra backend hoặc database</Text>
              <br />
              <Button 
                type="primary" 
                onClick={retryLoadData}
                style={{ marginTop: '16px' }}
              >
                Thử lại
              </Button>
            </div>
          )}
          
          {/* Thêm phần khuyến mãi */}
          {danhSachKhuyenMai.length > 0 && (
            <>
              <Divider style={{ margin: '40px 0 20px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
              <Title level={4} style={{ color: '#ffffff' }}>
                <GiftOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                Khuyến mãi hiện tại
              </Title>
              <Row gutter={[16, 16]}>
                {danhSachKhuyenMai.map(khuyenMai => (
                  <Col xs={24} sm={12} md={8} key={khuyenMai.id}>
                    <Card
                      hoverable
                      className={`promotion-card ${khuyenMaiDuocChon?.id === khuyenMai.id ? 'selected' : ''}`}
                      onClick={() => setKhuyenMaiDuocChon(khuyenMai)}
                    >
                      <div className="promotion-info">
                        <Text strong>{khuyenMai.ten}</Text>
                        <Text type="secondary">{khuyenMai.moTa}</Text>
                        <Text className="promotion-value" style={{ color: '#52c41a' }}>
                          {khuyenMai.loaiGiamGia === 'phan_tram' 
                            ? `Giảm ${khuyenMai.giaTriGiam}%`
                            : khuyenMai.loaiGiamGia === 'so_tien_co_dinh'
                            ? `Giảm ${khuyenMai.giaTriGiam.toLocaleString('vi-VN')} VNĐ`
                            : 'Tùy chọn miễn phí'
                          }
                        </Text>
                        <Text type="secondary" className="promotion-period">
                          {new Date(khuyenMai.ngayBatDau).toLocaleDateString('vi-VN')} - {new Date(khuyenMai.ngayKetThuc).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Chọn nội thất & bánh xe',
      icon: <CarOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Tùy chỉnh nội thất</Title>
          
          {danhSachNoiThat.length > 0 ? (
            <Row gutter={[16, 16]}>
              {danhSachNoiThat.map(noiThat => (
                <Col xs={24} sm={12} md={8} key={noiThat.id}>
                  <Card
                    hoverable
                    className={`interior-card ${cauHinhHienTai.idNoiThat === noiThat.id ? 'selected' : ''}`}
                    onClick={() => handleChonNoiThat(noiThat.id)}
                  >
                    {noiThat.duongDanAnh && (
                      <img 
                        src={`${BACKEND_URL.replace('/api/v1', '')}${noiThat.duongDanAnh}`}
                        alt={noiThat.ten}
                        className="interior-image"
                        onError={(e) => {
                          console.error('Interior image failed to load:', noiThat.duongDanAnh);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="interior-info">
                      <Text strong>{noiThat.ten}</Text>
                      <Text type="secondary">{noiThat.moTa}</Text>
                      <Text className="interior-price" style={{ color: '#1890ff' }}>
                        +{noiThat.giaThem.toLocaleString('vi-VN')} VNĐ
                      </Text>
                      {noiThat.laMacDinh && (
                        <Text type="secondary" className="default-badge">
                          Mặc định
                        </Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
              <Text>Không có tùy chọn nội thất nào</Text>
              <br />
              <Text type="secondary">Vui lòng kiểm tra backend hoặc database</Text>
              <br />
              <Button 
                type="primary" 
                onClick={() => loadInitialData()}
                style={{ marginTop: '16px' }}
              >
                Thử lại
              </Button>
            </div>
          )}
          
          {/* Thêm phần bánh xe */}
          <Divider style={{ margin: '40px 0 20px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
          <Title level={3}>Tùy chỉnh bánh xe</Title>
          
          {danhSachBanhXe.length > 0 ? (
            <Row gutter={[16, 16]}>
              {danhSachBanhXe.map(banhXe => (
                <Col xs={24} sm={12} md={8} key={banhXe.id}>
                  <Card
                    hoverable
                    className={`wheel-card ${cauHinhHienTai.idBanhXe === banhXe.id ? 'selected' : ''}`}
                    onClick={() => handleChonBanhXe(banhXe.id)}
                  >
                    {banhXe.duongDanAnh && (
                      <img 
                        src={`${BACKEND_URL.replace('/api/v1', '')}${banhXe.duongDanAnh}`}
                        alt={banhXe.ten}
                        className="wheel-image"
                        onError={(e) => {
                          console.error('Wheel image failed to load:', banhXe.duongDanAnh);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="wheel-info">
                      <Text strong>{banhXe.ten}</Text>
                      <Text type="secondary">{banhXe.moTa}</Text>
                      {banhXe.kichThuoc && (
                        <Text type="secondary" className="wheel-size">
                          Kích thước: {banhXe.kichThuoc}
                        </Text>
                      )}
                      <Text className="wheel-price" style={{ color: '#1890ff' }}>
                        +{banhXe.giaThem.toLocaleString('vi-VN')} VNĐ
                      </Text>
                      {banhXe.laMacDinh && (
                        <Text type="secondary" className="default-badge">
                          Mặc định
                        </Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
              <Text>Không có tùy chọn bánh xe nào</Text>
              <br />
              <Text type="secondary">Vui lòng kiểm tra backend hoặc database</Text>
              <br />
              <Button 
                type="primary" 
                onClick={() => loadInitialData()}
                style={{ marginTop: '16px' }}
              >
                Thử lại
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Xem lại & Xác nhận',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Tổng quan cấu hình</Title>
          
          {/* Thông tin xe - Fix layout để giá tiền nằm bên phải */}
          <Card title="Thông tin xe" className="summary-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="vehicle-info-item">
                  <div className="vehicle-info-label">
                    <Text strong>Mẫu xe:</Text>
                  </div>
                  <div className="vehicle-info-value">
                    <Text>{mauXe?.tenMau}</Text>
                  </div>
                </div>
                <div className="vehicle-info-item">
                  <div className="vehicle-info-label">
                    <Text strong>Màu sắc:</Text>
                  </div>
                  <div className="vehicle-info-value">
                    <Text>{danhSachMauSac.find(m => m.id === cauHinhHienTai.idMauSac)?.ten}</Text>
                    {(() => {
                      const mauSac = danhSachMauSac.find(m => m.id === cauHinhHienTai.idMauSac);
                      if (!mauSac) return null;
                      const isAdd = mauSac.giaThem > 0;
                      return (
                        <Text
                          className={`value-right ${isAdd ? 'price-add' : 'price-free'}`}
                        >
                          {isAdd ? `+${mauSac.giaThem.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                        </Text>
                      );
                    })()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Tùy chọn đã chọn */}
          {cauHinhHienTai.danhSachIdTuyChon.length > 0 && (
            <Card title="Tùy chọn đã chọn" className="summary-card">
              <Row gutter={[16, 16]}>
                {cauHinhHienTai.danhSachIdTuyChon.map(tuyChonId => {
                  const tuyChon = danhSachTuyChon.find(t => t.id === tuyChonId);
                  return tuyChon ? (
                    <Col span={24} key={tuyChonId}>
                      <div className="option-summary">
                        <Text>{tuyChon.ten}</Text>
                        <Text className="option-price">+{tuyChon.gia.toLocaleString('vi-VN')} VNĐ</Text>
                      </div>
                    </Col>
                  ) : null;
                })}
              </Row>
            </Card>
          )}

          {/* Nội thất đã chọn */}
          {cauHinhHienTai.idNoiThat && (
            <Card title="Nội thất đã chọn" className="summary-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="interior-summary">
                    <Text>{danhSachNoiThat.find(n => n.id === cauHinhHienTai.idNoiThat)?.ten}</Text>
                    <Text className="interior-price">
                      +{danhSachNoiThat.find(n => n.id === cauHinhHienTai.idNoiThat)?.giaThem.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Bánh xe đã chọn */}
          {cauHinhHienTai.idBanhXe && (
            <Card title="Bánh xe đã chọn" className="summary-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="wheel-summary">
                    <Text>{danhSachBanhXe.find(b => b.id === cauHinhHienTai.idBanhXe)?.ten}</Text>
                    {danhSachBanhXe.find(b => b.id === cauHinhHienTai.idBanhXe)?.kichThuoc && (
                      <Text type="secondary" className="wheel-size-summary">
                        ({danhSachBanhXe.find(b => b.id === cauHinhHienTai.idBanhXe)?.kichThuoc})
                      </Text>
                    )}
                    <Text className="wheel-price">
                      +{danhSachBanhXe.find(b => b.id === cauHinhHienTai.idBanhXe)?.giaThem.toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Tổng giá - Fix hiển thị giá sau khuyến mãi */}
          <Card title="Tổng giá" className="summary-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="price-summary">
                  <Text strong>Giá cơ bản:</Text>
                  <Text>{mauXe?.giaCoban.toLocaleString('vi-VN')} VNĐ</Text>
                </div>
                {cauHinhHienTai.tongGia > 0 && (
                  <div className="price-summary">
                    <Text strong>Tổng giá sau tùy chỉnh:</Text>
                    <Text className="total-price">{cauHinhHienTai.tongGia.toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                )}
                {/* Fix hiển thị giá sau khuyến mãi */}
                {khuyenMai && giaSauKhuyenMai > 0 ? (
                  <div className="price-summary">
                    <Text strong>Giá sau khuyến mãi:</Text>
                    <Text className="discount-price" style={{ color: '#52c41a' }}>
                      {giaSauKhuyenMai.toLocaleString('vi-VN')} VNĐ
                    </Text>
                    <Text type="secondary" style={{ marginLeft: '8px' }}>
                      (Tiết kiệm: {(cauHinhHienTai.tongGia - giaSauKhuyenMai).toLocaleString('vi-VN')} VNĐ)
                    </Text>
                  </div>
                ) : (
                  <div className="price-summary">
                    <Text strong>Giá sau khuyến mãi:</Text>
                    <Text type="secondary">Không có khuyến mãi</Text>
                  </div>
                )}
              </Col>
            </Row>
          </Card>

          {/* Thêm phần khuyến mãi đã chọn */}
          {khuyenMaiDuocChon && (
            <Card title="Khuyến mãi đã chọn" className="summary-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="promotion-summary">
                    <Text strong>{khuyenMaiDuocChon.ten}</Text>
                    <Text className="promotion-value">
                      {khuyenMaiDuocChon.loaiGiamGia === 'phan_tram' 
                        ? `Giảm ${khuyenMaiDuocChon.giaTriGiam}%`
                        : khuyenMaiDuocChon.loaiGiamGia === 'so_tien_co_dinh'
                        ? `Giảm ${khuyenMaiDuocChon.giaTriGiam.toLocaleString('vi-VN')} VNĐ`
                        : 'Tùy chọn miễn phí'
                      }
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="vehicle-configurator">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: '#ffffff' }}>Đang tải cấu hình xe...</div>
        </div>
      </div>
    );
  }

  // function xử lý đặt hàng ngay
  const handleDatHangNgay = async () => {
    try {
      // Kiểm tra xem user đã đăng nhập chưa
      if (!isAuthenticated || !user) {
        showNotification('error', "Vui lòng đăng nhập để đặt hàng", "", 3);
        return;
      }

      // Kiểm tra cấu hình đã hoàn thành chưa
      if (!selectedColor || cauHinhHienTai.tongGia <= 0) {
        showNotification('error', "Vui lòng hoàn thành cấu hình xe trước khi đặt hàng", "", 3);
        return;
      }

      setOrderLoading(true);
      
      // Lưu cấu hình trước
      const configId = await handleLuuCauHinh();
      if (!configId) {
        showNotification('error', 'Không thể lưu cấu hình', "", 3);
        setOrderLoading(false);
        return;
      }

      // Chuyển đến trang đặt hàng
      navigate(`/order/${configId}`, { 
        state: { 
          config: cauHinhHienTai,
          fromConfigurator: true 
        } 
      });

    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      showNotification('error', "Không thể đặt hàng", "", 3);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="vehicle-configurator">
      {/* Header */}
      <div className="configurator-header">
        <h2>Cấu hình xe {mauXe?.tenMau}</h2>
        <div className="header-actions">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Chế độ cấu hình' : 'Xem trước'}
          </Button>
          <Button 
            icon={<SaveOutlined />} 
            onClick={handleLuuCauHinh}
            loading={saving}
          >
            Lưu cấu hình
          </Button>
          <Button 
            icon={<ShareAltOutlined />} 
            onClick={handleChiaSe}
          >
            Chia sẻ
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleXuatPDF}
          >
            Xuất PDF
          </Button>
          <Button 
            type="primary" 
            icon={<CreditCardOutlined />}
            onClick={handleDatHangNgay}
            loading={orderLoading}
            style={{ 
              background: 'linear-gradient(135deg, #52c41a, #73d13d)',
              border: 'none',
              boxShadow: '0 4px 15px rgba(82, 196, 26, 0.3)'
            }}
          >
            Đặt hàng ngay
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="configurator-content">
        {/* Steps */}
        <div className="steps-container">
          <Steps current={currentStep} onChange={setCurrentStep}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>
        </div>

        {/* Step Content */}
        <div className="step-content-wrapper">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="step-navigation">
          <Button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Quay lại
          </Button>
          <Button 
            type="primary"
            disabled={currentStep === steps.length - 1}
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Tiếp theo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleConfigurator;