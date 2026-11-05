import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, test, expect, mock, afterEach } from 'bun:test';
import '@testing-library/jest-dom';

const setThemeMock = mock(() => {});

mock.module('next-themes', () => ({
  useTheme: () => ({ setTheme: setThemeMock, theme: 'light', resolvedTheme: 'light' }),
}));

const { ThemeToggle } = await import('./theme-toggle');

const defaultLabels = { light: 'Light', dark: 'Dark', system: 'System' };

afterEach(cleanup);

describe('ThemeToggle', () => {
  test('renders a single theme toggle button', () => {
    render(<ThemeToggle labels={defaultLabels} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('toggles from light to dark on click', () => {
    render(<ThemeToggle labels={defaultLabels} />);
    fireEvent.click(screen.getByRole('button'));
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });
});
