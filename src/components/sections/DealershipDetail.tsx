// frontend/audi/src/components/sections/DealershipDetail.tsx
import React, { useEffect } from 'react';
import { Dealership } from '../../services/dealershipService';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';

interface DealershipDetailProps {
  dealership: Dealership;
}

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, zoom, map]);
  
  return null;
};

const DealershipDetail: React.FC<DealershipDetailProps> = ({ dealership }) => {
  const formatWorkingHours = () => {
    // Kiểm tra nếu dữ liệu không tồn tại hoặc rỗng
    if (!dealership.gioLamViec) return <p>Không có thông tin</p>;
    
    let workingHours = dealership.gioLamViec;
    
    // Nếu dữ liệu đang là chuỗi thì parse
    if (typeof workingHours === 'string') {
      try {
        workingHours = JSON.parse(workingHours);
      } catch (e) {
        console.error('Lỗi khi parse dữ liệu giờ làm việc:', e);
        return <p>Lỗi định dạng dữ liệu</p>;
      }
    }
    
    // Kiểm tra sau khi parse có phải là object không
    if (!workingHours || typeof workingHours !== 'object' || Object.keys(workingHours).length === 0) {
      return <p>Không có thông tin</p>;
    }
    
    // Define dayOrder with an index signature
    const dayOrder: { [key: string]: number } = {
      "Thu 2-Thu 6": 1,
      "Thu 7": 2,
      "Chu Nhat": 3
    };
    
    // Sắp xếp theo thứ tự
    const sortedEntries = Object.entries(workingHours).sort((a, b) => {
      const orderA = dayOrder[a[0]] || 999;
      const orderB = dayOrder[b[0]] || 999;
      return orderA - orderB;
    });
    
    // Định dạng hiển thị đẹp hơn
    return (
      <div className="working-hours">
        {sortedEntries.map(([day, hours]) => {
          // Chuyển đổi tên ngày sang tiếng Việt có dấu
          const translatedDay = {
            "Thu 2-Thu 6": "Thứ 2-Thứ 6",
            "Thu 7": "Thứ 7",
            "Chu Nhat": "Chủ Nhật"
          }[day] || day;
          
          // Kiểm tra và dịch trạng thái đóng/mở cửa
          const isClosed = hours === "Dong cua";
          const isOpen = hours === "Mo cua";
          
          // Chuyển đổi văn bản
          let translatedHours = hours;
          if (isClosed) translatedHours = "Đóng cửa";
          if (isOpen) translatedHours = "Mở cửa";
          
          return (
            <div key={day} className="working-hours-row" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '10px 0',
              borderBottom: '1px dashed #eaeaea'
            }}>
              <span style={{ fontWeight: '500' }}>{translatedDay}</span>
              <span style={{ 
                color: isClosed ? "#D50000" : isOpen ? "#008000" : "#333", // Đỏ cho đóng cửa, xanh lá cho mở cửa
                fontWeight: (isClosed || isOpen) ? '500' : '400'
              }}>
                {translatedHours}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dealership-detail" style={{ 
      padding: '25px', 
      backgroundColor: '#fff', 
    
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '30px'
    }}>
      <h2 style={{ marginTop: 0, color: '#D50000', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        {dealership.ten}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <h3>Thông tin liên hệ</h3>
          <div style={{ margin: '15px 0' }}>
            <p><strong>Địa chỉ:</strong> {dealership.diaChi}, {dealership.thanhPho}, {dealership.tinh} {dealership.maBuuDien}</p>
            <p><strong>Quốc gia:</strong> {dealership.quocGia}</p>
            <p><strong>Điện thoại:</strong> {dealership.soDienThoai}</p>
            <p><strong>Email:</strong> {dealership.email || 'Không có'}</p>
          </div>
          
          {dealership.laTrungTamDichVu && (
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#D50000' }}>Trung tâm dịch vụ</h4>
              <p>Đại lý này cung cấp đầy đủ các dịch vụ bảo dưỡng, sửa chữa và bảo hành.</p>
            </div>
          )}
        </div>
        
        <div>
          <h3>Giờ làm việc</h3>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            {formatWorkingHours()}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <a 
          href="#schedule-test-drive" 
          style={{ 
            backgroundColor: '#D50000', 
            color: 'white', 
            padding: '10px 20px', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: '500'
          }}
        >
          Đặt lịch lái thử
        </a>
        
        {dealership.laTrungTamDichVu && (
          <a 
            href="#schedule-maintenance" 
            style={{ 
              backgroundColor: '#282828', 
              color: 'white', 
              padding: '10px 20px', 
              textDecoration: 'none', 
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Đặt lịch bảo dưỡng
          </a>
        )}
      </div>
    </div>
  );
};

export default DealershipDetail;