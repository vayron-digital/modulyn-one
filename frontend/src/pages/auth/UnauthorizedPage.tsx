import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <ShieldAlert className="h-16 w-16 mx-auto text-destructive" />
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 