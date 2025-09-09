import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supportService, YeuCauHoTroDTO, PhanHoiYeuCauDTO } from '../../services/supportService';
import { useAuth } from '../../context/AuthContext';
import {
  containerVariants,
  itemVariants,
  formVariants,
  buttonVariants,
  modalVariants,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  spinnerVariants,
  staggerContainer
} from '../../utils/animations';

// Styled components với CSS-in-JS
const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px',
    background: 'transparent',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    marginTop: 100,
    marginBottom: 24,
    textAlign: 'center' as const,
    color: '#e5e7eb',
    background: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: 8,
    textShadow: '0 1px 2px rgba(0,0,0,0.4)'
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: 500
  },
  formContainer: {
    background: '#0f0f10',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    marginBottom: 32,
    border: '1px solid #1f2937'
  },
  formGrid: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: '1fr 1fr auto',
    alignItems: 'end'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #374151',
    borderRadius: 12,
    fontSize: 14,
    transition: 'all 0.3s ease',
    outline: 'none',
    background: '#111216',
    color: '#e5e7eb'
  },
  inputFocus: {
    borderColor: '#3b82f6',
    background: '#0b0c0f',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)'
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #374151',
    borderRadius: 12,
    fontSize: 14,
    background: '#111216',
    color: '#e5e7eb',
    cursor: 'pointer',
    outline: 'none'
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    color: 'white',
    border: '1px solid #374151',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    alignItems: 'start'
  },
  panel: {
    background: '#0f0f10',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    border: '1px solid #1f2937',
    height: 'fit-content',
    color: '#e5e7eb'
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    color: '#e5e7eb',
    borderBottom: '1px solid #1f2937',
    paddingBottom: 12
  },
  ticketItem: {
    background: '#111216',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  ticketTitle: {
    fontWeight: 600,
    fontSize: 16,
    color: '#e5e7eb',
    marginBottom: 8
  },
  ticketMeta: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    fontSize: 12,
    color: '#9ca3af'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  pagination: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  paginationButton: {
    padding: '8px 16px',
    background: '#111216',
    border: '1px solid #1f2937',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#e5e7eb',
    transition: 'all 0.3s ease'
  },
  conversationPanel: {
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 16,
    background: '#0b0c0f'
  },
  conversationHeader: {
    fontWeight: 600,
    fontSize: 16,
    marginBottom: 12,
    color: '#e5e7eb',
    borderBottom: '1px solid #1f2937',
    paddingBottom: 8
  },
  messagesContainer: {
    maxHeight: 320,
    overflow: 'auto',
    marginBottom: 16,
    paddingRight: 8
  },
  message: {
    padding: '8px 12px',
    marginBottom: 8,
    borderRadius: 8,
    background: '#111216',
    border: '1px solid #1f2937',
    color: '#e5e7eb'
  },
  replyContainer: {
    display: 'flex',
    gap: 12
  },
  replyInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #374151',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#111216',
    color: '#e5e7eb'
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    border: '2px solid #1f2937',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    display: 'inline-block'
  },
  errorMessage: {
    color: '#fecaca',
    background: '#7f1d1d',
    padding: '12px 16px',
    borderRadius: 8,
    marginTop: 12,
    border: '1px solid #991b1b',
    fontSize: 14
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#9ca3af',
    fontSize: 14,
    padding: '40px 20px',
    background: '#0b0c0f',
    borderRadius: 8,
    border: '1px dashed #1f2937'
  }
};

const SupportTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<YeuCauHoTroDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tieuDe: '', noiDung: '', mucDoUuTien: 'trung_binh' });
  const [activeTicket, setActiveTicket] = useState<YeuCauHoTroDTO | null>(null);
  const [replies, setReplies] = useState<PhanHoiYeuCauDTO[]>([]);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ title: boolean; content: boolean }>({ title: false, content: false });

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
    if (!form.tieuDe.trim() || !form.noiDung.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    try {
      setSubmitting(true);
      await supportService.createTicket({ ...form, idNguoiDung: user.userId } as YeuCauHoTroDTO);
      setForm({ tieuDe: '', noiDung: '', mucDoUuTien: 'trung_binh' });
      setError(null);
      setPage(0);
      await loadTickets();
    } finally {
      setSubmitting(false);
    }
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

  const statusLabel = (s?: string) => {
    switch ((s || '').toLowerCase()) {
      case 'moi': return 'Mới';
      case 'dang_xu_ly': return 'Đang xử lý';
      case 'da_giai_quyet': return 'Đã giải quyết';
      case 'dong': return 'Đóng';
      default: return s || 'Không rõ';
    }
  };

  const statusColor = (s?: string) => {
    switch ((s || '').toLowerCase()) {
      case 'moi': return '#1677ff';
      case 'dang_xu_ly': return '#faad14';
      case 'da_giai_quyet': return '#52c41a';
      case 'dong': return '#999999';
      default: return '#666666';
    }
  };

  return (
    <motion.div
      style={styles.container}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <header style={styles.header}>
        <motion.h2 style={styles.title} variants={fadeInUp}>Yêu cầu hỗ trợ</motion.h2>
        <motion.p style={styles.subtitle} variants={fadeInUp}>Tạo và theo dõi các yêu cầu hỗ trợ của bạn với trải nghiệm mượt mà</motion.p>
      </header>

      <motion.div style={styles.formContainer} variants={formVariants}>
        <div style={styles.formGrid as any}>
          <motion.input
            placeholder="Tiêu đề"
            value={form.tieuDe}
            onChange={e => setForm({ ...form, tieuDe: e.target.value })}
            onFocus={() => setFocus(s => ({ ...s, title: true }))}
            onBlur={() => setFocus(s => ({ ...s, title: false }))}
            style={{
              ...styles.input,
              ...(focus.title ? styles.inputFocus : {})
            }}
          />
          <motion.input
            placeholder="Nội dung"
            value={form.noiDung}
            onChange={e => setForm({ ...form, noiDung: e.target.value })}
            onFocus={() => setFocus(s => ({ ...s, content: true }))}
            onBlur={() => setFocus(s => ({ ...s, content: false }))}
            style={{
              ...styles.input,
              ...(focus.content ? styles.inputFocus : {})
            }}
          />
          <motion.select
            value={form.mucDoUuTien}
            onChange={e => setForm({ ...form, mucDoUuTien: e.target.value })}
            style={styles.select}
          >
            <option value="thap">Thấp</option>
            <option value="trung_binh">Trung bình</option>
            <option value="cao">Cao</option>
            <option value="khan_cap">Khẩn cấp</option>
          </motion.select>
          <motion.button
            onClick={submitTicket}
            disabled={loading || submitting}
            style={{ ...styles.button, gridColumn: '1 / span 3', ...(loading || submitting ? styles.buttonDisabled : {}) }}
            variants={buttonVariants}
            whileHover={!loading && !submitting ? 'hover' : undefined}
            whileTap={!loading && !submitting ? 'tap' : undefined}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {(loading || submitting) && (
                <motion.span style={styles.loadingSpinner} variants={spinnerVariants} animate="end" />
              )}
              Gửi yêu cầu
            </span>
          </motion.button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              style={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={styles.contentGrid as any}>
        <motion.div style={styles.panel} variants={fadeInLeft}>
          <div style={styles.panelTitle}>Danh sách của tôi</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <AnimatePresence mode="popLayout">
              {tickets.length === 0 && !loading && (
                <motion.li key="empty" style={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Chưa có yêu cầu nào.
                </motion.li>
              )}
              {tickets.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  style={styles.ticketItem}
                  onClick={() => openConversation(t)}
                >
                  <div style={styles.ticketTitle}>{t.tieuDe}</div>
                  <div style={styles.ticketMeta}>
                    <span style={{
                      ...styles.statusBadge,
                      background: '#f5f7ff',
                      color: statusColor(t.trangThai),
                      border: `1px solid ${statusColor(t.trangThai)}`
                    }}>{statusLabel(t.trangThai)}</span>
                    <span>Ưu tiên: {t.mucDoUuTien}</span>
                    {t.ngayTao && <span>· {new Date(t.ngayTao).toLocaleString()}</span>}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div style={styles.pagination}>
            <motion.button
              style={styles.paginationButton}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              whileHover={! (page === 0) ? { scale: 1.03 } : undefined}
              whileTap={! (page === 0) ? { scale: 0.97 } : undefined}
            >
              Trước
            </motion.button>
            <span>Trang {page + 1} / {Math.max(1, totalPages)}</span>
            <motion.button
              style={styles.paginationButton}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              whileHover={!(page >= totalPages - 1) ? { scale: 1.03 } : undefined}
              whileTap={!(page >= totalPages - 1) ? { scale: 0.97 } : undefined}
            >
              Sau
            </motion.button>
          </div>
        </motion.div>

        <motion.div style={styles.panel} variants={fadeInRight}>
          <div style={styles.panelTitle}>Trao đổi</div>
          <AnimatePresence mode="wait">
            {!activeTicket ? (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.emptyState}>
                Chọn một ticket để xem nội dung
              </motion.div>
            ) : (
              <motion.div key="conversation" variants={scaleIn} initial="hidden" animate="visible" exit="hidden" style={styles.conversationPanel}>
                <div style={styles.conversationHeader}>{activeTicket.tieuDe}</div>
                <div style={styles.messagesContainer as any}>
                  <AnimatePresence>
                    {replies.map((r) => (
                      <motion.div
                        key={r.id}
                        style={styles.message}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {r.noiDung}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div style={styles.replyContainer}>
                  <input
                    placeholder="Nhập phản hồi..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    style={styles.replyInput}
                  />
                  <motion.button
                    onClick={sendReply}
                    style={styles.button}
                    whileHover='hover'
                    whileTap='tap'
                  >
                    Gửi
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SupportTickets;


