// src/types/jest.d.ts
import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
    }
  }
}
