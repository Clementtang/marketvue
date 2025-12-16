import { domToPng } from 'modern-screenshot';
import { logger } from './logger';

/**
 * Capture a DOM element as an image and copy to clipboard
 * Optimized for 16:9 aspect ratio (1920x1080 or scaled proportionally)
 */
export async function captureAndCopyToClipboard(
  elementId: string,
  targetWidth = 1920,
  targetHeight = 1080
): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      logger.error(`Element with id "${elementId}" not found`);
      return false;
    }

    // Calculate scale to achieve target dimensions while maintaining aspect ratio
    const elementRect = element.getBoundingClientRect();
    const scaleX = targetWidth / elementRect.width;
    const scaleY = targetHeight / elementRect.height;
    const scale = Math.min(scaleX, scaleY);

    // Detect current theme mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    const backgroundColor = isDarkMode ? '#1f2937' : '#ffffff'; // gray-800 for dark, white for light

    // Use modern-screenshot which has the best CSS support
    const dataUrl = await domToPng(element, {
      scale: scale,
      quality: 1,
      backgroundColor: backgroundColor,
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Copy to clipboard
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);

    logger.info('Screenshot copied to clipboard successfully');
    return true;
  } catch (error) {
    logger.error('Failed to capture screenshot:', error);
    return false;
  }
}

/**
 * Check if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined' &&
    typeof ClipboardItem !== 'undefined'
  );
}
