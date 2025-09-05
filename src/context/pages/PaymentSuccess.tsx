import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Typography, Space } from 'antd';
import { CheckCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../../styles/Payment.css';

const { Title, Text } = Typography;
const BACKEND_URL = 'http://localhost:8080/api/v1';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');
    const vnpay = searchParams.get('vnpay');
    const zalopay = searchParams.get('zalopay');
    const momo = searchParams.get('momo');
    
    // Determine payment method from URL params
    if (vnpay === '1') {
      setPaymentMethod('VNPay');
    } else if (zalopay === '1') {
      setPaymentMethod('ZaloPay');
    } else if (momo === '1') {
      setPaymentMethod('MoMo');
    }
    
    if (orderId) {
      loadOrderInfo(orderId, transactionId);
    }
  }, [searchParams]);

  const loadOrderInfo = async (orderId: string, transactionId: string | null) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/don-hang/${orderId}`);
      setOrderInfo(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang xử lý...</div>;
  }

  return (
    <div className="payment-page" style={{ 
      maxWidth: 900, 
      margin: '50px auto', 
      padding: '20px',
      textAlign: 'center'
    }}>
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />}
        title="Thanh toán thành công!"
        subTitle={`Đơn hàng của bạn đã được xác nhận và thanh toán thành công qua ${paymentMethod || 'cổng thanh toán'}.`}
        extra={[
          <Button 
            type="primary" 
            key="home"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>,
          <Button 
            key="orders"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/orders')}
          >
            Xem đơn hàng
          </Button>
        ]}
      />
      
      {orderInfo && (
        <Card 
          style={{ 
            marginTop: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          headStyle={{ color: '#fff' }}
          bodyStyle={{ color: '#fff' }}
        >
          <Title level={4}>Thông tin đơn hàng</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Mã đơn hàng:</Text> {orderInfo.maDonHang}
            </div>
            <div>
              <Text strong>Số tiền đã thanh toán:</Text> {orderInfo.tienDatCoc?.toLocaleString('vi-VN')} VNĐ
            </div>
            <div>
              <Text strong>Phương thức thanh toán:</Text> {paymentMethod || orderInfo.phuongThucThanhToan}
            </div>
            <div>
              <Text strong>Trạng thái:</Text> 
              <Text type="success"> Đã thanh toán</Text>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default PaymentSuccess; 