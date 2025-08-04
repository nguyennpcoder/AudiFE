import React, { useState, useEffect, useRef } from 'react';
import { Dealership } from '../../services/dealershipService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logoAudi from '../../assets/logo.svg';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Audi marker icon với logo Audi
const audiMarkerIcon = L.divIcon({
  className: 'audi-marker',
  html: `
    <div style="
      background: #D50000;
      border: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      position: relative;
    ">
      <img 
        src="${logoAudi}" 
        alt="Audi Logo" 
        style="
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
        "
      />
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface DealershipCardProps {
  dealership: Dealership;
  index: number;
}

const DealershipCard: React.FC<DealershipCardProps> = ({ dealership, index }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  // Default coordinates if not available
  const defaultCoords = { y: 21.0285, x: 105.8542 }; // Hanoi
  const coords = dealership.viTriDiaLy || defaultCoords;

  const handleViewMap = () => {
    const address = `${dealership.diaChi}, ${dealership.thanhPho}, ${dealership.tinh}, ${dealership.quocGia}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const formatWorkingHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') {
      return 'Thông tin giờ làm việc đang cập nhật';
    }

    const dayMapping = {
      'Thu2-Thu6': 'Thứ 2 - Thứ 6',
      'Thu7': 'Thứ 7',
      'ChuNhat': 'Chủ nhật',
      'MONDAY': 'Thứ 2',
      'TUESDAY': 'Thứ 3', 
      'WEDNESDAY': 'Thứ 4',
      'THURSDAY': 'Thứ 5',
      'FRIDAY': 'Thứ 6',
      'SATURDAY': 'Thứ 7',
      'SUNDAY': 'Chủ nhật'
    };

    const formattedHours = Object.entries(hours).map(([day, time]) => {
      const dayName = dayMapping[day as keyof typeof dayMapping] || day;
      return `${dayName}: ${time}`;
    });

    return formattedHours.join('\n');
  };

  // Hàm kiểm tra trạng thái mở cửa - sửa lại logic
  const isOpen = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
    
    // Mapping chính xác theo dữ liệu database
    const daysMapping = {
      0: ['SUNDAY'], // Chủ nhật
      1: ['MONDAY'], // Thứ 2
      2: ['TUESDAY'], // Thứ 3
      3: ['WEDNESDAY'], // Thứ 4
      4: ['THURSDAY'], // Thứ 5
      5: ['FRIDAY'], // Thứ 6
      6: ['SATURDAY'] // Thứ 7
    };
    
    const currentDayNames = daysMapping[currentDay as keyof typeof daysMapping];
    const workingHours = dealership.gioLamViec;
    
    // Debug log chi tiết
    console.log('=== DEBUG ISOPEN ===');
    console.log('Current day number:', currentDay);
    console.log('Current day names to check:', currentDayNames);
    console.log('Working hours object:', workingHours);
    
    if (!workingHours || typeof workingHours !== 'object') {
      console.log('No working hours data');
      return false;
    }
    
    // Tìm giờ làm việc cho ngày hiện tại
    let todayHours = null;
    for (const dayName of currentDayNames) {
      if (workingHours[dayName]) {
        todayHours = workingHours[dayName];
        console.log(`Found hours for ${dayName}:`, todayHours);
        break;
      }
    }
    
    if (!todayHours) {
      console.log('No hours found for any day name');
      return false;
    }
    
    const hoursText = todayHours.toString().toLowerCase();
    console.log('Hours text:', hoursText);
    
    // Kiểm tra các trường hợp đặc biệt trước
    if (hoursText.includes('mo cua') || hoursText.includes('mở cửa')) {
      console.log('Found "mo cua" - returning TRUE');
      return true;
    }
    
    if (hoursText.includes('dong cua') || hoursText.includes('đóng cửa')) {
      console.log('Found "dong cua" - returning FALSE');
      return false;
    }
    
    // Nếu có giờ cụ thể (ví dụ: 8:00-18:00) thì kiểm tra thời gian
    const timeMatch = hoursText.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2]);
      const closeTime = parseInt(timeMatch[3]) * 100 + parseInt(timeMatch[4]);
      console.log('Time check:', { currentTime, openTime, closeTime });
      return currentTime >= openTime && currentTime <= closeTime;
    }
    
    console.log('No matching pattern - returning FALSE');
    return false;
  };

  const openStatus = isOpen();

  // Debug log để kiểm tra
  useEffect(() => {
    console.log('Dealership:', dealership.ten);
    console.log('Working hours:', dealership.gioLamViec);
    console.log('Current day:', new Date().getDay());
    console.log('Current time:', new Date().getHours() + ':' + new Date().getMinutes());
    console.log('Is open:', openStatus);
  }, [dealership, openStatus]);

  useEffect(() => {
    // Set a timeout to show loading state
    const loadingTimeout = setTimeout(() => {
      if (!mapLoaded) {
        setMapError(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(loadingTimeout);
  }, [mapLoaded]);

  const handleMapLoad = () => {
    setMapLoaded(true);
    setMapError(false);
  };

  const handleMapError = () => {
    setMapError(true);
    setMapLoaded(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <article 
      ref={cardRef}
      className="audi-dealership-card"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="audi-dealership-card-content">
        {/* Map Section */}
        <div className="audi-dealership-map-section">
          <div className="map-container">
            {!mapError ? (
              <MapContainer
                center={[coords.y, coords.x]}
                zoom={15}
                style={{ height: '200px', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                touchZoom={false}
                ref={mapRef}
                whenReady={handleMapLoad}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  eventHandlers={{
                    loading: () => console.log('Map tiles loading...'),
                    load: handleMapLoad,
                    error: handleMapError
                  }}
                />
                <Marker 
                  position={[coords.y, coords.x]} 
                  icon={audiMarkerIcon}
                >
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ margin: '0 0 8px', color: '#D50000' }}>{dealership.ten}</h4>
                      <p style={{ margin: '0', fontSize: '12px' }}>{dealership.diaChi}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="map-error">
                <div className="error-icon">🗺️</div>
                <span>Không thể tải bản đồ</span>
                <button 
                  className="retry-map-btn"
                  onClick={() => {
                    setMapError(false);
                    setMapLoaded(false);
                  }}
                >
                  Thử lại
                </button>
              </div>
            )}
            
            {!mapLoaded && !mapError && (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <span>Đang tải bản đồ...</span>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="audi-dealership-info-section">
          <div className="dealership-header">
            <h3 className="dealership-name">{dealership.ten}</h3>
            <div className={`open-status ${openStatus ? 'open' : 'closed'}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {openStatus ? 'Đang mở cửa' : 'Đã đóng cửa'}
              </span>
            </div>
          </div>
          
          <div className="dealership-address">
            <p>{dealership.diaChi}</p>
            <p>{dealership.thanhPho}, {dealership.tinh} {dealership.maBuuDien}</p>
            <p>{dealership.quocGia}</p>
          </div>

          <div className="dealership-contact">
            <div className="contact-item">
              <span className="contact-label">Hotline:</span>
              <span className="contact-value">{dealership.soDienThoai}</span>
            </div>
            {dealership.email && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <a href={`mailto:${dealership.email}`} className="contact-value email-link">
                  {dealership.email}
                </a>
              </div>
            )}
          </div>

          {dealership.laTrungTamDichVu && (
            <div className="service-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,7H13A2,2 0 0,1 15,9V15A2,2 0 0,1 13,17H11A2,2 0 0,1 9,15V9A2,2 0 0,1 11,7M11,9V15H13V9H11Z"/>
              </svg>
              Trung tâm dịch vụ
            </div>
          )}

          <div className="working-hours">
            <h4>Giờ làm việc:</h4>
            <pre className="hours-text">{formatWorkingHours(dealership.gioLamViec)}</pre>
          </div>

          <button 
            className="view-map-btn"
            onClick={handleViewMap}
            style={{
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C15.31,2 18,4.66 18,7.95C18,12.41 12,19 12,19S6,12.41 6,7.95C6,4.66 8.69,2 12,2M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6Z"/>
            </svg>
            Xem bản đồ
          </button>
        </div>
      </div>
    </article>
  );
};

export default DealershipCard; 