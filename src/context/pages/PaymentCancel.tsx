import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '50px auto', 
      padding: '20px',
      textAlign: 'center'
    }}>
      <Result
        status="error"
        icon={<CloseCircleOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
        title="Thanh toán bị hủy"
        subTitle="Giao dịch thanh toán đã bị hủy hoặc thất bại."
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