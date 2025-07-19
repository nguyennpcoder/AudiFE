import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

// Interfaces
export interface KhuyenMai {
  id: number;
  ten: string;
  moTa?: string;
  loaiGiamGia: 'phan_tram' | 'so_tien_co_dinh' | 'tuy_chon_mien_phi';
  giaTriGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  maKhuyenMai?: string;
  apDungCho: 'tat_ca_mau' | 'mau_cu_the' | 'dong_cu_the';
  giaTriToiThieu?: number;
  gioiHanSuDung?: number;
  soLanDaDung: number;
  conHieuLuc: boolean;
  trangThai: number; // 1: còn hiệu lực, 0: hết hiệu lực
  danhSachDieuKien: DieuKienKhuyenMai[];
}

export interface DieuKienKhuyenMai {
  id?: number;
  idKhuyenMai?: number;
  loaiDoiTuong: 'mau_xe' | 'dong_xe' | 'tuy_chon';
  idDoiTuong: number;
  tenDoiTuong?: string;
}

export interface KhuyenMaiResponse {
  khuyenMai: KhuyenMai[];
  trangHienTai: number;
  tongItem: number;
  tongTrang: number;
}

// API functions
export const marketingService = {
  // Lấy tất cả khuyến mãi
  async getAllKhuyenMai(page = 0, size = 10, sortBy = 'ngayKetThuc', sortDir = 'desc'): Promise<KhuyenMaiResponse> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai`, {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  // Lấy khuyến mãi còn hiệu lực
  async getKhuyenMaiConHieuLuc(page = 0, size = 10): Promise<KhuyenMaiResponse> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai/con-hieu-luc`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy khuyến mãi sắp hết hạn
  async getKhuyenMaiSapHetHan(page = 0, size = 10): Promise<KhuyenMaiResponse> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai/sap-het-han`, {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy khuyến mãi theo ID
  async getKhuyenMaiById(id: number): Promise<KhuyenMai> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai/${id}`);
    return response.data;
  },

  // Lấy khuyến mãi theo mã
  async getKhuyenMaiByMa(maKhuyenMai: string): Promise<KhuyenMai> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai/ma/${maKhuyenMai}`);
    return response.data;
  },

  // Tạo khuyến mãi mới
  async createKhuyenMai(khuyenMai: Omit<KhuyenMai, 'id' | 'soLanDaDung' | 'conHieuLuc' | 'trangThai'>): Promise<KhuyenMai> {
    const response = await axios.post(`${BACKEND_URL}/api/v1/khuyen-mai`, khuyenMai);
    return response.data;
  },

  // Cập nhật khuyến mãi
  async updateKhuyenMai(id: number, khuyenMai: Partial<KhuyenMai>): Promise<KhuyenMai> {
    try {
      console.log('Updating khuyến mãi with ID:', id);
      console.log('Update data:', khuyenMai);
      
      const response = await axios.put(`${BACKEND_URL}/api/v1/khuyen-mai/${id}`, khuyenMai);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update error details:', error.response?.data);
      console.error('Update error status:', error.response?.status);
      console.error('Update error message:', error.message);
      throw error;
    }
  },

  // Xóa khuyến mãi
  async deleteKhuyenMai(id: number): Promise<boolean> {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/khuyen-mai/${id}`);
    return response.data.daXoa;
  },

  // Tìm khuyến mãi cho mẫu xe
  async timKhuyenMaiChoMauXe(idMauXe: number): Promise<KhuyenMai[]> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai/mau-xe/${idMauXe}`);
    return response.data;
  },

  // Tính giá sau khuyến mãi
  async tinhGiaSauKhuyenMai(giaBanDau: number, idKhuyenMai: number): Promise<{
    giaBanDau: number;
    giaSauKhuyenMai: number;
    soTienGiam: number;
  }> {
    const response = await axios.get(`${BACKEND_URL}/api/v1/khuyen-mai/tinh-gia`, {
      params: { giaBanDau, idKhuyenMai }
    });
    return response.data;
  },

  // Kiểm tra áp dụng khuyến mãi
  async kiemTraApDungKhuyenMai(idKhuyenMai: number, idMauXes: number[], tongGiaTri: number): Promise<{
    idKhuyenMai: number;
    hopLe: boolean;
  }> {
    const response = await axios.post(`${BACKEND_URL}/api/v1/khuyen-mai/kiem-tra-ap-dung`, null, {
      params: { idKhuyenMai, idMauXes, tongGiaTri }
    });
    return response.data;
  },

  // Tăng số lần sử dụng
  async tangSoLanSuDung(id: number): Promise<boolean> {
    const response = await axios.post(`${BACKEND_URL}/api/v1/khuyen-mai/${id}/tang-su-dung`);
    return response.data.thanhCong;
  },

  // Update promotion status
  async updateKhuyenMaiStatus(id: number, trangThai: number): Promise<void> {
    const response = await axios.patch(`${BACKEND_URL}/api/khuyen-mai/${id}/status`, { trangThai });
    return response.data;
  }
};