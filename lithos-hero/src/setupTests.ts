// src/setupTests.ts
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});
