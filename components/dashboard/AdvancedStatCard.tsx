'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  gradient: string;
  onClick?: () => void;
}

export function AdvancedStatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  gradient,
  onClick,
}: AdvancedStatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-5`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {value}
              </h3>
              {trend && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={`rounded-xl ${gradient} p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`h-1 ${gradient}`} />
    </Card>
  );
}
