import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export interface BanhXe {
    id: number;
    ten: string;
    moTa: string;
    kichThuoc: string;
    chatLieu: string;
    giaThem: number;
    duongDanAnh: string;
}

export interface HinhAnhBanhXe {
    id: number;
    idMau: number;
    idBanhXe: number;
    idMauSac?: number;
    duongDanAnh: string;
    loaiHinh: 'ngoai_that' | 'banh_xe' | 'chi_tiet' | 'tinh_nang' | 'thu_nho';
    viTri: number;
}

export const banhXeService = {
    // Lấy tất cả bánh xe
    getAllBanhXe: async (): Promise<BanhXe[]> => {
        const response = await axios.get(`${API_URL}/banh-xe`);
        return response.data;
    },

    // Lấy bánh xe theo ID
    getBanhXeById: async (id: number): Promise<BanhXe> => {
        const response = await axios.get(`${API_URL}/banh-xe/${id}`);
        return response.data;
    },

    // Tìm kiếm bánh xe
    searchBanhXe: async (keyword: string): Promise<BanhXe[]> => {
        const response = await axios.get(`${API_URL}/banh-xe/search?keyword=${keyword}`);
        return response.data;
    },

    // Lấy bánh xe theo kích thước
    getBanhXeByKichThuoc: async (kichThuoc: string): Promise<BanhXe[]> => {
        const response = await axios.get(`${API_URL}/banh-xe/kich-thuoc/${kichThuoc}`);
        return response.data;
    },

    // Lấy bánh xe theo chất liệu
    getBanhXeByChatLieu: async (chatLieu: string): Promise<BanhXe[]> => {
        const response = await axios.get(`${API_URL}/banh-xe/chat-lieu/${chatLieu}`);
        return response.data;
    },

    // Lấy bánh xe theo mẫu xe
    getBanhXeByMauXe: async (idMau: number): Promise<BanhXe[]> => {
        const response = await axios.get(`${API_URL}/mau-xe/${idMau}/banh-xe`);
        return response.data;
    },

    // Lấy bánh xe mặc định theo mẫu xe
    getBanhXeMacDinhByMauXe: async (idMau: number): Promise<BanhXe> => {
        const response = await axios.get(`${API_URL}/mau-xe/${idMau}/banh-xe/mac-dinh`);
        return response.data;
    },

    // Lấy hình ảnh bánh xe theo mẫu xe và bánh xe
    getHinhAnhBanhXe: async (idMau: number, idBanhXe: number): Promise<HinhAnhBanhXe[]> => {
        const response = await axios.get(`${API_URL}/mau-xe/${idMau}/banh-xe/${idBanhXe}/hinh-anh`);
        return response.data;
    },

    // Lấy hình ảnh bánh xe theo mẫu xe, bánh xe và màu sắc
    getHinhAnhBanhXeByMauSac: async (idMau: number, idBanhXe: number, idMauSac: number): Promise<HinhAnhBanhXe[]> => {
        const response = await axios.get(`${API_URL}/mau-xe/${idMau}/banh-xe/${idBanhXe}/hinh-anh/mau-sac/${idMauSac}`);
        return response.data;
    },

    // Lấy hình ảnh bánh xe theo loại hình
    getHinhAnhBanhXeByLoaiHinh: async (idMau: number, idBanhXe: number, loaiHinh: string): Promise<HinhAnhBanhXe[]> => {
        const response = await axios.get(`${API_URL}/mau-xe/${idMau}/banh-xe/${idBanhXe}/hinh-anh/loai-hinh/${loaiHinh}`);
        return response.data;
    }
};