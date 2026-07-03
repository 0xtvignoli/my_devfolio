import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, test, expect, afterEach } from 'bun:test';
import '@testing-library/jest-dom';
import { SkipLink } from './skip-link';

afterEach(cleanup);

describe('SkipLink', () => {
  test('renders link with correct href and label', () => {
    render(<SkipLink label="Skip to main content" />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  test('applies sr-only class for screen reader visibility', () => {
    render(<SkipLink label="Vai al contenuto" />);
    const link = screen.getByRole('link');
    expect(link.className).toMatch(/sr-only/);
  });
});
