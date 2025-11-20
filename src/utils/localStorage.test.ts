import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  clearLocalStorage,
  isLocalStorageAvailable
} from './localStorage';

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getLocalStorageItem', () => {
    it('should return stored value when key exists', () => {
      const testData = { value: 123, name: 'test' };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const result = getLocalStorageItem('testKey', { value: 0, name: '' });

      expect(result).toEqual(testData);
    });

    it('should return default value when key does not exist', () => {
      const defaultValue = { value: 999 };
      const result = getLocalStorageItem('nonexistent', defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it('should handle primitive types correctly', () => {
      localStorage.setItem('stringKey', JSON.stringify('hello'));
      localStorage.setItem('numberKey', JSON.stringify(42));
      localStorage.setItem('booleanKey', JSON.stringify(true));

      expect(getLocalStorageItem('stringKey', '')).toBe('hello');
      expect(getLocalStorageItem('numberKey', 0)).toBe(42);
      expect(getLocalStorageItem('booleanKey', false)).toBe(true);
    });

    it('should return default value when JSON parsing fails', () => {
      localStorage.setItem('invalidJSON', '{invalid json}');
      const defaultValue = { error: 'default' };

      const result = getLocalStorageItem('invalidJSON', defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it('should handle array types', () => {
      const testArray = [1, 2, 3, 4, 5];
      localStorage.setItem('arrayKey', JSON.stringify(testArray));

      const result = getLocalStorageItem('arrayKey', []);

      expect(result).toEqual(testArray);
    });
  });

  describe('setLocalStorageItem', () => {
    it('should store item successfully', () => {
      const testData = { id: 1, name: 'Test User' };

      const success = setLocalStorageItem('user', testData);

      expect(success).toBe(true);
      const stored = localStorage.getItem('user');
      expect(JSON.parse(stored!)).toEqual(testData);
    });

    it('should handle primitive values', () => {
      expect(setLocalStorageItem('str', 'hello')).toBe(true);
      expect(setLocalStorageItem('num', 123)).toBe(true);
      expect(setLocalStorageItem('bool', false)).toBe(true);

      expect(localStorage.getItem('str')).toBe('"hello"');
      expect(localStorage.getItem('num')).toBe('123');
      expect(localStorage.getItem('bool')).toBe('false');
    });

    it('should overwrite existing values', () => {
      setLocalStorageItem('key', 'oldValue');
      setLocalStorageItem('key', 'newValue');

      const result = getLocalStorageItem('key', '');
      expect(result).toBe('newValue');
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: { id: 1, profile: { name: 'John', age: 30 } },
        settings: { theme: 'dark', lang: 'en' }
      };

      setLocalStorageItem('complex', complexData);
      const result = getLocalStorageItem('complex', {});

      expect(result).toEqual(complexData);
    });
  });

  describe('removeLocalStorageItem', () => {
    it('should remove existing item', () => {
      localStorage.setItem('toRemove', 'value');

      const success = removeLocalStorageItem('toRemove');

      expect(success).toBe(true);
      expect(localStorage.getItem('toRemove')).toBeNull();
    });

    it('should succeed even if key does not exist', () => {
      const success = removeLocalStorageItem('nonexistent');

      expect(success).toBe(true);
    });
  });

  describe('clearLocalStorage', () => {
    it('should clear all items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      const success = clearLocalStorage();

      expect(success).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('should succeed even when storage is empty', () => {
      const success = clearLocalStorage();

      expect(success).toBe(true);
      expect(localStorage.length).toBe(0);
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      const result = isLocalStorageAvailable();

      expect(result).toBe(true);
    });

    it('should clean up test key after check', () => {
      isLocalStorageAvailable();

      expect(localStorage.getItem('__localStorage_test__')).toBeNull();
    });
  });
});
