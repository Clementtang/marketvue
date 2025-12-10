import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useKeepAlive Hook
 *
 * Prevents Render Free Tier service from sleeping by periodically pinging the health endpoint.
 *
 * Features:
 * - Pings /api/v1/health every 10 minutes
 * - Configurable enable/disable via localStorage
 * - Automatic cleanup on component unmount
 * - Error handling (failures don't affect main functionality)
 * - Tracks last ping time for UI display
 *
 * @returns {Object} - keepAliveEnabled, setKeepAliveEnabled, lastPingTime, isPinging
 */
export function useKeepAlive() {
  const [keepAliveEnabled, setKeepAliveEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('keepAliveEnabled');
    return saved === 'true';
  });

  const [lastPingTime, setLastPingTime] = useState<Date | null>(() => {
    // Restore last ping time from localStorage
    const saved = localStorage.getItem('lastKeepAlivePing');
    return saved ? new Date(saved) : null;
  });
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // Use ref to store the current enabled state to avoid closure issues
  const enabledRef = useRef<boolean>(keepAliveEnabled);
  enabledRef.current = keepAliveEnabled;

  // Ping function using useCallback to avoid closure issues
  const ping = useCallback(async () => {
    // Use ref value to get the most current state
    if (!enabledRef.current) {
      console.log('[KeepAlive] Ping skipped - disabled');
      return;
    }

    try {
      setIsPinging(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://marketvue-api.onrender.com';
      console.log('[KeepAlive] Pinging', apiUrl);

      const response = await fetch(`${apiUrl}/api/v1/health`, {
        method: 'GET',
        cache: 'no-cache',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const now = new Date();
        setLastPingTime(now);
        console.log('[KeepAlive] Ping successful at', now.toLocaleTimeString());

        // Store last ping time in localStorage for persistence
        localStorage.setItem('lastKeepAlivePing', now.toISOString());
      } else {
        console.warn('[KeepAlive] Ping failed with status:', response.status);
      }
    } catch (error) {
      console.warn('[KeepAlive] Ping error:', error);
      // Don't throw error - keep-alive failure shouldn't affect main functionality
    } finally {
      setIsPinging(false);
    }
  }, []);

  // Enable/disable handler
  const setKeepAliveEnabled = (enabled: boolean) => {
    setKeepAliveEnabledState(enabled);
    localStorage.setItem('keepAliveEnabled', String(enabled));

    if (enabled) {
      // Immediately ping once when enabled
      ping();
    }
  };

  // Setup interval effect
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (keepAliveEnabled) {
      console.log('[KeepAlive] Enabled - will ping every 10 minutes');

      // Initial ping
      ping();

      // Set up interval (10 minutes = 600,000 ms)
      intervalRef.current = window.setInterval(() => {
        console.log('[KeepAlive] Interval triggered');
        ping();
      }, 10 * 60 * 1000) as unknown as number; // 10 minutes

      // Also do a test ping after 5 seconds for debugging
      // Remove this in production once confirmed working
      const debugTimeout = window.setTimeout(() => {
        console.log('[KeepAlive] Debug ping after 5 seconds');
        ping();
      }, 5000);

      return () => {
        clearTimeout(debugTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      console.log('[KeepAlive] Disabled');
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [keepAliveEnabled, ping]);

  return {
    keepAliveEnabled,
    setKeepAliveEnabled,
    lastPingTime,
    isPinging,
  };
}
