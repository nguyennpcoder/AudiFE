import React from 'react';
import StarRating from '../common/StarRating';

const ForceHalfStarTest: React.FC = () => {
  // Tạo dữ liệu giả lập với rating có phần thập phân
  const mockRatings = [
    { id: 1, tenNguoiDung: 'Test User 1', tenMauXe: 'A4', soSao: 4.5 },
    { id: 2, tenNguoiDung: 'Test User 2', tenMauXe: 'Q5', soSao: 3.5 },
    { id: 3, tenNguoiDung: 'Test User 3', tenMauXe: 'A6', soSao: 2.5 },
    { id: 4, tenNguoiDung: 'Test User 4', tenMauXe: 'RS6', soSao: 1.5 },
    { id: 5, tenNguoiDung: 'Test User 5', tenMauXe: 'e-tron', soSao: 0.5 },
    { id: 6, tenNguoiDung: 'Test User 6', tenMauXe: 'A8', soSao: 4.0 },
    { id: 7, tenNguoiDung: 'Test User 7', tenMauXe: 'Q7', soSao: 3.0 },
    { id: 8, tenNguoiDung: 'Test User 8', tenMauXe: 'TT', soSao: 2.0 },
    { id: 9, tenNguoiDung: 'Test User 9', tenMauXe: 'R8', soSao: 1.0 },
    { id: 10, tenNguoiDung: 'Test User 10', tenMauXe: 'S8', soSao: 0.0 },
  ];

  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Force Half Star Test - Test với dữ liệu giả lập</h2>
      <p>Test này sử dụng dữ liệu giả lập để kiểm tra xem StarRating component có hiển thị nửa sao đúng không.</p>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>⚠️ Lưu ý:</h3>
        <p>Nếu test này hiển thị đúng nửa sao nhưng RatingManagement không hiển thị, thì vấn đề là ở dữ liệu từ backend.</p>
        <p>Nếu test này cũng không hiển thị nửa sao, thì vấn đề là ở StarRating component hoặc CSS.</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test với dữ liệu giả lập:</h3>
        {mockRatings.map((rating) => {
          const decimalPart = rating.soSao % 1;
          const isHalfRating = decimalPart > 0;
          
          return (
            <div key={rating.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              padding: '10px',
              border: isHalfRating ? '2px solid #28a745' : '1px solid #ddd',
              marginBottom: '10px',
              borderRadius: '4px',
              background: isHalfRating ? '#f8fff9' : 'white'
            }}>
              <div style={{ minWidth: '200px' }}>
                <strong>{rating.tenNguoiDung}</strong> - {rating.tenMauXe}
              </div>
              <div style={{ minWidth: '150px' }}>
                Rating: <strong>{rating.soSao}</strong> (Type: {typeof rating.soSao})
                {isHalfRating && <span style={{ color: 'green', fontWeight: 'bold' }}> ⭐ HALF RATING</span>}
              </div>
              <StarRating rating={rating.soSao} size="small" readonly allowHalf />
              <div style={{ fontSize: '12px', color: '#666' }}>
                Floor: {Math.floor(rating.soSao)}, Ceil: {Math.ceil(rating.soSao)}, Decimal: {decimalPart.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4fd', borderRadius: '8px' }}>
        <h4>Debug Info:</h4>
        <p>1. Mở Developer Tools (F12) và xem Console</p>
        <p>2. Kiểm tra debug logs từ StarRating component</p>
        <p>3. Rating màu xanh lá là rating có phần thập phân</p>
        <p>4. Nếu không thấy nửa sao ở đây, thì có vấn đề với StarRating component</p>
        <p>5. Nếu thấy nửa sao ở đây nhưng không thấy trong RatingManagement, thì vấn đề là dữ liệu từ backend</p>
      </div>
    </div>
  );
};

export default ForceHalfStarTest;
