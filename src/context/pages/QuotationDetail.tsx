import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Divider, 
  Tag, 
  Space, 
  message, 
  Spin,
  Descriptions,
  Image,
  Timeline
} from "antd";
import { 
  CarOutlined, 
  EditOutlined, 
  ShareAltOutlined, 
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  WhatsAppOutlined,
  FacebookOutlined
} from "@ant-design/icons";
import "../../styles/QuotationDetail.css";

const { Title, Text, Paragraph } = Typography;
const BACKEND_URL = 'http://localhost:8080/api/v1';

interface CauHinhTuyChinh {
  id: number;
  ten: string;
  idMau: number;
  tenMau: string;
  idMauSac: number;
  tenMauSac: string;
  idNoiThat?: number;
  tenNoiThat?: string;
  danhSachTuyChon: Array<{
    id: number;
    ten: string;
    gia: number;
    danhMuc: string;
  }>;
  tongGia: number;
  ngayTao: string;
  khuyenMai?: {
    id: number;
    ten: string;
    loaiKhuyenMai: string;
    giaTri: number;
  };
  giaSauKhuyenMai?: number;
}

const QuotationDetail: React.FC = () => {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  
  const [cauHinh, setCauHinh] = useState<CauHinhTuyChinh | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadCauHinh();
  }, [configId]);

  const loadCauHinh = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/cau-hinh/${configId}`);
      setCauHinh(response.data);
    } catch (error) {
      console.error("Lỗi khi tải cấu hình:", error);
      message.error("Không thể tải thông tin cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleChinhSua = () => {
    navigate(`/configure/${cauHinh?.idMau}`);
  };

  const handleChiaSe = async () => {
    try {
      setSharing(true);
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      message.success("Đã sao chép link chia sẻ!");
    } catch (error) {
      message.error("Không thể chia sẻ");
    } finally {
      setSharing(false);
    }
  };

  const handleXuatPDF = () => {
    window.open(`${BACKEND_URL}/cau-hinh/${configId}/pdf`, '_blank');
  };

  const handleInBaoGia = () => {
    window.print();
  };

  const handleGuiEmail = () => {
    const subject = encodeURIComponent(`Báo giá xe ${cauHinh?.tenMau}`);
    const body = encodeURIComponent(
      `Xin chào,\n\nTôi muốn nhận báo giá chi tiết cho xe ${cauHinh?.tenMau}.\n\nCảm ơn!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleChiaSeWhatsApp = () => {
    const text = encodeURIComponent(
      `Báo giá xe ${cauHinh?.tenMau}: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleChiaSeFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải báo giá...</Text>
      </div>
    );
  }

  if (!cauHinh) {
    return (
      <div className="error-container">
        <Text type="danger">Không tìm thấy cấu hình</Text>
      </div>
    );
  }

  const tongGiaTuyChon = cauHinh.danhSachTuyChon.reduce((sum, tuyChon) => sum + tuyChon.gia, 0);
  const giaCuoi = cauHinh.giaSauKhuyenMai || cauHinh.tongGia;

  return (
    <div className="force-light quotation-detail">
      <div className="quotation-header">
        <div className="header-content">
          <Title level={2}>
            <CarOutlined /> Báo giá xe {cauHinh.tenMau}
          </Title>
          <Text type="secondary">
            Cấu hình được tạo ngày: {new Date(cauHinh.ngayTao).toLocaleDateString('vi-VN')}
          </Text>
        </div>
        
        <div className="header-actions">
          <Space>
            <Button 
              icon={<EditOutlined />}
              onClick={handleChinhSua}
            >
              Chỉnh sửa
            </Button>
            <Button 
              icon={<ShareAltOutlined />}
              loading={sharing}
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
              icon={<PrinterOutlined />}
              onClick={handleInBaoGia}
            >
              In báo giá
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin cấu hình" className="config-card">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mẫu xe">
                <Text strong>{cauHinh.tenMau}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Màu sắc">
                <Space>
                  <div 
                    className="color-preview"
                    style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%',
                      backgroundColor: '#ccc' // Có thể lấy từ API
                    }}
                  />
                  <Text>{cauHinh.tenMauSac}</Text>
                </Space>
              </Descriptions.Item>
              {cauHinh.tenNoiThat && (
                <Descriptions.Item label="Nội thất">
                  <Text>{cauHinh.tenNoiThat}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {cauHinh.danhSachTuyChon.length > 0 && (
              <>
                <Divider />
                <Title level={4}>Tùy chọn đã chọn</Title>
                <Row gutter={[16, 16]}>
                  {cauHinh.danhSachTuyChon.map(tuyChon => (
                    <Col xs={24} sm={12} key={tuyChon.id}>
                      <Card size="small" className="option-item">
                        <div className="option-header">
                          <Text strong>{tuyChon.ten}</Text>
                          <Tag color="blue">{tuyChon.danhMuc}</Tag>
                        </div>
                        <Text className="option-price" style={{ color: '#1890ff' }}>
                          +{tuyChon.gia.toLocaleString('vi-VN')} VNĐ
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Card>

          <Card title="Chi tiết giá" className="price-card">
            <div className="price-breakdown">
              <div className="price-item">
                <Text>Giá cơ bản:</Text>
                <Text>{cauHinh.tongGia.toLocaleString('vi-VN')} VNĐ</Text>
              </div>
              
              {tongGiaTuyChon > 0 && (
                <div className="price-item">
                  <Text>Tùy chọn:</Text>
                  <Text>+{tongGiaTuyChon.toLocaleString('vi-VN')} VNĐ</Text>
                </div>
              )}
              
              {cauHinh.khuyenMai && (
                <div className="price-item discount">
                  <Text>Khuyến mãi ({cauHinh.khuyenMai.ten}):</Text>
                  <Text>-{cauHinh.khuyenMai.loaiKhuyenMai === 'PHAN_TRAM' 
                    ? `${cauHinh.khuyenMai.giaTri}%`
                    : cauHinh.khuyenMai.giaTri.toLocaleString('vi-VN') + ' VNĐ'
                  }</Text>
                </div>
              )}
              
              <Divider />
              <div className="price-item total">
                <Text strong>Tổng cộng:</Text>
                <Text strong className="final-price">
                  {giaCuoi.toLocaleString('vi-VN')} VNĐ
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hành động" className="action-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block
                icon={<MailOutlined />}
                onClick={handleGuiEmail}
              >
                Gửi email báo giá
              </Button>
              
              <Button 
                block
                icon={<WhatsAppOutlined />}
                onClick={handleChiaSeWhatsApp}
              >
                Chia sẻ qua WhatsApp
              </Button>
              
              <Button 
                block
                icon={<FacebookOutlined />}
                onClick={handleChiaSeFacebook}
              >
                Chia sẻ trên Facebook
              </Button>
            </Space>
          </Card>

          <Card title="Lịch sử cấu hình" className="history-card">
            <Timeline>
              <Timeline.Item>
                <Text>Cấu hình được tạo</Text>
                <br />
                <Text type="secondary">
                  {new Date(cauHinh.ngayTao).toLocaleString('vi-VN')}
                </Text>
              </Timeline.Item>
              <Timeline.Item>
                <Text>Báo giá được xem</Text>
                <br />
                <Text type="secondary">
                  {new Date().toLocaleString('vi-VN')}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default QuotationDetail;
