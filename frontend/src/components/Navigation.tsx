// src/components/Navigation.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, History, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth'; // Import the useAuth hook

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth(); // Destructure user, isAuthenticated, logout from useAuth

  // Helper function to get initials for AvatarFallback
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U'; // Default fallback
  };

  // Handle sign out
  const handleSignOut = () => {
    logout(); // Call logout function from useAuth
    navigate('/auth'); // Redirect to auth page after logout
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-surface border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Left Section — Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl glass-surface group-hover:glow-info transition-all duration-300">
              <Shield className="h-8 w-8 text-signal-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">VerifyNow</h1>
              <p className="text-sm text-text-secondary">Spot Fake News. Stay Informed.</p>
            </div>
          </Link>

          {/* Center Section — Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/')
                  ? 'text-signal-info bg-signal-info/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-brand-glass'
              }`}
            >
              Verify
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/about')
                  ? 'text-signal-info bg-signal-info/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-brand-glass'
              }`}
            >
              About
            </Link>

            {/* History link only shows if authenticated */}
            {isAuthenticated && (
              <Link
                to="/history"
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/history')
                    ? 'text-signal-info bg-signal-info/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-brand-glass'
                }`}
              >
                History
              </Link>
            )}
          </div>

          {/* Right Section — User / Sign In */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? ( // Conditional rendering based on isAuthenticated from useAuth
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full glass-surface"
                    title={`Logged in as ${user?.name || user?.email || 'User'}`} // Use user data from useAuth
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} /> {/* Display user image */}
                      <AvatarFallback className="bg-signal-info/20 text-signal-info text-lg font-bold">
                        {getUserInitials(user?.name, user?.email)} {/* Display initials */}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 glass-surface" align="end">
                  <div className="flex flex-col space-y-1 p-2 border-b border-white/10">
                    <p className="text-sm font-medium text-text-primary">
                      {/* Display user name */}
                      {user?.name || 'User Name'}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-text-muted truncate">
                        {/* Display user email */}
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="flex items-center space-x-2 cursor-pointer">
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut} // Use handleSignOut for logout
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // If not authenticated, show Sign In button
              <Link to="/auth">
                <Button variant="default" className="btn-glass flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};