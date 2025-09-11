import React, { useEffect, useMemo, useState } from 'react';
import { supportService, YeuCauHoTroDTO, PhanHoiYeuCauDTO } from '../../../services/supportService';
import { useAuth } from '../../AuthContext';
import '../../../styles/Admin.css';
import AdminHeader from './AdminHeader';

type SupportManagementProps = {
  useAdminLayout?: boolean;
  pageTitle?: string;
};

const SupportManagement: React.FC<SupportManagementProps> = ({ useAdminLayout = true, pageTitle = 'Quản lý hỗ trợ' }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<YeuCauHoTroDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<YeuCauHoTroDTO | null>(null);
  const [replies, setReplies] = useState<PhanHoiYeuCauDTO[]>([]);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<{ status?: string }>({});
  const [scope, setScope] = useState<'assigned' | 'unassigned' | 'all'>('assigned');
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  // Filter tickets for support view
  const visibleTickets = useMemo(() => {
    const agentId = user?.userId;
    return tickets.filter(t => {
      if (scope === 'all') return true;
      if (scope === 'assigned') return t.idNguoiPhuTrach === agentId;
      return !t.idNguoiPhuTrach; // unassigned
    });
  }, [tickets, scope, user?.userId]);

  const open = async (t: YeuCauHoTroDTO) => {
    setActive(t);
    const r = await supportService.getReplies(t.id!);
    setReplies(r);
    setShowDetailModal(true);
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

  const takeOwnership = async () => {
    if (!active || !user?.userId) return;
    await supportService.assignAgent(active.id!, user.userId);
    await load();
  };

  return (
    <div style={{ 
      background: '#f5f5f5', 
      height: '100vh', 
      overflow: 'hidden', 
      padding: 0 
    }}>
      {useAdminLayout && <AdminHeader pageTitle={pageTitle} />}
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '32px 0 0 0',
        height: 'calc(100vh - 80px)',
        overflow: 'hidden',
      }}>
        <div className="admin-section" style={{ 
          background: '#fff', 
          borderRadius: 18, 
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', 
          padding: '32px 32px 24px 32px', 
          marginBottom: 32,
          height: useAdminLayout ? 'calc(100vh - 120px)' : 'auto', 
          overflow: 'hidden', 
        }}>
          {!useAdminLayout && (
            <div className="support-kpi-grid admin-animate-bottom">
              <div className="support-kpi-card">
                <div className="support-kpi-title">Tổng ticket</div>
                <div className="support-kpi-value">{tickets.length}</div>
              </div>
              <div className="support-kpi-card">
                <div className="support-kpi-title">Của tôi</div>
                <div className="support-kpi-value">{tickets.filter(t => t.idNguoiPhuTrach === user?.userId).length}</div>
              </div>
              <div className="support-kpi-card">
                <div className="support-kpi-title">Chưa phân công</div>
                <div className="support-kpi-value">{tickets.filter(t => !t.idNguoiPhuTrach).length}</div>
              </div>
              <div className="support-kpi-card">
                <div className="support-kpi-title">Đã giải quyết</div>
                <div className="support-kpi-value">{tickets.filter(t => t.trangThai === 'da_giai_quyet').length}</div>
              </div>
            </div>
          )}
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={scope}
              onChange={e => setScope(e.target.value as 'assigned' | 'unassigned' | 'all')}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                color: 'rgb(107, 114, 128)',
                background: '#fafbfc',
              }}
            >
              <option value="assigned">Của tôi</option>
              <option value="unassigned">Chưa phân công</option>
              <option value="all">Tất cả</option>
            </select>
            <select
              value={filter.status || ''}
              onChange={e => setFilter({ status: e.target.value || undefined })}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                color: 'rgb(107, 114, 128)',
                fontSize: 15,
                background: '#fafbfc',
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="moi">Mới</option>
              <option value="dang_xu_ly">Đang xử lý</option>
              <option value="da_giai_quyet">Đã giải quyết</option>
              <option value="dong">Đóng</option>
            </select>
          </div>

          {/* Table Container */}
          <div className={"support-table"} style={{ 
            height: 'calc(100vh - 280px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              overflowX: 'auto', 
              borderRadius: 12, 
              background: '#fafbfc',
              flex: 1,
              minHeight: 0
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate', 
                borderSpacing: 0,
                height: '100%'
              }}>
                <thead>
                  <tr style={{ background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Tiêu đề</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Trạng thái</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Ưu tiên</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Phụ trách</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTickets
                    .filter(t => (filter.status ? t.trangThai === filter.status : true))
                    .map((t, idx) => (
                      <tr
                        key={t.id}
                        className="table-row-fadein"
                        style={{
                          animationDelay: `${idx * 120}ms`,
                          background: '#fff',
                          borderBottom: '1px solid #f0f0f0',
                          height: '50px'
                        }}
                      >
                        <td style={{ padding: '10px 8px' }}>{t.tieuDe}</td>
                        <td style={{ padding: '10px 8px' }}>{t.trangThai}</td>
                        <td style={{ padding: '10px 8px' }}>{t.mucDoUuTien}</td>
                        <td style={{ padding: '10px 8px' }}>{t.idNguoiPhuTrach ? (t.idNguoiPhuTrach === user?.userId ? 'Bạn' : `#${t.idNguoiPhuTrach}`) : '—'}</td>
                        <td
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            minWidth: 120,
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}>
                            <button
                              className="btn-view"
                              title="Xem chi tiết"
                              onClick={() => open(t)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                  {visibleTickets.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ 
                        textAlign: 'center', 
                        padding: '100px 24px',
                        color: '#888',
                        height: '300px'
                      }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination" style={{ 
              marginTop: 16, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 8,
              flexShrink: 0
            }}>
              <button 
                onClick={() => setPage(0)}
                disabled={page === 0}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              <span style={{ fontSize: 14, color: '#555' }}>
                Trang {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                onClick={() => setPage(Math.max(0, totalPages - 1))}
                disabled={page >= totalPages - 1}
                style={{
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages - 1 ? 0.6 : 1,
                }}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết hỗ trợ */}
      {showDetailModal && active && (
        <div className="admin-modal">
          <div className="admin-modal-content admin-modal-large">
            <div className="admin-modal-header">
              <h2>Chi tiết yêu cầu hỗ trợ</h2>
              <button 
                className="admin-modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <select onChange={e => updateStatus(e.target.value)} defaultValue={active.trangThai} style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 15,
                  color: 'rgb(107, 114, 128)',
                  background: '#fafbfc',
                }}>
                  <option value="moi">Mới</option>
                  <option value="dang_xu_ly">Đang xử lý</option>
                  <option value="da_giai_quyet">Đã giải quyết</option>
                  <option value="dong">Đóng</option>
                </select>
                {!active.idNguoiPhuTrach && (
                  <button onClick={takeOwnership} style={{
                    background: '#1890ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 16px',
                    fontWeight: 600,
                  }}>Nhận xử lý</button>
                )}
              </div>
              <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, maxHeight: 360, overflow: 'auto', background: '#fafafa' }}>
                {replies.map(r => {
                  const isCustomer = r.idNguoiDung === active.idNguoiDung;
                  return (
                    <div key={r.id} style={{
                      padding: '8px 12px',
                      margin: '6px 0',
                      borderRadius: 8,
                      background: isCustomer ? '#fff' : '#e6f4ff',
                      border: '1px solid #eee',
                      textAlign: isCustomer ? 'left' : 'right'
                    }}>
                      <div style={{ fontSize: 12, color: '#888' }}>{isCustomer ? 'Khách hàng' : 'Support'}</div>
                      <div>{r.noiDung}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input placeholder="Nhập phản hồi..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafbfc' }} />
                <button onClick={send} style={{
                  background: '#1890ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 600,
                }}>Gửi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;


