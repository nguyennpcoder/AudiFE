import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Add type declaration to extend the L namespace
declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}

interface MapRoutingProps {
  dealershipPosition: [number, number] | null;
  userPosition: [number, number] | null;
  visible: boolean;
}

const MapRouting = ({ dealershipPosition, userPosition, visible }: MapRoutingProps) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  
  useEffect(() => {
    if (!map || !visible || !dealershipPosition || !userPosition) return;
    
    // Tạo routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(dealershipPosition[0], dealershipPosition[1])
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#D50000', opacity: 0.7, weight: 5 }]
      },
      collapsible: true,
      show: false, // Không hiển thị panel chỉ đường
    }).addTo(map);
    
    routingControlRef.current = routingControl;
    
    // Xóa control khi component unmount hoặc khi props thay đổi
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, dealershipPosition, userPosition, visible]);
  
  // Hàm xóa mốc chỉ đường, ví dụ xóa mốc thứ 1 (index 0)
  const removeWaypoint = (index: number) => {
    if (routingControlRef.current) {
      routingControlRef.current.spliceWaypoints(index, 1);
    }
  };
  
  return null;
};

export default MapRouting;