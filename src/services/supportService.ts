export interface YeuCauHoTroDTO {
  id?: number;
  idNguoiDung?: number;
  tieuDe: string;
  noiDung: string;
  mucDoUuTien?: string;
  trangThai?: string;
  idNguoiPhuTrach?: number | null;
  ngayTao?: string;
}

export interface PhanHoiYeuCauDTO {
  id?: number;
  idYeuCau: number;
  idNguoiDung?: number;
  noiDung: string;
  ngayTao?: string;
}

const BASE_URL = 'http://localhost:8080/api/v1';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const supportService = {
  // Tickets
  async createTicket(payload: YeuCauHoTroDTO): Promise<YeuCauHoTroDTO> {
    const res = await fetch(`${BASE_URL}/ho-tro`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Tạo yêu cầu thất bại');
    return res.json();
  },

  async getMyTickets(userId: number, page = 0, size = 10) {
    const res = await fetch(`${BASE_URL}/ho-tro/nguoi-dung/${userId}?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Tải danh sách yêu cầu thất bại');
    return res.json();
  },

  async getAllTickets(page = 0, size = 10, sortBy = 'ngayTao', sortDir: 'asc' | 'desc' = 'desc') {
    const res = await fetch(`${BASE_URL}/ho-tro?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Tải danh sách yêu cầu thất bại');
    return res.json();
  },

  async updateStatus(id: number, trangThai: string) {
    const res = await fetch(`${BASE_URL}/ho-tro/${id}/trang-thai?trangThai=${encodeURIComponent(trangThai)}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
    return res.json();
  },

  async updatePriority(id: number, mucDoUuTien: string) {
    const res = await fetch(`${BASE_URL}/ho-tro/${id}/uu-tien?mucDoUuTien=${encodeURIComponent(mucDoUuTien)}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Cập nhật ưu tiên thất bại');
    return res.json();
  },

  async assignAgent(id: number, idNguoiPhuTrach: number) {
    const res = await fetch(`${BASE_URL}/ho-tro/${id}/phan-cong?idNguoiPhuTrach=${idNguoiPhuTrach}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Phân công thất bại');
    return res.json();
  },

  // Replies
  async getReplies(ticketId: number): Promise<PhanHoiYeuCauDTO[]> {
    const res = await fetch(`${BASE_URL}/phan-hoi/yeu-cau/${ticketId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Tải phản hồi thất bại');
    return res.json();
  },

  async createReply(payload: PhanHoiYeuCauDTO): Promise<PhanHoiYeuCauDTO> {
    const res = await fetch(`${BASE_URL}/phan-hoi`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Tạo phản hồi thất bại');
    return res.json();
  },
};


