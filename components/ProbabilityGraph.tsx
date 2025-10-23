/**
 * ProbabilityGraph component
 * Displays cumulative probability curves using Recharts
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { Boss, DropItem } from '@lib/types/boss';
import {
  generateGraphData,
  getActiveLines,
  formatProbabilityPercent,
} from '@lib/utils/graphDataGenerator';

interface ProbabilityGraphProps {
  boss: Boss;
  item: DropItem;
  luckEnabled: boolean;
  badLuckMitigationEnabled: boolean;
  enrage: number;
}

export default function ProbabilityGraph({
  boss,
  item,
  luckEnabled,
  badLuckMitigationEnabled,
  enrage,
}: ProbabilityGraphProps) {
  // Generate graph data with memoization for performance
  const graphData = useMemo(() => {
    return generateGraphData({
      dropRate: item.rate,
      luckEnabled,
      blmEnabled: badLuckMitigationEnabled,
      enrage,
      boss,
      item,
      maxDataPoints: 60, // Limit to 60 points for performance
    });
  }, [item.rate, luckEnabled, badLuckMitigationEnabled, enrage, boss, item]);

  // Determine which lines to show
  const activeLines = useMemo(() => {
    return getActiveLines(
      luckEnabled,
      badLuckMitigationEnabled,
      boss.drop_mechanics.luck_applicable,
      boss.drop_mechanics.bad_luck_mitigation,
    );
  }, [luckEnabled, badLuckMitigationEnabled, boss]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded p-3 shadow-lg">
        <p className="text-sm font-semibold text-white mb-2">
          {data.attempts} kills
        </p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatProbabilityPercent(entry.value)}
            </p>
          ))}
        </div>
      </div>
    );
  };

  // Custom Y-axis tick formatter
  const formatYAxis = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  // Custom X-axis tick formatter
  const formatXAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={graphData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="attempts"
            stroke="#94a3b8"
            tickFormatter={formatXAxis}
            label={{
              value: 'Number of Kills',
              position: 'insideBottom',
              offset: -5,
              fill: '#94a3b8',
            }}
          />

          <YAxis
            stroke="#94a3b8"
            tickFormatter={formatYAxis}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            label={{
              value: 'Probability',
              angle: -90,
              position: 'insideLeft',
              fill: '#94a3b8',
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
            iconType="line"
          />

          {/* Reference lines at 50%, 90%, 99% */}
          <ReferenceLine
            y={0.5}
            stroke="#64748b"
            strokeDasharray="5 5"
            label={{ value: '50%', fill: '#94a3b8', fontSize: 12 }}
          />
          <ReferenceLine
            y={0.9}
            stroke="#64748b"
            strokeDasharray="5 5"
            label={{ value: '90%', fill: '#94a3b8', fontSize: 12 }}
          />
          <ReferenceLine
            y={0.99}
            stroke="#64748b"
            strokeDasharray="5 5"
            label={{ value: '99%', fill: '#94a3b8', fontSize: 12 }}
          />

          {/* Base probability line (always shown) */}
          {activeLines.showBase && (
            <Line
              type="monotone"
              dataKey="base"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Base rate"
              isAnimationActive={false}
            />
          )}

          {/* Luck-only line */}
          {activeLines.showLuck && (
            <Line
              type="monotone"
              dataKey="withLuck"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="With Luck"
              isAnimationActive={false}
            />
          )}

          {/* BLM-only line */}
          {activeLines.showBLM && (
            <Line
              type="monotone"
              dataKey="withBLM"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="With BLM"
              isAnimationActive={false}
            />
          )}

          {/* Combined (Luck + BLM) line */}
          {activeLines.showBoth && (
            <Line
              type="monotone"
              dataKey="withBoth"
              stroke="url(#gradient)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="With Luck + BLM"
              isAnimationActive={false}
            />
          )}

          {/* Gradient definition for combined line */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
