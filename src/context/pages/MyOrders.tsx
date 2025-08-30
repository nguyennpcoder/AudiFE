import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  message, 
  Spin,
  Empty,
  Modal,
  Descriptions,
  Divider,
  Image,
  Tooltip,
  Badge
} from 'antd';
import { 
  ShoppingCartOutlined, 
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/MyAudi.css';

const { Title, Text, Paragraph } = Typography;
const BACKEND_URL = 'http://localhost:8080/api/v1';

interface DonHang {
  id: number;
  maDonHang?: string;
  tenNguoiDung: string;
  tenMau?: string;
  tongTien: number;
  trangThai: string;
  ngayDat: string;
  ngayGiaoDuKien?: string;
  phuongThucThanhToan: string;
  tienDatCoc: number;
  ghiChu?: string;
  tenDaiLy?: string;
  cauHinh?: {
    tenCauHinh: string;
    mauSac?: string;
    noiThat?: string;
    banhXe?: string;
  };
}

const MyOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [donHangList, setDonHangList] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDonHang();
    }
  }, [isAuthenticated, user]);

  const loadDonHang = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/don-hang/nguoi-dung/${user!.userId}`);
      setDonHangList(response.data);
      console.log('Danh sách đơn hàng:', response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (donHang: DonHang) => {
    setSelectedOrder(donHang);
    setPreviewModalVisible(true);
  };

  const getStatusColor = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly': return 'orange';
      case 'da_xac_nhan': return 'blue';
      case 'dang_san_xuat': return 'purple';
      case 'san_sang_giao': return 'green';
      case 'da_giao': return 'success';
      case 'da_huy': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly': return 'Chờ xử lý';
      case 'da_xac_nhan': return 'Đã xác nhận';
      case 'dang_san_xuat': return 'Đang sản xuất';
      case 'san_sang_giao': return 'Sẵn sàng giao';
      case 'da_giao': return 'Đã giao';
      case 'da_huy': return 'Đã hủy';
      default: return trangThai;
    }
  };

  const getStatusIcon = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_xu_ly': return <ClockCircleOutlined />;
      case 'da_xac_nhan': return <CheckCircleOutlined />;
      case 'dang_san_xuat': return <CarOutlined />;
      case 'san_sang_giao': return <CheckCircleOutlined />;
      case 'da_giao': return <CheckCircleOutlined />;
      case 'da_huy': return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="my-audi-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={2}>Vui lòng đăng nhập để xem đơn hàng</Title>
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-audi-container">
      <div className="my-audi-header">
        <Title level={2}>
          <ShoppingCartOutlined /> Đơn hàng của tôi
        </Title>
        <div style={{ marginTop: '8px', color: '#666' }}>
          Xin chào, {user?.fullName}  - Quản lý đơn hàng của bạn
        </div>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadDonHang}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/models')}
          >
            Đặt hàng mới
          </Button>
        </Space>
      </div>

      {/* Thống kê đơn hàng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Badge count={donHangList.length} showZero>
                <ShoppingCartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </Badge>
              <div style={{ marginTop: 8 }}>Tổng đơn hàng</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Badge count={donHangList.filter(dh => dh.trangThai === 'cho_xu_ly').length} showZero>
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
              </Badge>
              <div style={{ marginTop: 8 }}>Chờ xử lý</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Badge count={donHangList.filter(dh => dh.trangThai === 'dang_san_xuat').length} showZero>
                <CarOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
              </Badge>
              <div style={{ marginTop: 8 }}>Đang sản xuất</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Badge count={donHangList.filter(dh => dh.trangThai === 'da_giao').length} showZero>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              </Badge>
              <div style={{ marginTop: 8 }}>Đã giao</div>
            </div>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>Đang tải đơn hàng...</div>
        </div>
      ) : donHangList.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bạn chưa có đơn hàng nào"
        >
          <Button type="primary" onClick={() => navigate('/models')}>
            Đặt hàng ngay
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {donHangList.map((donHang) => (
            <Col xs={24} md={12} lg={8} key={donHang.id}>
              <Card
                hoverable
                className="order-card"
                actions={[
                  <Tooltip title="Xem chi tiết">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={() => handleViewOrder(donHang)}
                    >
                      Chi tiết
                    </Button>
                  </Tooltip>
                ]}
              >
                <div className="order-card-header">
                  <div className="order-id">
                    <Text strong>Đơn hàng #{donHang.id}</Text>
                  </div>
                  <Tag 
                    color={getStatusColor(donHang.trangThai)}
                    icon={getStatusIcon(donHang.trangThai)}
                  >
                    {getStatusText(donHang.trangThai)}
                  </Tag>
                </div>
                
                <div className="order-card-content">
                  <div className="order-info">
                    <Text type="secondary">Ngày đặt:</Text>
                    <Text>{formatDate(donHang.ngayDat)}</Text>
                  </div>
                  
                  {donHang.cauHinh && (
                    <div className="order-info">
                      <Text type="secondary">Cấu hình:</Text>
                      <Text strong>{donHang.cauHinh.tenCauHinh}</Text>
                    </div>
                  )}
                  
                  {donHang.tenMau && (
                    <div className="order-info">
                      <Text type="secondary">Mẫu xe:</Text>
                      <Text>{donHang.tenMau}</Text>
                    </div>
                  )}
                  
                  <div className="order-info">
                    <Text type="secondary">Tổng tiền:</Text>
                    <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                      {formatCurrency(donHang.tongTien)}
                    </Text>
                  </div>
                  
                  {donHang.tienDatCoc > 0 && (
                    <div className="order-info">
                      <Text type="secondary">Đặt cọc:</Text>
                      <Text>{formatCurrency(donHang.tienDatCoc)}</Text>
                    </div>
                  )}
                  
                  {donHang.ngayGiaoDuKien && (
                    <div className="order-info">
                      <Text type="secondary">Dự kiến giao:</Text>
                      <Text>{formatDate(donHang.ngayGiaoDuKien)}</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã đơn hàng">
              #{selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedOrder.trangThai)}>
                {getStatusText(selectedOrder.trangThai)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {formatDate(selectedOrder.ngayDat)}
            </Descriptions.Item>
            {selectedOrder.cauHinh && (
              <Descriptions.Item label="Cấu hình xe">
                {selectedOrder.cauHinh.tenCauHinh}
              </Descriptions.Item>
            )}
            {selectedOrder.tenMau && (
              <Descriptions.Item label="Mẫu xe">
                {selectedOrder.tenMau}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tổng tiền">
              <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
                {formatCurrency(selectedOrder.tongTien)}
              </Text>
            </Descriptions.Item>
            {selectedOrder.tienDatCoc > 0 && (
              <Descriptions.Item label="Tiền đặt cọc">
                {formatCurrency(selectedOrder.tienDatCoc)}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder.phuongThucThanhToan}
            </Descriptions.Item>
            {selectedOrder.ngayGiaoDuKien && (
              <Descriptions.Item label="Ngày giao dự kiến">
                {formatDate(selectedOrder.ngayGiaoDuKien)}
              </Descriptions.Item>
            )}
            {selectedOrder.ghiChu && (
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.ghiChu}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders; 