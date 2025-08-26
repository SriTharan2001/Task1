// src/types/jest.d.ts
import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string): R;
      toBeRequired(): R;
      toHaveClass(className: string): R;
    }
  }
}
