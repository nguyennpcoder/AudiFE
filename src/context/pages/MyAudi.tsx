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
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  CarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cauHinhService, CauHinhTuyChinh } from '../../services/cauHinhService';
import '../../styles/MyAudi.css';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const { Title, Text, Paragraph } = Typography;

const MyAudi: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cauHinhList, setCauHinhList] = useState<CauHinhTuyChinh[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCauHinh, setSelectedCauHinh] = useState<CauHinhTuyChinh | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCauHinhList();
    }
  }, [isAuthenticated, user]);

  const loadCauHinhList = async () => {
    try {
      setLoading(true);
      const data = await cauHinhService.getCauHinhByNguoiDung(user!.userId!);
      setCauHinhList(data);
      console.log('Danh sách cấu hình:', data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách cấu hình:', error);
      message.error('Không thể tải danh sách cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (cauHinh: CauHinhTuyChinh) => {
    setSelectedCauHinh(cauHinh);
    setPreviewModalVisible(true);
  };

  const handleEdit = (cauHinh: CauHinhTuyChinh) => {
    // SỬA: Sử dụng navigate thay vì window.location.href
    navigate(`/configure/${cauHinh.idMau}?configId=${cauHinh.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await cauHinhService.deleteCauHinh(id);
      message.success('Đã xóa cấu hình thành công');
      loadCauHinhList(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi khi xóa cấu hình:', error);
      message.error('Không thể xóa cấu hình');
    } finally {
      setDeleting(null);
    }
  };

  const handleXuatPDF = async (id: number) => {
    try {
      const blob = await cauHinhService.xuatPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cau-hinh-xe-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất PDF thành công');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      message.error('Không thể xuất PDF');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  useScrollToTop();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Vui lòng đăng nhập để xem cấu hình xe của bạn</Title>
        <Button type="primary" size="large" href="/login">
          Đăng nhập
        </Button>
      </div>
    );
  }

  return (
    <div className="my-audi-container">
      <div className="my-audi-header">
        <Title level={2}>
          <CarOutlined /> Tài khoản của tôi - Cấu hình xe
        </Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadCauHinhList}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            href="/models"
          >
            Tạo cấu hình mới
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>Đang tải cấu hình xe...</div>
        </div>
      ) : cauHinhList.length === 0 ? (
        <Empty
          description="Bạn chưa có cấu hình xe nào"
          style={{ margin: '50px 0' }}
        >
          <Button type="primary" href="/models">
            Tạo cấu hình đầu tiên
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {cauHinhList.map((cauHinh) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={cauHinh.id}>
              <Card
                hoverable
                className="cau-hinh-card"
                actions={[
                  <Tooltip title="Xem chi tiết">
                    <EyeOutlined onClick={() => handlePreview(cauHinh)} />
                  </Tooltip>,
                  <Tooltip title="Chỉnh sửa">
                    <EditOutlined onClick={() => handleEdit(cauHinh)} />
                  </Tooltip>,
                  <Tooltip title="Xuất PDF">
                    <DownloadOutlined onClick={() => handleXuatPDF(cauHinh.id!)} />
                  </Tooltip>,
                  <Popconfirm
                    title="Xóa cấu hình"
                    description="Bạn có chắc chắn muốn xóa cấu hình này?"
                    onConfirm={() => handleDelete(cauHinh.id!)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Tooltip title="Xóa">
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                        loading={deleting === cauHinh.id}
                        style={{ padding: 0, border: 'none' }}
                      />
                    </Tooltip>
                  </Popconfirm>
                ]}
              >
                <div className="cau-hinh-info">
                  <div className="cau-hinh-header">
                    <Title level={4} className="cau-hinh-title">
                      {cauHinh.ten || `${cauHinh.tenMau} - ${formatDate(cauHinh.ngayTao || '')}`}
                    </Title>
                    <Tag color="blue">{cauHinh.tenMau}</Tag>
                  </div>
                  
                  <div className="cau-hinh-details">
                    <div className="detail-item">
                      <Text strong>Màu sắc:</Text>
                      <Text>{cauHinh.tenMauSac}</Text>
                    </div>
                    
                    {cauHinh.tenNoiThat && (
                      <div className="detail-item">
                        <Text strong>Nội thất:</Text>
                        <Text>{cauHinh.tenNoiThat}</Text>
                      </div>
                    )}
                    
                    {cauHinh.tenBanhXe && (
                      <div className="detail-item">
                        <Text strong>Bánh xe:</Text>
                        <Text>{cauHinh.tenBanhXe}</Text>
                      </div>
                    )}
                    
                    {cauHinh.danhSachTuyChon && cauHinh.danhSachTuyChon.length > 0 && (
                      <div className="detail-item">
                        <Text strong>Tùy chọn:</Text>
                        <Text>{cauHinh.danhSachTuyChon.length} mục</Text>
                      </div>
                    )}
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div className="cau-hinh-price">
                    <Text strong className="price-label">Tổng giá:</Text>
                    <Text className="price-value">
                      {formatPrice(cauHinh.tongGia)}
                    </Text>
                  </div>
                  
                  {cauHinh.ngayTao && (
                    <div className="cau-hinh-date">
                      <Text type="secondary">
                        Tạo ngày: {formatDate(cauHinh.ngayTao)}
                      </Text>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết cấu hình xe"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setPreviewModalVisible(false);
              if (selectedCauHinh) handleEdit(selectedCauHinh);
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={800}
      >
        {selectedCauHinh && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Tên cấu hình" span={2}>
              {selectedCauHinh.ten || 'Không có tên'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Mẫu xe">
              {selectedCauHinh.tenMau}
            </Descriptions.Item>
            
            <Descriptions.Item label="Màu sắc">
              {selectedCauHinh.tenMauSac}
            </Descriptions.Item>
            
            {selectedCauHinh.tenNoiThat && (
              <Descriptions.Item label="Nội thất">
                {selectedCauHinh.tenNoiThat}
                {selectedCauHinh.giaNoiThat && (
                  <Text type="secondary"> (+{formatPrice(selectedCauHinh.giaNoiThat)})</Text>
                )}
              </Descriptions.Item>
            )}
            
            {selectedCauHinh.tenBanhXe && (
              <Descriptions.Item label="Bánh xe">
                {selectedCauHinh.tenBanhXe}
                {selectedCauHinh.giaBanhXe && (
                  <Text type="secondary"> (+{formatPrice(selectedCauHinh.giaBanhXe)})</Text>
                )}
              </Descriptions.Item>
            )}
            
            {selectedCauHinh.danhSachTuyChon && selectedCauHinh.danhSachTuyChon.length > 0 && (
              <Descriptions.Item label="Tùy chọn" span={2}>
                <div>
                  {selectedCauHinh.danhSachTuyChon.map((tuyChon, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <Text strong>{tuyChon.ten}</Text>
                      <Text type="secondary"> - {tuyChon.danhMuc}</Text>
                      <Text type="secondary"> (+{formatPrice(tuyChon.gia)})</Text>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Tổng giá" span={2}>
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                {formatPrice(selectedCauHinh.tongGia)}
              </Text>
            </Descriptions.Item>
            
            {selectedCauHinh.ngayTao && (
              <Descriptions.Item label="Ngày tạo">
                {formatDate(selectedCauHinh.ngayTao)}
              </Descriptions.Item>
            )}
            
            {selectedCauHinh.ngayCapNhat && (
              <Descriptions.Item label="Ngày cập nhật">
                {formatDate(selectedCauHinh.ngayCapNhat)}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyAudi;