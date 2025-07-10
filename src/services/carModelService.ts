import axios from 'axios';

export interface CarModel {
  id: number;
  tenMau: string;
  tenDong: string;
  hinhAnh: string;
}

const BACKEND_URL = 'http://localhost:8080';

export async function fetchSampleCarModels(): Promise<CarModel[]> {
  // Lấy 5 mẫu xe đầu tiên
  const res = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/con-hang?conHang=true`);
  const data = res.data.slice(0, 5); // Lấy 5 mẫu đầu tiên

  // Lấy ảnh cho từng mẫu xe
  const carModels: CarModel[] = await Promise.all(
    data.map(async (item: any) => {
      // Lấy ảnh đại diện
      let hinhAnh = '';
      try {
        const imgRes = await axios.get(`${BACKEND_URL}/api/v1/hinh-anh/mau-xe/${item.id}`);
        if (imgRes.data && imgRes.data.length > 0) {
          hinhAnh = `${BACKEND_URL}${imgRes.data[0].duongDanAnh}`;
        }
      } catch {
        hinhAnh = '';
      }
      return {
        id: item.id,
        tenMau: item.tenMau,
        tenDong: item.tenDong,
        hinhAnh,
      };
    })
  );
  return carModels;
}