import { useState, useEffect } from 'react';

/**
 * Custom hook that behaves like useState, but automatically persists
 * changes to the browser's localStorage.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;

      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}