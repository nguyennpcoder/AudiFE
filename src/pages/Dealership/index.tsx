// frontend/audi/src/pages/Dealership/index.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAllDealerships, getDealershipById, Dealership } from '../../services/dealershipService';
import DealershipMap from '../../components/sections/DealershipMap';
import DealershipDetail from '../../components/sections/DealershipDetail';
import TestDriveForm from '../../components/sections/TestDriveForm';
import MaintenanceForm from '../../components/sections/MaintenanceForm';
import { useNotification } from '../../context/NotificationContext';

const DealershipPage: React.FC = () => {
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();
  const params = useParams<{ id?: string }>();

  useEffect(() => {
    const fetchDealerships = async () => {
      setLoading(true);
      try {
        const data = await getAllDealerships();
        setDealerships(data);
        
        // If there's an ID in the URL, select that dealership
        if (params.id) {
          const dealershipId = parseInt(params.id, 10);
          const dealership = data.find(d => d.id === dealershipId);
          if (dealership) {
            setSelectedDealership(dealership);
          } else {
            // If no matching dealership found, show notification
            showNotification('error', 'Không tìm thấy đại lý với ID này');
            // Select the first dealership instead
            if (data.length > 0) {
              setSelectedDealership(data[0]);
            }
          }
        } else if (data.length > 0) {
          // If no ID in URL, select first dealership by default
          setSelectedDealership(data[0]);
        }
      } catch (error) {
        console.error('Error fetching dealerships:', error);
        showNotification('error', 'Không thể tải thông tin đại lý. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDealerships();
  }, [params.id, showNotification]);

  const handleSelectDealership = (dealership: Dealership) => {
    setSelectedDealership(dealership);
    // Update URL to reflect selected dealership (optional)
    window.history.pushState({}, '', `/dealership/${dealership.id}`);
  };

  return (
    <div className="dealership-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#D50000', marginBottom: '10px' }}>Đại lý Audi</h1>
        <p style={{ fontSize: '1.1rem', color: '#333' }}>
          Khám phá mạng lưới đại lý Audi trên toàn quốc và tìm đại lý gần bạn nhất
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p>Đang tải thông tin đại lý...</p>
        </div>
      ) : (
        <>
          <DealershipMap 
            dealerships={dealerships} 
            selectedDealership={selectedDealership} 
            onSelectDealership={handleSelectDealership} 
          />
          
          {selectedDealership && (
            <div style={{ marginTop: '40px' }}>
              <DealershipDetail dealership={selectedDealership} />
              <TestDriveForm dealership={selectedDealership} />
              {selectedDealership.laTrungTamDichVu && (
                <MaintenanceForm dealership={selectedDealership} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DealershipPage;