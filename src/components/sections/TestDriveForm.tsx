// frontend/audi/src/components/sections/TestDriveForm.tsx
import React, { useState, useEffect } from 'react';
import { Dealership } from '../../services/dealershipService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { scheduleTestDrive } from '../../services/dealershipService';

interface TestDriveFormProps {
  dealership: Dealership;
}

interface CarModel {
  id: number;
  tenMau: string;
}

const TestDriveForm: React.FC<TestDriveFormProps> = ({ dealership }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Fetch available car models for test drive
  useEffect(() => {
    // In a real implementation, this would come from an API
    setCarModels([
      { id: 1, tenMau: 'A4 2023' },
      { id: 2, tenMau: 'A6 2023' },
      { id: 3, tenMau: 'RS7 2023' },
      { id: 4, tenMau: 'R8 2023' },
      { id: 5, tenMau: 'e-tron GT 2023' }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showNotification('error', 'Vui lòng đăng nhập để đặt lịch lái thử');
      return;
    }
    
    if (!selectedDate || !selectedTime || !selectedModel) {
      showNotification('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    
    const testDriveData = {
      idNguoiDung: user.userId || 0,
      idMau: selectedModel,
      idDaiLy: dealership.id,
      thoiGianHen: `${selectedDate}T${selectedTime}:00`,
      ghiChu: notes
    };
    
    const result = await scheduleTestDrive(testDriveData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      showNotification('success', result.message);
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setSelectedModel(null);
      setNotes('');
    } else {
      showNotification('error', result.message);
    }
  };

  return (
    <div id="schedule-test-drive" style={{ 
      margin: '40px 0', 
      padding: '30px', 
      backgroundColor: '#f9f9f9', 
      borderRadius: '8px'
    }}>
      <h2 style={{ marginTop: 0, color: '#D50000' }}>Đặt lịch lái thử tại {dealership.ten}</h2>
      <p>Trải nghiệm cảm giác lái đầy phấn khích với các mẫu xe Audi mới nhất</p>
      
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="carModel" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Chọn mẫu xe*
          </label>
          <select 
            id="carModel"
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(Number(e.target.value))}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              backgroundColor: '#fff'
            }}
            required
          >
            <option value="">-- Chọn mẫu xe --</option>
            {carModels.map(model => (
              <option key={model.id} value={model.id}>{model.tenMau}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Ngày lái thử*
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
              Giờ lái thử*
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
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Ghi chú
          </label>
          <textarea 
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Các yêu cầu đặc biệt..."
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
              backgroundColor: '#D50000', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: '500',
              cursor: isSubmitting ? 'default' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch ngay'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestDriveForm;