import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import '@testing-library/jest-dom';
import { ErrorBoundary } from './error-boundary';

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <span>OK</span>;
}

afterEach(cleanup);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React's console.error when boundary catches
    const spy = console.error;
    console.error = () => {};
    (console as any)._errorSpy = spy;
  });

  afterEach(() => {
    if ((console as any)._errorSpy) {
      console.error = (console as any)._errorSpy;
    }
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>Child content</span>
      </ErrorBoundary>
    );
    expect(screen.getByText(/child content/i)).toBeInTheDocument();
  });

  test('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to lab home/i })).toBeInTheDocument();
  });

  test('uses custom messages when provided', () => {
    render(
      <ErrorBoundary
        messages={{
          title: 'Custom title',
          description: 'Custom description',
          reloadLabel: 'Retry',
          goHomeLabel: 'Home',
        }}
      >
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/custom title/i)).toBeInTheDocument();
    expect(screen.getByText(/custom description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
  });

});
