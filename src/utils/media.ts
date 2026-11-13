/**
 * Central place to turn the paths stored in the database into real URLs.
 *
 * The backend stores relative paths such as:
 *   /uploads/images/blogs/a4_2024.jpg
 *   uploads/images/avatar_user/namjoohyuk4.png
 *   /uploads/images/vehicles/s_etron_gt_exterior_1.jpeg
 *
 * In production those files live on the GitHub raw CDN (VITE_MEDIA_URL),
 * while in development Vite proxies /uploads to localhost:8080.
 */

import type { SyntheticEvent } from 'react';

const RAW_MEDIA_BASE = (import.meta.env.VITE_MEDIA_URL || '').trim().replace(/\/+$/, '');
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || '').trim().replace(/\/+$/, '');

export const DEFAULT_AVATAR = '/avatar-default-256.png';
export const DEFAULT_BLOG_IMAGE = '/blog-placeholder.svg';
export const DEFAULT_CAR_IMAGE = '/car-placeholder.svg';

export type MediaKind = 'blog' | 'avatar' | 'vehicle';

const KIND_FOLDER: Record<MediaKind, string> = {
  blog: 'uploads/images/blogs',
  avatar: 'uploads/images/avatar_user',
  vehicle: 'uploads/images/vehicles',
};

const ABSOLUTE_URL = /^(?:https?:)?\/\//i;

/**
 * Files created while the app is running (avatar uploads, blog covers,
 * admin-uploaded car photos) are written to the backend disk. They are not
 * part of the pinned GitHub CDN commit, so they must be loaded from the API
 * origin instead.
 *
 * Naming patterns produced by the backend:
 *   1794532713925_copy_xxx.jpeg      (AuthController.dang-ky)
 *   copy_xxx_1794532713925.jpeg      (FileStorageService / upload/avatar)
 *   color_12_1a2b3c4d.jpg            (MauSacImageService)
 *   1_ngoai_that_2.jpeg              (HinhAnhXeService)
 */
const RUNTIME_UPLOAD_NAME =
  /(?:\d{13}[_-][^/]+|[^/]+_\d{13}\.[A-Za-z0-9]+|color_\d+_[0-9a-f]{8}\.[A-Za-z0-9]+|\d+_(?:ngoai_that|noi_that|chi_tiet|tinh_nang|thu_nho)_[^/]+)$/i;

function isRuntimeUpload(path: string): boolean {
  const name = path.split('/').pop() || '';
  return RUNTIME_UPLOAD_NAME.test(name);
}

function defaultFor(kind: MediaKind): string {
  if (kind === 'avatar') return DEFAULT_AVATAR;
  if (kind === 'blog') return DEFAULT_BLOG_IMAGE;
  return DEFAULT_CAR_IMAGE;
}

function joinWithBase(path: string): string {
  const clean = path.replace(/^\/+/, '');

  // Runtime uploads only exist on the backend, never on the pinned CDN.
  if (isRuntimeUpload(clean)) {
    return API_ORIGIN ? `${API_ORIGIN}/${clean}` : `/${clean}`;
  }

  // No CDN configured (local dev): keep the path relative so the Vite proxy
  // and the Spring Boot static handler can serve it.
  if (!RAW_MEDIA_BASE) return `/${clean}`;

  // Allow VITE_MEDIA_URL to be either a repository root
  // (https://raw.githubusercontent.com/.../<commit>) or a directory that
  // already ends in /uploads.
  if (/\/uploads$/i.test(RAW_MEDIA_BASE) && clean.startsWith('uploads/')) {
    return `${RAW_MEDIA_BASE}/${clean.slice('uploads/'.length)}`;
  }

  return `${RAW_MEDIA_BASE}/${clean}`;
}

/**
 * Resolve a database image path for the given kind of asset.
 * Falls back to a local placeholder instead of an external image service.
 */
export function resolveMediaUrl(rawPath: string | null | undefined, kind: MediaKind = 'vehicle'): string {
  const value = (rawPath ?? '').trim();
  const fallback = defaultFor(kind);

  if (!value || value === 'null' || value === 'undefined') return fallback;

  // Already a complete URL (Firebase/Google avatars, data URIs, blobs...).
  if (ABSOLUTE_URL.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  // Ignore legacy placeholder names that point at the old (broken) file.
  if (/^\/?avatar-default(?:-256)?\.(png|svg)$/i.test(value)) return fallback;
  if (/^\/?(blog|car)-placeholder\.svg$/i.test(value)) return fallback;

  let path = value.replace(/\\/g, '/');

  if (path.startsWith('/uploads/')) path = path.slice(1);
  if (path.startsWith('/images/')) path = `uploads${path}`;
  if (path.startsWith('images/')) path = `uploads/${path}`;

  // Bare file name: the kind tells us which folder it belongs to.
  if (!path.includes('/')) {
    return joinWithBase(`${KIND_FOLDER[kind]}/${path}`);
  }

  // A relative path that already contains a folder (uploads/..., images/...).
  if (path.startsWith('uploads/')) return joinWithBase(path);

  // Some records store "blogs/foo.jpg" or "avatar_user/foo.png".
  if (path.startsWith('blogs/') || path.startsWith('avatar_user/') || path.startsWith('vehicles/')) {
    return joinWithBase(`uploads/images/${path}`);
  }

  return joinWithBase(path);
}

export const getBlogImageUrl = (path?: string | null) => resolveMediaUrl(path, 'blog');
export const getAvatarUrl = (path?: string | null) => resolveMediaUrl(path, 'avatar');
export const getVehicleImageUrl = (path?: string | null) => resolveMediaUrl(path, 'vehicle');

/**
 * Shared onError handler: swap to the local placeholder once, never loop.
 */
export function applyImageFallback(event: SyntheticEvent<HTMLImageElement>, fallback: string) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === '1') return;
  image.dataset.fallbackApplied = '1';
  image.src = fallback;
}

export { API_ORIGIN, RAW_MEDIA_BASE };
