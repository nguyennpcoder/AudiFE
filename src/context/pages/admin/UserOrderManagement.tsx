import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Table, 
  Card, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  message, 
  Spin,
  Row,
  Col,
  Statistic
} from "antd";
import { 
  ShoppingCartOutlined, 
  EyeOutlined, 
  ReloadOutlined
} from "@ant-design/icons";
import { useAuth } from "../../AuthContext";

const { Title, Text } = Typography;
const BACKEND_URL = 'http://localhost:8080/api/v1';

interface DonHang {
  id: number;
  maDonHang: string;
  tenNguoiDung: string;
  tenMau: string;
  tongTien: number;
  trangThai: string;
  ngayDat: string;
  ngayGiaoDuKien?: string;
  phuongThucThanhToan: string;
  tienDatCoc: number;
}

const UserOrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [donHangList, setDonHangList] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonHang();
  }, []);

  const loadDonHang = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/don-hang/nguoi-dung/${user?.userId || user?.userId || 0}`);
      setDonHangList(response.data);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (record: DonHang) => {
    navigate(`/orders/${record.id}`);
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

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (text: number) => <Text strong>#{text}</Text>
    },
    {
      title: 'Mẫu xe',
      dataIndex: 'tenMau',
      key: 'tenMau'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      render: (value: number) => `${value.toLocaleString('vi-VN')} VNĐ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (trangThai: string) => (
        <Tag color={getStatusColor(trangThai)}>
          {getStatusText(trangThai)}
        </Tag>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'ngayDat',
      key: 'ngayDat',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: DonHang) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text>Đang tải danh sách đơn hàng...</Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ShoppingCartOutlined /> Đơn hàng của tôi
        </Title>
        <Button 
          icon={<ReloadOutlined />}
          onClick={loadDonHang}
        >
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={donHangList.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={donHangList.filter(dh => dh.trangThai === 'cho_xu_ly').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang sản xuất"
              value={donHangList.filter(dh => dh.trangThai === 'dang_san_xuat').length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã giao"
              value={donHangList.filter(dh => dh.trangThai === 'da_giao').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách đơn hàng">
        <Table
          columns={columns}
          dataSource={donHangList}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đơn hàng`
          }}
        />
      </Card>
    </div>
  );
};

export default UserOrderManagement; 