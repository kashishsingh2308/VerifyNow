import { ExternalLink, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
export interface Evidence {
  source: string;
  title: string;
  url: string;
  rating?: string;
  date?: string;
  snippet?: string;
  domain?: string;
  firstSeen?: string;
  imageUrl?: string;
  pageUrl?: string;
}

interface EvidenceCardProps {
  evidence: Evidence;
  type: 'factCheck' | 'reverseImage' | 'provenance';
}

export const EvidenceCard = ({ evidence, type }: EvidenceCardProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingBadge = (rating?: string) => {
    if (!rating) return null;
    
    const isPositive = rating.toLowerCase().includes('true') || 
                      rating.toLowerCase().includes('verified') ||
                      rating.toLowerCase().includes('accurate');
    
    const isNegative = rating.toLowerCase().includes('false') || 
                      rating.toLowerCase().includes('fake') ||
                      rating.toLowerCase().includes('misleading');
    
    return (
      <Badge className={
        isPositive ? 'badge-verified' : 
        isNegative ? 'badge-fake' : 
        'badge-misleading'
      }>
        {rating}
      </Badge>
    );
  };

  return (
    <Card className="glass-surface-hover animate-slide-in-right">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-text-primary line-clamp-2">
              {evidence.title}
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{evidence.source || evidence.domain}</span>
              </div>
              {(evidence.date || evidence.firstSeen) && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(evidence.date || evidence.firstSeen)}</span>
                </div>
              )}
            </div>
          </div>
          {evidence.rating && getRatingBadge(evidence.rating)}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {evidence.snippet && (
          <p className="text-text-secondary text-sm mb-4 line-clamp-3">
            {evidence.snippet}
          </p>
        )}
        
        {type === 'reverseImage' && evidence.imageUrl && (
          <div className="mb-4">
            <img 
              src={evidence.imageUrl} 
              alt="Related content" 
              className="w-full h-32 object-cover rounded-lg glass-surface"
            />
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="btn-glass w-full"
        >
          <a 
            href={evidence.url || evidence.pageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Source</span>
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};