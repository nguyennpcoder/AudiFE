import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Typography, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
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
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');
    const vnpay = searchParams.get('vnpay');
    const zalopay = searchParams.get('zalopay');
    const momo = searchParams.get('momo');
    
    // Check ZaloPay status from URL params
    const zaloStatus = searchParams.get('status');
    if (zalopay === '1' && zaloStatus) {
      setPaymentMethod('ZaloPay');
      // ZaloPay status: 1 = success, -49 = cancelled, other = failed
      if (zaloStatus === '1') {
        setIsPaymentSuccessful(true);
        setLoading(false);
        return;
      } else {
        // Redirect to cancel page for failed/cancelled ZaloPay
        navigate('/payment/cancel?zalopay=1&status=' + zaloStatus);
        return;
      }
    }
    
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
      checkPaymentStatus(orderId);
    }
  }, [searchParams, navigate]);

  const loadOrderInfo = async (orderId: string, transactionId: string | null) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/don-hang/${orderId}`);
      setOrderInfo(response.data);
    } catch (error) {
      console.error('Lỗi khi tải thông tin đơn hàng:', error);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/thanh-toan/payment-status/${orderId}`);
      setPaymentStatus(response.data);
      setIsPaymentSuccessful(response.data.hasSuccessfulPayment);
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
      setIsPaymentSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang xử lý...</div>;
  }

  // Nếu thanh toán không thành công, chuyển hướng đến trang cancel
  if (!isPaymentSuccessful) {
    return (
      <div className="payment-page" style={{ 
        maxWidth: 900, 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <Result
          status="error"
          icon={<CloseCircleOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
          title="Thanh toán chưa thành công"
          subTitle={`Giao dịch thanh toán qua ${paymentMethod || 'cổng thanh toán'} chưa được xác nhận thành công.`}
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
      </div>
    );
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
      
      {(orderInfo || paymentStatus) && (
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
              <Text strong>Mã đơn hàng:</Text> {orderInfo?.maDonHang || paymentStatus?.orderId}
            </div>
            <div>
              <Text strong>Số tiền đã thanh toán:</Text> {(orderInfo?.tienDatCoc || paymentStatus?.amount)?.toLocaleString('vi-VN')} VNĐ
            </div>
            <div>
              <Text strong>Phương thức thanh toán:</Text> {paymentMethod || orderInfo?.phuongThucThanhToan || paymentStatus?.paymentMethod}
            </div>
            <div>
              <Text strong>Trạng thái:</Text> 
              <Text type="success"> Đã thanh toán</Text>
            </div>
            {paymentStatus?.transactionId && (
              <div>
                <Text strong>Mã giao dịch:</Text> {paymentStatus.transactionId}
              </div>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default PaymentSuccess; 