import { useState, useCallback } from "react";

/**
 * Custom hook for persisting state to localStorage
 *
 * Uses synchronous lazy initializer to read from localStorage on first render,
 * avoiding UI flicker and double API requests that occur with useEffect-based approaches.
 *
 * @template T - The type of the state value
 * @param key - The localStorage key to use for persistence
 * @param defaultValue - The default value if no saved value exists
 * @returns A tuple of [state, setState] similar to useState
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = usePersistedState<'light' | 'dark'>('theme', 'light');
 * ```
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        try {
          return JSON.parse(saved) as T;
        } catch {
          // Handle legacy plain strings (e.g. "candlestick" stored without JSON.stringify)
          localStorage.setItem(key, JSON.stringify(saved));
          return saved as unknown as T;
        }
      }
    } catch {
      // localStorage unavailable (e.g. Safari private mode)
    }
    return defaultValue;
  });

  const setPersistedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.error(`Failed to save "${key}" to localStorage:`, error);
        }

        return newValue;
      });
    },
    [key],
  );

  return [state, setPersistedState];
}
