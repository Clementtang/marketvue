import { useSpring, animated, to } from '@react-spring/web';
import { animations } from '../../utils/animations';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

/**
 * AnimatedNumber Component
 * Smoothly animates number changes with spring physics
 *
 * @param value - The target number value
 * @param decimals - Number of decimal places (default: 2)
 * @param prefix - Text to prepend (e.g., '$')
 * @param suffix - Text to append (e.g., '%')
 * @param className - CSS classes for styling
 * @param duration - Animation duration in ms (default: 800)
 */
export function AnimatedNumber({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
  duration = 800,
}: AnimatedNumberProps) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { ...animations.gentle, duration },
  });

  return (
    <span className={className}>
      {prefix}
      <animated.span>
        {to(number, (n) => n.toFixed(decimals))}
      </animated.span>
      {suffix}
    </span>
  );
}
