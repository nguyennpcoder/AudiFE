// frontend/audi/src/components/sections/MaintenanceForm.tsx
import React, { useState } from 'react';
import { Dealership, scheduleMaintenance } from '../../services/dealershipService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface MaintenanceFormProps {
  dealership: Dealership;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ dealership }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('bao_duong_dinh_ky');
  const [vehicleVIN, setVehicleVIN] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showNotification('error', 'Vui lòng đăng nhập để đặt lịch bảo dưỡng');
      return;
    }
    
    if (!selectedDate || !selectedTime || !vehicleVIN) {
      showNotification('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    
    const maintenanceData = {
      idNguoiDung: user.userId || 0,
      idDaiLy: dealership.id,
      soKhung: vehicleVIN,
      ngayHen: `${selectedDate}T${selectedTime}:00`,
      loaiDichVu: serviceType as 'bao_duong_dinh_ky' | 'sua_chua' | 'bao_hanh' | 'trieu_hoi',
      moTa: description
    };
    
    const result = await scheduleMaintenance(maintenanceData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      showNotification('success', result.message);
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setVehicleVIN('');
      setDescription('');
    } else {
      showNotification('error', result.message);
    }
  };

  if (!dealership.laTrungTamDichVu) {
    return null;
  }

  return (
    <div id="schedule-maintenance" style={{ 
      margin: '40px 0', 
      
      padding: '30px', 
      backgroundColor: '#f9f9f9', 
      borderRadius: '8px'
    }}>
      <h2 style={{ marginTop: 0, color: '#282828' }}>Đặt lịch bảo dưỡng tại {dealership.ten}</h2>
      <p>Giữ cho chiếc Audi của bạn trong tình trạng hoạt động tốt nhất với dịch vụ bảo dưỡng chất lượng cao</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="vin" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Số khung xe (VIN)*
          </label>
          <input 
            id="vin"
            type="text" 
            value={vehicleVIN}
            onChange={(e) => setVehicleVIN(e.target.value)}
            placeholder="Nhập số khung xe của bạn"
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="serviceType" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Loại dịch vụ*
          </label>
          <select 
            id="serviceType"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              backgroundColor: '#fff'
            }}
            required
          >
            <option value="bao_duong_dinh_ky">Bảo dưỡng định kỳ</option>
            <option value="sua_chua">Sửa chữa</option>
            <option value="bao_hanh">Bảo hành</option>
            <option value="trieu_hoi">Triệu hồi</option>
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Ngày hẹn*
            </label>
            <input 
              id="date"
              type="date" 
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '4px', 
                border: '1px solid #ddd'
              }}
              required
            />
          </div>
          
          <div>
            <label htmlFor="time" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Giờ hẹn*
            </label>
            <input 
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '4px', 
                border: '1px solid #ddd'
              }}
              required
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Mô tả vấn đề
          </label>
          <textarea 
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết về vấn đề của xe..."
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              backgroundColor: '#282828', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: '500',
              cursor: isSubmitting ? 'default' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch bảo dưỡng'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;