import { Progress } from '@/components/ui/progress';

interface ConfidenceMeterProps {
  confidence: number;
  verdict: 'Verified' | 'Fake' | 'Possibly Misleading';
}

export const ConfidenceMeter = ({ confidence, verdict }: ConfidenceMeterProps) => {
  const getColorClass = (verdict: string) => {
    switch (verdict) {
      case 'Verified':
        return 'text-signal-verified';
      case 'Fake':
        return 'text-signal-fake';
      case 'Possibly Misleading':
        return 'text-signal-misleading';
      default:
        return 'text-text-secondary';
    }
  };

  const getProgressColor = (verdict: string) => {
    switch (verdict) {
      case 'Verified':
        return 'bg-signal-verified';
      case 'Fake':
        return 'bg-signal-fake';
      case 'Possibly Misleading':
        return 'bg-signal-misleading';
      default:
        return 'bg-text-secondary';
    }
  };

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <span className="text-text-secondary font-medium">Confidence Level</span>
        <span className={`text-2xl font-bold ${getColorClass(verdict)}`}>
          {confidence}%
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={confidence} 
          className="h-3 glass-surface"
        />
        <div 
          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${getProgressColor(verdict)}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <p className="text-sm text-text-muted">
        Based on AI analysis and cross-referenced sources
      </p>
    </div>
  );
};