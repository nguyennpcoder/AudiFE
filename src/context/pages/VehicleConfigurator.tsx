import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Steps, Button, Card, Row, Col, Typography, Divider, message, Spin, Progress, Alert, Tag, Space } from "antd";
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
  CreditCardOutlined, // THÊM icon này
  LockOutlined, // THÊM icon này
  LoginOutlined // THÊM icon này
} from "@ant-design/icons";
import "../../styles/VehicleConfigurator.css";
import { useAuth } from "../AuthContext"; // Thêm import này
import { cauHinhService } from "../../services/cauHinhService";
import { useScrollToTop } from "../../hooks/useScrollToTop"; // THÊM import này


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
  giaThem: number; // Thay đổi từ gia thành giaThem
  duongDanAnh: string;
  laMacDinh?: boolean; // Thêm field này
  mauSac?: string; // Thêm field này
}

interface BanhXe {
  id: number;
  ten: string;
  moTa: string;
  giaThem: number;
  duongDanAnh: string;
  laMacDinh?: boolean;
  kichThuoc?: string; // Kích thước bánh xe (ví dụ: "19 inch", "20 inch")
}

interface CauHinhTuyChinh {
  id?: number;
  idNguoiDung?: number;
  idMau: number;
  idMauSac: number;
  idNoiThat?: number;
  idBanhXe?: number; // Thêm trường này
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
  const { user, isAuthenticated } = useAuth(); // Thêm hook này
  
  // THÊM: Kiểm tra đăng nhập ngay từ đầu
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để tùy chỉnh cấu hình xe');
      navigate('/login', { 
        state: { 
          from: `/configurator/${id}`,
          message: 'Vui lòng đăng nhập để tùy chỉnh cấu hình xe'
        } 
      });
      return;
    }
  }, [isAuthenticated, navigate, id]);

  // THÊM: Hiển thị màn hình bảo vệ nếu chưa đăng nhập
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

  // THÊM: Sử dụng custom hook để scroll to top
  useScrollToTop();
  
  // State cho dữ liệu
  const [mauXe, setMauXe] = useState<MauXe | null>(null);
  const [danhSachMauSac, setDanhSachMauSac] = useState<MauSac[]>([]);
  const [danhSachTuyChon, setDanhSachTuyChon] = useState<TuyChon[]>([]);
  const [danhSachNoiThat, setDanhSachNoiThat] = useState<NoiThat[]>([]);
  const [danhSachBanhXe, setDanhSachBanhXe] = useState<BanhXe[]>([]);
  
  // State cho hình ảnh xe theo màu
  const [hinhAnhXeTheoMau, setHinhAnhXeTheoMau] = useState<{ [key: number]: HinhAnhXeTheoMauDTO[] }>({});
  
  // State cho cấu hình hiện tại
  const [cauHinhHienTai, setCauHinhHienTai] = useState<CauHinhTuyChinh>({
    idMau: parseInt(id || "0"),
    idMauSac: 0,
    danhSachIdTuyChon: [],
    tongGia: 0
  });
  
  // State cho UI
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // State cho khuyến mãi
  const [khuyenMai, setKhuyenMai] = useState<any>(null);
  const [giaSauKhuyenMai, setGiaSauKhuyenMai] = useState(0);

  // Thêm state cho khuyến mãi
  const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState<KhuyenMai[]>([]);
  const [khuyenMaiDuocChon, setKhuyenMaiDuocChon] = useState<KhuyenMai | null>(null);

  // THÊM state cho modal đặt hàng
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

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
          message.warning('Sử dụng tùy chọn mặc định do lỗi server');
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
          message.warning('Sử dụng nội thất mặc định do lỗi server');
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
          message.warning('Sử dụng bánh xe mặc định do lỗi server');
        }
      }
      
      // Load khuyến mãi
      await loadKhuyenMai();
      
      // SỬA: Load hình ảnh cho TẤT CẢ màu sắc ngay từ đầu
      if (mauSacResponse.data.length > 0) {
        const defaultColor = mauSacResponse.data[0];
        setCauHinhHienTai(prev => ({
          ...prev,
          idMauSac: defaultColor.id
        }));
        
        // Load hình ảnh cho TẤT CẢ màu sắc cùng lúc
        console.log('Bắt đầu load hình ảnh cho tất cả màu sắc...');
        await loadAllColorImages(mauSacResponse.data);
      }
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải dữ liệu cấu hình xe");
    } finally {
      setLoading(false);
    }
  };

  // THÊM FUNCTION MỚI: Load hình ảnh cho tất cả màu sắc
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
      message.warning('Có lỗi khi load một số hình ảnh màu sắc');
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
      console.log('Đang tính giá với params:', {
        idMauXe: cauHinhHienTai.idMau,
        idMauSac: cauHinhHienTai.idMauSac,
        idNoiThat: cauHinhHienTai.idNoiThat,
        idTuyChon: cauHinhHienTai.danhSachIdTuyChon
      });
      
      const response = await axios.get(`${BACKEND_URL}/cau-hinh/tinh-gia`, {
        params: {
          idMauXe: cauHinhHienTai.idMau,
          idMauSac: cauHinhHienTai.idMauSac,
          idNoiThat: cauHinhHienTai.idNoiThat,
          idTuyChon: cauHinhHienTai.danhSachIdTuyChon
        }
      });
      
      console.log('Response tính giá:', response.data);
      
      const tongGia = response.data;
      setCauHinhHienTai(prev => ({ ...prev, tongGia }));
      
      // Tính khuyến mãi
      await tinhKhuyenMai(tongGia);
      
    } catch (error: any) {
      console.error("Lỗi khi tính giá:", error);
      
      // Fallback: tính giá thủ công
      let tongGia = mauXe?.giaCoban || 0;
      
      // Cộng giá màu sắc
      const mauSac = danhSachMauSac.find(m => m.id === cauHinhHienTai.idMauSac);
      if (mauSac && mauSac.giaThem) {
        tongGia += mauSac.giaThem;
      }
      
      // Cộng giá nội thất
      const noiThat = danhSachNoiThat.find(n => n.id === cauHinhHienTai.idNoiThat);
      if (noiThat && noiThat.giaThem) {
        tongGia += noiThat.giaThem;
      }
      
      // Cộng giá bánh xe
      const banhXe = danhSachBanhXe.find(b => b.id === cauHinhHienTai.idBanhXe);
      if (banhXe && banhXe.giaThem) {
        tongGia += banhXe.giaThem;
      }
      
      // Cộng giá tùy chọn
      cauHinhHienTai.danhSachIdTuyChon.forEach(tuyChonId => {
        const tuyChon = danhSachTuyChon.find(t => t.id === tuyChonId);
        if (tuyChon && tuyChon.gia) {
          tongGia += tuyChon.gia;
        }
      });
      
      setCauHinhHienTai(prev => ({ ...prev, tongGia }));
      setGiaSauKhuyenMai(tongGia);
      
      message.warning('Sử dụng tính giá thủ công do lỗi server');
    }
  };

  // Fix function tính khuyến mãi
  const tinhKhuyenMai = async (tongGia: number) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/khuyen-mai/ap-dung`, {
        params: { tongGia }
      });
      
      if (response.data && response.data.coApDung) {
        setKhuyenMai(response.data);
        
        // Fix logic tính giảm giá - sử dụng đúng enum từ backend
        let giamGia = 0;
        switch (response.data.loaiKhuyenMai) {
          case 'phan_tram':
            giamGia = (tongGia * response.data.giaTri) / 100;
            break;
          case 'so_tien_co_dinh':
            giamGia = response.data.giaTri;
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
          loaiKhuyenMai: response.data.loaiKhuyenMai,
          giaTri: response.data.giaTri,
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
    if (cauHinhHienTai.idMauSac > 0) {
      tinhTongGia();
    }
  }, [cauHinhHienTai.idMauSac, cauHinhHienTai.danhSachIdTuyChon, cauHinhHienTai.idNoiThat]);

  // Xử lý chọn màu sắc - SỬA: Không cần load lại hình ảnh nữa
  const handleChonMauSac = async (mauSac: MauSac) => {
    console.log('Chọn màu sắc:', mauSac);
    setCauHinhHienTai(prev => ({
      ...prev,
      idMauSac: mauSac.id
    }));
    
    // BỎ: Không cần load hình ảnh nữa vì đã load sẵn
    // await loadColorImages(mauSac.id);
  };

  // Xử lý chọn tùy chọn
  const handleChonTuyChon = (tuyChonId: number) => {
    setCauHinhHienTai(prev => {
      const danhSachMoi = prev.danhSachIdTuyChon.includes(tuyChonId)
        ? prev.danhSachIdTuyChon.filter(id => id !== tuyChonId)
        : [...prev.danhSachIdTuyChon, tuyChonId];
      
      return {
        ...prev,
        danhSachIdTuyChon: danhSachMoi
      };
    });
  };

  // Xử lý chọn nội thất
  const handleChonNoiThat = (noiThatId: number) => {
    setCauHinhHienTai(prev => ({
      ...prev,
      idNoiThat: noiThatId
    }));
  };

  const handleChonBanhXe = (banhXeId: number) => {
    setCauHinhHienTai(prev => ({
      ...prev,
      idBanhXe: banhXeId
    }));
  };

  // Thêm function validation
  const validateCauHinh = () => {
    if (!cauHinhHienTai.idMau || !cauHinhHienTai.idMauSac) {
      message.error("Vui lòng chọn mẫu xe và màu sắc");
      return false;
    }
    
    if (!isAuthenticated || !user) {
      message.error("Vui lòng đăng nhập để lưu cấu hình");
      return false;
    }
    
    if (!cauHinhHienTai.tongGia || cauHinhHienTai.tongGia <= 0) {
      message.error("Vui lòng tính giá trước khi lưu");
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

      setSaving(true);
      
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
      
      const response = await cauHinhService.createCauHinh(cauHinhData);
      
      message.success("Đã lưu cấu hình thành công!");
      return response.id;
    } catch (error: any) {
      console.error("Lỗi khi lưu cấu hình:", error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);
        
        if (error.response.status === 400) {
          const errorMessage = error.response.data.message || 'Dữ liệu không hợp lệ';
          message.error(`Lỗi validation: ${errorMessage}`);
        } else if (error.response.status === 401) {
          message.error('Vui lòng đăng nhập để sử dụng tính năng này');
        } else if (error.response.status === 403) {
          message.error('Bạn không có quyền truy cập tính năng này');
        } else {
          message.error(`Lỗi server: ${error.response.data.message || 'Không thể lưu cấu hình'}`);
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
      } else {
        message.error('Lỗi không xác định: ' + error.message);
      }
      
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Xuất PDF
  const handleXuatPDF = async () => {
    try {
      // Kiểm tra xem user đã đăng nhập chưa
      if (!isAuthenticated || !user) {
        message.error("Vui lòng đăng nhập để xuất PDF");
        return;
      }

      // Hiển thị loading
      const hideLoading = message.loading('Đang tạo PDF...', 0);
      
      // Lưu cấu hình trước
      const configId = await handleLuuCauHinh();
      if (!configId) {
        hideLoading();
        message.error('Không thể lưu cấu hình');
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
        
        hideLoading();
        message.success('Đã xuất PDF thành công!');
        
      } catch (downloadError) {
        console.error("Lỗi khi download PDF:", downloadError);
        
        // Fallback: mở trong tab mới
        window.open(pdfUrl, '_blank');
        message.success({ content: 'Đã mở PDF trong tab mới!', key: 'pdf' });
      }
      
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      message.error({ content: 'Không thể xuất PDF: ' + (error as any).message, key: 'pdf' });
    }
  };

  // Chia sẻ cấu hình
  const handleChiaSe = async () => {
    try {
      const configId = await handleLuuCauHinh();
      if (configId) {
        const shareUrl = `${window.location.origin}/quotation/${configId}`;
        await navigator.clipboard.writeText(shareUrl);
        message.success("Đã sao chép link chia sẻ!");
      }
    } catch (error) {
      message.error("Không thể chia sẻ cấu hình");
    }
  };

  // Thêm function để retry load data
  const retryLoadData = async () => {
    message.loading('Đang thử lại...', 0);
    try {
      await loadInitialData();
      message.destroy();
      message.success('Đã tải lại dữ liệu thành công!');
    } catch (error) {
      message.destroy();
      message.error('Không thể tải lại dữ liệu');
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

  // THÊM function xử lý đặt hàng ngay
  const handleDatHangNgay = async () => {
    try {
      // Kiểm tra xem user đã đăng nhập chưa
      if (!isAuthenticated || !user) {
        message.error("Vui lòng đăng nhập để đặt hàng");
        return;
      }

      // Kiểm tra cấu hình đã hoàn thành chưa
      if (!cauHinhHienTai.idMauSac || cauHinhHienTai.tongGia <= 0) {
        message.error("Vui lòng hoàn thành cấu hình xe trước khi đặt hàng");
        return;
      }

      // Lưu cấu hình trước
      const configId = await handleLuuCauHinh();
      if (!configId) {
        message.error('Không thể lưu cấu hình');
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
      message.error("Không thể đặt hàng");
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
