import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Steps,
  Modal,
  Radio,
  Space,
  Tag,
  Progress
} from "antd";
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  BankOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  WalletOutlined,
  QrcodeOutlined,
  CarOutlined,
  GiftOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SearchOutlined,
  StarOutlined
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import "../../styles/OrderForm.css";
import { fetchUserProfile } from '../../services/authService';

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
  danhSachTuyChon?: Array<{
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

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fee: number;
  processingTime: string;
}

const OrderForm: React.FC = () => {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [cauHinh, setCauHinh] = useState<CauHinhTuyChinh | null>(null);
  const [danhSachDaiLy, setDanhSachDaiLy] = useState<DaiLy[]>([]);
  const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState<KhuyenMai[]>([]);
  const [khuyenMaiSelected, setKhuyenMaiSelected] = useState<KhuyenMai | null>(null);
  const [giaSauKhuyenMai, setGiaSauKhuyenMai] = useState(0);
  const [selectedDaiLy, setSelectedDaiLy] = useState<number | null>(null);
  const [searchDaiLy, setSearchDaiLy] = useState('');
  const [filteredDaiLy, setFilteredDaiLy] = useState<any[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
  const [searchPromotion, setSearchPromotion] = useState('');
  const [filteredPromotions, setFilteredPromotions] = useState<any[]>([]);

  // Danh sách phương thức thanh toán online
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: <BankOutlined />,
      description: 'Thanh toán qua VNPay - An toàn và nhanh chóng',
      fee: 0,
      processingTime: 'Ngay lập tức'
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: <WalletOutlined />,
      description: 'Thanh toán qua ví MoMo',
      fee: 0,
      processingTime: 'Ngay lập tức'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: <QrcodeOutlined />,
      description: 'Thanh toán qua ZaloPay',
      fee: 0,
      processingTime: 'Ngay lập tức'
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      icon: <BankOutlined />,
      description: 'Chuyển khoản trực tiếp đến tài khoản ngân hàng',
      fee: 0,
      processingTime: '1-2 giờ'
    }
  ];

  useEffect(() => {
    loadInitialData();
  }, [configId]);
  
  // useEffect để filter đại lý
  useEffect(() => {
    if (danhSachDaiLy.length > 0) {
      const filtered = danhSachDaiLy.filter(daiLy => 
        daiLy.ten.toLowerCase().includes(searchDaiLy.toLowerCase()) ||
        daiLy.thanhPho.toLowerCase().includes(searchDaiLy.toLowerCase()) ||
        daiLy.diaChi.toLowerCase().includes(searchDaiLy.toLowerCase())
      );
      setFilteredDaiLy(filtered);
    }
  }, [danhSachDaiLy, searchDaiLy]);
  
  // useEffect để filter khuyến mãi
  useEffect(() => {
    if (danhSachKhuyenMai.length > 0) {
      const filtered = danhSachKhuyenMai.filter(khuyenMai => 
        khuyenMai.ten.toLowerCase().includes(searchPromotion.toLowerCase())
      );
      setFilteredPromotions(filtered);
    }
  }, [danhSachKhuyenMai, searchPromotion]);

  // Thêm useEffect để tự động điền thông tin người dùng
  useEffect(() => {
    console.log('User data:', user); // Debug log
    if (user && form && user.token) {
      // Gọi API để lấy thông tin chi tiết người dùng
      const fetchUserDetails = async () => {
        try {
          const userDetails = await fetchUserProfile(user.token!);
          console.log('User details from API:', userDetails);
          
          const userData = {
            hoTen: userDetails.ho && userDetails.ten ? `${userDetails.ho} ${userDetails.ten}`.trim() : '',
            soDienThoai: userDetails.soDienThoai || '',
            email: userDetails.email || user.email || '',
            diaChi: userDetails.diaChi || ''
          };
          
          console.log('Setting form values:', userData);
          form.setFieldsValue(userData);
        } catch (error) {
          console.error('Error fetching user details:', error);
          // Fallback to basic user data
          const userData = {
            hoTen: user.fullName || '',
            soDienThoai: user.phone || '',
            email: user.email || '',
            diaChi: ''
          };
          form.setFieldsValue(userData);
        }
      };
      
      fetchUserDetails();
    }
  }, [user, form]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load cấu hình
      const configResponse = await axios.get(`${BACKEND_URL}/cau-hinh/${configId}`);
      setCauHinh(configResponse.data);
      setGiaSauKhuyenMai(configResponse.data.tongGia || 0);
      
      // Load danh sách đại lý
      const daiLyResponse = await axios.get(`${BACKEND_URL}/dai-ly`);
      setDanhSachDaiLy(daiLyResponse.data);
      
      // Load khuyến mãi
      try {
        const khuyenMaiResponse = await axios.get(`${BACKEND_URL}/khuyen-mai/con-hieu-luc`, {
          params: { page: 0, size: 50 }
        });
        setDanhSachKhuyenMai(khuyenMaiResponse.data.khuyenMai || []);
      } catch (khuyenMaiError) {
        console.error('Lỗi khi load khuyến mãi:', khuyenMaiError);
        setDanhSachKhuyenMai([]);
      }
      
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
        setGiaSauKhuyenMai(response.data.giaSauKhuyenMai || cauHinh?.tongGia || 0);
        message.success("Áp dụng khuyến mãi thành công!");
      } else {
        message.error(response.data.thongBao);
      }
    } catch (error) {
      message.error("Không thể áp dụng khuyến mãi");
    }
  };

  // Tách riêng VNPay
  const payWithVNPay = async () => {
    const token = user?.token || localStorage.getItem('token');
    if (!token) {
      message.error('Bạn cần đăng nhập để tiếp tục.');
      navigate('/login', { state: { redirectTo: location.pathname } });
      return;
    }

    const rawDeposit = Number(form.getFieldValue('tienDatCoc')) || 0;
    const minDeposit = Math.ceil((giaSauKhuyenMai || 0) * 0.1);
    const amount = rawDeposit > 0 ? rawDeposit : minDeposit;
    if (!amount || amount <= 0) {
      message.error('Tiền cọc không hợp lệ. Yêu cầu tối thiểu 10% giá trị xe.');
      return;
    }

    // Không tạo đơn hàng trước. Gửi payload để backend tạo đơn khi callback thành công
    const paymentResponse = await axios.post(`${BACKEND_URL}/thanh-toan/tao-url`, {
      orderId: null,
      amount,
      paymentMethod: 'vnpay',
      returnUrl: `${window.location.origin}/payment/success?vnpay=1`,
      cancelUrl: `${window.location.origin}/payment/cancel?vnpay=1`,
      idCauHinh: parseInt(configId || "0"),
      idDaiLy: form.getFieldValue('idDaiLy'),
      tienDatCoc: amount,
      ghiChu: form.getFieldValue('ghiChu'),
      idKhuyenMai: khuyenMaiSelected?.id || null
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    window.location.href = paymentResponse.data.paymentUrl;
  };

  // Tách riêng ZaloPay
  const payWithZaloPay = async () => {
    const token = user?.token || localStorage.getItem('token');
    if (!token) {
      message.error('Bạn cần đăng nhập để tiếp tục.');
      navigate('/login', { state: { redirectTo: location.pathname } });
      return;
    }

    const rawDeposit = Number(form.getFieldValue('tienDatCoc')) || 0;
    const minDeposit = Math.ceil((giaSauKhuyenMai || 0) * 0.1);
    const amount = rawDeposit > 0 ? rawDeposit : minDeposit;

    if (!amount || amount <= 0) {
      message.error('Tiền cọc không hợp lệ. Yêu cầu tối thiểu 10% giá trị xe.');
      return;
    }
    if (amount < 1000) {
      message.error('ZaloPay yêu cầu số tiền tối thiểu 1.000 VNĐ.');
      return;
    }

    try {
      // Send configuration data directly to payment API (like VNPay)
      const paymentPayload = {
        idCauHinh: parseInt(configId || "0"),
        idDaiLy: form.getFieldValue('idDaiLy'),
        tienDatCoc: amount,
        ghiChu: form.getFieldValue('ghiChu'),
        idKhuyenMai: khuyenMaiSelected?.id,
        amount,
        returnUrl: `${window.location.origin}/payment/success?zalopay=1`,
        cancelUrl: `${window.location.origin}/payment/cancel?zalopay=1`
      } as any;

      const paymentResponse = await axios.post(`${BACKEND_URL}/thanh-toan/tao-url`, {
        ...paymentPayload,
        paymentMethod: 'zalopay'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!paymentResponse?.data?.paymentUrl) {
        console.error('Create ZaloPay URL missing paymentUrl:', paymentResponse?.data);
        message.error('Không nhận được đường dẫn thanh toán ZaloPay.');
        return;
      }

      window.location.href = paymentResponse.data.paymentUrl;
    } catch (err: any) {
      console.error('Lỗi khi tạo thanh toán ZaloPay:', err);
      const detail = err?.response?.data || err?.message;
      message.error(`Không thể tạo thanh toán ZaloPay${detail?.error ? ': ' + detail.error : detail?.message ? ': ' + detail.message : ''}`);
      throw err;
    }
  };

  // Tách riêng MoMo
  const payWithMoMo = async () => {
    const token = user?.token || localStorage.getItem('token');
    if (!token) {
      message.error('Bạn cần đăng nhập để tiếp tục.');
      navigate('/login', { state: { redirectTo: location.pathname } });
      return;
    }

    const rawDeposit = Number(form.getFieldValue('tienDatCoc')) || 0;
    const minDeposit = Math.ceil((giaSauKhuyenMai || 0) * 0.1);
    const amount = rawDeposit > 0 ? rawDeposit : minDeposit;

    if (!amount || amount <= 0) {
      message.error('Tiền cọc không hợp lệ. Yêu cầu tối thiểu 10% giá trị xe.');
      return;
    }

    try {
      // Send configuration data directly to payment API (like VNPay)
      const paymentPayload = {
        idCauHinh: parseInt(configId || "0"),
        idDaiLy: form.getFieldValue('idDaiLy'),
        tienDatCoc: amount,
        ghiChu: form.getFieldValue('ghiChu'),
        idKhuyenMai: khuyenMaiSelected?.id,
        amount,
        returnUrl: `${window.location.origin}/payment/success?momo=1`,
        cancelUrl: `${window.location.origin}/payment/cancel?momo=1`
      } as any;

      const paymentResponse = await axios.post(`${BACKEND_URL}/thanh-toan/tao-url`, {
        ...paymentPayload,
        paymentMethod: 'momo'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!paymentResponse?.data?.paymentUrl) {
        console.error('Create MoMo URL missing paymentUrl:', paymentResponse?.data);
        message.error('Không nhận được đường dẫn thanh toán MoMo.');
        return;
      }

      window.location.href = paymentResponse.data.paymentUrl;
    } catch (err: any) {
      console.error('Lỗi khi tạo thanh toán MoMo:', err);
      const detail = err?.response?.data || err?.message;
      message.error(`Không thể tạo thanh toán MoMo${detail?.error ? ': ' + detail.error : detail?.message ? ': ' + detail.message : ''}`);
      throw err;
    }
  };

  // Router theo gateway
  const handleOnlinePayment = async (paymentMethod: string) => {
    try {
      setPaymentProcessing(true);
      if (paymentMethod === 'vnpay') {
        await payWithVNPay();
      } else if (paymentMethod === 'zalopay') {
        await payWithZaloPay();
      } else if (paymentMethod === 'momo') {
        await payWithMoMo();
      } else {
        message.warning('Cổng thanh toán này chưa được hỗ trợ.');
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo thanh toán:", error);
      const backendMsg = error?.response?.data?.error || error?.response?.data?.message;
      message.error(backendMsg || "Không thể tạo thanh toán");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handler cho việc chọn đại lý
  const handleSelectDaiLy = (daiLyId: number) => {
    setSelectedDaiLy(daiLyId);
    form.setFieldsValue({ idDaiLy: daiLyId });
  };
  
  // Handler cho việc chọn khuyến mãi
  const handleSelectPromotion = async (promotionId: number | null) => {
    setSelectedPromotion(promotionId);
    form.setFieldsValue({ idKhuyenMai: promotionId });
    await handleKhuyenMaiChange(promotionId || 0);
  };

  const handleSubmit = async (values: any) => {
    const paymentMethod = values.phuongThucThanhToan;
    
    if (paymentMethod === 'tien_mat') {
      try {
        setSubmitting(true);

        const token = user?.token || localStorage.getItem('token');
        if (!token) {
          message.error('Bạn cần đăng nhập để tiếp tục.');
          navigate('/login', { state: { redirectTo: location.pathname } });
          return;
        }
        
        const orderData = {
          idCauHinh: parseInt(configId || "0"),
          idDaiLy: values.idDaiLy,
          tienDatCoc: values.tienDatCoc || 0,
          phuongThucThanhToan: values.phuongThucThanhToan,
          ghiChu: values.ghiChu,
          idKhuyenMai: khuyenMaiSelected?.id
        };

        const response = await axios.post(`${BACKEND_URL}/don-hang/tu-cau-hinh`, null, {
          params: orderData,
          headers: { Authorization: `Bearer ${token}` }
        });

        message.success("Đặt hàng thành công!");
        navigate(`/orders/${response.data.id}`);
        
      } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
        message.error("Không thể đặt hàng");
      } finally {
        setSubmitting(false);
      }
    } else {
      setSelectedPaymentMethod(paymentMethod);
      setPaymentModalVisible(true);
    }
  };

  const steps = [
    {
      title: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      content: (
        <div className="step-content">
          <div className="step-header">
            <Title level={3} className="step-title">
              <UserOutlined className="step-icon" />
              Thông tin người đặt hàng
            </Title>
            <Text className="step-description">
              Vui lòng cung cấp thông tin cá nhân để chúng tôi có thể liên hệ với bạn
            </Text>
          </div>
          
          <div className="form-section">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="hoTen"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  className="form-item"
                >
                  <Input 
                    placeholder="Nhập họ và tên" 
                    className="form-input user-info-input" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="soDienThoai"
                  label="Số điện thoại"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  className="form-item"
                >
                  <Input 
                    placeholder="Nhập số điện thoại" 
                    className="form-input user-info-input" 
                  />
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
                  className="form-item"
                >
                  <Input 
                    placeholder="Nhập email" 
                    className="form-input user-info-input" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="diaChi"
                  label="Địa chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                  className="form-item"
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Nhập địa chỉ giao hàng" 
                    className="form-textarea user-info-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      )
    },
    {
      title: 'Chọn đại lý',
      icon: <BankOutlined />,
      content: (
        <div className="step-content">
          <div className="step-header">
            <Title level={3} className="step-title">
              <BankOutlined className="step-icon" />
              Chọn đại lý giao xe
            </Title>
            <Text className="step-description">
              Chọn đại lý gần nhất để nhận xe và được hỗ trợ tốt nhất
            </Text>
          </div>
          
          <div className="form-section dealer-selection-section">
            {/* Search Bar */}
            <div className="dealer-search-container">
              <Input 
                placeholder="Tìm kiếm đại lý theo tên, thành phố..." 
                prefix={<SearchOutlined />}
                className="dealer-search-input"
                value={searchDaiLy}
                onChange={(e) => setSearchDaiLy(e.target.value)}
                size="large"
              />
            </div>
            
            {/* Dealer Cards Grid */}
            <Form.Item
              name="idDaiLy"
              rules={[{ required: true, message: 'Vui lòng chọn đại lý' }]}
              className="dealer-cards-form-item"
            >
              <div className="dealer-cards-grid">
                {(searchDaiLy ? filteredDaiLy : danhSachDaiLy).map(daiLy => (
                  <Card 
                    key={daiLy.id}
                    className={`dealer-card ${selectedDaiLy === daiLy.id ? 'selected' : ''}`}
                    onClick={() => handleSelectDaiLy(daiLy.id)}
                    hoverable
                  >
                    <div className="dealer-card-header">
                      <div className="dealer-icon">
                        <BankOutlined />
                      </div>
                      <div className="dealer-rating">
                        <StarOutlined className="star-icon" />
                        <span>4.8</span>
                      </div>
                    </div>
                    
                    <div className="dealer-card-content">
                      <Title level={4} className="dealer-title">{daiLy.ten}</Title>
                      
                      <div className="dealer-details">
                        <div className="dealer-detail-item">
                          <EnvironmentOutlined className="detail-icon" />
                          <Text className="detail-text">
                            {daiLy.diaChi}, {daiLy.thanhPho}
                          </Text>
                        </div>
                        
                        <div className="dealer-detail-item">
                          <PhoneOutlined className="detail-icon" />
                          <Text className="detail-text">{daiLy.soDienThoai}</Text>
                        </div>
                      </div>
                      
                      <div className="dealer-card-footer">
                        <Tag color="green" className="availability-tag">
                          Có sẵn
                        </Tag>
                        <Text type="secondary" className="distance-text">
                          ~15km
                        </Text>
                      </div>
                    </div>
                    
                    {selectedDaiLy === daiLy.id && (
                      <div className="selected-indicator">
                        <CheckCircleOutlined />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              
              {(searchDaiLy ? filteredDaiLy : danhSachDaiLy).length === 0 && (
                <div className="no-dealers-found">
                  <Text type="secondary">Không tìm thấy đại lý nào phù hợp</Text>
                </div>
              )}
            </Form.Item>
          </div>
        </div>
      )
    },
    {
      title: 'Khuyến mãi & Thanh toán',
      icon: <ShoppingCartOutlined />,
      content: (
        <div className="step-content">
          <div className="step-header">
            <Title level={3} className="step-title">
              <ShoppingCartOutlined className="step-icon" />
              Khuyến mãi và phương thức thanh toán
            </Title>
            <Text className="step-description">
              Chọn khuyến mãi phù hợp và phương thức thanh toán thuận tiện
            </Text>
          </div>
          
          <div className="form-section">
            {/* Khuyến mãi */}
            {danhSachKhuyenMai.length > 0 && (
              <div className="promotion-section">
                {/* Search Bar */}
                <div className="promotion-search-container">
                  <Input 
                    placeholder="Tìm kiếm khuyến mãi..." 
                    prefix={<SearchOutlined />}
                    className="promotion-search-input"
                    value={searchPromotion}
                    onChange={(e) => setSearchPromotion(e.target.value)}
                    size="large"
                  />
                </div>
                
                {/* Promotion Cards Grid */}
                <Form.Item
                  name="idKhuyenMai"
                  className="promotion-cards-form-item"
                >
                  <div className="promotion-cards-grid">
                    {/* No Promotion Option */}
                    <Card 
                      className={`promotion-card ${selectedPromotion === null ? 'selected' : ''}`}
                      onClick={() => handleSelectPromotion(null)}
                      hoverable
                    >
                      <div className="promotion-card-header">
                        <div className="promotion-icon">
                          <GiftOutlined />
                        </div>
                        <div className="promotion-badge">
                          <span>Mặc định</span>
                        </div>
                      </div>
                      
                      <div className="promotion-card-content">
                        <Title level={4} className="promotion-title">Không áp dụng khuyến mãi</Title>
                        <Text className="promotion-description">
                          Giữ nguyên giá gốc của xe
                        </Text>
                      </div>
                      
                      <div className="promotion-card-footer">
                        <Tag color="blue" className="promotion-type-tag">
                          Giá gốc
                        </Tag>
                        <Text className="promotion-amount">0 VNĐ</Text>
                      </div>
                      
                      {selectedPromotion === null && (
                        <div className="selected-indicator">
                          <CheckCircleOutlined />
                        </div>
                      )}
                    </Card>
                    
                    {/* Promotion Cards */}
                    {(searchPromotion ? filteredPromotions : danhSachKhuyenMai).map(khuyenMai => (
                      <Card 
                        key={khuyenMai.id}
                        className={`promotion-card ${selectedPromotion === khuyenMai.id ? 'selected' : ''}`}
                        onClick={() => handleSelectPromotion(khuyenMai.id)}
                        hoverable
                      >
                        <div className="promotion-card-header">
                          <div className="promotion-icon">
                            <GiftOutlined />
                          </div>
                          <div className="promotion-badge">
                            <span>{khuyenMai.loaiKhuyenMai === 'GIAM_GIA_TRUC_TIEP' ? 'Giảm giá' : 'Khuyến mãi'}</span>
                          </div>
                        </div>
                        
                        <div className="promotion-card-content">
                          <Title level={4} className="promotion-title">{khuyenMai.ten}</Title>
                          <Text className="promotion-description">
                            Áp dụng cho xe {cauHinh?.tenMau}
                          </Text>
                        </div>
                        
                        <div className="promotion-card-footer">
                          <Tag color="green" className="promotion-type-tag">
                            Tiết kiệm
                          </Tag>
                          <Text className="promotion-amount">
                            -{(khuyenMai.giaTri || 0).toLocaleString('vi-VN')} VNĐ
                          </Text>
                        </div>
                        
                        {selectedPromotion === khuyenMai.id && (
                          <div className="selected-indicator">
                            <CheckCircleOutlined />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                  
                  {(searchPromotion ? filteredPromotions : danhSachKhuyenMai).length === 0 && (
                    <div className="no-promotions-found">
                      <Text type="secondary">Không tìm thấy khuyến mãi nào phù hợp</Text>
                    </div>
                  )}
                </Form.Item>
              </div>
            )}
            
            {/* Phương thức thanh toán */}
            <div className="payment-method-section">
              <Form.Item
                name="phuongThucThanhToan"
                label="* Phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                className="payment-method-cards-form-item"
              >
                <div className="payment-method-cards-grid">
                  {/* Cash Payment Card */}
                  <Card 
                    className={`payment-method-card ${form.getFieldValue('phuongThucThanhToan') === 'tien_mat' ? 'selected' : ''}`}
                    onClick={() => form.setFieldsValue({ phuongThucThanhToan: 'tien_mat' })}
                    hoverable
                  >
                    <div className="payment-method-card-header">
                      <div className="payment-method-icon">
                        <WalletOutlined />
                      </div>
                      <div className="payment-method-badge">
                        <span>Miễn phí</span>
                      </div>
                    </div>
                    
                    <div className="payment-method-card-content">
                      <Title level={4} className="payment-method-title">Thanh toán tiền mặt</Title>
                      <Text className="payment-method-description">
                        Thanh toán trực tiếp tại đại lý khi nhận xe
                      </Text>
                    </div>
                    
                    <div className="payment-method-card-footer">
                      <div className="payment-method-details">
                        <Text className="payment-method-fee">Phí: 0 VNĐ</Text>
                        <Text className="payment-method-time">Khi giao xe</Text>
                      </div>
                    </div>
                    
                    {form.getFieldValue('phuongThucThanhToan') === 'tien_mat' && (
                      <div className="selected-indicator">
                        <CheckCircleOutlined />
                      </div>
                    )}
                  </Card>
                  
                  {/* Online Payment Card */}
                  <Card 
                    className={`payment-method-card ${form.getFieldValue('phuongThucThanhToan') === 'online' ? 'selected' : ''}`}
                    onClick={() => form.setFieldsValue({ phuongThucThanhToan: 'online' })}
                    hoverable
                  >
                    <div className="payment-method-card-header">
                      <div className="payment-method-icon">
                        <CreditCardOutlined />
                      </div>
                      <div className="payment-method-badge">
                        <span>Nhanh chóng</span>
                      </div>
                    </div>
                    
                    <div className="payment-method-card-content">
                      <Title level={4} className="payment-method-title">Thanh toán online</Title>
                      <Text className="payment-method-description">
                        VNPay, MoMo, ZaloPay, Chuyển khoản ngân hàng
                      </Text>
                    </div>
                    
                    <div className="payment-method-card-footer">
                      <div className="payment-method-details">
                        <Text className="payment-method-fee">Phí: 0 VNĐ</Text>
                        <Text className="payment-method-time">Ngay lập tức</Text>
                      </div>
                    </div>
                    
                    {form.getFieldValue('phuongThucThanhToan') === 'online' && (
                      <div className="selected-indicator">
                        <CheckCircleOutlined />
                      </div>
                    )}
                  </Card>
                </div>
              </Form.Item>
            </div>
            
            {/* Tiền đặt cọc */}
            <div className="deposit-section">
              <Form.Item
                name="tienDatCoc"
                label="Tiền đặt cọc (VNĐ)"
                className="form-item deposit-form-item"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền đặt cọc"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  className="form-input-number deposit-input"
                  min={0}
                  max={giaSauKhuyenMai}
                />
              </Form.Item>
            </div>
            
            {/* Thông tin thanh toán */}
            <Alert
              message={
                <div className="alert-content">
                  <SafetyOutlined className="alert-icon" />
                  <span>Thông tin thanh toán</span>
                </div>
              }
              description={
                <div className="payment-info">
                  <Text>• Tiền mặt: Thanh toán khi nhận xe tại đại lý</Text><br />
                  <Text>• Online: Thanh toán ngay qua các cổng thanh toán an toàn</Text><br />
                  <Text>• Tiền cọc: Tối thiểu 10% giá trị xe</Text>
                </div>
              }
              type="info"
              showIcon={false}
              className="payment-info-alert"
            />
            
            {/* Ghi chú */}
            <Form.Item
              name="ghiChu"
              label="Ghi chú"
              className="form-item"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Ghi chú thêm về đơn hàng" 
                className="form-textarea"
              />
            </Form.Item>
          </div>
        </div>
      )
    },
    {
      title: 'Xác nhận đơn hàng',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="step-content">
          <div className="step-header">
            <Title level={3} className="step-title">
              <CheckCircleOutlined className="step-icon" />
              Xác nhận thông tin đơn hàng
            </Title>
            <Text className="step-description">
              Kiểm tra lại thông tin trước khi đặt hàng
            </Text>
          </div>
          
          <div className="confirmation-section">
            <Card className="order-summary-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div className="summary-section">
                    <Title level={4} className="summary-title">
                      <CarOutlined className="summary-icon" />
                      Thông tin xe
                    </Title>
                    <div className="summary-content">
                      <div className="summary-item">
                        <Text strong className="summary-label">Mẫu xe:</Text>
                        <Text className="summary-value">{cauHinh?.tenMau}</Text>
                      </div>
                      <div className="summary-item">
                        <Text strong className="summary-label">Màu sắc:</Text>
                        <Text className="summary-value">{cauHinh?.tenMauSac}</Text>
                      </div>
                      <div className="summary-item">
                        <Text strong className="summary-label">Tùy chọn:</Text>
                        <div className="summary-value">
                          {cauHinh?.danhSachTuyChon && cauHinh.danhSachTuyChon.length > 0 ? (
                            <ul className="options-list">
                              {cauHinh.danhSachTuyChon.map(tuyChon => (
                                <li key={tuyChon.id} className="option-item">
                                  {tuyChon.ten} (+{(tuyChon.gia || 0).toLocaleString('vi-VN')} VNĐ)
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Text type="secondary">Không có tùy chọn</Text>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="summary-section">
                    <Title level={4} className="summary-title">
                      <CreditCardOutlined className="summary-icon" />
                      Thông tin thanh toán
                    </Title>
                    <div className="summary-content">
                      <div className="summary-item">
                        <Text strong className="summary-label">Giá gốc:</Text>
                        <Text className="summary-value">
                          {(cauHinh?.tongGia || 0).toLocaleString('vi-VN')} VNĐ
                        </Text>
                      </div>
                      {khuyenMaiSelected && (
                        <div className="summary-item">
                          <Text strong className="summary-label">Khuyến mãi:</Text>
                          <Text className="summary-value promotion-value">
                            {khuyenMaiSelected.ten}
                          </Text>
                        </div>
                      )}
                      <div className="summary-item total-item">
                        <Text strong className="summary-label">Tổng tiền:</Text>
                        <Text strong className="summary-value total-value">
                          {(giaSauKhuyenMai || 0).toLocaleString('vi-VN')} VNĐ
                        </Text>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
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
    <div className="order-form-container">
      {/* Header */}
      <div className="order-header">
        <div className="header-content">
          <div className="header-left">
            <h2>
              <ShoppingCartOutlined className="header-icon" />
              Đặt hàng xe {cauHinh?.tenMau}
            </h2>
            <Text className="header-subtitle">
              Hoàn thành các bước sau để đặt hàng xe của bạn
            </Text>
          </div>
          <div className="header-right">
            <div className="order-progress">
              <Text className="progress-label">Tiến độ đặt hàng</Text>
              <Progress 
                percent={((currentStep + 1) / steps.length) * 100} 
                strokeColor="#d5001c"
                trailColor="rgba(255,255,255,0.1)"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="order-content">
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
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              hoTen: user?.fullName || '',
              email: user?.email || '',
              soDienThoai: user?.phone || '',
              diaChi: ''
            }}
            className="order-form"
          >
            {steps[currentStep].content}
          </Form>
        </div>

        {/* Navigation */}
        <div className="step-navigation">
          <Button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="nav-btn nav-btn-back"
          >
            Quay lại
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="nav-btn nav-btn-next"
            >
              Tiếp theo
            </Button>
          ) : (
            <Button 
              type="primary"
              htmlType="submit"
              loading={submitting}
              onClick={() => form.submit()}
              className="nav-btn nav-btn-submit"
              icon={<CheckCircleOutlined />}
            >
              Đặt hàng
            </Button>
          )}
        </div>
      </div>
      
      {/* Payment Modal */}
      <Modal
        title={
          <div className="modal-title">
            <CreditCardOutlined className="modal-icon" />
            <span>Chọn phương thức thanh toán online</span>
          </div>
        }
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={700}
        className="payment-modal"
      >
        <div className="payment-amount-display">
          <Text className="amount-label">Số tiền cần thanh toán:</Text>
          <Text className="amount-value">
            {(form.getFieldValue('tienDatCoc') || (giaSauKhuyenMai || 0) * 0.1).toLocaleString('vi-VN')} VNĐ
          </Text>
        </div>
        
        <Radio.Group 
          value={selectedPaymentMethod} 
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          className="payment-methods-group"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {paymentMethods.map(method => (
              <Radio key={method.id} value={method.id} className="payment-method-radio">
                <Card className="payment-method-card">
                  <Row align="middle" gutter={16}>
                    <Col>
                      <div className="payment-method-icon">
                        {method.icon}
                      </div>
                    </Col>
                    <Col flex={1}>
                      <Text strong className="payment-method-name">{method.name}</Text>
                      <br />
                      <Text type="secondary" className="payment-method-desc">{method.description}</Text>
                      <br />
                      <Text type="secondary" className="payment-method-fee">
                        Phí: {method.fee.toLocaleString('vi-VN')} VNĐ
                      </Text>
                      <br />
                      <Text type="secondary" className="payment-method-time">
                        Thời gian: {method.processingTime}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
        
        <div className="payment-actions">
          <Button 
            type="primary" 
            size="large"
            loading={paymentProcessing}
            disabled={!selectedPaymentMethod}
            onClick={() => handleOnlinePayment(selectedPaymentMethod)}
            icon={<CreditCardOutlined />}
            className="payment-submit-btn"
          >
            Thanh toán ngay
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderForm; 