import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

export interface VehicleNews {
  id: number;
  tenMau: string;
  tenDong: string;
  namSanXuat: number;
  giaCoban: number;
  moTa: string;
  ngayRaMat: string;
  anhDaiDien?: string;
  isNew?: boolean;
}

export interface BlogPost {
  id: string;
  tieuDe: string;
  noiDung: string;
  anhDaiDien?: string;
  tenTacGia: string;
  avatarTacGia?: string;
  ngayDang: string;
  danhMuc?: string;
  theGan?: string[];
  luotXem?: number;
  thoiGianDoc?: number;
}

export interface NewsAndBlogData {
  latestVehicles: VehicleNews[];
  latestBlogs: BlogPost[];
}

class NewsService {
  // Get latest vehicles (newly released)
  async getLatestVehicles(limit: number = 3): Promise<VehicleNews[]> {
    try {
      // Get latest vehicles sorted by release date
      const response = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/con-hang?conHang=true&size=${limit}&sort=ngayRaMat,desc`);
      const vehicles = response.data;
      
      // Get car series information
      const seriesResponse = await axios.get(`${BACKEND_URL}/api/v1/dong-xe`);
      const seriesData = seriesResponse.data;
      
      // Map vehicles with series information and get images
      const mappedVehicles: VehicleNews[] = await Promise.all(
        vehicles.map(async (vehicle: any) => {
          const series = seriesData.find((s: any) => s.id === vehicle.idDong);
          
          // Get vehicle images
          let anhDaiDien = vehicle.anhDaiDien;
          if (!anhDaiDien) {
            try {
              const images = await this.getVehicleImages(vehicle.id);
              anhDaiDien = images.find(img => img.includes('ngoai_that')) || images[0];
            } catch (error) {
              console.error(`Error fetching images for vehicle ${vehicle.id}:`, error);
            }
          }
          
          return {
            id: vehicle.id,
            tenMau: vehicle.tenMau,
            tenDong: series ? series.ten : 'Không xác định',
            namSanXuat: vehicle.namSanXuat,
            giaCoban: vehicle.giaCoban,
            moTa: vehicle.moTa,
            ngayRaMat: vehicle.ngayRaMat,
            anhDaiDien: anhDaiDien,
            isNew: this.isNewVehicle(vehicle.ngayRaMat)
          };
        })
      );
      
      return mappedVehicles;
    } catch (error) {
      console.error('Error fetching latest vehicles:', error);
      throw new Error('Không thể tải danh sách xe mới');
    }
  }

  // Get latest blog posts
  async getLatestBlogs(limit: number = 3): Promise<BlogPost[]> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/bai-viet/public?page=0&size=${limit}&sort=ngayDang,desc`);
      const data = response.data;
      
      return data.baiViet || data.data || [];
    } catch (error) {
      console.error('Error fetching latest blogs:', error);
      throw new Error('Không thể tải danh sách blog mới nhất');
    }
  }

  // Get both latest vehicles and blogs
  async getNewsAndBlogData(vehicleLimit: number = 3, blogLimit: number = 3): Promise<NewsAndBlogData> {
    try {
      const [latestVehicles, latestBlogs] = await Promise.all([
        this.getLatestVehicles(vehicleLimit),
        this.getLatestBlogs(blogLimit)
      ]);

      return {
        latestVehicles,
        latestBlogs
      };
    } catch (error) {
      console.error('Error fetching news and blog data:', error);
      throw new Error('Không thể tải dữ liệu tin tức và blog');
    }
  }

  // Check if vehicle is new (released within last 6 months)
  private isNewVehicle(releaseDate: string): boolean {
    try {
      const release = new Date(releaseDate);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      return release >= sixMonthsAgo;
    } catch {
      return false;
    }
  }

  // Get vehicle images
  async getVehicleImages(vehicleId: number): Promise<string[]> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${vehicleId}`);
      const images = response.data;
      
      return images.map((img: any) => img.duongDanAnh).filter(Boolean);
    } catch (error) {
      console.error('Error fetching vehicle images:', error);
      return [];
    }
  }

  // Get blog image URL
  getBlogImageUrl(imagePath?: string): string {
    if (!imagePath) return '/avatar-default.png';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads/')) {
      return `${BACKEND_URL}${imagePath}`;
    }
    
    return `${BACKEND_URL}/uploads/images/blogs/${imagePath}`;
  }

  // Get vehicle image URL
  getVehicleImageUrl(vehicleId: number, imagePath?: string): string {
    if (imagePath) {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      if (imagePath.startsWith('/uploads/')) {
        return `${BACKEND_URL}${imagePath}`;
      }
      
      return `${BACKEND_URL}/uploads/images/vehicles/${imagePath}`;
    }
    
    // Return default vehicle image
    return '/avatar-default.png';
  }

  // Format date for display
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  // Format price for display
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }

  // Get reading time for blog posts
  getReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Truncate text for preview
  truncateText(text: string, maxLength: number = 100): string {
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  }

  // Get category color for blog posts
  getCategoryColor(category: string): { bg: string; text: string } {
    const categoryColors: Record<string, { bg: string; text: string }> = {
      'THONG_TIN': { bg: '#e3f2fd', text: '#1976d2' },
      'TIN_TUC': { bg: '#f3e5f5', text: '#7b1fa2' },
      'REVIEW': { bg: '#e8f5e8', text: '#388e3c' },
      'HUONG_DAN': { bg: '#fff3e0', text: '#f57c00' },
      'MEO': { bg: '#fff3e0', text: '#f57c00' },
      default: { bg: '#f5f5f5', text: '#616161' }
    };
    return categoryColors[category] || categoryColors.default;
  }
}

export const newsService = new NewsService();
export default newsService;
