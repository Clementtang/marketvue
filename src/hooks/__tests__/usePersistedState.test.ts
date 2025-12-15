import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistedState } from '../usePersistedState';

describe('usePersistedState Hook', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    globalThis.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default value when no saved value exists', () => {
      const { result } = renderHook(() =>
        usePersistedState<string>('test-key', 'default-value')
      );

      expect(result.current[0]).toBe('default-value');
    });

    it('should load saved value from localStorage on mount', () => {
      localStorageMock['test-key'] = JSON.stringify('saved-value');

      const { result } = renderHook(() =>
        usePersistedState<string>('test-key', 'default-value')
      );

      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result.current[0]).toBe('saved-value');
    });

    it('should persist value to localStorage when state changes', async () => {
      const { result } = renderHook(() =>
        usePersistedState<string>('test-key', 'default-value')
      );

      // Wait for initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Update state
      await act(async () => {
        result.current[1]('new-value');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('new-value')
      );
      expect(result.current[0]).toBe('new-value');
    });
  });

  describe('Complex Data Types', () => {
    it('should handle object values', async () => {
      const defaultValue = { name: 'test', count: 0 };
      const { result } = renderHook(() =>
        usePersistedState('object-key', defaultValue)
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newValue = { name: 'updated', count: 5 };
      await act(async () => {
        result.current[1](newValue);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'object-key',
        JSON.stringify(newValue)
      );
      expect(result.current[0]).toEqual(newValue);
    });

    it('should handle array values', async () => {
      const defaultValue = [1, 2, 3];
      const { result } = renderHook(() =>
        usePersistedState('array-key', defaultValue)
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newValue = [4, 5, 6];
      await act(async () => {
        result.current[1](newValue);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current[0]).toEqual(newValue);
    });

    it('should handle boolean values', async () => {
      const { result } = renderHook(() =>
        usePersistedState('bool-key', false)
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current[1](true);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current[0]).toBe(true);
    });
  });

  describe('Functional Updates', () => {
    it('should support functional state updates', async () => {
      const { result } = renderHook(() =>
        usePersistedState<number>('counter-key', 0)
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current[1]((prev) => prev + 1);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current[0]).toBe(1);

      await act(async () => {
        result.current[1]((prev) => prev + 1);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current[0]).toBe(2);
    });

    it('should support functional updates with objects', async () => {
      interface State {
        count: number;
        text: string;
      }

      const defaultValue: State = { count: 0, text: 'hello' };
      const { result } = renderHook(() =>
        usePersistedState<State>('state-key', defaultValue)
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current[1]((prev) => ({ ...prev, count: prev.count + 1 }));
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current[0]).toEqual({ count: 1, text: 'hello' });
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      localStorageMock['bad-key'] = 'invalid-json{';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        usePersistedState<string>('bad-key', 'default-value')
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load "bad-key" from localStorage:',
        expect.any(Error)
      );
      expect(result.current[0]).toBe('default-value');

      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage.setItem errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() =>
        usePersistedState<string>('error-key', 'default-value')
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current[1]('new-value');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save "error-key" to localStorage:',
        expect.any(Error)
      );
      // State should still update even if localStorage fails
      expect(result.current[0]).toBe('new-value');

      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage.getItem errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const { result } = renderHook(() =>
        usePersistedState<string>('error-key', 'default-value')
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load "error-key" from localStorage:',
        expect.any(Error)
      );
      expect(result.current[0]).toBe('default-value');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Initialization Behavior', () => {
    it('should not save to localStorage before initialization completes', async () => {
      const { result } = renderHook(() =>
        usePersistedState<string>('init-key', 'default-value')
      );

      // Before useEffect runs, setItem should not be called
      expect(localStorage.setItem).not.toHaveBeenCalled();

      // Wait for initialization
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Now updates should persist
      await act(async () => {
        result.current[1]('new-value');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should only call localStorage.getItem once on mount', () => {
      renderHook(() =>
        usePersistedState<string>('single-load-key', 'default-value')
      );

      expect(localStorage.getItem).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem).toHaveBeenCalledWith('single-load-key');
    });
  });

  describe('Multiple Instances', () => {
    it('should maintain separate state for different keys', async () => {
      const { result: result1 } = renderHook(() =>
        usePersistedState<string>('key1', 'value1')
      );
      const { result: result2 } = renderHook(() =>
        usePersistedState<string>('key2', 'value2')
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result1.current[0]).toBe('value1');
      expect(result2.current[0]).toBe('value2');

      await act(async () => {
        result1.current[1]('updated1');
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result1.current[0]).toBe('updated1');
      expect(result2.current[0]).toBe('value2');
    });
  });
});
