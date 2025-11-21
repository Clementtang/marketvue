/**
 * Performance Monitoring Utilities
 *
 * Provides tools to monitor and log React component render performance.
 * Useful for identifying performance bottlenecks and optimizing re-renders.
 */

import React from 'react';

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  totalRenderTime: number;
  avgRenderTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, RenderMetrics> = new Map();
  private enabled: boolean = import.meta.env.DEV;

  /**
   * Start tracking a component render
   */
  startRender(componentName: string): () => void {
    if (!this.enabled) {
      return () => {}; // No-op in production
    }

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      this.recordRender(componentName, renderTime);
    };
  }

  /**
   * Record render metrics for a component
   */
  private recordRender(componentName: string, renderTime: number): void {
    const existing = this.metrics.get(componentName);

    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const newTotalTime = existing.totalRenderTime + renderTime;

      this.metrics.set(componentName, {
        componentName,
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        totalRenderTime: newTotalTime,
        avgRenderTime: newTotalTime / newRenderCount,
      });
    } else {
      this.metrics.set(componentName, {
        componentName,
        renderCount: 1,
        lastRenderTime: renderTime,
        totalRenderTime: renderTime,
        avgRenderTime: renderTime,
      });
    }

    // Log if render is slow (> 16ms, roughly 60fps threshold)
    if (renderTime > 16) {
      console.warn(
        `[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get metrics for a specific component
   */
  getMetrics(componentName: string): RenderMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): RenderMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Print performance summary to console
   */
  printSummary(): void {
    if (!this.enabled || this.metrics.size === 0) {
      return;
    }

    console.group('📊 Component Render Performance Summary');

    const sortedMetrics = this.getAllMetrics().sort(
      (a, b) => b.totalRenderTime - a.totalRenderTime
    );

    console.table(
      sortedMetrics.map((m) => ({
        Component: m.componentName,
        'Render Count': m.renderCount,
        'Avg Time (ms)': m.avgRenderTime.toFixed(2),
        'Total Time (ms)': m.totalRenderTime.toFixed(2),
        'Last Render (ms)': m.lastRenderTime.toFixed(2),
      }))
    );

    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook to monitor component renders
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useRenderMonitor('MyComponent');
 *   // ... rest of component
 * }
 * ```
 */
export const useRenderMonitor = (componentName: string): void => {
  if (import.meta.env.DEV) {
    const endRender = performanceMonitor.startRender(componentName);
    endRender();
  }
};

/**
 * Higher-order component to monitor renders
 *
 * Usage:
 * ```tsx
 * export default withRenderMonitor('MyComponent')(MyComponent);
 * ```
 */
export const withRenderMonitor = <P extends object>(componentName: string) => {
  return (Component: React.ComponentType<P>) => {
    const MonitoredComponent = (props: P) => {
      useRenderMonitor(componentName);
      return React.createElement(Component, props);
    };

    MonitoredComponent.displayName = `withRenderMonitor(${componentName})`;
    return MonitoredComponent;
  };
};

// Export to window for debugging in browser console
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).performanceMonitor = performanceMonitor;
  console.log('💡 Performance monitor available at window.performanceMonitor');
  console.log('   Use: performanceMonitor.printSummary() to see metrics');
}
