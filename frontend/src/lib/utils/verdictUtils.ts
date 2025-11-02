export const verdictToColor = (verdict: string) => {
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

export const formatConfidence = (confidence: number) => {
  return `${confidence}%`;
};

export const isTrustedDomain = (domain: string) => {
  const trustedDomains = [
    'snopes.com',
    'factcheck.org',
    'politifact.com',
    'reuters.com',
    'apnews.com',
    'bbc.com',
    'cnn.com',
    'npr.org'
  ];
  
  return trustedDomains.some(trusted => domain.toLowerCase().includes(trusted));
};

export const getVerdictEmoji = (verdict: string) => {
  switch (verdict) {
    case 'Verified':
      return '✅';
    case 'Fake':
      return '❌';
    case 'Possibly Misleading':
      return '⚠️';
    default:
      return '❓';
  }
};