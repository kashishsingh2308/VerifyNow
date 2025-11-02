import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter.tsx';
import { VerdictBadge } from '../components/ui/VerdictBadge.tsx';
import { EvidenceCard, Evidence } from '../components/ui/EvidenceCard.tsx';
import './Verify.css';

interface VerificationResult {
  verdict: 'Real' | 'Fake' | 'Misleading' | 'Unverified';
  summary: string;
  proofs: string[];
}

const verdictMapping: Record<VerificationResult['verdict'], 'Verified' | 'Fake' | 'Possibly Misleading'> = {
  Real: 'Verified',
  Fake: 'Fake',
  Misleading: 'Possibly Misleading',
  Unverified: 'Possibly Misleading'
};

const getConfidenceScore = (verdict: VerificationResult['verdict']): number => {
  switch (verdict) {
    case 'Real': return 90;
    case 'Fake': return 85;
    case 'Misleading': return 60;
    case 'Unverified': return 30;
    default: return 0;
  }
};

const VerifyImage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setVerificationResult(null);
      setError(null);
    }
  };

  const handleVerifyImage = async () => {
    if (!selectedFile) return setError('Please select an image.');
    if (!token) return navigate('/auth');

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/analyze/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(data.message || 'Image verification failed.');
      }

      const data: VerificationResult = await response.json();
      setVerificationResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <h1>Verify Image Content</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleVerifyImage} disabled={isLoading || !selectedFile}>
        {isLoading ? 'Verifying...' : 'Verify Image'}
      </button>

      {error && <p className="error-message">{error}</p>}

      {verificationResult && (
        <div className="results-section">
          <div className="verdict-display">
            <VerdictBadge verdict={verdictMapping[verificationResult.verdict]} />
            <ConfidenceMeter
              confidence={getConfidenceScore(verificationResult.verdict)}
              verdict={verdictMapping[verificationResult.verdict]}
            />
          </div>

          <h3>Summary:</h3>
          <p>{verificationResult.summary}</p>

          <h3>Proofs:</h3>
          <div className="proofs-list">
            {verificationResult.proofs.map((proof, idx) => (
              <EvidenceCard
                key={idx}
                evidence={{
                  title: proof,
                  source: 'AI Verification',
                  url: '#'
                } as Evidence}
                type="factCheck"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyImage;
