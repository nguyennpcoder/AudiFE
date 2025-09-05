import React, { useEffect, useState } from 'react';
import '../../styles/Payment.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
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
  }, [searchParams]);

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
        title="Thanh toán bị hủy"
        subTitle={`Giao dịch thanh toán qua ${paymentMethod || 'cổng thanh toán'} đã bị hủy hoặc thất bại.`}
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
};

export default PaymentCancel; 