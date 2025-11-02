import { VerdictBadge, VerdictType } from './VerdictBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ResultCardProps {
  verdict: VerdictType;
  confidence: number;
  explanation: string;
}

export const ResultCard = ({ verdict, confidence, explanation }: ResultCardProps) => {
  return (
    <Card className="glass-surface-hover w-full max-w-2xl mx-auto animate-scale-in">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <VerdictBadge verdict={verdict} size="lg" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          Analysis Complete
        </h2>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ConfidenceMeter verdict={verdict} confidence={confidence} />
        
        <Separator className="border-text-muted/20" />
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Explanation
          </h3>
          <p className="text-text-secondary leading-relaxed">
            {explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};