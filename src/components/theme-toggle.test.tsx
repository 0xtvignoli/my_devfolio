import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, test, expect, mock, afterEach } from 'bun:test';
import '@testing-library/jest-dom';
import { MuiTestWrapper } from '@/test-utils';

const setThemeMock = mock(() => {});

mock.module('next-themes', () => ({
  useTheme: () => ({ setTheme: setThemeMock, theme: 'light', resolvedTheme: 'light' }),
}));

const { ThemeToggle } = await import('./theme-toggle');

const defaultLabels = { light: 'Light', dark: 'Dark', system: 'System' };

afterEach(cleanup);

describe('ThemeToggle', () => {
  test('renders toggle button with accessible name', () => {
    render(<ThemeToggle labels={defaultLabels} />, { wrapper: MuiTestWrapper });
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
