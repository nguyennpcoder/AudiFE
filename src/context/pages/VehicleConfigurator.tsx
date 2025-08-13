import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Steps, Button, Card, Row, Col, Typography, Divider, message, Spin, Progress } from "antd";
import { 
  CarOutlined, 
  BgColorsOutlined, 
  SettingOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  SaveOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import "../../styles/VehicleConfigurator.css";

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

interface CauHinhTuyChinh {
  id?: number;
  idNguoiDung?: number;
  idMau: number;
  idMauSac: number;
  idNoiThat?: number;
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

const VehicleConfigurator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State cho dữ liệu
  const [mauXe, setMauXe] = useState<MauXe | null>(null);
  const [danhSachMauSac, setDanhSachMauSac] = useState<MauSac[]>([]);
  const [danhSachTuyChon, setDanhSachTuyChon] = useState<TuyChon[]>([]);
  const [danhSachNoiThat, setDanhSachNoiThat] = useState<NoiThat[]>([]);
  
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

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load mẫu xe
      const mauXeResponse = await axios.get(`${BACKEND_URL}/mau-xe/${id}`);
      setMauXe(mauXeResponse.data);
      
      // Load màu sắc cho mẫu xe cụ thể - BỎ /api/v1
      const mauSacResponse = await axios.get(`${BACKEND_URL}/mau-sac/mau-xe/${id}`);
      console.log('Màu sắc loaded:', mauSacResponse.data);
      setDanhSachMauSac(mauSacResponse.data);
      
      // Load tùy chọn - BỎ /api/v1
      const tuyChonResponse = await axios.get(`${BACKEND_URL}/tuy-chon`);
      console.log('Tùy chọn loaded:', tuyChonResponse.data);
      setDanhSachTuyChon(tuyChonResponse.data);
      
      // Load nội thất - BỎ /api/v1
      try {
        const noiThatResponse = await axios.get(`${BACKEND_URL}/noi-that/mau-xe/${id}`);
        console.log('Nội thất loaded:', noiThatResponse.data);
        setDanhSachNoiThat(noiThatResponse.data);
      } catch (noiThatError: any) {
        console.error('Lỗi khi load nội thất:', noiThatError);
        setDanhSachNoiThat([]);
      }
      
      // Set màu sắc đầu tiên làm mặc định và load hình ảnh
      if (mauSacResponse.data.length > 0) {
        const defaultColor = mauSacResponse.data[0];
        setCauHinhHienTai(prev => ({
          ...prev,
          idMauSac: defaultColor.id
        }));
        
        // Load hình ảnh cho màu mặc định
        await loadColorImages(defaultColor.id);
      }
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải dữ liệu cấu hình xe");
    } finally {
      setLoading(false);
    }
  };

  // Load hình ảnh theo màu sắc - BỎ /api/v1
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

  // Tính tổng giá - BỎ /api/v1
  const tinhTongGia = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/cau-hinh/tinh-gia`, {
        params: {
          idMauXe: cauHinhHienTai.idMau,
          idMauSac: cauHinhHienTai.idMauSac,
          idTuyChon: cauHinhHienTai.danhSachIdTuyChon
        }
      });
      
      const tongGia = response.data;
      setCauHinhHienTai(prev => ({ ...prev, tongGia }));
      
      // Tính khuyến mãi
      await tinhKhuyenMai(tongGia);
      
    } catch (error) {
      console.error("Lỗi khi tính giá:", error);
    }
  };

  // Tính khuyến mãi
  const tinhKhuyenMai = async (tongGia: number) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/khuyen-mai/ap-dung`, {
        params: { tongGia }
      });
      
      if (response.data) {
        setKhuyenMai(response.data);
        const giamGia = response.data.loaiKhuyenMai === 'PHAN_TRAM' 
          ? (tongGia * response.data.giaTri / 100)
          : response.data.giaTri;
        setGiaSauKhuyenMai(Math.max(0, tongGia - giamGia));
      }
    } catch (error) {
      console.error("Lỗi khi tính khuyến mãi:", error);
    }
  };

  // Cập nhật cấu hình khi thay đổi
  useEffect(() => {
    if (cauHinhHienTai.idMauSac > 0) {
      tinhTongGia();
    }
  }, [cauHinhHienTai.idMauSac, cauHinhHienTai.danhSachIdTuyChon]);

  // Xử lý chọn màu sắc
  const handleChonMauSac = async (mauSac: MauSac) => {
    console.log('Chọn màu sắc:', mauSac);
    setCauHinhHienTai(prev => ({
      ...prev,
      idMauSac: mauSac.id
    }));
    
    // Load hình ảnh cho màu sắc mới
    await loadColorImages(mauSac.id);
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

  // Lưu cấu hình
  const handleLuuCauHinh = async () => {
    try {
      setSaving(true);
      
      const response = await axios.post(`${BACKEND_URL}/cau-hinh`, {
        ...cauHinhHienTai,
        ten: `${mauXe?.tenMau} - ${new Date().toLocaleDateString('vi-VN')}`
      });
      
      message.success("Đã lưu cấu hình thành công!");
      return response.data.id;
    } catch (error) {
      console.error("Lỗi khi lưu cấu hình:", error);
      message.error("Không thể lưu cấu hình");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Xuất PDF
  const handleXuatPDF = async () => {
    try {
      const configId = await handleLuuCauHinh();
      if (configId) {
        window.open(`${BACKEND_URL}/cau-hinh/${configId}/pdf`, '_blank');
      }
    } catch (error) {
      message.error("Không thể xuất PDF");
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
              
              console.log(`Rendering color ${mauSac.ten}:`, {
                colorId: mauSac.id,
                totalImages: colorImages.length,
                exteriorImages: exteriorImages.length,
                mainImage: mainImage
              });
              
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
                          // Sử dụng đúng đường dẫn hình ảnh như ProductDetail
                          src={`${BACKEND_URL.replace('/api/v1', '')}${mainImage.duongDanAnh}`}
                          alt={`${mauSac.ten} - ${mauXe?.tenMau}`}
                          className="color-car-image"
                          onError={(e) => {
                            console.error('Image failed to load:', `${BACKEND_URL.replace('/api/v1', '')}${mainImage.duongDanAnh}`);
                            // Ẩn hình ảnh và hiển thị color swatch
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
                      <Text strong>{mauSac.ten}</Text>
                      <Text type="secondary" className="color-price">
                        {mauSac.giaThem > 0 ? `+${mauSac.giaThem.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                      </Text>
                      {mauSac.laMetallic && (
                        <Text type="secondary" className="metallic-badge">
                          Metallic
                        </Text>
                      )}
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
        </div>
      )
    },
    {
      title: 'Chọn nội thất',
      icon: <CarOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Tùy chỉnh nội thất</Title>
          
          {/* Debug info */}
          <div style={{ marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <Text type="secondary">
              Debug: Đã load {danhSachNoiThat.length} nội thất
            </Text>
            <br />
            <Text type="secondary">
              Danh sách: {danhSachNoiThat.map(n => n.ten).join(', ')}
            </Text>
          </div>
          
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
          
          {/* Thông tin xe */}
          <Card title="Thông tin xe" className="summary-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Mẫu xe:</Text>
                <Text>{mauXe?.tenMau}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Màu sắc:</Text>
                <Text>{danhSachMauSac.find(m => m.id === cauHinhHienTai.idMauSac)?.ten}</Text>
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

          {/* Tổng giá */}
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
                {khuyenMai && (
                  <div className="price-summary">
                    <Text strong>Giá sau khuyến mãi:</Text>
                    <Text className="discount-price">{giaSauKhuyenMai.toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
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
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/quotation/new', { state: { config: cauHinhHienTai } })}
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