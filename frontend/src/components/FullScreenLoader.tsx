import React from 'react';
import { Loader2 } from 'lucide-react';

const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 dark:bg-background-dark/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-dark" />
    </div>
  );
};

export default FullScreenLoader; 