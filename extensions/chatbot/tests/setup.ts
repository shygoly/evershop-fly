/**
 * Jest setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = jest.fn();

// Mock EventSource
global.EventSource = jest.fn() as any;

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  (global.fetch as jest.Mock).mockClear();
  (global.EventSource as jest.Mock).mockClear();
});

