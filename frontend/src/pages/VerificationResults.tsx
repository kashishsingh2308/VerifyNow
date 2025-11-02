import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast as sonnerToast } from 'sonner';
import { ShieldAlert, Info, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';

interface SubmittedData {
  type: 'text' | 'link' | 'image' | 'video';
  content: string | File;
}

interface VerificationResult {
  verdict: 'Real' | 'Fake' | 'Misleading' | 'Unverified';
  summary: string;
  proofs: string[];
  safety_status?: string;
  safety_check?: {
    safe: boolean;
    verdict: string;
    details: string;
    threats?: any[];
  };
}

const VerificationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get both new submission data and historical result
  const submittedData = location.state?.submittedData as SubmittedData | undefined;
  const historicalResult = location.state?.historicalResult as VerificationResult | undefined;
  const isHistoricalView = location.state?.isHistoricalView;

  const [isLoading, setIsLoading] = useState(!isHistoricalView); // Don't load if historical
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(
    historicalResult || null // Use historical result if available
  );
  const [error, setError] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    console.log('🔄 VerificationResults useEffect triggered');
    console.log('Historical view:', isHistoricalView);
    console.log('Historical result:', historicalResult);
    console.log('Submitted data:', submittedData);

    // If it's a historical view, we already have the result
    if (isHistoricalView && historicalResult) {
      console.log('📚 Displaying historical result');
      setIsLoading(false);
      setVerificationResult(historicalResult);
      sonnerToast.success('Historical result loaded');
      return;
    }

    // Prevent duplicate calls for new submissions
    if (hasVerified.current) {
      console.log('⏩ Already verified, skipping duplicate call');
      return;
    }

    if (!submittedData) {
      console.log('❌ No content submitted');
      sonnerToast.error('No content submitted', { description: 'Please submit content for verification.' });
      navigate('/');
      return;
    }

    const verifyContent = async () => {
      hasVerified.current = true;
      console.log('🚀 Starting verification process...');
      
      setIsLoading(true);
      setVerificationResult(null);
      setError(null);

      const token = localStorage.getItem('app_token');

      if (!token) {
        setError('Authentication token not found. Please log in.');
        sonnerToast.error('Authentication Required', { description: 'Please log in to verify content.' });
        setIsLoading(false);
        navigate('/auth');
        return;
      }

      let endpoint = '';
      let body: FormData | string = '';
      let headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      try {
        if (submittedData.type === 'text') {
          endpoint = '/api/verify-text';
          body = JSON.stringify({ text: submittedData.content });
          headers['Content-Type'] = 'application/json';
        } else if (submittedData.type === 'link') {
          endpoint = '/api/verify-link';
          body = JSON.stringify({ url: submittedData.content });
          headers['Content-Type'] = 'application/json';
        } else if (submittedData.type === 'image') {
          endpoint = '/api/verify-image';
        
          if (!(submittedData.content instanceof File)) {
            throw new Error('Image content is not a file.');
          }

          const formData = new FormData();
          formData.append('image', submittedData.content);
          body = formData;
        
          headers = {
            'Authorization': `Bearer ${token}`,
          };
        } else if (submittedData.type === 'video') {
          sonnerToast.info('Feature Not Available', { description: 'Video verification is not yet implemented.' });
          setIsLoading(false);
          return;
        } else {
          setError('Unsupported verification type.');
          sonnerToast.error('Invalid Request', { description: 'Unsupported verification type.' });
          setIsLoading(false);
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const apiUrl = `${BACKEND_URL}${endpoint}`;
        console.log(`📡 Sending request to: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: body,
        });

        console.log('✅ API Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Backend error:', errorData);
          throw new Error(errorData.message || 'Failed to verify content.');
        }

        const result: VerificationResult = await response.json();
        console.log('🎯 Final result received:', result);
        
        setVerificationResult(result);
        sonnerToast.success('Verification successful!', { description: `Verdict: ${result.verdict}` });

      } catch (err: any) {
        console.error('❌ Verification error:', err);
        setError(err.message || 'An unexpected error occurred during verification.');
        sonnerToast.error('Verification Failed', { description: err.message || 'Please check console for details.' });
      } finally {
        console.log('🏁 Verification process completed');
        setIsLoading(false);
      }
    };

    verifyContent();
  }, [submittedData, historicalResult, isHistoricalView, navigate]);

  // Helper function to get icon and color for verdict
  const getVerdictDisplay = (verdict: VerificationResult['verdict']) => {
    switch (verdict) {
      case 'Real':
        return { icon: <CheckCircle className="h-6 w-6 text-signal-success" />, color: 'text-signal-success', title: 'Real' };
      case 'Fake':
        return { icon: <XCircle className="h-6 w-6 text-signal-error" />, color: 'text-signal-error', title: 'Fake' };
      case 'Misleading':
        return { icon: <ShieldAlert className="h-6 w-6 text-signal-warning" />, color: 'text-signal-warning', title: 'Misleading' };
      case 'Unverified':
      default:
        return { icon: <Info className="h-6 w-6 text-text-muted" />, color: 'text-text-muted', title: 'Unverified' };
    }
  };

  const verdictDisplay = verificationResult ? getVerdictDisplay(verificationResult.verdict) : null;

  return (
    <div className="min-h-screen pt-24 pb-8 flex flex-col items-center justify-start text-foreground">
      <h1 className="text-5xl font-bold mb-12 text-center text-text-primary">
        Verification Results
      </h1>

      {isHistoricalView && (
        <div className="mb-4 text-text-secondary">
          📚 Viewing historical result
        </div>
      )}

      {isLoading && (
        <Card className="mt-8 w-full max-w-4xl glass-surface p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4 text-text-secondary">
            <span className="animate-spin text-signal-info">⚙️</span>
            <p className="text-xl font-medium">Analyzing content...</p>
          </div>
          <Progress value={Math.random() * 100} className="w-full h-2 bg-signal-info/20" />
          <p className="mt-4 text-text-muted text-sm">This may take a few moments.</p>
        </Card>
      )}

      {error && (
        <Card className="mt-8 w-full max-w-4xl border-signal-error bg-signal-error/10 text-signal-error">
          <CardHeader>
            <CardTitle>Error During Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-sm text-text-secondary">Please go back to the <a onClick={() => navigate('/')} className="text-signal-info hover:underline cursor-pointer">home page</a> and try again.</p>
          </CardContent>
        </Card>
      )}

      {verificationResult && (
        <Card className="mt-8 w-full max-w-4xl glass-surface-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className={`flex items-center gap-3 text-3xl font-bold ${verdictDisplay?.color}`}>
              {verdictDisplay?.icon}
              {verdictDisplay?.title}
            </CardTitle>
            <Badge 
              className={`
                text-lg px-4 py-2 font-semibold 
                ${verificationResult.verdict === 'Real' && 'bg-signal-success/20 text-signal-success border-signal-success'}
                ${verificationResult.verdict === 'Fake' && 'bg-signal-error/20 text-signal-error border-signal-error'}
                ${verificationResult.verdict === 'Misleading' && 'bg-signal-warning/20 text-signal-warning border-signal-warning'}
                ${verificationResult.verdict === 'Unverified' && 'bg-text-muted/20 text-text-muted border-text-muted'}
              `}
              variant="outline"
            >
              {verificationResult.verdict}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <p className="text-text-primary text-xl font-medium leading-relaxed">{verificationResult.summary}</p>
            {verificationResult.proofs && verificationResult.proofs.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-text-secondary mb-3 border-b border-text-muted/30 pb-2">Proofs/Evidence:</h3>
                <ul className="list-disc pl-5 text-text-primary space-y-2">
                  {verificationResult.proofs.map((proof, index) => (
                    <li key={index}>{proof}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-6 text-sm text-text-muted">
              Disclaimer: AI verification is a tool to assist fact-checking and should be cross-referenced with human expertise.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && (
        <button onClick={() => navigate('/')} className="btn-hero mt-12 py-3 px-8 text-lg">
          {isHistoricalView ? 'Back to History' : 'Verify New Content'}
        </button>
      )}
    </div>
  );
};

export default VerificationResults;