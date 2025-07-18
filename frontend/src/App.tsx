import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { AuthProvider } from './contexts/AuthContext';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './AppRoutes';

const App: React.FC = () => (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <TooltipProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
          </TooltipProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );

export default App; 