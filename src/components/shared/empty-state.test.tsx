import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, afterEach } from 'bun:test';
import '@testing-library/jest-dom';
import { EmptyState } from './empty-state';

afterEach(cleanup);

describe('EmptyState', () => {
  test('renders title', () => {
    render(<EmptyState title="No articles yet" />);
    expect(screen.getByRole('heading', { level: 2, name: /no articles yet/i })).toBeInTheDocument();
  });

  test('renders description when provided', () => {
    render(
      <EmptyState
        title="Empty"
        description="Nothing to show here."
      />
    );
    expect(screen.getByText(/nothing to show here/i)).toBeInTheDocument();
  });

  test('renders action when provided', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button type="button">Go back</button>}
      />
    );
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  test('has role status and aria-live for screen readers', () => {
    render(<EmptyState title="Empty" />);
    const wrapper = screen.getByRole('status');
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
  });
});
