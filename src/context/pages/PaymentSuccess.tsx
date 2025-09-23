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
    const vnpay = searchParams.get('vnpay');
    const zalopay = searchParams.get('zalopay');
    const momo = searchParams.get('momo');
    
    // Determine payment method first
    let detectedPaymentMethod = '';
    if (vnpay === '1') {
      detectedPaymentMethod = 'VNPay';
    } else if (zalopay === '1') {
      detectedPaymentMethod = 'ZaloPay';
    } else if (momo === '1') {
      detectedPaymentMethod = 'MoMo';
    }
    setPaymentMethod(detectedPaymentMethod);

    console.log('Payment params:', { orderId, vnpay, zalopay, momo, detectedPaymentMethod });

    // Handle VNPay
    if (vnpay === '1') {
      const vnpResponseCode = searchParams.get('vnp_ResponseCode');
      const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
      const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
      
      console.log('VNPay params:', { vnpResponseCode, vnpTransactionStatus, vnpTransactionNo });
      
      // VNPay success: vnp_ResponseCode = '00' and vnp_TransactionStatus = '00'
      if (vnpResponseCode === '00') {
        setIsPaymentSuccessful(true);
        if (orderId) {
          updatePaymentStatusOnBackend(orderId, vnpTransactionNo, 'VNPay', '00');
          loadOrderInfo(orderId, vnpTransactionNo);
          checkPaymentStatusWithoutOverride(orderId);
        } else {
          setLoading(false);
        }
        return;
      } else {
        // VNPay failed
        navigate('/payment/cancel?vnpay=1&vnp_ResponseCode=' + vnpResponseCode);
        return;
      }
    }

    // Handle ZaloPay
    if (zalopay === '1') {
      const zaloStatus = searchParams.get('status');
      const zpTransId = searchParams.get('zp_trans_id');
      console.log('ZaloPay status:', zaloStatus);
      
      if (zaloStatus) {
        // ZaloPay status: 1 = success, -49 = cancelled, other = failed
        if (zaloStatus === '1') {
          setIsPaymentSuccessful(true);
          if (orderId) {
            updatePaymentStatusOnBackend(orderId, zpTransId, 'ZaloPay', 'SUCCESS');
            loadOrderInfo(orderId, zpTransId);
            checkPaymentStatusWithoutOverride(orderId);
          } else {
          setLoading(false);
        }
          return;
        } else {
          // Redirect to cancel page for failed/cancelled ZaloPay
          navigate('/payment/cancel?zalopay=1&status=' + zaloStatus);
          return;
        }
      }
    }

    // Handle MoMo
    if (momo === '1') {
      const momoResultCode = searchParams.get('resultCode');
      const momoMessage = searchParams.get('message');
      const momoTransId = searchParams.get('transId');
      
      console.log('MoMo params:', { momoResultCode, momoMessage, momoTransId });
      
      // MoMo resultCode: 0 = success
      if (momoResultCode === '0' || momoMessage === 'Successful.') {
        setIsPaymentSuccessful(true);
        if (orderId) {
          updatePaymentStatusOnBackend(orderId, momoTransId, 'MoMo', 'SUCCESS');
          loadOrderInfo(orderId, momoTransId);
          checkPaymentStatusWithoutOverride(orderId);
        } else {
          setLoading(false);
        }
        return;
      } else if (momoResultCode && momoResultCode !== '0') {
        // Redirect to cancel page for failed MoMo
        navigate('/payment/cancel?momo=1&resultCode=' + momoResultCode);
        return;
      }
    }

    // Handle other cases or when no specific payment method is detected
    if (orderId) {
      loadOrderInfo(orderId, null);
      checkPaymentStatus(orderId);
    } else {
      setLoading(false);
    }
  }, [searchParams, navigate]);

  // Function to update payment status on backend
  const updatePaymentStatusOnBackend = async (
    orderId: string, 
    transactionId: string | null, 
    paymentMethod: string, 
    status: string
  ) => {
    try {
      const updateData = {
        orderId: orderId,
        transactionId: transactionId,
        paymentMethod: paymentMethod,
        status: status,
        amount: searchParams.get('amount') || searchParams.get('vnp_Amount'), // VNPay uses vnp_Amount
        timestamp: new Date().toISOString()
      };

      console.log('Updating payment status:', updateData);
      
      const response = await axios.post(`${BACKEND_URL}/thanh-toan/update-payment-status`, updateData);
      
      if (response.data.success) {
        console.log('Payment status updated successfully');
      } else {
        console.error('Failed to update payment status:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      // Don't fail the whole process if backend update fails
      // The user still sees success, but log the error for debugging
    }
  };

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

  // Check payment status without overriding already successful status
  const checkPaymentStatusWithoutOverride = async (orderId: string) => {
    try {
      // Add a small delay to allow backend to process the update
      await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay to 3 seconds
      
      const response = await axios.get(`${BACKEND_URL}/thanh-toan/payment-status/${orderId}`);
      setPaymentStatus(response.data);
      // Don't override if already successful from URL params
      if (!isPaymentSuccessful) { // Only update if not already successful
        setIsPaymentSuccessful(response.data.hasSuccessfulPayment);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
    } finally {
      if (loading) { // Only set loading to false if it's still true
        setLoading(false);
      }
    }
  };

  // Get transaction ID from various sources
  const getTransactionId = () => {
    // Priority order for transaction ID based on payment method
    if (searchParams.get('vnpay') === '1') {
      return searchParams.get('vnp_TransactionNo');
    } else if (searchParams.get('zalopay') === '1') {
      return searchParams.get('zp_trans_id');
    } else if (searchParams.get('momo') === '1') {
      return searchParams.get('transId');
    }
    
    // Fallback to any transaction ID parameter
    return searchParams.get('transactionId') || 
           searchParams.get('transId') || 
           searchParams.get('vnp_TransactionNo') || 
           searchParams.get('zp_trans_id') ||
           (paymentStatus?.transactionId);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '16px'
      }}>
        Đang xử lý thanh toán...
      </div>
    );
  }

  // Nếu thanh toán không thành công, hiển thị trang lỗi
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
          subTitle={`Giao dịch thanh toán qua ${paymentMethod || 'cổng thanh toán'} chưa được xác nhận thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.`}
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

  const transactionId = getTransactionId();

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
          <Title level={4} style={{ color: '#fff' }}>Thông tin đơn hàng</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ color: '#fff' }}>Mã đơn hàng:</Text> 
              <Text style={{ color: '#fff', marginLeft: 8 }}>
                {orderInfo?.maDonHang || paymentStatus?.orderId}
              </Text>
            </div>
            <div>
              <Text strong style={{ color: '#fff' }}>Số tiền đã thanh toán:</Text> 
              <Text style={{ color: '#fff', marginLeft: 8 }}>
                {(orderInfo?.tienDatCoc || paymentStatus?.amount)?.toLocaleString('vi-VN')} VNĐ
              </Text>
            </div>
            <div>
              <Text strong style={{ color: '#fff' }}>Phương thức thanh toán:</Text> 
              <Text style={{ color: '#fff', marginLeft: 8 }}>
                {paymentMethod || orderInfo?.phuongThucThanhToan || paymentStatus?.paymentMethod}
              </Text>
            </div>
            <div>
              <Text strong style={{ color: '#fff' }}>Trạng thái:</Text> 
              <Text type="success" style={{ marginLeft: 8 }}> Đã thanh toán</Text>
            </div>
            {transactionId && (
              <div>
                <Text strong style={{ color: '#fff' }}>Mã giao dịch:</Text> 
                <Text style={{ color: '#fff', marginLeft: 8 }}>
                  {transactionId}
                </Text>
              </div>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default PaymentSuccess;