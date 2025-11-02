// src/pages/Auth.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Add validation
if (!GOOGLE_CLIENT_ID) {
  console.error('Google Client ID is missing. Check your environment variables.');
  // You can show a user-friendly error message
}
const BACKEND_GOOGLE_LOGIN_URL = `${import.meta.env.VITE_BACKEND_URL}/api/google-login`;


const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout, isAuthLoading } = useAuth();
  const [loadingGoogleLogin, setLoadingGoogleLogin] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: 'Sign In Failed',
        description: 'No credential received from Google.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingGoogleLogin(true);
    const idToken = credentialResponse.credential;

    try {
      const response = await fetch(BACKEND_GOOGLE_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok && data.token && data.user) {
        login(data.token, {
          id: data.user.id || '',
          name: data.user.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          image: data.user.image || '',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: data.message || 'Unknown server error.',
          variant: 'destructive',
        });
        logout();
      }
    } catch (error) {
      console.error('Network error:', error);
      toast({
        title: 'Login Failed',
        description: 'Network or server error occurred.',
        variant: 'destructive',
      });
      logout();
    } finally {
      setLoadingGoogleLogin(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast({
      title: 'Login Failed',
      description: 'Google Sign-In failed.',
      variant: 'destructive',
    });
    setLoadingGoogleLogin(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (isAuthLoading) {
    return (
      <main className="container mx-auto px-6 py-12 text-center">
        <p className="text-text-secondary">Checking session...</p>
      </main>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {isAuthenticated ? (
            <Card className="glass-surface-hover animate-scale-in">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl text-text-primary">
                  Welcome, {user?.name || user?.email || 'User'}!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                {user?.image && (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                  />
                )}
                <p className="text-text-secondary">Signed in as:</p>
                <p className="text-text-primary font-medium">{user?.email}</p>
                <Button onClick={handleLogout} className="w-full">
                  Log Out
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-surface-hover animate-scale-in">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl text-text-primary">
                  Sign In with Google
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center relative">
                {/* Conditionally render GoogleLogin or a loading message */}
                {loadingGoogleLogin ? (
                  <p className="text-text-secondary">Signing in...</p>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    width="100%"
                    text="signin_with"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </GoogleOAuthProvider>
  );
};

export default Auth;