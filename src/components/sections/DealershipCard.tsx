import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// Custom Audi marker icon với logo Audi - tối ưu hóa
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default coordinates if not available
  const defaultCoords = { y: 21.0285, x: 105.8542 }; // Hanoi
  const coords = dealership.viTriDiaLy || defaultCoords;

  // Tối ưu hóa hàm handleViewMap với useCallback
  const handleViewMap = useCallback(() => {
    const address = `${dealership.diaChi}, ${dealership.thanhPho}, ${dealership.tinh}, ${dealership.quocGia}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  }, [dealership]);

  // Tối ưu hóa hàm formatWorkingHours với màu sắc
  const formatWorkingHours = useCallback((hours: any) => {
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
      'SUNDAY': 'Chủ nhật',
      'Thứ 2': 'Thứ 2',
      'Thứ 3': 'Thứ 3',
      'Thứ 4': 'Thứ 4',
      'Thứ 5': 'Thứ 5',
      'Thứ 6': 'Thứ 6',
      'Thứ 7': 'Thứ 7',
      'Chủ nhật': 'Chủ nhật'
    };

    const formattedHours = Object.entries(hours).map(([day, time]) => {
      const dayName = dayMapping[day as keyof typeof dayMapping] || day;
        const timeStr = String(time).toLowerCase();
        
      // Kiểm tra trạng thái để thêm màu sắc
      if (timeStr.includes('mo cua') || timeStr.includes('mở cửa')) {
        return `<span style="color: #22c55e;">${dayName}: ${time}</span>`; // Màu xanh lá
      } else if (timeStr.includes('dong cua') || timeStr.includes('đóng cửa')) {
        return `<span style="color: #ef4444;">${dayName}: ${time}</span>`; // Màu đỏ
      } else {
        return `${dayName}: ${time}`; // Màu trắng mặc định
      }
    });

    return formattedHours.join('\n');
  }, []);

  // Thêm lại logic kiểm tra trạng thái mở cửa đơn giản
  const isOpen = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
    
    // Mapping ngày
    const daysMapping = {
      0: ['SUNDAY', 'ChuNhat', 'Chủ nhật'], // Chủ nhật
      1: ['MONDAY', 'Thu2-Thu6', 'Thứ 2'], // Thứ 2
      2: ['TUESDAY', 'Thu2-Thu6', 'Thứ 3'], // Thứ 3
      3: ['WEDNESDAY', 'Thu2-Thu6', 'Thứ 4'], // Thứ 4
      4: ['THURSDAY', 'Thu2-Thu6', 'Thứ 5'], // Thứ 5
      5: ['FRIDAY', 'Thu2-Thu6', 'Thứ 6'], // Thứ 6
      6: ['SATURDAY', 'Thu7', 'Thứ 7'] // Thứ 7
    };
    
    const currentDayNames = daysMapping[currentDay as keyof typeof daysMapping];
    const workingHours = dealership.gioLamViec;
    
    if (!workingHours || typeof workingHours !== 'object') {
      return false;
    }
    
    // Tìm giờ làm việc cho ngày hiện tại
    let todayHours = null;
    for (const dayName of currentDayNames) {
      if (workingHours[dayName]) {
        todayHours = workingHours[dayName];
        break;
      }
    }
    
    if (!todayHours) {
      return false;
    }
    
    const hoursText = todayHours.toString().toLowerCase();
    
    // Kiểm tra "Mo cua" trước
    if (hoursText.includes('mo cua') || hoursText.includes('mở cửa')) {
      return true;
    }
    
    // Kiểm tra "Dong cua"
    if (hoursText.includes('dong cua') || hoursText.includes('đóng cửa')) {
      return false;
    }
    
    // Nếu có giờ cụ thể thì kiểm tra thời gian
    const timeMatch = hoursText.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2]);
      const closeTime = parseInt(timeMatch[3]) * 100 + parseInt(timeMatch[4]);
      return currentTime >= openTime && currentTime <= closeTime;
    }
    
    // Mặc định là mở cửa nếu có dữ liệu
    return true;
  }, [dealership.gioLamViec]);

  const openStatus = isOpen;

  // Tối ưu hóa hover effects với debounce
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 50); // Debounce 50ms
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set a timeout to show loading state
    const loadingTimeout = setTimeout(() => {
      if (!mapLoaded) {
        setMapError(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(loadingTimeout);
  }, [mapLoaded]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    setMapError(false);
  }, []);

  const handleMapError = useCallback(() => {
    setMapError(true);
    setMapLoaded(false);
  }, []);

  // Component hiển thị giờ làm việc – gọn và chuyên nghiệp
  const WorkingHoursDisplay = ({ hours }: { hours: any }) => {
    if (!hours || typeof hours !== 'object') {
      return <div className="hours-empty">Thông tin giờ làm việc đang cập nhật</div>;
    }

    const get = (key: string) => (hours as Record<string, any>)[key];

    const normalizeTime = (value: string | null | undefined): string => {
      if (!value) return '';
      const v = String(value).trim();
      // Chuẩn hóa "8:00-18:00" -> "08:00 – 18:00"
      const m = v.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (m) {
        const pad = (n: string) => (n.length === 1 ? `0${n}` : n);
        return `${pad(m[1])}:${m[2]} – ${pad(m[3])}:${m[4]}`;
      }
      return v; // "Mở cửa" | "Đóng cửa" ...
    };

    const makeRow = (label: string, raw: any) => {
      const value = raw ? String(raw) : '';
      const lower = value.toLowerCase();
      const status = lower.includes('mo cua') || lower.includes('mở cửa')
        ? 'open'
        : lower.includes('dong cua') || lower.includes('đóng cửa')
        ? 'closed'
        : undefined;
      return { label, time: normalizeTime(value), status } as { label: string; time: string; status?: 'open' | 'closed' };
    };

    // Gom nhóm T2–T6 nếu cùng khung giờ
    const weekdayValues = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map(get);
    const allWeekdaysEqual = weekdayValues.every(v => v && String(v) === String(weekdayValues[0]));

    const rows: Array<{ label: string; time: string; status?: 'open' | 'closed' }> = [];
    if (allWeekdaysEqual && weekdayValues[0]) {
      rows.push(makeRow('Thứ 2 – Thứ 6', weekdayValues[0]));
    } else {
      rows.push(
        makeRow('Thứ 2', get('MONDAY')),
        makeRow('Thứ 3', get('TUESDAY')),
        makeRow('Thứ 4', get('WEDNESDAY')),
        makeRow('Thứ 5', get('THURSDAY')),
        makeRow('Thứ 6', get('FRIDAY')),
      );
    }
    rows.push(makeRow('Thứ 7', get('SATURDAY')));
    rows.push(makeRow('Chủ nhật', get('SUNDAY')));

    // Bỏ các hàng không có dữ liệu
    const filtered = rows.filter(r => r.time);

    return (
      <div className="hours-grid">
        {filtered.map((r, i) => (
          <div key={i} className="hours-row">
            <div className="hours-day">{r.label}</div>
            <div className="hours-sep" />
            {r.status ? (
              <span className={`hours-badge ${r.status}`}>{r.status === 'open' ? 'Mở cửa' : 'Đóng cửa'}</span>
            ) : (
              <div className="hours-time">{r.time}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <article 
      ref={cardRef}
      className="audi-dealership-card"
      style={{ animationDelay: `${index * 0.05}s` }} // Giảm delay animation
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
            <WorkingHoursDisplay hours={dealership.gioLamViec} />
          </div>

          <button 
            className="view-map-btn"
            onClick={handleViewMap}
            style={{
              transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 0.15s ease'
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