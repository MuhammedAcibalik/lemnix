# Dashboard v2.0 Architecture Guide

## 🎯 Vision

**Optimization-First Dashboard** - LEMNİX'e özel, kesim optimizasyonu metriklerini ön planda tutan, gerçek zamanlı güncellenen modern dashboard.

## 📐 Architecture Overview

### Design Principles

1. **Optimization-First:** Cutting optimization metrics front and center
2. **Real-Time:** Live updates for active optimizations (10s polling)
3. **Actionable:** Quick actions always visible (CTA buttons)
4. **Visual Hierarchy:** F-pattern, most critical data first
5. **Glassmorphism:** Design System v2.0 full compliance
6. **Responsive:** Mobile-first (xs → xl breakpoints)
7. **Performance:** Lazy loading, code splitting, memoization

## 🏗️ Component Structure (FSD)

```
entities/dashboard/
├── model/
│   └── types.ts              # Dashboard domain types
├── api/
│   ├── dashboardApi.ts       # HTTP client
│   └── dashboardQueries.ts   # React Query hooks
└── index.ts                  # Public API

widgets/dashboard-v2/
├── hero-metrics/
│   ├── ui/
│   │   └── HeroMetricCard.tsx
│   ├── hooks/
│   │   └── useHeroMetrics.ts
│   └── index.ts
├── quick-actions/
│   ├── ui/
│   │   └── QuickActionsBar.tsx
│   └── index.ts
├── optimization-grid/
│   ├── ui/
│   │   ├── AlgoComparisonChart.tsx
│   │   ├── EfficiencyTrend.tsx
│   │   ├── WasteTimeline.tsx
│   │   └── CostSavings.tsx
│   └── index.ts
├── active-operations/
│   ├── ui/
│   │   ├── OperationCard.tsx
│   │   └── ActiveOperationsPanel.tsx
│   └── index.ts
├── smart-insights/
│   ├── ui/
│   │   └── SmartInsightsPanel.tsx
│   └── index.ts
└── activity-timeline/
    ├── ui/
    │   └── ActivityTimelinePanel.tsx
    └── index.ts

pages/DashboardPage/
└── index.tsx                 # Main composition
```

## 🎨 Layout Design

```
┌─────────────────────────────────────────────────────────┐
│  Page Header (Gradient Title)                           │
│  "Dashboard"                                             │
│  "Kesim optimizasyonu performans özeti..."             │
├─────────────────────────────────────────────────────────┤
│  Hero Metrics (4 Cards - Glassmorphism)                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐│
│  │ Aktif      │ │ Bu Hafta   │ │ Ortalama   │ │ Toplam ││
│  │ Optimiz.   │ │ Listeler   │ │ Verimlilik │ │ Fire   ││
│  │            │ │            │ │            │ │ Tasarruf│
│  │ 3 adet     │ │ 12 liste   │ │ 92.5%      │ │ 450m   ││
│  │ ↑ trend    │ │ sparkline  │ │ sparkline  │ │ ↑ trend││
│  └────────────┘ └────────────┘ └────────────┘ └────────┘│
├─────────────────────────────────────────────────────────┤
│  Quick Actions Bar (Gradient Buttons)                   │
│  [Optimizasyon Başlat] [Yeni Liste] [Geçmiş] [Rapor]  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐ ┌─────────────────────────┐│
│  │ Optimization Grid (60%) │ │ Right Column (40%)      ││
│  │                         │ │                         ││
│  │ • Algo Comparison       │ │ • Active Operations     ││
│  │   (Bar Chart)           │ │   (Real-time list)      ││
│  │                         │ │   - Queued: 2           ││
│  │ • Efficiency Trend      │ │   - Processing: 1       ││
│  │   (Line Chart - 4 algos)│ │                         ││
│  │                         │ │ • Smart Insights        ││
│  │ • Waste & Cost (Row)    │ │   - Top 3 profiles      ││
│  │   ├─ Waste Timeline     │ │   - Best algorithm      ││
│  │   └─ Cost Savings       │ │   - Peak hours          ││
│  │                         │ │                         ││
│  │                         │ │ • Activity Timeline     ││
│  │                         │ │   (Scrollable feed)     ││
│  └─────────────────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🔌 API Integration

### Backend Endpoints

```typescript
// Complete dashboard data (aggregated)
GET /api/dashboard/metrics?timeRange=7d

// Individual sections (performance optimization)
GET /api/dashboard/hero-metrics?timeRange=7d
GET /api/dashboard/optimization-performance?timeRange=7d
GET /api/dashboard/active-operations
GET /api/dashboard/insights?timeRange=7d
GET /api/dashboard/activity-timeline?limit=20&type=optimization_started
```

### Frontend Hooks

```typescript
// Complete dashboard data
const { data, isLoading } = useDashboardData({ timeRange: '7d' });

// Hero metrics only (lightweight)
const { data: heroMetrics } = useHeroMetrics({ timeRange: '7d' });

// Optimization performance
const { data: perfData } = useOptimizationPerformance({ timeRange: '7d' });

// Active operations (real-time, 10s polling)
const { data: activeOps } = useActiveOperations();

// Smart insights
const { data: insights } = useSmartInsights({ timeRange: '7d' });

// Activity timeline
const { data: timeline } = useActivityTimeline({ limit: 20 });
```

### React Query Configuration

```typescript
// Hero metrics - Refreshes every 1 min
staleTime: 1 * 60 * 1000
gcTime: 5 * 60 * 1000

// Active operations - Near real-time (5s stale, 10s poll)
staleTime: 5 * 1000
refetchInterval: 10 * 1000

// Performance data - Less frequent (5 min stale)
staleTime: 5 * 60 * 1000
gcTime: 10 * 60 * 1000
```

## 🎨 Design System v2.0 Compliance

### CardV2 Glassmorphism
```typescript
<CardV2 variant="glass" hoverable sx={{ p: ds.spacing['4'] }}>
  {content}
</CardV2>
```

### Gradient Titles
```typescript
<Typography sx={{
  fontSize: '2.25rem',
  fontWeight: 800,
  background: ds.gradients.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}>
  Dashboard
</Typography>
```

### Spacing Tokens
```typescript
p: ds.spacing['6']    // 24px padding
gap: ds.spacing['3']  // 12px gap
mb: ds.spacing['4']   // 16px margin-bottom
```

### Color Tokens
```typescript
color: ds.colors.text.primary      // #1e293b
color: ds.colors.primary.main      // #1e40af
background: alpha(ds.colors.success.main, 0.1) // 10% opacity
```

## 📊 Data Models

### Hero Metrics
```typescript
interface DashboardHeroMetrics {
  activeOptimizations: number;
  cuttingListsThisWeek: number;
  averageEfficiency: number; // 0-100
  totalWasteSaved: number; // meters
  efficiencyTrend: number[]; // Last 7 days sparkline
  wasteTrend: number[]; // Last 7 days sparkline
}
```

### Algorithm Performance
```typescript
interface AlgorithmPerformanceStats {
  algorithm: 'ffd' | 'bfd' | 'genetic' | 'pooling';
  count: number;
  avgEfficiency: number;
  avgExecutionTime: number; // ms
  avgWastePercentage: number;
  successRate: number; // 0-100
}
```

### Active Operation
```typescript
interface ActiveOperation {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  algorithm: AlgorithmType;
  itemCount: number;
  progress: number; // 0-100
  startedAt: string;
  currentGeneration?: number; // For GA
  totalGenerations?: number; // For GA
  userName?: string;
}
```

## 🚀 Performance Optimizations

### Code Splitting
```typescript
// Lazy load charts
const LazyChart = lazy(() => import('./AlgoComparisonChart'));

<Suspense fallback={<Skeleton />}>
  <LazyChart data={data} />
</Suspense>
```

### Memoization
```typescript
const formattedMetrics = useMemo(() => {
  return data?.map(formatMetric);
}, [data]);
```

### Debouncing
```typescript
const debouncedFilter = useDebounce(filter, 300);
```

## ✅ Checklist

**Design System Compliance:**
- [x] `useDesignSystem()` hook used throughout
- [x] All spacing via `ds.spacing['X']`
- [x] All colors via `ds.colors.X.Y`
- [x] CardV2 glassmorphism variant
- [x] Gradient titles (page header)
- [x] No hardcoded values

**FSD Compliance:**
- [x] Entity layer (dashboard domain)
- [x] Widgets layer (6 widgets)
- [x] Page layer (DashboardPage)
- [x] Public API pattern (`index.ts`)
- [x] Bottom-up dependencies only

**Features:**
- [x] Hero metrics (4 KPI cards)
- [x] Quick actions (4 buttons)
- [x] Algorithm comparison chart
- [x] Efficiency trend chart
- [x] Waste timeline chart
- [x] Cost savings chart
- [x] Active operations panel (real-time)
- [x] Smart insights panel
- [x] Activity timeline (filterable)

**Performance:**
- [x] Lazy loading
- [x] Code splitting
- [x] Memoization
- [x] TanStack Query caching
- [x] Polling (10s for active ops)

**Responsiveness:**
- [x] Mobile (xs, sm)
- [x] Tablet (md)
- [x] Desktop (lg, xl)
- [x] Grid layout adapts

**Empty States:**
- [x] No active operations
- [x] No data in charts
- [x] No timeline events
- [x] All have friendly messages + icons

**Error Handling:**
- [x] Error boundaries on all widgets
- [x] Loading states
- [x] Error states with retry
- [x] API error handling

## 🔗 Navigation

**Routes:**
- URL: `/dashboard`
- Keyboard shortcut: `Ctrl+D`
- Command palette: "Dashboard"

**Quick Actions:**
- Start Optimization → `/enterprise-optimization`
- New List → `/cutting-list`
- History → `/statistics`
- Export Reports → `/statistics` (with export action)

## 📝 Implementation Notes

### Backend Service (v2)

`backend/src/services/monitoring/dashboardServiceV2.ts`:
- Aggregates data from Optimization, CuttingList, UserActivity tables
- Calculates hero metrics (active count, averages, totals)
- Generates time series data (efficiency, waste, cost)
- Real-time active operations query

### API Controllers

`backend/src/controllers/dashboardControllerV2.ts`:
- Thin HTTP handlers
- Error handling
- Response formatting

### Routes

`backend/src/routes/dashboardRoutesV2.ts`:
- RESTful endpoints
- Rate limiting (default tier)
- No auth required for metrics (for now - can add later)

## 🐛 Known Limitations

1. **Mock Data:** Some time series data is mocked (waiting for real aggregation)
2. **Real-Time Updates:** Currently polling (10s), will add WebSocket later
3. **Progress Tracking:** GA progress is mocked (need real-time updates from algorithm)
4. **No Caching:** No Redis yet (TanStack Query cache only)

## 🚀 Future Enhancements

**P1 (Next Sprint):**
- Real-time WebSocket for active operations
- Actual progress tracking for GA
- Real aggregation queries (replace mocks)
- Pagination for activity timeline

**P2:**
- Dashboard customization (drag & drop widgets)
- Export dashboard as PDF
- Email reports (scheduled)
- Custom metrics widgets

**P3:**
- ML-based predictions
- Anomaly detection alerts
- A/B testing dashboard layouts
- Dark mode support

## 📄 File References

### Frontend
- [Dashboard Page](mdc:frontend/src/pages/DashboardPage/index.tsx)
- [Dashboard Entity](mdc:frontend/src/entities/dashboard/)
- [Hero Metrics Widget](mdc:frontend/src/widgets/dashboard-v2/hero-metrics/)
- [Quick Actions Widget](mdc:frontend/src/widgets/dashboard-v2/quick-actions/)
- [Optimization Grid Widget](mdc:frontend/src/widgets/dashboard-v2/optimization-grid/)
- [Active Operations Widget](mdc:frontend/src/widgets/dashboard-v2/active-operations/)
- [Smart Insights Widget](mdc:frontend/src/widgets/dashboard-v2/smart-insights/)
- [Activity Timeline Widget](mdc:frontend/src/widgets/dashboard-v2/activity-timeline/)

### Backend
- [Dashboard Service v2](mdc:backend/src/services/monitoring/dashboardServiceV2.ts)
- [Dashboard Controller v2](mdc:backend/src/controllers/dashboardControllerV2.ts)
- [Dashboard Routes v2](mdc:backend/src/routes/dashboardRoutesV2.ts)

---

**Version:** 2.0.0  
**Last Updated:** 2025-10-21  
**Status:** ✅ Implementation Complete

