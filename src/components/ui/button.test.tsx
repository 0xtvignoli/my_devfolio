import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test('applies the correct default variant class', () => {
    render(<Button>Default Button</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('bg-primary');
  });

  test('applies a destructive variant class', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('bg-destructive');
  });

  test('is disabled when the disabled prop is passed', () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
  });
});
