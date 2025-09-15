import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

export type ActivityKind =
  | 'auth_login_success'
  | 'auth_login_fail'
  | 'auth_social_login_success'
  | 'auth_social_login_fail'
  | 'comment_create'
  | 'comment_reply'
  | 'comment_edit'
  | 'comment_delete'
  | 'comment_like'
  | 'comment_unlike';

function getClientMeta() {
  try {
    const ua = navigator.userAgent;
    const uaData = (navigator as any).userAgentData;
    const browser = Array.isArray(uaData?.brands)
      ? uaData.brands.map((b: any) => b.brand).join(', ')
      : ua;
    return {
      diaChiIp: undefined,
      thietBi: /Mobile|Android|iP(hone|od|ad)/.test(ua) ? 'mobile' : 'desktop',
      trinhDuyet: browser,
      heDieuHanh: navigator.platform,
      duongDan: window.location.pathname + window.location.search
    };
  } catch {
    return {} as any;
  }
}

export async function logActivity(kind: ActivityKind, details?: Record<string, any>) {
  try {
    const token = localStorage.getItem('token');
    // Skip logging when unauthenticated to avoid 401s from protected endpoints
    if (!token) return;
    // All authenticated roles can ingest logs; admin-only restriction is removed on backend for /ingest
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const nowTs = Date.now();
    const meta = getClientMeta() as any;
    const payload = {
      loaiHoatDong: kind,
      ...meta,
      // Chi tiết hiển thị theo dạng: { timestamp, testPayload: { chiTiet, thietBi, duongDan, heDieuHanh, trinhDuyet, loaiHoatDong } }
      chiTiet: {
        timestamp: nowTs,
        testPayload: {
          chiTiet: details || {},
          thietBi: meta?.thietBi,
          duongDan: meta?.duongDan,
          heDieuHanh: meta?.heDieuHanh,
          trinhDuyet: meta?.trinhDuyet,
          loaiHoatDong: kind
        }
      }
    };

    // backend exposes /api/v1/nhat-ky/test-log for generic logging
    await axios.post(`${BACKEND_URL}/api/v1/nhat-ky/ingest`, payload, { headers });
  } catch (e) {
    // swallow client logging errors
    // console.debug('logActivity failed', e);
  }
}


