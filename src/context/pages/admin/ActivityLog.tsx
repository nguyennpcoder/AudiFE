import React, { useEffect, useMemo, useState } from 'react';
import { Tag, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import AdminHeader from './AdminHeader';
import { activityLogService, NhatKyHoatDongDTO } from '../../../services/activityLogService';
import { buildAvatarUrl } from '../../../services/authService';
import '../../../styles/Admin.css';
// import '../../../styles/AdminAnimations.css';

// Removed antd Typography/DatePicker in favor of native controls to match other admin pages

const formatDateTime = (iso: string) => dayjs(iso).format('DD/MM/YYYY HH:mm:ss');

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<NhatKyHoatDongDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [hoveredUserImgPos, setHoveredUserImgPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredUserImgUrl, setHoveredUserImgUrl] = useState<string | null>(null);
  const [userAvatarCache, setUserAvatarCache] = useState<Record<number, string>>({});
  const [hoveredDetail, setHoveredDetail] = useState<{
    x: number; y: number; json: string
  } | null>(null);

  const loadTypes = async () => {
    try {
      const data = await activityLogService.getLoaiHoatDong();
      setTypes(data || []);
    } catch {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let resp;
      const zeroBased = page - 1;

      if (dateRange) {
        resp = await activityLogService.getByDateRange(
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD'),
          zeroBased,
          pageSize
        );
      } else if (selectedType) {
        resp = await activityLogService.getByType(selectedType, zeroBased, pageSize);
      } else if (userId.trim()) {
        const id = parseInt(userId.trim(), 10);
        resp = await activityLogService.getByUser(id, zeroBased, pageSize);
      } else {
        resp = await activityLogService.getAll(zeroBased, pageSize, 'ngayTao', 'DESC');
      }

      setLogs(resp.content || []);
      setTotal(resp.totalElements || 0);
    } catch (e) {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedType, dateRange]);

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const onChangeType = (value?: string) => {
    setSelectedType(value);
    setPage(1);
  };

  const onChangeDate = (dates: null | [Dayjs | null, Dayjs | null]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
    setPage(1);
  };

  const onSearchUser = () => {
    setSelectedType(undefined);
    setDateRange(null);
    setPage(1);
    fetchData();
  };

  const resolveAvatarForUser = async (record: NhatKyHoatDongDTO): Promise<string> => {
    const cacheKey = (record.idNguoiDung ?? record.id) as number;
    if (cacheKey && userAvatarCache[cacheKey]) return userAvatarCache[cacheKey];
    const fallback = '/avatar-default.png';

    // Try from chiTietHoatDong first
    try {
      if (record.chiTietHoatDong && typeof record.chiTietHoatDong !== 'string') {
        // @ts-ignore
        const raw = record.chiTietHoatDong.avatar || record.chiTietHoatDong.anhDaiDien || record.chiTietHoatDong.anh_dai_dien;
        if (raw) {
          const url = buildAvatarUrl(raw);
          setUserAvatarCache(prev => ({ ...prev, [cacheKey]: url }));
          return url;
        }
      }
    } catch {}

    // Fetch user by id to get avatar
    try {
      if (record.idNguoiDung) {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/v1/nguoi-dung/${record.idNguoiDung}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const user = await res.json();
          const raw = user.avatar || user.avatarUrl || user.anhDaiDien || user.anh_dai_dien;
          const url = raw ? buildAvatarUrl(raw) : fallback;
          setUserAvatarCache(prev => ({ ...prev, [cacheKey]: url }));
          return url;
        }
      }
    } catch {}

    if (cacheKey) setUserAvatarCache(prev => ({ ...prev, [cacheKey]: fallback }));
    return fallback;
  };

  const formatDetails = (val: any): { chips: Array<{ k: string; v: string }>; title: string } => {
    try {
      const obj = typeof val === 'string' ? JSON.parse(val) : val;
      if (!obj || typeof obj !== 'object') {
        return { chips: [{ k: 'chi_tiet', v: String(val) }], title: String(val) };
      }
      const entries = Object.entries(obj).map(([k, v]) => ({ k, v: typeof v === 'object' ? JSON.stringify(v) : String(v) }));
      const title = JSON.stringify(obj, null, 2);
      return { chips: entries, title };
    } catch {
      const text = typeof val === 'string' ? val : JSON.stringify(val);
      return { chips: [{ k: 'chi_tiet', v: text }], title: text };
    }
  };

  return (
    <div style={{ 
      background: '#f5f5f5', 
      height: '100vh', 
      overflow: 'hidden', 
      padding: 0 
    }}>
      <AdminHeader pageTitle="Nhật ký hoạt động" />
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
          height: 'calc(100vh - 120px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                placeholder="Lọc theo ID người dùng"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSearchUser(); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 15,
                  background: '#fafbfc',
                }}
              />
            </div>
            <select
              value={selectedType || ''}
              onChange={(e) => onChangeType(e.target.value || undefined)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333',
              }}
            >
              <option value="">Tất cả loại hoạt động</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="date"
              onChange={(e) => onChangeDate([dayjs(e.target.value), dateRange ? dateRange[1] : null])}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333',
              }}
            />
            <input
              type="date"
              onChange={(e) => onChangeDate([dateRange ? dateRange[0] : null, dayjs(e.target.value)])}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                background: '#fafbfc',
                color: '#333',
              }}
            />
            <button
              onClick={fetchData}
              style={{
                background: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Làm mới
            </button>
          </div>

          {/* Table Container */}
          <div style={{ 
            height: 'calc(100% - 88px)', 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0
          }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Spin />
              </div>
            ) : (
              <>
                <div style={{ 
                  overflowX: 'auto', 
                  borderRadius: 12, 
                  background: '#fafbfc',
                  flex: 1,
                  minHeight: 0,
                  border: '1px solid #e5e7eb'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'separate', 
                    borderSpacing: 0,
                    height: '100%',
                    minWidth: '1400px'
                  }}>
                    <thead>
                      <tr style={{ background: '#fafbfc', color: '#6b7280', fontWeight: 700 }}>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '16%'
                        }}>Thời gian</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '16%'
                        }}>Người dùng</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '14%'
                        }}>Loại hoạt động</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left',
                          minWidth: '280px'
                        }}>Chi tiết</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '10%'
                        }}>IP</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '12%'
                        }}>Thiết bị</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '12%'
                        }}>Trình duyệt</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', width: '12%' }}>Hệ điều hành</th>
                        <th style={{ 
                          padding: '12px 8px', 
                          textAlign: 'left', 
                          width: '18%'
                        }}>Đường dẫn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ 
                            textAlign: 'center', 
                            padding: '60px 24px',
                            color: '#64748b',
                            fontSize: '15px',
                            height: '200px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <i className="fas fa-inbox" style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '8px' }}></i>
                              Không có dữ liệu
                            </div>
                          </td>
                        </tr>
                      ) : (
                        logs.map((record, idx) => (
                          <tr
                            key={record.id}
                            className="table-row-fadein"
                            style={{ 
                              background: '#fff',
                              borderBottom: '1px solid #f0f0f0',
                              animationDelay: `${idx * 120}ms`,
                              height: '50px'
                            }}
                          >
                            <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                              {dayjs(record.ngayTao).format('HH:mm:ss DD/MM/YYYY')}
                            </td>
                            <td
                              style={{ padding: '10px 8px', maxWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              onMouseEnter={async (e) => {
                                setHoveredUserId(record.idNguoiDung ?? record.id);
                                setHoveredUserImgPos({ x: e.clientX, y: e.clientY });
                                // Set temp default image then resolve real
                                setHoveredUserImgUrl('/avatar-default.png');
                                const url = await resolveAvatarForUser(record);
                                setHoveredUserImgUrl(url);
                              }}
                              onMouseMove={(e) => setHoveredUserImgPos({ x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => { setHoveredUserId(null); setHoveredUserImgPos(null); setHoveredUserImgUrl(null); }}
                            >
                              <span title={record.tenNguoiDung || ''}>
                                {record.tenNguoiDung || `ID: ${record.idNguoiDung ?? 'N/A'}`}
                              </span>
                            </td>
                            <td style={{ 
                              padding: '10px 8px'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                background: '#eef2ff',
                                color: '#3730a3',
                                borderRadius: 8,
                                padding: '2px 14px',
                                fontWeight: 600,
                                fontSize: 14
                              }}>
                                {record.loaiHoatDong}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              {(() => {
                                const { chips, title } = formatDetails(record.chiTietHoatDong);
                                const max = 3;
                                const visible = chips.slice(0, max);
                                const remaining = chips.length - visible.length;
                                return (
                                  <div
                                    title={title}
                                    style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
                                    onMouseEnter={(e) => setHoveredDetail({ x: e.clientX, y: e.clientY, json: title })}
                                    onMouseMove={(e) => setHoveredDetail(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : { x: e.clientX, y: e.clientY, json: title })}
                                    onMouseLeave={() => setHoveredDetail(null)}
                                  >
                                    {visible.map((c, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          background: '#f8fafc',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: 10,
                                          padding: '3px 10px',
                                          fontSize: 12,
                                          color: '#0f172a',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 6,
                                          maxWidth: 260,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        <span style={{
                                          background: '#eef2ff',
                                          color: '#3730a3',
                                          borderRadius: 8,
                                          padding: '1px 8px',
                                          fontWeight: 700
                                        }}>{c.k}</span>
                                        <span style={{ color: '#334155' }}>{c.v}</span>
                                      </span>
                                    ))}
                                    {remaining > 0 && (
                                      <span style={{
                                        background: '#eef2ff',
                                        color: '#3730a3',
                                        borderRadius: 10,
                                        padding: '3px 10px',
                                        fontSize: 12,
                                        fontWeight: 700
                                      }}>+{remaining}</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td style={{ 
                              padding: '10px 8px'
                            }}>
                              {record.diaChiIp || '—'}
                            </td>
                            <td style={{ 
                              padding: '10px 8px'
                            }}>
                              {record.thietBi || '—'}
                            </td>
                            <td style={{ 
                              padding: '10px 8px'
                            }}>
                              {record.trinhDuyet || '—'}
                            </td>
                            <td style={{ padding: '10px 8px' }}>{record.heDieuHanh || '—'}</td>
                            <td style={{ 
                              padding: '10px 8px',
                              maxWidth: 260,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <span title={record.duongDan || ''}>{record.duongDan || '—'}</span>
                            </td>
                          </tr>
                        ))
                      )}
                      {logs.length > 0 && logs.length < pageSize &&
                        Array.from({ length: pageSize - logs.length }).map((_, i) => (
                          <tr key={`empty-${i}`} style={{ height: '50px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                            <td colSpan={9} style={{ padding: '10px 8px' }}></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Pagination - fixed bottom */}
                <div className="admin-pagination" style={{ 
                  marginTop: 16, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 8,
                  flexShrink: 0
                }}>
                  <button 
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.6 : 1,
                    }}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.6 : 1,
                    }}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                  <span style={{ fontSize: 14, color: '#555' }}>
                    Trang {page} / {Math.max(totalPages, 1)}
                  </span>
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.6 : 1,
                    }}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button 
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    style={{
                      background: '#e0e0e0',
                      color: '#333',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 14,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.6 : 1,
                    }}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {hoveredUserId && hoveredUserImgPos && hoveredUserImgUrl && (
        <div
          className="activitylog-hover-avatar"
          style={{
            position: 'fixed',
            left: hoveredUserImgPos.x - 316,
            top: hoveredUserImgPos.y - 100,
            zIndex: 9999,
            pointerEvents: 'none',
            background: 'transparent',
            boxShadow: 'none',
            borderRadius: 0
          }}
        >
          <img
            src={hoveredUserImgUrl}
            alt="avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #fff',
              boxShadow: '0 2px 12px 0 rgba(24,144,255,0.10)'
            }}
          />
        </div>
      )}
      {hoveredDetail && (
        <div
          style={{
            position: 'fixed',
            left: Math.max(12, hoveredDetail.x - 260),
            top: hoveredDetail.y + 12,
            zIndex: 10000,
            background: '#0b1220',
            color: '#e2e8f0',
            padding: '10px 12px',
            borderRadius: 10,
            boxShadow: '0 8px 28px rgba(2, 6, 23, 0.35)',
            minWidth: 280,
            maxWidth: 520,
            maxHeight: 280,
            overflow: 'auto',
            pointerEvents: 'none',
            border: '1px solid rgba(148,163,184,0.25)'
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, lineHeight: 1.4 }}>
            {hoveredDetail.json}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;


