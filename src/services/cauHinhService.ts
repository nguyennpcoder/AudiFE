import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080/api/v1';

export interface CauHinhTuyChinh {
  id?: number;
  idNguoiDung?: number;
  tenNguoiDung?: string;
  idMau: number;
  tenMau?: string;
  idMauSac: number;
  tenMauSac?: string;
  idNoiThat?: number;
  tenNoiThat?: string;
  giaNoiThat?: number;
  idBanhXe?: number;
  tenBanhXe?: string;
  giaBanhXe?: number;
  danhSachIdTuyChon: number[];
  danhSachTuyChon?: Array<{
    id: number;
    ten: string;
    gia: number;
    danhMuc: string;
  }>;
  tongGia: number;
  ten?: string;
  ngayTao?: string;
  ngayCapNhat?: string;
  khuyenMai?: {
    id: number;
    ten: string;
    loaiKhuyenMai: string;
    giaTri: number;
  };
  giaSauKhuyenMai?: number;
}

export const cauHinhService = {
  // Lấy tất cả cấu hình
  getAllCauHinh: async (): Promise<CauHinhTuyChinh[]> => {
    const response = await axios.get(`${BACKEND_URL}/cau-hinh`);
    return response.data;
  },

  // Lấy cấu hình theo ID
  getCauHinhById: async (id: number): Promise<CauHinhTuyChinh> => {
    const response = await axios.get(`${BACKEND_URL}/cau-hinh/${id}`);
    return response.data;
  },

  // Lấy cấu hình của người dùng
  getCauHinhByNguoiDung: async (idNguoiDung: number): Promise<CauHinhTuyChinh[]> => {
    const response = await axios.get(`${BACKEND_URL}/cau-hinh/nguoi-dung/${idNguoiDung}`);
    return response.data;
  },

  // Lấy cấu hình theo mẫu xe
  getCauHinhByMauXe: async (idMauXe: number): Promise<CauHinhTuyChinh[]> => {
    const response = await axios.get(`${BACKEND_URL}/cau-hinh/mau-xe/${idMauXe}`);
    return response.data;
  },

  // Tạo cấu hình mới
  createCauHinh: async (cauHinh: CauHinhTuyChinh): Promise<CauHinhTuyChinh> => {
    const response = await axios.post(`${BACKEND_URL}/cau-hinh`, cauHinh);
    return response.data;
  },

  // Cập nhật cấu hình
  updateCauHinh: async (id: number, cauHinh: CauHinhTuyChinh): Promise<CauHinhTuyChinh> => {
    const response = await axios.put(`${BACKEND_URL}/cau-hinh/${id}`, cauHinh);
    return response.data;
  },

  // Xóa cấu hình
  deleteCauHinh: async (id: number): Promise<void> => {
    await axios.delete(`${BACKEND_URL}/cau-hinh/${id}`);
  },

  // Tính giá cấu hình
  tinhGiaCauHinh: async (
    idMauXe: number, 
    idMauSac: number, 
    idTuyChon?: number[]
  ): Promise<number> => {
    const params = new URLSearchParams();
    params.append('idMauXe', idMauXe.toString());
    params.append('idMauSac', idMauSac.toString());
    
    if (idTuyChon && idTuyChon.length > 0) {
      idTuyChon.forEach(id => params.append('idTuyChon', id.toString()));
    }
    
    const response = await axios.get(`${BACKEND_URL}/cau-hinh/tinh-gia?${params.toString()}`);
    return response.data;
  },

  // Tùy chỉnh nhanh
  tuyChinhNhanh: async (
    idNguoiDung: number,
    idMauXe: number,
    idMauSac: number,
    idTuyChon?: number[],
    ten?: string
  ): Promise<CauHinhTuyChinh> => {
    const params = new URLSearchParams();
    params.append('idNguoiDung', idNguoiDung.toString());
    params.append('idMauXe', idMauXe.toString());
    params.append('idMauSac', idMauSac.toString());
    
    if (idTuyChon && idTuyChon.length > 0) {
      idTuyChon.forEach(id => params.append('idTuyChon', id.toString()));
    }
    
    if (ten) {
      params.append('ten', ten);
    }
    
    const response = await axios.post(`${BACKEND_URL}/cau-hinh/tuy-chinh-nhanh?${params.toString()}`);
    return response.data;
  },

  // Xuất PDF
  xuatPDF: async (id: number): Promise<Blob> => {
    const response = await axios.get(`${BACKEND_URL}/cau-hinh/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
}; 