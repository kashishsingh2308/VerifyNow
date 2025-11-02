import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AnimatedBackground>
      <Navigation />
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-8 glass-surface rounded-2xl flex items-center justify-center">
            <span className="text-6xl">404</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Page Not Found</h1>
          <p className="text-xl text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="btn-hero flex items-center space-x-2">
            <a href="/">
              <Home className="h-5 w-5" />
              <span>Return to Home</span>
            </a>
          </Button>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default NotFound;
