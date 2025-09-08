import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

export interface NhatKyHoatDongDTO {
  id: number;
  idNguoiDung?: number;
  tenNguoiDung?: string;
  loaiHoatDong: string;
  chiTietHoatDong?: Record<string, any> | string;
  diaChiIp?: string;
  thietBi?: string;
  trinhDuyet?: string;
  heDieuHanh?: string;
  duongDan?: string;
  ngayTao: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ThongKeHoatDongDTO {
  tongSoHoatDong: number;
  soNguoiDungThamGia: number;
  topLoaiHoatDong: Array<{ loai: string; soLuong: number }>; 
}

export const activityLogService = {
  async getAll(page = 0, size = 20, sortBy = 'ngayTao', sortDir: 'ASC' | 'DESC' = 'DESC'): Promise<PageResponse<NhatKyHoatDongDTO>> {
    const res = await axios.get(`${BACKEND_URL}/api/v1/nhat-ky`, { params: { page, size, sortBy, sortDir } });
    return res.data;
  },

  async getByUser(idNguoiDung: number, page = 0, size = 20): Promise<PageResponse<NhatKyHoatDongDTO>> {
    const res = await axios.get(`${BACKEND_URL}/api/v1/nhat-ky/nguoi-dung/${idNguoiDung}`, { params: { page, size } });
    return res.data;
  },

  async getByType(loaiHoatDong: string, page = 0, size = 20): Promise<PageResponse<NhatKyHoatDongDTO>> {
    const res = await axios.get(`${BACKEND_URL}/api/v1/nhat-ky/loai/${encodeURIComponent(loaiHoatDong)}`, { params: { page, size } });
    return res.data;
  },

  async getByDateRange(tuNgay: string, denNgay: string, page = 0, size = 20): Promise<PageResponse<NhatKyHoatDongDTO>> {
    const res = await axios.get(`${BACKEND_URL}/api/v1/nhat-ky/ngay`, { params: { tuNgay, denNgay, page, size } });
    return res.data;
  },

  async getLoaiHoatDong(): Promise<string[]> {
    const res = await axios.get(`${BACKEND_URL}/api/v1/nhat-ky/loai-hoat-dong`);
    return res.data;
  },

  async getThongKe(): Promise<ThongKeHoatDongDTO> {
    const res = await axios.get(`${BACKEND_URL}/api/v1/nhat-ky/thong-ke`);
    return res.data;
  }
};


