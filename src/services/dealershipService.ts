// frontend/audi/src/services/dealershipService.ts
import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'https://audivn.onrender.com/api/v1';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export interface Dealership {
  id: number;
  ten: string;
  diaChi: string;
  thanhPho: string;
  tinh: string;
  maBuuDien: string;
  quocGia: string;
  soDienThoai: string;
  email: string;
  gioLamViec: {
    [key: string]: string;
  };
  viTriDiaLy?: {
    // Coordinates in the format expected by Leaflet (y is latitude, x is longitude)
    y: number; // latitude
    x: number; // longitude
  };
  laTrungTamDichVu: boolean;
}

export interface Vehicle {
  id: number;
  tenMau: string;
  namSanXuat: number;
  giaCoBan: number;
  moTa: string;
  duongDanAnh?: string;
  mauSac: string;
  soKhung: string;
  trangThai: string;
}

export interface TestDriveForm {
  idNguoiDung: number;
  idMau: number;
  idDaiLy: number;
  thoiGianHen: string;
  ghiChu?: string;
}

export interface MaintenanceForm {
  idNguoiDung: number;
  idDaiLy: number;
  soKhung: string;
  ngayHen: string;
  loaiDichVu: 'bao_duong_dinh_ky' | 'sua_chua' | 'bao_hanh' | 'trieu_hoi';
  moTa?: string;
}

// Thêm mapping cho các thành phố Việt Nam
const cityCoordinates: Record<string, {x: number, y: number}> = {
  'Hà Nội': {x: 105.8542, y: 21.0285},
  'Hồ Chí Minh': {x: 106.7033, y: 10.7758},
  'Đà Nẵng': {x: 108.2208, y: 16.0478},
  'Hải Phòng': {x: 106.6881, y: 20.8449},
  'Cần Thơ': {x: 105.7469, y: 10.0452}
};

// Add a geocoding function
async function geocodeAddress(address: string): Promise<{x: number, y: number} | null> {
  try {
    // Using OpenStreetMap Nominatim API for geocoding
    const encodedAddress = encodeURIComponent(`${address}, Vietnam`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        y: parseFloat(data[0].lat),
        x: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Get all dealerships
export const getAllDealerships = async (): Promise<Dealership[]> => {
  try {
    const response = await axios.get(`${API_URL}/dai-ly`);
    
    // Kiểm tra và chuyển đổi dữ liệu giờ làm việc
    return response.data.map((dealership: Dealership) => {
      // Đảm bảo gioLamViec là một object
      if (dealership.gioLamViec && typeof dealership.gioLamViec === 'string') {
        try {
          dealership.gioLamViec = JSON.parse(dealership.gioLamViec);
        } catch (e) {
          console.error('Error parsing working hours:', e);
          dealership.gioLamViec = {};
        }
      }
      
      // Kiểm tra và thêm tọa độ nếu chưa có
      if (!dealership.viTriDiaLy) {
        const coords = cityCoordinates[dealership.thanhPho];
        if (coords) {
          dealership.viTriDiaLy = coords;
        }
      }
      
      return dealership;
    });
  } catch (error) {
    console.error('Error fetching dealerships:', error);
    return [];
  }
};

// Get dealership by ID
export const getDealershipById = async (id: number): Promise<Dealership | null> => {
  try {
    const response = await axios.get(`${API_URL}/dai-ly/${id}`);
    
    // Xử lý dữ liệu giờ làm việc
    const dealership = response.data;
    if (dealership && dealership.gioLamViec) {
      if (typeof dealership.gioLamViec === 'string') {
        try {
          dealership.gioLamViec = JSON.parse(dealership.gioLamViec);
        } catch (e) {
          console.error('Error parsing working hours:', e);
          dealership.gioLamViec = {};
        }
      }
    }
    
    return dealership;
  } catch (error) {
    console.error(`Error fetching dealership ${id}:`, error);
    return null;
  }
};

// Get inventory by dealership ID
export const getDealershipInventory = async (dealershipId: number): Promise<Vehicle[]> => {
  try {
    const response = await axios.get(`${API_URL}/ton-kho/dai-ly/${dealershipId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory for dealership ${dealershipId}:`, error);
    return [];
  }
};

// Schedule test drive
export const scheduleTestDrive = async (testDriveData: TestDriveForm): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/lai-thu`, testDriveData);
    return {
      success: true,
      message: 'Đăng ký lái thử thành công!'
    };
  } catch (error) {
    console.error('Error scheduling test drive:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response 
        ? error.response.data.message || 'Đăng ký lái thử thất bại' 
        : 'Không thể kết nối đến máy chủ'
    };
  }
};

// Schedule maintenance
export const scheduleMaintenance = async (maintenanceData: MaintenanceForm): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/lich-bao-duong`, maintenanceData);
    return {
      success: true,
      message: 'Đăng ký bảo dưỡng thành công!'
    };
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    return {
      success: false,
      message: axios.isAxiosError(error) && error.response 
        ? error.response.data.message || 'Đăng ký bảo dưỡng thất bại' 
        : 'Không thể kết nối đến máy chủ'
    };
  }
};