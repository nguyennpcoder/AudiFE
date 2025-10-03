import React, { useState } from 'react';
import { Form, Rate, Button, Input, message } from 'antd';
import StarRating from '../common/StarRating';

const { TextArea } = Input;

const RatingFormTest: React.FC = () => {
  const [form] = Form.useForm();
  const [testRating, setTestRating] = useState<number>(0);

  const handleSubmit = (values: any) => {
    console.log('=== RATING FORM TEST ===');
    console.log('Form values:', values);
    console.log('Rating value:', values.soSao, 'Type:', typeof values.soSao);
    console.log('Is half rating:', values.soSao % 1 !== 0);
    console.log('Decimal part:', values.soSao % 1);
    
    setTestRating(values.soSao);
    message.success(`Đánh giá: ${values.soSao} sao`);
  };

  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Rating Form Test - Kiểm tra form đánh giá</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Test với giá trị cố định:</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
          <button onClick={() => setTestRating(2.5)}>Test 2.5 sao</button>
          <button onClick={() => setTestRating(3.5)}>Test 3.5 sao</button>
          <button onClick={() => setTestRating(4.5)}>Test 4.5 sao</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Hiển thị: {testRating} sao</span>
          <StarRating rating={testRating} size="large" readonly allowHalf showValue />
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Form đánh giá test:</h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '500px' }}
        >
          <Form.Item
            name="soSao"
            label="Đánh giá sao"
            rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item
            name="tieuDe"
            label="Tiêu đề đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề đánh giá..." />
          </Form.Item>

          <Form.Item
            name="noiDung"
            label="Nội dung đánh giá"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Chia sẻ trải nghiệm của bạn..."
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Test Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px' }}>
        <h4>Debug Info:</h4>
        <p>1. Chọn rating 2.5 sao trong form</p>
        <p>2. Submit form và xem Console logs</p>
        <p>3. Kiểm tra xem giá trị có đúng là 2.5 không</p>
        <p>4. Kiểm tra StarRating component có hiển thị nửa sao không</p>
        <p>5. Nếu form gửi đúng 2.5 nhưng StarRating không hiển thị nửa sao, thì vấn đề ở StarRating component</p>
        <p>6. Nếu form gửi sai giá trị, thì vấn đề ở Ant Design Rate component</p>
      </div>
    </div>
  );
};

export default RatingFormTest;
