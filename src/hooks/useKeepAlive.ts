import { useEffect, useRef, useState } from 'react';

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

  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // Ping function
  const ping = async () => {
    if (!keepAliveEnabled) return;

    try {
      setIsPinging(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://marketvue-api.onrender.com';
      const response = await fetch(`${apiUrl}/api/v1/health`, {
        method: 'GET',
        cache: 'no-cache',
      });

      if (response.ok) {
        setLastPingTime(new Date());
        console.log('[KeepAlive] Ping successful at', new Date().toLocaleTimeString());
      } else {
        console.warn('[KeepAlive] Ping failed with status:', response.status);
      }
    } catch (error) {
      console.warn('[KeepAlive] Ping error:', error);
      // Don't throw error - keep-alive failure shouldn't affect main functionality
    } finally {
      setIsPinging(false);
    }
  };

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
      // Initial ping
      ping();

      // Set up interval (10 minutes = 600,000 ms)
      intervalRef.current = setInterval(() => {
        ping();
      }, 10 * 60 * 1000); // 10 minutes

      console.log('[KeepAlive] Enabled - will ping every 10 minutes');
    } else {
      console.log('[KeepAlive] Disabled');
    }

    // Cleanup on unmount or when keepAliveEnabled changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [keepAliveEnabled]);

  return {
    keepAliveEnabled,
    setKeepAliveEnabled,
    lastPingTime,
    isPinging,
  };
}
