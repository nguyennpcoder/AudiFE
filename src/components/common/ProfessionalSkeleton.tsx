import React from 'react';
import { Card, Skeleton, Row, Col } from 'antd';
import './ProfessionalSkeleton.css';

// ================================================
// PROFESSIONAL SKELETON COMPONENTS
// ================================================

interface SkeletonProps {
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Professional Card Skeleton
 * For car configuration and order cards
 */
export const ProfessionalCardSkeleton: React.FC<SkeletonProps> = ({ 
  loading = true, 
  children, 
  className = '' 
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  return (
    <Card className={`professional-skeleton-card ${className}`}>
      <div className=\"skeleton-card-header\">
        <Skeleton.Avatar size={64} active className=\"skeleton-avatar\" />
        <div className=\"skeleton-header-content\">
          <Skeleton.Input style={{ width: 180, height: 24 }} active />
          <Skeleton.Input style={{ width: 120, height: 16, marginTop: 8 }} active />
        </div>
      </div>
      
      <div className=\"skeleton-card-body\">
        <div className=\"skeleton-details\">
          {[...Array(4)].map((_, index) => (
            <div key={index} className=\"skeleton-detail-item\">
              <Skeleton.Input style={{ width: 80, height: 16 }} active />
              <Skeleton.Input style={{ width: 100, height: 16 }} active />
            </div>
          ))}
        </div>
        
        <div className=\"skeleton-progress\">
          <Skeleton.Input style={{ width: '100%', height: 6 }} active />
        </div>
        
        <div className=\"skeleton-price\">
          <Skeleton.Input style={{ width: 140, height: 24 }} active />
        </div>
      </div>
      
      <div className=\"skeleton-card-actions\">
        {[...Array(4)].map((_, index) => (
          <Skeleton.Button key={index} size=\"small\" active />
        ))}
      </div>
    </Card>
  );
};

/**
 * Dashboard Header Skeleton
 * For header sections with user info
 */
export const DashboardHeaderSkeleton: React.FC<SkeletonProps> = ({ 
  loading = true, 
  children, 
  className = '' 
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  return (
    <div className={`dashboard-header-skeleton ${className}`}>
      <div className=\"header-left-skeleton\">
        <Skeleton.Avatar size={64} active />
        <div className=\"header-text-skeleton\">
          <Skeleton.Input style={{ width: 200, height: 28 }} active />
          <Skeleton.Input style={{ width: 300, height: 16, marginTop: 8 }} active />
        </div>
      </div>
      <div className=\"header-actions-skeleton\">
        <Skeleton.Button size=\"large\" active style={{ marginRight: 12 }} />
        <Skeleton.Button size=\"large\" active style={{ marginRight: 12 }} />
        <Skeleton.Button size=\"large\" active />
      </div>
    </div>
  );
};

/**
 * Statistics Cards Skeleton
 * For dashboard statistics
 */
export const StatisticsCardsSkeleton: React.FC<{ count?: number } & SkeletonProps> = ({ 
  loading = true, 
  children, 
  count = 4,
  className = '' 
}) => {
  if (!loading && children) {
    return <>{children}</>;
  }

  return (
    <Row gutter={[20, 20]} className={`statistics-skeleton ${className}`}>
      {[...Array(count)].map((_, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card className=\"stat-skeleton-card\">
            <div className=\"stat-skeleton-content\">
              <Skeleton.Avatar size={40} active />
              <div className=\"stat-skeleton-text\">
                <Skeleton.Input style={{ width: 80, height: 14 }} active />
                <Skeleton.Input style={{ width: 60, height: 24, marginTop: 8 }} active />
              </div>
            </div>
          </Card>
        </Col>
      ))}\n    </Row>\n  );\n};\n\n/**\n * List Item Skeleton\n * For list view items\n */\nexport const ListItemSkeleton: React.FC<{ count?: number } & SkeletonProps> = ({ \n  loading = true, \n  children, \n  count = 3,\n  className = '' \n}) => {\n  if (!loading && children) {\n    return <>{children}</>;\n  }\n\n  return (\n    <div className={`list-skeleton ${className}`}>\n      {[...Array(count)].map((_, index) => (\n        <div key={index} className=\"list-item-skeleton\">\n          <Skeleton.Avatar size={64} active />\n          <div className=\"list-item-content-skeleton\">\n            <div className=\"list-item-header-skeleton\">\n              <Skeleton.Input style={{ width: 180, height: 20 }} active />\n              <div className=\"list-item-tags-skeleton\">\n                <Skeleton.Button size=\"small\" active />\n                <Skeleton.Button size=\"small\" active />\n              </div>\n            </div>\n            <div className=\"list-item-description-skeleton\">\n              <Skeleton.Input style={{ width: '100%', height: 16 }} active />\n              <Skeleton.Input style={{ width: '80%', height: 16, marginTop: 4 }} active />\n            </div>\n            <div className=\"list-item-progress-skeleton\">\n              <Skeleton.Input style={{ width: '100%', height: 6, marginTop: 8 }} active />\n            </div>\n          </div>\n          <div className=\"list-item-price-skeleton\">\n            <Skeleton.Input style={{ width: 120, height: 24 }} active />\n          </div>\n        </div>\n      ))}\n    </div>\n  );\n};\n\n/**\n * Timeline Item Skeleton\n * For timeline view\n */\nexport const TimelineItemSkeleton: React.FC<{ count?: number } & SkeletonProps> = ({ \n  loading = true, \n  children, \n  count = 3,\n  className = '' \n}) => {\n  if (!loading && children) {\n    return <>{children}</>;\n  }\n\n  return (\n    <div className={`timeline-skeleton ${className}`}>\n      {[...Array(count)].map((_, index) => (\n        <div key={index} className=\"timeline-item-skeleton\">\n          <div className=\"timeline-dot-skeleton\">\n            <Skeleton.Avatar size={16} active />\n          </div>\n          <Card className=\"timeline-card-skeleton\">\n            <div className=\"timeline-card-header-skeleton\">\n              <Skeleton.Input style={{ width: 150, height: 20 }} active />\n              <Skeleton.Button size=\"small\" active />\n            </div>\n            <div className=\"timeline-card-content-skeleton\">\n              <Row gutter={[16, 8]}>\n                <Col span={12}>\n                  <Skeleton.Input style={{ width: '100%', height: 16 }} active />\n                </Col>\n                <Col span={12}>\n                  <Skeleton.Input style={{ width: '100%', height: 16 }} active />\n                </Col>\n                <Col span={12}>\n                  <Skeleton.Input style={{ width: '100%', height: 16 }} active />\n                </Col>\n                <Col span={12}>\n                  <Skeleton.Input style={{ width: '100%', height: 16 }} active />\n                </Col>\n              </Row>\n            </div>\n            <div className=\"timeline-actions-skeleton\">\n              <Skeleton.Button size=\"small\" active style={{ marginRight: 8 }} />\n              <Skeleton.Button size=\"small\" active />\n            </div>\n            <div className=\"timeline-progress-skeleton\">\n              <Skeleton.Input style={{ width: '100%', height: 6, marginTop: 16 }} active />\n            </div>\n          </Card>\n        </div>\n      ))}\n    </div>\n  );\n};\n\n/**\n * Table Skeleton\n * For data tables\n */\nexport const TableSkeleton: React.FC<{ rows?: number; columns?: number } & SkeletonProps> = ({ \n  loading = true, \n  children, \n  rows = 5,\n  columns = 5,\n  className = '' \n}) => {\n  if (!loading && children) {\n    return <>{children}</>;\n  }\n\n  return (\n    <div className={`table-skeleton ${className}`}>\n      {/* Table Header */}\n      <div className=\"table-header-skeleton\">\n        {[...Array(columns)].map((_, index) => (\n          <Skeleton.Input key={index} style={{ width: '100%', height: 32 }} active />\n        ))}\n      </div>\n      \n      {/* Table Rows */}\n      {[...Array(rows)].map((_, rowIndex) => (\n        <div key={rowIndex} className=\"table-row-skeleton\">\n          {[...Array(columns)].map((_, colIndex) => (\n            <div key={colIndex} className=\"table-cell-skeleton\">\n              {colIndex === 0 ? (\n                <Skeleton.Avatar size={32} active />\n              ) : (\n                <Skeleton.Input style={{ width: '80%', height: 16 }} active />\n              )}\n            </div>\n          ))}\n        </div>\n      ))}\n    </div>\n  );\n};\n\n/**\n * Form Skeleton\n * For form loading states\n */\nexport const FormSkeleton: React.FC<{ fields?: number } & SkeletonProps> = ({ \n  loading = true, \n  children, \n  fields = 6,\n  className = '' \n}) => {\n  if (!loading && children) {\n    return <>{children}</>;\n  }\n\n  return (\n    <div className={`form-skeleton ${className}`}>\n      {[...Array(fields)].map((_, index) => (\n        <div key={index} className=\"form-field-skeleton\">\n          <Skeleton.Input style={{ width: 120, height: 16 }} active />\n          <Skeleton.Input style={{ width: '100%', height: 40, marginTop: 8 }} active />\n        </div>\n      ))}\n      <div className=\"form-actions-skeleton\">\n        <Skeleton.Button size=\"large\" active style={{ marginRight: 12 }} />\n        <Skeleton.Button size=\"large\" active />\n      </div>\n    </div>\n  );\n};\n\n/**\n * Page Skeleton\n * Full page loading skeleton\n */\nexport const PageSkeleton: React.FC<SkeletonProps> = ({ \n  loading = true, \n  children, \n  className = '' \n}) => {\n  if (!loading && children) {\n    return <>{children}</>;\n  }\n\n  return (\n    <div className={`page-skeleton ${className}`}>\n      <DashboardHeaderSkeleton />\n      <StatisticsCardsSkeleton />\n      <div className=\"page-content-skeleton\">\n        <Row gutter={[20, 20]}>\n          {[...Array(6)].map((_, index) => (\n            <Col xs={24} sm={12} lg={8} xl={6} key={index}>\n              <ProfessionalCardSkeleton />\n            </Col>\n          ))}\n        </Row>\n      </div>\n    </div>\n  );\n};\n\n/**\n * Shimmer Effect Component\n * Adds shimmer animation to any content\n */\nexport const ShimmerWrapper: React.FC<{\n  children: React.ReactNode;\n  className?: string;\n  active?: boolean;\n}> = ({ children, className = '', active = true }) => {\n  return (\n    <div className={`shimmer-wrapper ${active ? 'shimmer-active' : ''} ${className}`}>\n      {children}\n      {active && <div className=\"shimmer-overlay\" />}\n    </div>\n  );\n};\n\n/**\n * Content Placeholder\n * Generic placeholder for various content types\n */\nexport const ContentPlaceholder: React.FC<{\n  type: 'image' | 'text' | 'video' | 'chart';\n  width?: string | number;\n  height?: string | number;\n  className?: string;\n}> = ({ type, width = '100%', height = 200, className = '' }) => {\n  const getPlaceholderContent = () => {\n    switch (type) {\n      case 'image':\n        return <div className=\"placeholder-icon\">📷</div>;\n      case 'video':\n        return <div className=\"placeholder-icon\">🎥</div>;\n      case 'chart':\n        return <div className=\"placeholder-icon\">📊</div>;\n      default:\n        return <div className=\"placeholder-icon\">📄</div>;\n    }\n  };\n\n  return (\n    <div \n      className={`content-placeholder placeholder-${type} ${className}`}\n      style={{ width, height }}\n    >\n      <ShimmerWrapper>\n        {getPlaceholderContent()}\n      </ShimmerWrapper>\n    </div>\n  );\n};\n\nexport default {\n  ProfessionalCardSkeleton,\n  DashboardHeaderSkeleton,\n  StatisticsCardsSkeleton,\n  ListItemSkeleton,\n  TimelineItemSkeleton,\n  TableSkeleton,\n  FormSkeleton,\n  PageSkeleton,\n  ShimmerWrapper,\n  ContentPlaceholder\n};
