import React, { useEffect, useState } from 'react';
import { supportService, YeuCauHoTroDTO, PhanHoiYeuCauDTO } from '../../services/supportService';
import { useAuth } from '../../context/AuthContext';

const SupportTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<YeuCauHoTroDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ tieuDe: '', noiDung: '', mucDoUuTien: 'trung_binh' });
  const [activeTicket, setActiveTicket] = useState<YeuCauHoTroDTO | null>(null);
  const [replies, setReplies] = useState<PhanHoiYeuCauDTO[]>([]);
  const [replyText, setReplyText] = useState('');

  const loadTickets = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const data = await supportService.getMyTickets(user.userId, page, size);
      setTickets(data.yeuCau || []);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, [page]);

  const submitTicket = async () => {
    if (!user?.userId) return;
    if (!form.tieuDe.trim() || !form.noiDung.trim()) return;
    await supportService.createTicket({ ...form, idNguoiDung: user.userId } as YeuCauHoTroDTO);
    setForm({ tieuDe: '', noiDung: '', mucDoUuTien: 'trung_binh' });
    setPage(0);
    await loadTickets();
  };

  const openConversation = async (t: YeuCauHoTroDTO) => {
    setActiveTicket(t);
    const r = await supportService.getReplies(t.id!);
    setReplies(r);
  };

  const sendReply = async () => {
    if (!activeTicket || !replyText.trim()) return;
    await supportService.createReply({ idYeuCau: activeTicket.id!, noiDung: replyText } as PhanHoiYeuCauDTO);
    setReplyText('');
    const r = await supportService.getReplies(activeTicket.id!);
    setReplies(r);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: 16 }}>Yêu cầu hỗ trợ</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 2fr auto' }}>
        <input placeholder="Tiêu đề" value={form.tieuDe} onChange={e => setForm({ ...form, tieuDe: e.target.value })} />
        <input placeholder="Nội dung" value={form.noiDung} onChange={e => setForm({ ...form, noiDung: e.target.value })} />
        <select value={form.mucDoUuTien} onChange={e => setForm({ ...form, mucDoUuTien: e.target.value })}>
          <option value="thap">Thấp</option>
          <option value="trung_binh">Trung bình</option>
          <option value="cao">Cao</option>
          <option value="khan_cap">Khẩn cấp</option>
        </select>
        <button onClick={submitTicket} disabled={loading} style={{ gridColumn: '1 / span 3' }}>Gửi yêu cầu</button>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Danh sách của tôi</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tickets.map(t => (
              <li key={t.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8, cursor: 'pointer' }} onClick={() => openConversation(t)}>
                <div style={{ fontWeight: 600 }}>{t.tieuDe}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{t.trangThai} · Ưu tiên: {t.mucDoUuTien}</div>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Trước</button>
            <span>Trang {page + 1} / {Math.max(1, totalPages)}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Sau</button>
          </div>
        </div>

        <div>
          <h3>Trao đổi</h3>
          {!activeTicket ? (
            <div>Chọn một ticket để xem nội dung</div>
          ) : (
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>{activeTicket.tieuDe}</div>
              <div style={{ maxHeight: 320, overflow: 'auto', paddingRight: 6 }}>
                {replies.map(r => (
                  <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px dashed #eee' }}>{r.noiDung}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input placeholder="Nhập phản hồi..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1 }} />
                <button onClick={sendReply}>Gửi</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;


