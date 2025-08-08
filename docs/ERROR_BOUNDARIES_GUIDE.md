# Error Boundaries Implementation Guide

## 🚀 Overview

This guide covers the comprehensive Error Boundary system implemented across the CRM application to catch JavaScript errors anywhere in the component tree and display graceful fallback UIs instead of crashing the app.

## 📦 Components

### 1. ErrorBoundary (Base Component)

The main Error Boundary component that catches JavaScript errors and displays a fallback UI.

**Location**: `frontend/src/components/common/ErrorBoundary.tsx`

**Features**:
- Catches JavaScript errors in component tree
- Customizable fallback UI
- Error logging and reporting
- Retry functionality
- Navigation options (Home, Back, Reload)
- Error ID generation for tracking

**Usage**:
```tsx
import ErrorBoundary from '../../components/common/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo);
  }}
  showDetails={import.meta.env.DEV}
  resetOnPropsChange={true}
>
  <YourComponent />
</ErrorBoundary>
```

### 2. PageErrorBoundary (Page-Level)

Specialized Error Boundary for page-level errors with enhanced UI and reporting.

**Location**: `frontend/src/components/common/PageErrorBoundary.tsx`

**Features**:
- Page-specific error reporting
- Enhanced fallback UI with contact support
- Technical details toggle
- Comprehensive error logging
- User-friendly error messages

**Usage**:
```tsx
import PageErrorBoundary from '../../components/common/PageErrorBoundary';

<PageErrorBoundary
  pageName="Dashboard"
  showDetails={import.meta.env.DEV}
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
>
  <DashboardPage />
</PageErrorBoundary>
```

### 3. ComponentErrorBoundary (Component-Level)

Lightweight Error Boundary for component-level errors with minimal UI disruption.

**Location**: `frontend/src/components/common/ComponentErrorBoundary.tsx`

**Features**:
- Minimal fallback UI
- Component-specific error reporting
- Optional retry functionality
- Non-disruptive error handling

**Usage**:
```tsx
import ComponentErrorBoundary from '../../components/common/ComponentErrorBoundary';

<ComponentErrorBoundary
  componentName="DataTable"
  showRetry={true}
  fallback={<div>Custom fallback UI</div>}
>
  <DataTable data={data} />
</ComponentErrorBoundary>
```

## 🔧 Hooks

### 1. useErrorBoundary

Custom hook for error boundary functionality in functional components.

**Location**: `frontend/src/hooks/useErrorBoundary.ts`

**Features**:
- Error state management
- Error capture and logging
- Reset functionality
- Error reporting utilities

**Usage**:
```tsx
import { useErrorBoundary } from '../../hooks/useErrorBoundary';

const MyComponent = () => {
  const { error, hasError, resetError, captureError } = useErrorBoundary();

  if (hasError) {
    return <div>Error occurred: {error?.message}</div>;
  }

  return <YourContent />;
};
```

### 2. useAsyncError

Hook for handling async errors in functional components.

**Usage**:
```tsx
import { useAsyncError } from '../../hooks/useErrorBoundary';

const MyComponent = () => {
  const throwError = useAsyncError();

  const handleAsyncOperation = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      throwError(error);
    }
  };

  return <YourContent />;
};
```

### 3. useErrorReporting

Hook for error reporting and analytics.

**Usage**:
```tsx
import { useErrorReporting } from '../../hooks/useErrorBoundary';

const MyComponent = () => {
  const { reportError, reportUserAction } = useErrorReporting();

  const handleError = (error) => {
    const errorId = reportError(error, { context: 'user-action' });
    console.log('Error reported with ID:', errorId);
  };

  const handleUserAction = () => {
    reportUserAction('button-click', { button: 'submit' });
  };

  return <YourContent />;
};
```

## 🎯 Implementation Strategy

### 1. App-Level Error Boundary

Wraps the entire application to catch any unhandled errors.

```tsx
// App.tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('App-level error caught:', error, errorInfo);
  }}
  showDetails={import.meta.env.DEV}
>
  <YourApp />
</ErrorBoundary>
```

### 2. Page-Level Error Boundaries

Each page is wrapped with PageErrorBoundary for specific error handling.

```tsx
// AppRoutes.tsx
<PageErrorBoundary pageName="Dashboard" showDetails={import.meta.env.DEV}>
  <Suspense fallback={<PageLoader />}>
    <Dashboard />
  </Suspense>
</PageErrorBoundary>
```

### 3. Component-Level Error Boundaries

Critical components are wrapped with ComponentErrorBoundary.

```tsx
// DashboardLayout.tsx
<ComponentErrorBoundary componentName="DashboardLayout">
  <Outlet />
</ComponentErrorBoundary>
```

## 🔄 Error Flow

1. **Error Occurs**: JavaScript error in component
2. **Error Boundary Catches**: Nearest error boundary catches the error
3. **Error Logging**: Error is logged with context and error ID
4. **Fallback UI**: User sees appropriate fallback UI
5. **Error Reporting**: Error sent to tracking service (if configured)
6. **User Recovery**: User can retry, navigate away, or contact support

## 🎨 Customization

### Custom Fallback UI

```tsx
<ErrorBoundary
  fallback={
    <div className="custom-error-ui">
      <h2>Something went wrong</h2>
      <p>Please try again later</p>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### Custom Error Handling

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling logic
    analytics.trackError(error);
    notifyTeam(error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Error Boundary with Context

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Error in user dashboard:', error, errorInfo);
  }}
  showDetails={import.meta.env.DEV}
  resetOnPropsChange={true}
>
  <UserDashboard />
</ErrorBoundary>
```

## 🚨 Best Practices

### 1. Strategic Placement

- **App Level**: Catch all unhandled errors
- **Page Level**: Handle page-specific errors
- **Component Level**: Handle component-specific errors
- **Critical Paths**: Wrap data-fetching components

### 2. Error Reporting

```tsx
// Always include context
onError={(error, errorInfo) => {
  console.error('Error in component:', {
    component: 'UserProfile',
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
}}
```

### 3. User Experience

- Provide clear error messages
- Offer recovery options (retry, navigate, contact support)
- Don't show technical details in production
- Include error IDs for support

### 4. Performance

- Don't wrap every component
- Use component-level boundaries sparingly
- Reset error boundaries when props change
- Avoid expensive operations in error handlers

## 🔧 Integration with Error Tracking Services

### Sentry Integration

```tsx
// In your error boundary
private logErrorToService(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, {
    extra: {
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  });
}
```

### LogRocket Integration

```tsx
// In your error boundary
private logErrorToService(error: Error, errorInfo: ErrorInfo) {
  LogRocket.captureException(error, {
    tags: {
      errorId: this.state.errorId,
      component: this.props.componentName
    },
    extra: {
      componentStack: errorInfo.componentStack
    }
  });
}
```

## 📊 Error Monitoring

### Error Metrics to Track

1. **Error Frequency**: How often errors occur
2. **Error Types**: Most common error types
3. **User Impact**: How many users are affected
4. **Recovery Rate**: How often users successfully recover
5. **Error Context**: Which components/pages have most errors

### Error Dashboard

Create a dashboard to monitor:
- Error rates by page/component
- User recovery actions
- Error trends over time
- Most common error patterns

## 🚨 Common Pitfalls

### 1. Over-Wrapping

```tsx
// ❌ Bad - Too many error boundaries
<ErrorBoundary>
  <ErrorBoundary>
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  </ErrorBoundary>
</ErrorBoundary>

// ✅ Good - Strategic placement
<ErrorBoundary>
  <Page>
    <ComponentErrorBoundary>
      <CriticalComponent />
    </ComponentErrorBoundary>
  </Page>
</ErrorBoundary>
```

### 2. Ignoring Async Errors

```tsx
// ❌ Bad - Async errors not handled
const handleClick = async () => {
  const data = await fetchData(); // Error not caught
};

// ✅ Good - Async errors handled
const handleClick = async () => {
  try {
    const data = await fetchData();
  } catch (error) {
    throwError(error); // Caught by error boundary
  }
};
```

### 3. Not Providing Recovery Options

```tsx
// ❌ Bad - No recovery options
<ErrorBoundary>
  <Component />
</ErrorBoundary>

// ✅ Good - Recovery options provided
<ErrorBoundary
  onError={handleError}
  showDetails={import.meta.env.DEV}
>
  <Component />
</ErrorBoundary>
```

## 🔗 Related Files

- `frontend/src/components/common/ErrorBoundary.tsx`
- `frontend/src/components/common/PageErrorBoundary.tsx`
- `frontend/src/components/common/ComponentErrorBoundary.tsx`
- `frontend/src/hooks/useErrorBoundary.ts`
- `frontend/src/App.tsx` (app-level error boundary)
- `frontend/src/AppRoutes.tsx` (page-level error boundaries)
- `frontend/src/components/layout/DashboardLayout.tsx` (component-level error boundary)

## 🎯 Next Steps

1. **Configure Error Tracking Service**: Integrate with Sentry, LogRocket, or similar
2. **Add Error Analytics**: Track error patterns and user recovery
3. **Create Error Dashboard**: Monitor error rates and trends
4. **Implement Error Recovery**: Add automatic retry mechanisms
5. **User Feedback**: Collect user feedback on error experiences 