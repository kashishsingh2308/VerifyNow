//import { AnimatedBackground } from '@/components/AnimatedBackground';
//import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Target, Users, Zap, Globe, Award } from 'lucide-react';

const About = () => {
  return (
    //<AnimatedBackground>
      //<Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <div className="w-24 h-24 mx-auto mb-8 glass-surface rounded-2xl flex items-center justify-center glow-info">
              <Shield className="h-12 w-12 text-signal-info" />
            </div>
            <h1 className="text-5xl font-bold text-text-primary mb-6 animate-fade-in-up">
              About VerifyNow
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
              We're on a mission to combat misinformation and help people make informed decisions 
              in an era of information overload.
            </p>
          </section>

          {/* Mission */}
          <section className="mb-16">
            <Card className="glass-surface-hover animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-text-primary flex items-center space-x-3">
                  <Target className="h-8 w-8 text-signal-info" />
                  <span>Our Mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-text-secondary text-lg leading-relaxed">
                <p className="mb-4">
                  In a world where information travels faster than verification, VerifyNow provides 
                  instant, AI-powered fact-checking to help you distinguish between real and fake content.
                </p>
                <p>
                  We combine cutting-edge artificial intelligence with trusted fact-checking databases 
                  to give you confidence in the information you consume and share.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12 animate-fade-in-up">
              How We Verify
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'AI-Powered Analysis',
                  description: 'Advanced machine learning models analyze content patterns, source credibility, and cross-reference multiple databases in real-time.'
                },
                {
                  icon: Globe,
                  title: 'Multi-Source Cross-Check',
                  description: 'We verify information against trusted fact-checking organizations like Snopes, PolitiFact, and Reuters.'
                },
                {
                  icon: Award,
                  title: 'Confidence Scoring',
                  description: 'Each verification comes with a confidence percentage, helping you understand the reliability of our analysis.'
                },
                {
                  icon: Users,
                  title: 'Community Standards',
                  description: 'Our algorithms are trained on millions of verified examples and continuously updated to catch new misinformation patterns.'
                }
              ].map((feature, index) => (
                <Card 
                  key={index} 
                  className="glass-surface-hover animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mb-4 glass-surface rounded-xl flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-signal-info" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          

          {/* Values */}
          <section>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12 animate-fade-in-up">
              Our Values
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  title: 'Transparency',
                  description: 'We show you exactly how we reached our conclusions with detailed evidence and source links.'
                },
                {
                  title: 'Accuracy',
                  description: 'Our AI models are continuously trained and updated to maintain the highest accuracy standards.'
                },
                {
                  title: 'Speed',
                  description: 'Get verification results in seconds, not hours or days.'
                },
                {
                  title: 'Privacy',
                  description: 'We respect your privacy and never store or share your personal verification queries.'
                }
              ].map((value, index) => (
                <Card 
                  key={index} 
                  className="glass-surface-hover animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 flex items-start space-x-4">
                    <Badge className="badge-verified mt-1">
                      {String(index + 1).padStart(2, '0')}
                    </Badge>
                    <div>
                      <h4 className="text-lg font-semibold text-text-primary mb-2">
                        {value.title}
                      </h4>
                      <p className="text-text-secondary leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    //</AnimatedBackground>
  );
};

export default About;