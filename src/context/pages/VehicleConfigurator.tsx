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
  gia: number;
  duongDanAnh: string;
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
      
      // Load màu sắc cho mẫu xe cụ thể
      const mauSacResponse = await axios.get(`${BACKEND_URL}/mau-sac/mau-xe/${id}`);
      console.log('Màu sắc loaded:', mauSacResponse.data); // Debug log
      setDanhSachMauSac(mauSacResponse.data);
      
      // Load tùy chọn
      const tuyChonResponse = await axios.get(`${BACKEND_URL}/tuy-chon`);
      setDanhSachTuyChon(tuyChonResponse.data);
      
      // Load nội thất
      const noiThatResponse = await axios.get(`${BACKEND_URL}/noi-that`);
      setDanhSachNoiThat(noiThatResponse.data);
      
      // Set màu sắc đầu tiên làm mặc định
      if (mauSacResponse.data.length > 0) {
        setCauHinhHienTai(prev => ({
          ...prev,
          idMauSac: mauSacResponse.data[0].id
        }));
      }
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải dữ liệu cấu hình xe");
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng giá
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
  const handleChonMauSac = (mauSac: MauSac) => {
    setCauHinhHienTai(prev => ({
      ...prev,
      idMauSac: mauSac.id
    }));
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
              console.log('Rendering color:', mauSac); // Debug log
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={mauSac.id}>
                  <Card
                    hoverable
                    className={`color-card ${cauHinhHienTai.idMauSac === mauSac.id ? 'selected' : ''}`}
                    onClick={() => handleChonMauSac(mauSac)}
                  >
                    <div className="color-preview">
                      {mauSac.duongDanAnh ? (
                        <img 
                          src={`${BACKEND_URL}${mauSac.duongDanAnh}`}
                          alt={`${mauSac.ten} - ${mauXe?.tenMau}`}
                          className="color-car-image"
                          onError={(e) => {
                            console.error('Image failed to load:', `${BACKEND_URL}${mauSac.duongDanAnh}`);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div 
                        className={`color-swatch ${mauSac.duongDanAnh ? 'hidden' : ''}`}
                        style={{ backgroundColor: mauSac.maHex }}
                      />
                    </div>
                    <div className="color-info">
                      <Text strong>{mauSac.ten}</Text>
                      <Text type="secondary">
                        {mauSac.giaThem > 0 ? `+${mauSac.giaThem.toLocaleString('vi-VN')} VNĐ` : '+0 VNĐ'}
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
                      src={`${BACKEND_URL}${noiThat.duongDanAnh}`}
                      alt={noiThat.ten}
                      className="interior-image"
                    />
                  )}
                  <div className="interior-info">
                    <Text strong>{noiThat.ten}</Text>
                    <Text type="secondary">{noiThat.moTa}</Text>
                    <Text className="interior-price" style={{ color: '#1890ff' }}>
                      +{noiThat.gia.toLocaleString('vi-VN')} VNĐ
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
      title: 'Xem lại & Xác nhận',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Xem lại cấu hình của bạn</Title>
          
          <Card className="summary-card">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Title level={4}>Thông tin xe</Title>
                <Paragraph>
                  <Text strong>Mẫu xe:</Text> {mauXe?.tenMau}
                </Paragraph>
                <Paragraph>
                  <Text strong>Màu sắc:</Text> {
                    danhSachMauSac.find(m => m.id === cauHinhHienTai.idMauSac)?.ten
                  }
                </Paragraph>
                <Paragraph>
                  <Text strong>Nội thất:</Text> {
                    danhSachNoiThat.find(n => n.id === cauHinhHienTai.idNoiThat)?.ten || 'Chưa chọn'
                  }
                </Paragraph>
              </Col>
              
              <Col xs={24} md={12}>
                <Title level={4}>Tùy chọn đã chọn</Title>
                {cauHinhHienTai.danhSachIdTuyChon.length > 0 ? (
                  <ul>
                    {cauHinhHienTai.danhSachIdTuyChon.map(id => {
                      const tuyChon = danhSachTuyChon.find(t => t.id === id);
                      return tuyChon ? (
                        <li key={id}>
                          {tuyChon.ten} (+{tuyChon.gia.toLocaleString('vi-VN')} VNĐ)
                        </li>
                      ) : null;
                    })}
                  </ul>
                ) : (
                  <Text type="secondary">Chưa chọn tùy chọn nào</Text>
                )}
              </Col>
            </Row>
            
            <Divider />
            
            <div className="price-summary">
              <Title level={4}>Tổng giá</Title>
              <div className="price-breakdown">
                <div className="price-item">
                  <Text>Giá cơ bản:</Text>
                  <Text>{mauXe?.giaCoban.toLocaleString('vi-VN')} VNĐ</Text>
                </div>
                <div className="price-item">
                  <Text>Màu sắc:</Text>
                  <Text>+{danhSachMauSac.find(m => m.id === cauHinhHienTai.idMauSac)?.giaThem.toLocaleString('vi-VN') || 0} VNĐ</Text>
                </div>
                <div className="price-item">
                  <Text>Tùy chọn:</Text>
                  <Text>+{cauHinhHienTai.danhSachIdTuyChon.reduce((sum, id) => {
                    const tuyChon = danhSachTuyChon.find(t => t.id === id);
                    return sum + (tuyChon?.gia || 0);
                  }, 0).toLocaleString('vi-VN')} VNĐ</Text>
                </div>
                {khuyenMai && (
                  <div className="price-item discount">
                    <Text>Khuyến mãi ({khuyenMai.ten}):</Text>
                    <Text>-{khuyenMai.loaiKhuyenMai === 'PHAN_TRAM' 
                      ? `${khuyenMai.giaTri}%`
                      : khuyenMai.giaTri.toLocaleString('vi-VN') + ' VNĐ'
                    }</Text>
                  </div>
                )}
                <Divider />
                <div className="price-item total">
                  <Text strong>Tổng cộng:</Text>
                  <Text strong>
                    {giaSauKhuyenMai > 0 ? giaSauKhuyenMai : cauHinhHienTai.tongGia} VNĐ
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải cấu hình xe...</Text>
      </div>
    );
  }

  if (!mauXe) {
    return (
      <div className="error-container">
        <Text type="danger">Không tìm thấy mẫu xe</Text>
      </div>
    );
  }

  return (
    <div className="force-light vehicle-configurator">
      <div className="configurator-header">
        <Title level={2}>
          <CarOutlined /> Cấu hình xe {mauXe.tenMau}
        </Title>
        <div className="header-actions">
          <Button 
            icon={<EyeOutlined />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Chế độ cấu hình' : 'Xem trước'}
          </Button>
          <Button 
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleLuuCauHinh}
          >
            Lưu cấu hình
          </Button>
          <Button 
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate(`/order/${cauHinhHienTai.id}`)}
          >
            Đặt hàng ngay
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleXuatPDF}
          >
            Xuất PDF
          </Button>
          <Button 
            icon={<ShareAltOutlined />}
            onClick={handleChiaSe}
          >
            Chia sẻ
          </Button>
        </div>
      </div>

      <div className="configurator-content">
        <div className="steps-container">
          <Steps current={currentStep} onChange={setCurrentStep}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>
        </div>

        <div className="step-content-container">
          {steps[currentStep].content}
        </div>

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

      {previewMode && (
        <div className="preview-panel">
          <Title level={4}>Xem trước cấu hình</Title>
          <div className="preview-content">
            {/* Ở đây có thể thêm 3D preview hoặc hình ảnh xe với màu đã chọn */}
            <div className="vehicle-preview">
              <img 
                src={mauXe.hinhAnh || '/placeholder-car.jpg'} 
                alt={mauXe.tenMau}
                className="preview-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleConfigurator; 