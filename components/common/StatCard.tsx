import React from 'react';
import { LucideIcon } from 'lucide-react';

type StatVariant =
  | 'olive'
  | 'terracotta'
  | 'warm-yellow'
  | 'soft-blue'
  | 'soft-orange'
  | 'soft-pink'
  | 'sage'
  | 'emerald'
  | 'blue'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'slate';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: StatVariant;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'olive',
  onClick,
}) => {
  const variantStyles: Record<StatVariant, { icon: string; accent: string; bar: string }> = {
    olive:        { icon: 'bg-olive-100 text-olive-600 border border-olive-200',        accent: 'text-olive-600',       bar: 'bg-olive-500' },
    terracotta:   { icon: 'bg-terracotta-100 text-terracotta-600 border border-terracotta-200', accent: 'text-terracotta-600', bar: 'bg-terracotta-500' },
    'warm-yellow':{ icon: 'bg-warm-yellow-100 text-warm-yellow-600 border border-warm-yellow-200', accent: 'text-warm-yellow-600', bar: 'bg-warm-yellow-400' },
    'soft-blue':  { icon: 'bg-soft-blue-100 text-soft-blue-600 border border-soft-blue-200', accent: 'text-soft-blue-600', bar: 'bg-soft-blue-500' },
    'soft-orange':{ icon: 'bg-soft-orange-100 text-soft-orange-600 border border-soft-orange-200', accent: 'text-soft-orange-600', bar: 'bg-soft-orange-500' },
    'soft-pink':  { icon: 'bg-soft-pink-100 text-soft-pink-600 border border-soft-pink-200', accent: 'text-soft-pink-600', bar: 'bg-soft-pink-500' },
    sage:         { icon: 'bg-sage-100 text-sage-600 border border-sage-200',           accent: 'text-sage-600',        bar: 'bg-sage-500' },
    emerald:      { icon: 'bg-olive-100 text-olive-600 border border-olive-200',        accent: 'text-olive-600',       bar: 'bg-olive-500' },
    blue:         { icon: 'bg-soft-blue-100 text-soft-blue-600 border border-soft-blue-200', accent: 'text-soft-blue-600', bar: 'bg-soft-blue-500' },
    purple:       { icon: 'bg-soft-pink-100 text-soft-pink-600 border border-soft-pink-200', accent: 'text-soft-pink-600', bar: 'bg-soft-pink-500' },
    amber:        { icon: 'bg-warm-yellow-100 text-warm-yellow-600 border border-warm-yellow-200', accent: 'text-warm-yellow-600', bar: 'bg-warm-yellow-400' },
    rose:         { icon: 'bg-terracotta-100 text-terracotta-600 border border-terracotta-200', accent: 'text-terracotta-600', bar: 'bg-terracotta-500' },
    slate:        { icon: 'bg-earth-card-soft text-earth-text border border-earth-border', accent: 'text-earth-muted', bar: 'bg-earth-border' },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`bg-earth-card border border-earth-border rounded-2xl p-5 shadow-card relative overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Subtle top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${styles.bar} opacity-60 rounded-t-2xl`} />

      <div className="flex items-start justify-between mt-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-earth-muted uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-2xl font-extrabold text-earth-text mt-1.5 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-earth-muted mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span className={trend.isPositive ? 'text-olive-600' : 'text-terracotta-600'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-earth-muted">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ml-3 ${styles.icon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
