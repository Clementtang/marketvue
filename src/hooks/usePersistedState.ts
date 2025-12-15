import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state to localStorage
 *
 * This hook provides a similar API to useState, but automatically persists
 * the state to localStorage and restores it on component mount.
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
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setState(JSON.parse(saved) as T);
      }
    } catch (error) {
      console.error(`Failed to load "${key}" from localStorage:`, error);
      // If parsing fails, keep the default value
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  // Save to localStorage on state change (after initialization)
  const setPersistedState = (value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof value === 'function'
        ? (value as (prev: T) => T)(prev)
        : value;

      // Only save to localStorage after initial load is complete
      if (isInitialized) {
        try {
          localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.error(`Failed to save "${key}" to localStorage:`, error);
          // Continue with state update even if localStorage fails
        }
      }

      return newValue;
    });
  };

  return [state, setPersistedState];
}
