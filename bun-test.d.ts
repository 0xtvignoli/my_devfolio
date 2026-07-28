/** Type declarations for `bun:test` so TypeScript resolves the module. */
declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function mock<T = (...args: unknown[]) => unknown>(fn?: T): T;
  export namespace mock {
    function module(module: string, implementation: () => unknown): void;
  }
  /** The optional message is bun's own second argument, surfaced on failure. */
  export const expect: (value: unknown, message?: string) => {
    toBeInTheDocument(): void;
    toHaveAttribute(name: string, value?: string): void;
    toEqual(value: unknown): void;
    toMatch(regex: RegExp): void;
    not: {
      toEqual(value: unknown);
      toMatch(regex: RegExp): void;
      toContainText(text: string | RegExp): void;
    };
    [key: string]: (...args: unknown[]) => unknown;
  };
}
