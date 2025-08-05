import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Select, 
  InputNumber,
  message,
  Spin,
  Divider,
  Alert,
  Steps
} from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  BankOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import "../../styles/OrderForm.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const BACKEND_URL = 'http://localhost:8080/api/v1';

interface CauHinhTuyChinh {
  id: number;
  ten: string;
  idMau: number;
  tenMau: string;
  idMauSac: number;
  tenMauSac: string;
  tongGia: number;
  danhSachTuyChon: Array<{
    id: number;
    ten: string;
    gia: number;
  }>;
}

interface DaiLy {
  id: number;
  ten: string;
  diaChi: string;
  thanhPho: string;
  soDienThoai: string;
}

interface KhuyenMai {
  id: number;
  ten: string;
  loaiKhuyenMai: string;
  giaTri: number;
}

const OrderForm: React.FC = () => {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [cauHinh, setCauHinh] = useState<CauHinhTuyChinh | null>(null);
  const [danhSachDaiLy, setDanhSachDaiLy] = useState<DaiLy[]>([]);
  const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState<KhuyenMai[]>([]);
  const [khuyenMaiSelected, setKhuyenMaiSelected] = useState<KhuyenMai | null>(null);
  const [giaSauKhuyenMai, setGiaSauKhuyenMai] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, [configId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load cấu hình
      const configResponse = await axios.get(`${BACKEND_URL}/cau-hinh/${configId}`);
      setCauHinh(configResponse.data);
      
      // Load danh sách đại lý
      const daiLyResponse = await axios.get(`${BACKEND_URL}/dai-ly`);
      setDanhSachDaiLy(daiLyResponse.data);
      
      // Load khuyến mãi phù hợp
      const khuyenMaiResponse = await axios.get(`${BACKEND_URL}/don-hang/khuyen-mai-phu-hop`, {
        params: { idMauXes: [configResponse.data.idMau] }
      });
      setDanhSachKhuyenMai(khuyenMaiResponse.data);
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải thông tin đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleKhuyenMaiChange = async (idKhuyenMai: number) => {
    if (!idKhuyenMai) {
      setKhuyenMaiSelected(null);
      setGiaSauKhuyenMai(cauHinh?.tongGia || 0);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/don-hang/kiem-tra-khuyen-mai`, null, {
        params: {
          idKhuyenMai,
          idMauXes: [cauHinh?.idMau],
          tongGiaTri: cauHinh?.tongGia
        }
      });

      if (response.data.hopLe) {
        const khuyenMai = danhSachKhuyenMai.find(km => km.id === idKhuyenMai);
        setKhuyenMaiSelected(khuyenMai || null);
        setGiaSauKhuyenMai(response.data.giaSauKhuyenMai);
        message.success("Áp dụng khuyến mãi thành công!");
      } else {
        message.error(response.data.thongBao);
      }
    } catch (error) {
      message.error("Không thể áp dụng khuyến mãi");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      const orderData = {
        idCauHinh: parseInt(configId || "0"),
        idDaiLy: values.idDaiLy,
        tienDatCoc: values.tienDatCoc || 0,
        phuongThucThanhToan: values.phuongThucThanhToan,
        ghiChu: values.ghiChu,
        idKhuyenMai: khuyenMaiSelected?.id
      };

      const response = await axios.post(`${BACKEND_URL}/don-hang/tu-cau-hinh`, null, {
        params: orderData
      });

      message.success("Đặt hàng thành công!");
      navigate(`/orders/${response.data.id}`);
      
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      message.error("Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Thông tin người đặt hàng</Title>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="hoTen"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="soDienThoai"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="diaChi"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ giao hàng" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      )
    },
    {
      title: 'Chọn đại lý',
      icon: <BankOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Chọn đại lý giao xe</Title>
          <Form.Item
            name="idDaiLy"
            label="Đại lý"
            rules={[{ required: true, message: 'Vui lòng chọn đại lý' }]}
          >
            <Select placeholder="Chọn đại lý">
              {danhSachDaiLy.map(daiLy => (
                <Option key={daiLy.id} value={daiLy.id}>
                  <div>
                    <Text strong>{daiLy.ten}</Text>
                    <br />
                    <Text type="secondary">{daiLy.diaChi}, {daiLy.thanhPho}</Text>
                    <br />
                    <Text type="secondary">ĐT: {daiLy.soDienThoai}</Text>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Khuyến mãi & Thanh toán',
      icon: <ShoppingCartOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Khuyến mãi và phương thức thanh toán</Title>
          
          {danhSachKhuyenMai.length > 0 && (
            <>
              <Alert
                message="Khuyến mãi có sẵn"
                description="Bạn có thể áp dụng các khuyến mãi sau:"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name="idKhuyenMai"
                label="Chọn khuyến mãi"
              >
                <Select 
                  placeholder="Chọn khuyến mãi (tùy chọn)"
                  onChange={handleKhuyenMaiChange}
                  allowClear
                >
                  {danhSachKhuyenMai.map(khuyenMai => (
                    <Option key={khuyenMai.id} value={khuyenMai.id}>
                      {khuyenMai.ten} - {khuyenMai.loaiKhuyenMai === 'PHAN_TRAM' 
                        ? `Giảm ${khuyenMai.giaTri}%`
                        : `Giảm ${khuyenMai.giaTri.toLocaleString('vi-VN')} VNĐ`
                      }
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="phuongThucThanhToan"
                label="Phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
              >
                <Select placeholder="Chọn phương thức thanh toán">
                  <Option value="tien_mat">Tiền mặt</Option>
                  <Option value="chuyen_khoan">Chuyển khoản</Option>
                  <Option value="the_tin_dung">Thẻ tín dụng</Option>
                  <Option value="tra_gop">Trả góp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="tienDatCoc"
                label="Tiền đặt cọc (VNĐ)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền đặt cọc"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="ghiChu"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về đơn hàng" />
          </Form.Item>
        </div>
      )
    },
    {
      title: 'Xác nhận đơn hàng',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="step-content">
          <Title level={3}>Xác nhận thông tin đơn hàng</Title>
          
          <Card className="order-summary">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Title level={4}>Thông tin xe</Title>
                <Paragraph>
                  <Text strong>Mẫu xe:</Text> {cauHinh?.tenMau}
                </Paragraph>
                <Paragraph>
                  <Text strong>Màu sắc:</Text> {cauHinh?.tenMauSac}
                </Paragraph>
                <Paragraph>
                  <Text strong>Tùy chọn:</Text>
                  {cauHinh?.danhSachTuyChon.length ? (
                    <ul>
                      {cauHinh.danhSachTuyChon.map(tuyChon => (
                        <li key={tuyChon.id}>
                          {tuyChon.ten} (+{tuyChon.gia.toLocaleString('vi-VN')} VNĐ)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Text type="secondary">Không có tùy chọn</Text>
                  )}
                </Paragraph>
              </Col>
              
              <Col xs={24} md={12}>
                <Title level={4}>Thông tin thanh toán</Title>
                <Paragraph>
                  <Text strong>Giá gốc:</Text> {cauHinh?.tongGia.toLocaleString('vi-VN')} VNĐ
                </Paragraph>
                {khuyenMaiSelected && (
                  <Paragraph>
                    <Text strong>Khuyến mãi:</Text> {khuyenMaiSelected.ten}
                  </Paragraph>
                )}
                <Paragraph>
                  <Text strong>Tổng tiền:</Text> 
                  <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
                    {giaSauKhuyenMai.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </Paragraph>
              </Col>
            </Row>
          </Card>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải thông tin đặt hàng...</Text>
      </div>
    );
  }

  if (!cauHinh) {
    return (
      <div className="error-container">
        <Text type="danger">Không tìm thấy cấu hình xe</Text>
      </div>
    );
  }

  return (
    <div className="order-form">
      <div className="order-header">
        <Title level={2}>
          <ShoppingCartOutlined /> Đặt hàng xe {cauHinh.tenMau}
        </Title>
        <Text type="secondary">
          Hoàn thành các bước sau để đặt hàng
        </Text>
      </div>

      <div className="order-content">
        <Steps current={currentStep} onChange={setCurrentStep}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>

        <div className="step-content-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              hoTen: user?.fullName || '',
              email: user?.email || '',
              soDienThoai: user?.phone || ''
            }}
          >
            {steps[currentStep].content}
          </Form>
        </div>

        <div className="step-navigation">
          <Button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Quay lại
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button 
              type="primary"
              htmlType="submit"
              loading={submitting}
              onClick={() => form.submit()}
            >
              Đặt hàng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm; 