// src/pages/Index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerifyTabs } from '@/components/VerifyTabs';
import { CheckCircle, Search, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-bg.jpg';
import { toast as sonnerToast } from 'sonner'; // Add Sonner toast import

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { type: 'text' | 'link' | 'image' ; content: string | File }) => {
    // Basic validation for content existence before navigating
    if (typeof data.content === 'string' && !data.content.trim()) {
      sonnerToast.error('Input Required', { description: 'Please enter content to verify.' });
      return;
    }
    if (data.type === 'image') {
      if (!(data.content instanceof File)) {
        sonnerToast.error('Input Required', { description: 'Please select a file to upload.' });
        return;
      }
    }

    // For link type, validate URL format
    if (data.type === 'link') {
      const url = data.content as string;
      try {
        new URL(url); // This will throw an error for invalid URLs
      } catch (error) {
        sonnerToast.error('Invalid URL', { description: 'Please enter a valid URL starting with http:// or https://' });
        return;
      }
    }

    setIsLoading(true);

    // Navigate to results page with the submitted data
    navigate('/verify', { state: { submittedData: data } });
  
    // Reset loading state after a short delay
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <main className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <div 
          className="absolute inset-0 opacity-10 rounded-3xl"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-text-primary mb-6 animate-fade-in-up">
            Spot Fake News.
            <br />
            <span className="text-signal-info">Stay Informed.</span>
          </h1>
          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Instantly verify news articles, social media posts and images using 
            advanced AI analysis and real-time fact-checking.
          </p>
        </div>
      </section>

      {/* Verification Form */}
      <section className="mb-16">
        {/* Pass isLoading to VerifyTabs so its button correctly shows "Analyzing..." */}
        <VerifyTabs onSubmit={handleSubmit} isLoading={isLoading} />
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text-primary mb-4 animate-fade-in-up">
            How It Works
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto animate-fade-in-up">
            Our AI-powered verification process combines multiple sources and techniques
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: '01',
              icon: Search,
              title: 'Submit Content',
              description: 'Upload text, links or images you want to fact-check'
            },
            {
              step: '02',
              icon: Shield,
              title: 'AI Analysis',
              description: 'Advanced algorithms cross-reference multiple databases and sources'
            },
            {
              step: '03',
              icon: CheckCircle,
              title: 'Get Results',
              description: 'Receive detailed verification with confidence scores and proof'
            }
          ].map((item, index) => (
            <Card key={index} className="glass-surface-hover text-center animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 glass-surface rounded-2xl flex items-center justify-center glow-info">
                  <item.icon className="h-8 w-8 text-signal-info" />
                </div>
                <div className="text-signal-info font-bold text-sm mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-text-primary mb-4">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-text-primary mb-8 animate-fade-in-up">
            Trusted by Thousands
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6 animate-fade-in-up">
            {[
              'AI-Powered Analysis',
              'Real-time Verification', 
              'Multiple Source Cross-check',
              'Confidence Scoring',
              'Evidence Tracking'
            ].map((feature, index) => (
              <Badge key={index} className="badge-verified text-sm px-4 py-2">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;