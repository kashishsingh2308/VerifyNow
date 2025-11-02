import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type VerdictType = 'Real' | 'Fake' | 'Possibly Misleading';

interface VerdictBadgeProps {
  verdict: VerdictType;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge = ({ verdict, size = 'md' }: VerdictBadgeProps) => {
  const getVerdictConfig = (verdict: VerdictType) => {
    switch (verdict) {
      case 'Real':
        return {
          className: 'badge-verified border glow-verified',
          icon: CheckCircle,
          text: '✓ Likely Real'
        };
      case 'Fake':
        return {
          className: 'badge-fake border glow-fake',
          icon: XCircle,
          text: '✗ Likely Fake'
        };
      case 'Possibly Misleading':
        return {
          className: 'badge-misleading border',
          icon: AlertTriangle,
          text: '⚠ Possibly Misleading'
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} flex items-center space-x-2 animate-scale-in`}>
      <Icon className={`${size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      <span className="font-semibold">{config.text}</span>
    </Badge>
  );
};