import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { TenantProvider } from './contexts/TenantContext';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App-level error caught:', error, errorInfo);
      }}
      showDetails={import.meta.env.DEV}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <TooltipProvider>
              <SidebarProvider>
                <AuthProvider>
                  <TenantProvider>
                    <ToastProvider>
                      <AppRoutes />
                    </ToastProvider>
                  </TenantProvider>
                </AuthProvider>
              </SidebarProvider>
            </TooltipProvider>
          </ThemeProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App; 