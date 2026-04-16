import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-600',
  warning: 'bg-amber-500/10 text-amber-600',
  destructive: 'bg-destructive/10 text-destructive',
};

export default function KpiCard({ title, value, subtitle, icon: Icon, color = 'primary' }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
      <div className={cn("p-2.5 rounded-lg", colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
