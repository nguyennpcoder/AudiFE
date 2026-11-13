import React, { useEffect, useRef, useState } from 'react';
import { Rate, Tooltip } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../../services/ratingService';
import '../../styles/VehicleRatingSummary.css';

interface VehicleRatingSummaryProps {
  mauXeId: number;
  showCount?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

interface RatingSummaryCache {
  t: number;
  avg: number;
  count: number;
}

const RATING_CACHE_PREFIX = 'audi-rating-v1:';
const RATING_CACHE_TTL = 5 * 60 * 1000;
const memoryCache = new Map<number, RatingSummaryCache>();

function readRatingCache(id: number): RatingSummaryCache | null {
  const inMemory = memoryCache.get(id);
  if (inMemory && Date.now() - inMemory.t <= RATING_CACHE_TTL) return inMemory;

  try {
    const raw = sessionStorage.getItem(`${RATING_CACHE_PREFIX}${id}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as RatingSummaryCache;
    if (!entry || typeof entry.t !== 'number') return null;
    if (Date.now() - entry.t > RATING_CACHE_TTL) {
      sessionStorage.removeItem(`${RATING_CACHE_PREFIX}${id}`);
      return null;
    }
    memoryCache.set(id, entry);
    return entry;
  } catch {
    return null;
  }
}

function writeRatingCache(id: number, avg: number, count: number) {
  const entry: RatingSummaryCache = { t: Date.now(), avg, count };
  memoryCache.set(id, entry);
  try {
    sessionStorage.setItem(`${RATING_CACHE_PREFIX}${id}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota / private mode.
  }
}

const VehicleRatingSummary: React.FC<VehicleRatingSummaryProps> = ({
  mauXeId,
  showCount = true,
  size = 'default',
  className = ''
}) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const userId = user?.userId;

  // Only request ratings when the card is close to the viewport. The models
  // page has 14 cards, so this avoids 14-28 requests during the first paint.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    const fetchRatingSummary = async () => {
      try {
        setLoading(true);

        const cached = readRatingCache(mauXeId);
        let avgRating = cached?.avg ?? 0;
        let count = cached?.count ?? 0;

        if (!cached) {
          // One request gives both the average and the number of reviews.
          const ratingData = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 1);
          avgRating = ratingData.trungBinhSao || 0;
          count = ratingData.totalItems || 0;
          writeRatingCache(mauXeId, avgRating, count);
        }

        // Authenticated users may have a pending rating that is not part of
        // the public average yet. This stays an opt-in extra request.
        if (isAuthenticated && userId) {
          const userRatings = await ratingService.getDanhGiaByMauXe(mauXeId, 0, 100);
          const userRating = userRatings.danhGia?.find(
            (rating) => rating.idNguoiDung === userId
          );

          if (userRating && userRatings.trungBinhSao !== undefined) {
            avgRating = userRatings.trungBinhSao;
            count = userRatings.danhGia.length;
          }
        }

        if (cancelled) return;
        setAverageRating(avgRating);
        setRatingCount(count);
      } catch (error) {
        console.error('Error fetching rating summary:', error);
        if (!cancelled) {
          setAverageRating(0);
          setRatingCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRatingSummary();
    return () => {
      cancelled = true;
    };
  }, [visible, mauXeId, isAuthenticated, userId]);

  const pending = !visible || loading;

  const ratingTooltip = ratingCount > 0
    ? `${averageRating.toFixed(1)} sao từ ${ratingCount} đánh giá`
    : 'Chưa có đánh giá';

  return (
    <Tooltip title={pending ? '' : ratingTooltip}>
      <div
        ref={containerRef}
        className={`rating-summary ${pending ? 'loading' : ''} ${size} ${className}`}
      >
        <Rate
          disabled
          value={pending ? 0 : averageRating}
          allowHalf
          className={`rating-stars ${size}`}
        />
        {showCount && (
          pending
            ? <span className="rating-count">...</span>
            : ratingCount > 0 && (
              <span className="rating-count">({ratingCount})</span>
            )
        )}
      </div>
    </Tooltip>
  );
};

export default VehicleRatingSummary;
