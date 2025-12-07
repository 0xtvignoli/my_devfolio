'use client';

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, State> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('Chart Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className={cn(
            "w-full h-[200px] sm:h-[250px] lg:h-[300px] flex items-center justify-center",
            "border border-red-200 dark:border-red-800/30 rounded-lg",
            "bg-red-50 dark:bg-red-900/10",
            this.props.className
          )}
        >
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 dark:text-red-400" aria-hidden="true" />
            <div className="text-sm font-medium text-red-900 dark:text-red-200">
              Chart Error
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">
              Unable to render chart
            </div>
            {this.props.fallback}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
