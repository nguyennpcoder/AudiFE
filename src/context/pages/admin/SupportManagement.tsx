import React, { useEffect, useMemo, useState } from 'react';
import { supportService, YeuCauHoTroDTO, PhanHoiYeuCauDTO } from '../../../services/supportService';

const SupportManagement: React.FC = () => {
  const [tickets, setTickets] = useState<YeuCauHoTroDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<YeuCauHoTroDTO | null>(null);
  const [replies, setReplies] = useState<PhanHoiYeuCauDTO[]>([]);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<{ status?: string }>({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await supportService.getAllTickets(page, size, 'ngayTao', 'desc');
      setTickets(data.yeuCau || []);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const open = async (t: YeuCauHoTroDTO) => {
    setActive(t);
    const r = await supportService.getReplies(t.id!);
    setReplies(r);
  };

  const send = async () => {
    if (!active || !replyText.trim()) return;
    await supportService.createReply({ idYeuCau: active.id!, noiDung: replyText });
    setReplyText('');
    const r = await supportService.getReplies(active.id!);
    setReplies(r);
  };

  const updateStatus = async (status: string) => {
    if (!active) return;
    await supportService.updateStatus(active.id!, status);
    await load();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý hỗ trợ</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Trước</button>
            <span>Trang {page + 1} / {Math.max(1, totalPages)}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Sau</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Tiêu đề</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Trạng thái</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Ưu tiên</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => open(t)}>
                  <td style={{ padding: 8 }}>{t.tieuDe}</td>
                  <td style={{ padding: 8 }}>{t.trangThai}</td>
                  <td style={{ padding: 8 }}>{t.mucDoUuTien}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Chi tiết</h3>
          {!active ? (
            <div>Chọn một ticket ở bảng bên trái</div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select onChange={e => updateStatus(e.target.value)} defaultValue={active.trangThai}>
                  <option value="moi">Mới</option>
                  <option value="dang_xu_ly">Đang xử lý</option>
                  <option value="da_giai_quyet">Đã giải quyết</option>
                  <option value="dong">Đóng</option>
                </select>
              </div>
              <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, maxHeight: 360, overflow: 'auto' }}>
                {replies.map(r => (
                  <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px dashed #eee' }}>{r.noiDung}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input placeholder="Nhập phản hồi..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1 }} />
                <button onClick={send}>Gửi</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;


