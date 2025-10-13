import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'bun:test';
import '@testing-library/jest-dom';
import { Button } from './button';

describe('Button Component', () => {
  test('renders a button with the correct text', () => {
    render(<Button>Click Me</Button>);

    // screen.getByRole: Finds an element by its accessible role.
    // This is a good practice because it simulates how a user with assistive technology would find the element.
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    
    // expect(...).toBeInTheDocument(): Asserts that the element was found in the document.
    expect(buttonElement).toBeInTheDocument();
  });

  test('applies classes correctly', () => {
    render(<Button>Default Button</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement.className).toMatch(/inline-flex/);
    expect(buttonElement.className).toMatch(/bg-primary/);
  });

  test('renders with different variants', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement.className).toMatch(/bg-destructive/);
  });

  test('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveAttribute('disabled');
  });
});
