'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  gradient: string;
  accentColor: string;
  onClick?: () => void;
}

export function PremiumStatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  gradient,
  accentColor,
  onClick,
}: PremiumStatCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden border-0 shadow-lg transition-all duration-500 hover:shadow-2xl ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-150" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-150" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`rounded-lg bg-white/20 p-2 backdrop-blur-sm`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                {title}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-white tracking-tight">
                {value}
              </h3>
              
              {subtitle && (
                <p className="text-sm text-white/70 font-medium">
                  {subtitle}
                </p>
              )}
              
              {trend && (
                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      trend.isPositive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    <svg
                      className={`h-3 w-3 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span>{Math.abs(trend.value).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line with animation */}
      <div className={`absolute bottom-0 left-0 h-1 w-full ${accentColor} transition-all duration-500 group-hover:h-2`} />
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      </div>
    </Card>
  );
}
