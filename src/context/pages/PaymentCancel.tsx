import React, { useEffect, useState } from 'react';
import '../../styles/Payment.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const vnpay = searchParams.get('vnpay');
    const zalopay = searchParams.get('zalopay');
    const momo = searchParams.get('momo');
    const status = searchParams.get('status');
    const responseCode = searchParams.get('vnp_ResponseCode');
    
    // Determine payment method from URL params
    if (vnpay === '1') {
      setPaymentMethod('VNPay');
      // For VNPay, response code '00' actually means success, not failure
      if (responseCode === '00') {
        // Redirect to success page if we got a successful response code
        navigate(`/payment/success?vnpay=1&vnp_ResponseCode=${responseCode}`);
        return;
      }
      setStatusMessage('Giao dịch thanh toán qua VNPay đã bị hủy hoặc thất bại.');
    } else if (zalopay === '1') {
      setPaymentMethod('ZaloPay');
      // ZaloPay status codes
      if (status === '-49') {
        setStatusMessage('Giao dịch thanh toán qua ZaloPay đã bị hủy bởi người dùng.');
      } else if (status === '-1') {
        setStatusMessage('Giao dịch thanh toán qua ZaloPay thất bại do lỗi hệ thống.');
      } else {
        setStatusMessage(`Giao dịch thanh toán qua ZaloPay thất bại (Mã lỗi: ${status}).`);
      }
    } else if (momo === '1') {
      setPaymentMethod('MoMo');
      setStatusMessage('Giao dịch thanh toán qua MoMo đã bị hủy hoặc thất bại.');
    } else {
      setStatusMessage('Giao dịch thanh toán đã bị hủy hoặc thất bại.');
    }
  }, [searchParams, navigate]);

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
        subTitle={statusMessage}
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