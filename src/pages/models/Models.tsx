// frontend/audi/src/pages/Models.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

interface DongXe {
  id: number;
  ten: string;
  moTa: string;
  phanLoai: string;
  duongDanAnh: string;
}

interface MauXe {
  id: number;
  idDong: number;
  tenDong: string;
  tenMau: string;
  namSanXuat: number;
  giaCoban: number;
  moTa: string;
  thongSoKyThuat: string;
  conHang: boolean;
  ngayRaMat: string;
}

const ModelsPage: React.FC = () => {
  const [dongXeList, setDongXeList] = useState<DongXe[]>([]);
  const [mauXeMap, setMauXeMap] = useState<Record<number, MauXe[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDongXeAndMauXe = async () => {
      setLoading(true);
      try {
        // Lấy danh sách dòng xe
        const dongXeRes = await axios.get(`${BACKEND_URL}/api/v1/dong-xe`);
        setDongXeList(dongXeRes.data);

        // Lấy mẫu xe cho từng dòng xe
        const mauXeMapTemp: Record<number, MauXe[]> = {};
        for (const dongXe of dongXeRes.data) {
          const mauXeRes = await axios.get(`${BACKEND_URL}/api/v1/mau-xe/dong-xe/${dongXe.id}`);
          mauXeMapTemp[dongXe.id] = mauXeRes.data;
        }
        setMauXeMap(mauXeMapTemp);
      } catch (err) {
        // Xử lý lỗi
      }
      setLoading(false);
    };
    fetchDongXeAndMauXe();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="models-page" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar filter (có thể mở rộng sau) */}
      <aside style={{ width: 260, background: '#f5f5f5', padding: 24 }}>
        <h3>All models</h3>
        {/* Thêm filter body type, loại xe... nếu muốn */}
      </aside>
      {/* Main content */}
      <main style={{ flex: 1, padding: 32 }}>
        <h2>All models</h2>
        {dongXeList.map(dongXe => (
          <section key={dongXe.id} style={{ marginBottom: 48 }}>
            <h3 style={{ margin: '24px 0 16px' }}>{dongXe.ten}</h3>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {(mauXeMap[dongXe.id] || []).map(mauXe => (
                <div key={mauXe.id} style={{
                  width: 320, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 16
                }}>
                  {/* Ảnh mẫu xe: có thể lấy từ API khác nếu có */}
                  <div style={{ height: 180, background: '#eee', marginBottom: 12 }} />
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{mauXe.tenMau}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>{dongXe.ten}</div>
                  <div style={{ margin: '8px 0', color: '#d50000', fontWeight: 700 }}>
                    {mauXe.giaCoban.toLocaleString('vi-VN')} VNĐ
                  </div>
                  <button style={{
                    width: '100%', background: '#000', color: '#fff', border: 'none', padding: 10, borderRadius: 4, marginTop: 8
                  }}>Discover</button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default ModelsPage;