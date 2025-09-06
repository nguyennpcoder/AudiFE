// Rating Service for Vehicle Ratings
const BACKEND_URL = 'http://localhost:8080';

export interface DanhGia {
  id: number;
  idNguoiDung: number;
  tenNguoiDung: string;
  idMauXe: number;
  tenMauXe: string;
  soSao: number;
  tieuDe: string;
  noiDung: string;
  daMua: boolean;
  ngayTao: string;
  trangThai: 'cho_duyet' | 'da_duyet' | 'bi_tu_choi';
}

export interface DanhGiaRequest {
  idNguoiDung: number;
  idMauXe: number;
  soSao: number;
  tieuDe: string;
  noiDung: string;
  daMua?: boolean;
}

export interface DanhGiaResponse {
  danhGia: DanhGia[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  trungBinhSao: number;
}

export interface TrungBinhSaoResponse {
  idMauXe: number;
  trungBinhSao: number;
}

class RatingService {
  // Get ratings for a specific vehicle
  async getDanhGiaByMauXe(
    idMauXe: number, 
    page: number = 0, 
    size: number = 10
  ): Promise<DanhGiaResponse> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/danh-gia/mau-xe/${idMauXe}?page=${page}&size=${size}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle ratings:', error);
      throw error;
    }
  }

  // Get average rating for a vehicle
  async getTrungBinhSaoMauXe(idMauXe: number): Promise<TrungBinhSaoResponse> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/danh-gia/mau-xe/${idMauXe}/trung-binh`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching average rating:', error);
      throw error;
    }
  }

  // Submit a new rating
  async themDanhGia(ratingData: DanhGiaRequest): Promise<DanhGia> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/danh-gia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  // Get ratings by user
  async getDanhGiaByNguoiDung(
    idNguoiDung: number, 
    page: number = 0, 
    size: number = 10
  ): Promise<DanhGiaResponse> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/danh-gia/nguoi-dung/${idNguoiDung}?page=${page}&size=${size}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      throw error;
    }
  }

  // Update a rating
  async capNhatDanhGia(id: number, ratingData: Partial<DanhGiaRequest>): Promise<DanhGia> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/danh-gia/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  }

  // Delete a rating
  async xoaDanhGia(id: number): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/danh-gia/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  }

  // Get pending ratings (for admin)
  async getDanhGiaChoDuyet(
    page: number = 0, 
    size: number = 10
  ): Promise<DanhGiaResponse> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/danh-gia/cho-duyet?page=${page}&size=${size}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending ratings:', error);
      throw error;
    }
  }

  // Approve or reject a rating (for admin)
  async duyetDanhGia(id: number, approve: boolean): Promise<DanhGia> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/danh-gia/${id}/duyet?approve=${approve}`,
        {
          method: 'PATCH'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error approving/rejecting rating:', error);
      throw error;
    }
  }
}

export const ratingService = new RatingService();
export default ratingService;
