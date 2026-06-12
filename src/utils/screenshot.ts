import { domToPng } from 'modern-screenshot';
import { logger } from './logger';

/**
 * Maximum scale factor applied when rasterizing the DOM element.
 * Caps output size so very wide dashboards don't produce huge images.
 */
const MAX_SCALE = 3;

export interface CaptureOptions {
  /**
   * Desired output width in pixels. The element is scaled so its rendered
   * width matches this value; height follows the element's real aspect ratio.
   * Output dimensions are therefore predictable, not letterboxed.
   */
  targetWidth?: number;
}

/**
 * Rasterize a DOM element into a PNG Blob.
 * Returns null if the element does not exist or capture fails.
 */
export async function captureElementToBlob(
  elementId: string,
  { targetWidth = 1920 }: CaptureOptions = {}
): Promise<Blob | null> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      logger.error(`Element with id "${elementId}" not found`);
      return null;
    }

    const elementRect = element.getBoundingClientRect();
    if (elementRect.width === 0) {
      logger.error(`Element with id "${elementId}" has zero width`);
      return null;
    }

    // Scale by width only so the output width is exactly targetWidth and the
    // height keeps the element's true aspect ratio (no misleading 16:9 crop).
    const scale = Math.min(targetWidth / elementRect.width, MAX_SCALE);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const backgroundColor = isDarkMode ? '#1f2937' : '#ffffff'; // gray-800 / white

    const dataUrl = await domToPng(element, {
      scale,
      quality: 1,
      backgroundColor,
    });

    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    logger.error('Failed to capture element:', error);
    return null;
  }
}

/**
 * Whether writing images to the clipboard is supported in this browser.
 * Firefox and some Safari versions do not support ClipboardItem image writes.
 */
export function isClipboardImageSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined' &&
    typeof navigator.clipboard.write === 'function' &&
    typeof ClipboardItem !== 'undefined'
  );
}

/**
 * Capture an element and copy the resulting PNG to the clipboard.
 */
export async function captureAndCopyToClipboard(
  elementId: string,
  options?: CaptureOptions
): Promise<boolean> {
  const blob = await captureElementToBlob(elementId, options);
  if (!blob) return false;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    logger.info('Screenshot copied to clipboard successfully');
    return true;
  } catch (error) {
    logger.error('Failed to copy screenshot to clipboard:', error);
    return false;
  }
}

/**
 * Build a timestamped filename like `marketvue-2026-06-12-2207.png`.
 */
function defaultFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `marketvue-${stamp}.png`;
}

/**
 * Capture an element and trigger a PNG file download.
 * Works in every browser that supports canvas/blob (including Firefox/Safari),
 * so it serves as the fallback when clipboard image writes are unavailable.
 */
export async function captureAndDownload(
  elementId: string,
  filename: string = defaultFilename(),
  options?: CaptureOptions
): Promise<boolean> {
  const blob = await captureElementToBlob(elementId, options);
  if (!blob) return false;

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke on the next tick so the download has a chance to start.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    logger.info('Screenshot downloaded successfully');
    return true;
  } catch (error) {
    logger.error('Failed to download screenshot:', error);
    return false;
  }
}

/**
 * Capture an element and copy it to the clipboard when possible, otherwise
 * fall back to a file download. Returns how the capture was delivered so the
 * UI can show the right confirmation message.
 */
export async function captureScreenshot(
  elementId: string,
  options?: CaptureOptions
): Promise<'copied' | 'downloaded' | 'failed'> {
  if (isClipboardImageSupported()) {
    const copied = await captureAndCopyToClipboard(elementId, options);
    if (copied) return 'copied';
  }
  const downloaded = await captureAndDownload(elementId, undefined, options);
  return downloaded ? 'downloaded' : 'failed';
}

/**
 * @deprecated Use {@link isClipboardImageSupported}. Kept for backward compat.
 */
export function isClipboardAvailable(): boolean {
  return isClipboardImageSupported();
}
