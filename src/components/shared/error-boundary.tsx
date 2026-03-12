'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui-mui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-mui';

interface ErrorBoundaryMessages {
  title?: string;
  description?: string;
  reloadLabel?: string;
  goHomeLabel?: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  messages?: ErrorBoundaryMessages;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Qui potresti inviare l'errore a un servizio di logging come Sentry
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const m = this.props.messages;
      const title = m?.title ?? 'Something went wrong';
      const description = m?.description ?? "The Lab encountered an unexpected error. Don't worry, your data is safe.";
      const reloadLabel = m?.reloadLabel ?? 'Reload Page';
      const goHomeLabel = m?.goHomeLabel ?? 'Go to Lab Home';

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
          <Card sx={{ maxWidth: 672, width: '100%' }}>
            <CardHeader
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle style={{ height: 20, width: 20 }} />
                  <CardTitle>{title}</CardTitle>
                </div>
              }
              subheader={<CardDescription>{description}</CardDescription>}
            />
            <CardContent sx={{ '& > * + *': { mt: 2 } }}>
              {this.state.error && process.env.NODE_ENV !== 'production' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {reloadLabel}
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/lab'} className="gap-2">
                  <Home className="h-4 w-4" />
                  {goHomeLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}



