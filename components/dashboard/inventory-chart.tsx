'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetInventoryTrendQuery } from '@/lib/features/api/dashboardApi';
import { cn } from '@/lib/utils';

function formatNumber(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const W = 800;
const H = 220;

export function InventoryChart() {
  const [days, setDays] = useState(30);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useGetInventoryTrendQuery(
    { days },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const points = data?.points ?? [];

  const { min, max, span } = useMemo(() => {
    if (points.length === 0) return { min: 0, max: 1, span: 1 };
    const values = points.map((p) => p.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pad = (rawMax - rawMin) * 0.15 || rawMax * 0.05 || 1;
    return {
      min: rawMin - pad,
      max: rawMax + pad,
      span: rawMax - rawMin + pad * 2 || 1,
    };
  }, [points]);

  const firstValue = points[0]?.value ?? 0;
  const lastValue = points[points.length - 1]?.value ?? 0;
  const changePct =
    firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isUp = changePct >= 0;

  const { linePath, areaPath, coords } = useMemo(() => {
    if (points.length === 0)
      return {
        linePath: '',
        areaPath: '',
        coords: [] as { x: number; y: number; p: (typeof points)[0] }[],
      };

    const step = points.length > 1 ? W / (points.length - 1) : W;
    const coords = points.map((p, i) => {
      const x = i * step;
      const y = H - ((p.value - min) / span) * H;
      return { x, y, p };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaPath = `${d} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;
    return { linePath: d, areaPath, coords };
  }, [points, min, span]);

  const hoverPoint = hoverIdx != null ? coords[hoverIdx] : null;

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">Inventory overview</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>Stock value · last {days} days</span>
            {!isLoading && points.length > 0 && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/10 text-destructive',
                )}
              >
                {isUp ? '↑' : '↓'} {Math.abs(changePct).toFixed(2)}%
              </span>
            )}
          </CardDescription>
        </div>

        <Tabs
          value={String(days)}
          onValueChange={(v) => setDays(Number(v))}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="7" className="flex-1 sm:flex-none">
              7d
            </TabsTrigger>
            <TabsTrigger value="30" className="flex-1 sm:flex-none">
              30d
            </TabsTrigger>
            <TabsTrigger value="90" className="flex-1 sm:flex-none">
              90d
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent
        className={cn(
          'transition-opacity',
          isFetching && !isLoading && 'opacity-60',
        )}
      >
        {isLoading ? (
          <ChartSkeleton />
        ) : points.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No data yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current value</p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
                  {formatNumber(lastValue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Start of period</p>
                <p className="mt-0.5 text-sm font-medium tabular-nums text-muted-foreground">
                  {formatNumber(firstValue)}
                </p>
              </div>
            </div>

            <div className="relative">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="h-56 w-full overflow-visible"
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.35"
                      className="text-primary"
                    />
                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                      className="text-primary"
                    />
                  </linearGradient>
                  <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.5"
                      className="text-primary"
                    />
                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="1"
                      className="text-primary"
                    />
                  </linearGradient>
                </defs>

                {Array.from({ length: 5 }).map((_, i) => {
                  const y = (H / 4) * i;
                  return (
                    <line
                      key={i}
                      x1={0}
                      y1={y}
                      x2={W}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="3 6"
                      className="text-border"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}

                <path d={areaPath} fill="url(#areaFill)" />

                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineStroke)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />

                {coords.length > 0 && (
                  <g>
                    <circle
                      cx={coords[coords.length - 1].x}
                      cy={coords[coords.length - 1].y}
                      r={9}
                      className="fill-primary/25"
                    />
                    <circle
                      cx={coords[coords.length - 1].x}
                      cy={coords[coords.length - 1].y}
                      r={5}
                      className="fill-primary"
                    />
                  </g>
                )}

                {hoverPoint && (
                  <g>
                    <line
                      x1={hoverPoint.x}
                      y1={0}
                      x2={hoverPoint.x}
                      y2={H}
                      stroke="currentColor"
                      className="text-primary/40"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={hoverPoint.x}
                      cy={hoverPoint.y}
                      r={5}
                      className="fill-primary"
                    />
                    <circle
                      cx={hoverPoint.x}
                      cy={hoverPoint.y}
                      r={3}
                      className="fill-background"
                    />
                  </g>
                )}

                {coords.map((c, i) => {
                  const step = W / Math.max(1, coords.length - 1);
                  return (
                    <rect
                      key={i}
                      x={c.x - step / 2}
                      y={0}
                      width={step}
                      height={H}
                      fill="transparent"
                      onMouseEnter={() => setHoverIdx(i)}
                    />
                  );
                })}
              </svg>

              {hoverPoint && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(hoverPoint.x / W) * 100}%`,
                    top: `${(hoverPoint.y / H) * 100}%`,
                  }}
                >
                  <div className="mb-2 whitespace-nowrap rounded-md border border-border/60 bg-popover px-2 py-1 text-[10px] font-medium shadow-md">
                    <div className="text-foreground tabular-nums">
                      {formatNumber(hoverPoint.p.value)}
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {new Date(hoverPoint.p.date).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' },
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              {points
                .filter(
                  (_, i) =>
                    i % Math.max(1, Math.ceil(points.length / 5)) === 0,
                )
                .slice(0, 5)
                .map((p) => (
                  <span key={p.date}>
                    {new Date(p.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-4 rounded-full bg-gradient-to-r from-primary/40 to-primary" />
                Stock value
              </span>
              <span className="tabular-nums">
                {formatNumber(min)} — {formatNumber(max)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-56 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}