import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import '../../styles/DealershipMap.css';
import { Dealership } from '../../services/dealershipService';
import MapRouting from './MapRouting';

// MapController component to handle map centering and movement
const MapController = ({ center, zoom, isInitialLoad }: { center: [number, number], zoom: number, isInitialLoad: boolean }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    if (isInitialLoad) {
      // Set initial view without animation to prevent shake
      map.setView(center, zoom, { animate: false });
    } else {
      // Smooth transition for dealership selection
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map, isInitialLoad]);

  return null;
};

// Fix Leaflet's default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Audi icon
const audiIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/220px-Audi-Logo_2016.svg.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'audi-marker',
});

interface DealershipMapProps {
  dealerships: Dealership[];
  selectedDealership: Dealership | null;
  onSelectDealership: (dealership: Dealership) => void;
}

const DealershipMap: React.FC<DealershipMapProps> = ({
  dealerships,
  selectedDealership,
  onSelectDealership,
}) => {
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [routingVisible, setRoutingVisible] = useState(false);
  const [selectedDealerForRouting, setSelectedDealerForRouting] = useState<Dealership | null>(null);
  const [showRouting, setShowRouting] = useState(false);

  // Default center (Ho Chi Minh City)
  const defaultCenter: [number, number] = [10.762622, 106.660172];

  // Memoize map center calculation
  const mapCenter = useMemo(() => {
    if (selectedDealership?.viTriDiaLy) {
      return [selectedDealership.viTriDiaLy.y, selectedDealership.viTriDiaLy.x] as [number, number];
    }

    if (dealerships.length > 0 && dealerships.some(d => d.viTriDiaLy)) {
      const validDealers = dealerships.filter(d => d.viTriDiaLy);
      return [
        validDealers.reduce((sum, d) => sum + d.viTriDiaLy!.y, 0) / validDealers.length,
        validDealers.reduce((sum, d) => sum + d.viTriDiaLy!.x, 0) / validDealers.length,
      ] as [number, number];
    }

    return defaultCenter;
  }, [dealerships, selectedDealership]);

  // Mark initial load as complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Lấy vị trí người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Không thể lấy vị trí người dùng:", error);
          // Sử dụng vị trí mặc định nếu không thể lấy vị trí người dùng
          setUserPosition([10.762622, 106.660172]); // HCM City
        }
      );
    }
  }, []);

  // Hàm mở Google Maps để chỉ đường
  const openGoogleMapsDirections = (dealership: Dealership, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn không cho sự kiện lan truyền lên parent
    
    if (!dealership.viTriDiaLy) return;
    
    const { y: lat, x: lng } = dealership.viTriDiaLy;
    const destination = `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    
    // Mở tab mới đến Google Maps
    window.open(url, '_blank');
  };

  // Hiển thị đường đi trên bản đồ
  const showDirectionsOnMap = (dealership: Dealership, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!dealership.viTriDiaLy) return;
    
    setSelectedDealerForRouting(dealership);
    setRoutingVisible(true);
  };

  const toggleDirectionsOnMap = (dealership: Dealership, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dealership.viTriDiaLy) return;

    // Nếu đang chỉ đường tới đại lý này thì tắt, ngược lại thì bật
    if (selectedDealerForRouting?.id === dealership.id) {
      setSelectedDealerForRouting(null);
    } else {
      setSelectedDealerForRouting(dealership);
    }
  };

  const vietnamBounds: [[number, number], [number, number]] = [
    [8.18, 102.14],   // Southwest
    [23.39, 109.46],  // Northeast
  ];

  return (
    <div className="dealership-map-container">
      <div className="map-container" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          id="dealership-map"
          center={mapCenter}
          zoom={selectedDealership ? 15 : 6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          dragging={true}
          preferCanvas={true}
          zoomControl={false}
          attributionControl={false}
          fadeAnimation={false}
          markerZoomAnimation={false}
          inertia={false}
          maxBounds={vietnamBounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={5}
          />

          <MapController
            center={mapCenter}
            zoom={selectedDealership ? 15 : 6}
            isInitialLoad={isInitialLoad}
          />
          
          {/* Hiển thị vị trí người dùng */}
          {userPosition && (
            <Marker 
              position={userPosition}
              icon={new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                shadowSize: [41, 41]
              })}
            >
              <Popup>
                <div>
                  <p>Vị trí của bạn</p>
                </div>
              </Popup>
            </Marker>
          )}

          {dealerships.map(dealership => {
            if (!dealership.viTriDiaLy) return null;

            const position: [number, number] = [dealership.viTriDiaLy.y, dealership.viTriDiaLy.x];
            const isSelected = selectedDealership?.id === dealership.id;

            return (
              <Marker
                key={dealership.id}
                position={position}
                icon={audiIcon}
                eventHandlers={{
                  click: () => onSelectDealership(dealership),
                }}
              >
                <Popup>
                  <div>
                    <h3 style={{ margin: '0 0 5px', color: '#D50000' }}>{dealership.ten}</h3>
                    <p style={{ margin: '5px 0' }}>{dealership.diaChi}</p>
                    <p style={{ margin: '5px 0' }}>{dealership.thanhPho}, {dealership.tinh}</p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>SĐT:</strong> {dealership.soDienThoai}
                    </p>
                    {dealership.laTrungTamDichVu && (
                      <div
                        style={{
                            
                          marginTop: '5px',
                          backgroundColor: '#f0f0f0',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        Trung tâm dịch vụ
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={(e) => openGoogleMapsDirections(dealership, e)}
                        style={{
                          backgroundColor: '#D50000',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Google Maps
                      </button>
                      <button
                        onClick={(e) => toggleDirectionsOnMap(dealership, e)}
                        style={{
                          backgroundColor: '#333',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {selectedDealerForRouting?.id === dealership.id ? 'Đóng chỉ đường' : 'Chỉ đường'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Component chỉ đường */}
          {selectedDealerForRouting && selectedDealerForRouting.viTriDiaLy && (
            <MapRouting 
              dealershipPosition={[selectedDealerForRouting.viTriDiaLy.y, selectedDealerForRouting.viTriDiaLy.x]}
              userPosition={userPosition}
              visible={true}
            />
          )}
        </MapContainer>
      </div>

      <div className="dealership-list">
        <h3>Danh sách đại lý ({dealerships.length})</h3>
        <div className="dealership-grid">
          {dealerships.map(dealership => (
            <div
              key={dealership.id}
              className={`dealership-card ${selectedDealership?.id === dealership.id ? 'selected' : ''}`}
              onClick={() => onSelectDealership(dealership)}
            >
              <h4>{dealership.ten}</h4>
              <p>{dealership.diaChi}</p>
              <p>
                {dealership.thanhPho}, {dealership.tinh}, {dealership.maBuuDien}
              </p>
              <p>
                <strong>SĐT:</strong> {dealership.soDienThoai}
              </p>
              {dealership.laTrungTamDichVu && (
                <div className="service-badge">Trung tâm dịch vụ</div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={(e) => openGoogleMapsDirections(dealership, e)}
                  style={{
                    backgroundColor: '#D50000',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  Google Maps
                </button>
                <button
                  onClick={(e) => toggleDirectionsOnMap(dealership, e)}
                  style={{
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {selectedDealerForRouting?.id === dealership.id ? 'Đóng chỉ đường' : 'Chỉ đường'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealershipMap;