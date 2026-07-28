import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, test, expect } from 'bun:test';
import '@testing-library/jest-dom';
import { MuiTestWrapper } from '@/test-utils';
import { Button } from '@/components/ui-mui';

describe('Button Component (MUI)', () => {
  test('renders a button with the correct text', () => {
    render(<Button>Click Me</Button>, { wrapper: MuiTestWrapper });
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies variant correctly', () => {
    render(<Button variant="default">Default Button</Button>, { wrapper: MuiTestWrapper });
    const buttonElement = screen.getByRole('button', { name: /default button/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>, { wrapper: MuiTestWrapper });
    const buttonElement = screen.getByRole('button', { name: /delete/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>, { wrapper: MuiTestWrapper });
    const buttonElement = screen.getByRole('button', { name: /disabled button/i });
    expect(buttonElement).toHaveAttribute('disabled');
  });
});
