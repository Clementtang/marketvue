/**
 * Animation Configuration
 * Centralized animation settings for react-spring
 */

import { config as springConfig } from '@react-spring/web';

/**
 * Standard spring configurations
 * Use these for consistent animation feel across the app
 */
export const animations = {
  // Gentle easing - for subtle UI transitions
  gentle: {
    tension: 280,
    friction: 60,
  },

  // Wobbly - for playful interactions
  wobbly: {
    tension: 180,
    friction: 12,
  },

  // Stiff - for quick, responsive feedback
  stiff: {
    tension: 210,
    friction: 20,
  },

  // Slow - for loading states
  slow: {
    tension: 280,
    friction: 120,
  },

  // Default - balanced feel
  default: springConfig.default,
} as const;

/**
 * Common animation presets
 */
export const presets = {
  // Fade in from bottom
  fadeInUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
  },

  // Fade in
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  // Scale in
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },

  // Slide in from right
  slideInRight: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
  },
} as const;

/**
 * Stagger delay calculator
 * @param index - Item index in list
 * @param baseDelay - Base delay in ms (default: 50)
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

/**
 * Respect user's motion preferences
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation config based on user preferences
 * Returns immediate animations if user prefers reduced motion
 */
export const getAnimationConfig = (configName: keyof typeof animations = 'default') => {
  if (shouldReduceMotion()) {
    return { ...animations[configName], duration: 0 };
  }
  return animations[configName];
};
