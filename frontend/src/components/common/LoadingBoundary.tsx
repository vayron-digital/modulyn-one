import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonType?: 'table' | 'card' | 'form';
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({ 
  children, 
  fallback,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(false);
  }, []);

  const handleError = (error: Error) => {
    console.error('Error in boundary:', error);
    navigate('/error', { state: { error } });
  };

  if (loading) {
    return fallback || null;
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default LoadingBoundary; 