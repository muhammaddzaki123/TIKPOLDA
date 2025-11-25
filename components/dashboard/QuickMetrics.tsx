'use client';

import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface QuickMetricProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  isPositive?: boolean;
}

export function QuickMetric({ 
  label, 
  value, 
  change, 
  changeLabel,
  isPositive = true 
}: QuickMetricProps) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {changeLabel && (
        <span className="text-xs text-slate-500">{changeLabel}</span>
      )}
    </div>
  );
}

interface MetricsSummaryCardProps {
  title: string;
  metrics: QuickMetricProps[];
}

export function MetricsSummaryCard({ title, metrics }: MetricsSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <QuickMetric key={index} {...metric} />
        ))}
      </div>
    </Card>
  );
}
