import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, FileText, Link as LinkIcon, Image, Eye } from 'lucide-react';

// Define proper interface for verification history
interface VerificationHistory {
  id: string;
  verdict: 'Real' | 'Fake' | 'Misleading' | 'Unverified';
  summary: string;
  proofs?: any; // Make proofs optional and flexible
  confidence: number;
  inputType: 'text' | 'link' | 'image';
  createdAt: string;
}

const History = () => {
  const [verifications, setVerifications] = useState<VerificationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('app_token');
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${BACKEND_URL}/api/verification-history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const historyData = await response.json();
        setVerifications(historyData);
      } catch (error) {
        console.error('Error fetching history:', error);
        setVerifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
  };

  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return FileText;
      case 'link':
        return LinkIcon;
      case 'image':
        return Image;
      default:
        return FileText;
    }
  };

  // Safe function to get proofs array
  const getProofs = (verification: VerificationHistory): string[] => {
    if (!verification.proofs) return [];
    if (Array.isArray(verification.proofs)) return verification.proofs;
    if (typeof verification.proofs === 'string') {
      try {
        const parsed = JSON.parse(verification.proofs);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [verification.proofs];
      }
    }
    return [];
  };

  return (
    <AnimatedBackground>
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4 animate-fade-in-up">
              Verification History
            </h1>
            <p className="text-text-secondary text-lg animate-fade-in-up">
              View your recent fact-checking activities and results
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="glass-surface">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : verifications.length === 0 ? (
            <Card className="glass-surface text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 glass-surface rounded-2xl flex items-center justify-center">
                    <Clock className="h-10 w-10 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No Verifications Yet
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Start fact-checking content to see your verification history here.
                  </p>
                  <Link to="/">
                    <Button className="btn-hero">
                      Start Verifying
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification, index) => {
                const Icon = getInputTypeIcon(verification.inputType);
                const proofs = getProofs(verification);
                
                return (
                  <Card 
                    key={verification.id} 
                    className="glass-surface-hover animate-slide-in-right"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 glass-surface rounded-xl">
                          <Icon className="h-6 w-6 text-signal-info" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              verification.verdict === 'Real' ? 'bg-green-100 text-green-800' :
                              verification.verdict === 'Fake' ? 'bg-red-100 text-red-800' :
                              verification.verdict === 'Misleading' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {verification.verdict}
                            </span>
                            <span className="text-sm text-text-secondary font-medium">
                              {verification.confidence}% confidence
                            </span>
                          </div>
                          
                          <p className="text-text-primary font-medium mb-2 line-clamp-2">
                            {verification.summary}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-text-muted">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(verification.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Icon className="h-4 w-4" />
                              <span className="capitalize">{verification.inputType}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="btn-glass flex items-center space-x-2"
                        >
                          <Link 
                            to="/verify" 
                            state={{ 
                              historicalResult: {
                                verdict: verification.verdict,
                                summary: verification.summary,
                                proofs: proofs,
                                confidence: verification.confidence
                              },
                              isHistoricalView: true
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AnimatedBackground>
  );
};

export default History;