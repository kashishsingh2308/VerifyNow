export interface AnalysisRequest {
  type: 'text' | 'link' | 'image' | 'video';
  content: string | File;
}

export interface AnalysisResponse {
  verdict: 'Verified' | 'Fake' | 'Possibly Misleading';
  confidence: number;
  explanation: string;
  proofs: {
    factChecks: Array<{
      source: string;
      title: string;
      url: string;
      rating?: string;
      date?: string;
      snippet?: string;
    }>;
    reverseImage: Array<{
      source: string;
      title: string;
      url: string;
      imageUrl?: string;
      pageUrl?: string;
      domain?: string;
      firstSeen?: string;
    }>;
    provenance: {
      hasC2PA: boolean;
      issuer?: string;
      summary?: string;
      raw?: unknown;
    } | null;
    model: {
      name: string;
      version?: string;
      scoreBreakdown?: Record<string, number>;
      raw?: unknown;
    } | null;
  };
  requestId: string;
  createdAt: string;
  resolvedTitle?: string;
}

export interface UserVerification {
  id: string;
  verdict: 'Real' | 'Fake' | 'Misleading' | 'Unverified'; // Changed to match backend
  confidence: number;
  summary: string;
  createdAt: string;
  inputType: 'text' | 'link' | 'image' | 'video';
}