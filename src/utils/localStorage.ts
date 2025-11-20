/**
 * Type-safe localStorage utilities with error handling
 */

/**
 * Get item from localStorage with type safety
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 * @returns The parsed value or default value
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with type safety
 * @param key - The localStorage key
 * @param value - The value to store
 * @returns True if successful, false otherwise
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param key - The localStorage key to remove
 * @returns True if successful, false otherwise
 */
export function removeLocalStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * @returns True if successful, false otherwise
 */
export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns True if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
