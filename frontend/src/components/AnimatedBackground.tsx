interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export const AnimatedBackground = ({ children }: AnimatedBackgroundProps) => {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden">
      <div className="floating-particles absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};