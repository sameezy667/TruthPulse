/**
 * components/scanner/useBarcodeScanner.ts
 *
 * React hook for native barcode scanning using Capacitor ML Kit.
 * Handles permission management, native plugin integration, and fallback flows.
 *
 * Features:
 * - Request and check camera permissions
 * - Start/stop native barcode scanner
 * - Handle plugin availability and errors
 * - Provide fallback UI prompts for denied permissions
 * - Emit scanned barcode results
 *
 * Dependencies:
 * - @capacitor-mlkit/barcode-scanning (native plugin)
 * - @capacitor/core (Capacitor runtime)
 *
 * Integration:
 * - Used by components/scanner/NativeBarcodeScanner.tsx
 * - Results passed to lib/client-analyzer.ts via onBarcodeDetected callback
 */

import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

/**
 * Permission states for camera access.
 */
export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

/**
 * Scanner state machine states.
 */
export type ScannerState = 'idle' | 'requesting-permission' | 'scanning' | 'error';

/**
 * Hook return value interface.
 */
export interface UseBarcodeScanner {
  /** Current scanner state */
  state: ScannerState;
  /** Current permission state */
  permissionState: PermissionState;
  /** Start scanning for barcodes */
  startScan: () => Promise<void>;
  /** Stop scanning */
  stopScan: () => Promise<void>;
  /** Request camera permission */
  requestPermission: () => Promise<void>;
  /** Error message if state is 'error' */
  error: string | null;
  /** Whether the plugin is available on this platform */
  isPluginAvailable: boolean;
}

/**
 * Hook for managing native barcode scanner lifecycle.
 *
 * @param onBarcodeDetected - Callback invoked when a barcode is successfully scanned
 * @returns Scanner control interface
 */
export function useBarcodeScanner(
  onBarcodeDetected: (barcode: string) => void
): UseBarcodeScanner {
  const [state, setState] = useState<ScannerState>('idle');
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [isPluginAvailable] = useState(() => {
    // Check if plugin is available on this platform
    return Capacitor.isNativePlatform();
  });

  /**
   * Check current permission status.
   * Updates permissionState based on current grants.
   */
  const checkPermission = useCallback(async () => {
    if (!isPluginAvailable) {
      setPermissionState('denied');
      return;
    }

    try {
      const result = await BarcodeScanner.checkPermissions();
      
      if (result.camera === 'granted') {
        setPermissionState('granted');
      } else if (result.camera === 'denied') {
        setPermissionState('denied');
      } else {
        setPermissionState('prompt');
      }
    } catch (err) {
      console.error('[Scanner] Permission check failed:', err);
      setPermissionState('unknown');
    }
  }, [isPluginAvailable]);

  /**
   * Request camera permission from the user.
   * Updates permissionState based on user response.
   */
  const requestPermission = useCallback(async () => {
    if (!isPluginAvailable) {
      setError('Barcode scanner is not available on this platform');
      setState('error');
      return;
    }

    setState('requesting-permission');
    setError(null);

    try {
      const result = await BarcodeScanner.requestPermissions();
      
      if (result.camera === 'granted') {
        setPermissionState('granted');
        setState('idle');
      } else {
        setPermissionState('denied');
        setError('Camera permission is required for barcode scanning');
        setState('error');
      }
    } catch (err) {
      console.error('[Scanner] Permission request failed:', err);
      setError('Failed to request camera permission');
      setState('error');
    }
  }, [isPluginAvailable]);

  /**
   * Start the native barcode scanner.
   * Requests permission if not yet granted.
   * Listens for barcode detection events and invokes callback on first valid result.
   */
  const startScan = useCallback(async () => {
    if (!isPluginAvailable) {
      setError('Barcode scanner is not available on this platform');
      setState('error');
      return;
    }

    // Check/request permission first
    if (permissionState !== 'granted') {
      await requestPermission();
      // If permission was denied, don't proceed
      const recheck = await BarcodeScanner.checkPermissions();
      if (recheck.camera !== 'granted') {
        return;
      }
    }

    setState('scanning');
    setError(null);

    try {
      // Start scanning with common barcode formats
      const result = await BarcodeScanner.scan({
        formats: [
          BarcodeFormat.Ean13,
          BarcodeFormat.Ean8,
          BarcodeFormat.UpcA,
          BarcodeFormat.UpcE,
          BarcodeFormat.Code39,
          BarcodeFormat.Code93,
          BarcodeFormat.Code128,
          BarcodeFormat.Itf,
          BarcodeFormat.Codabar,
          BarcodeFormat.QrCode,
        ],
      });

      // Process first valid barcode
      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0];
        if (barcode.rawValue) {
          console.log('[Scanner] Barcode detected:', barcode.rawValue);
          onBarcodeDetected(barcode.rawValue);
          setState('idle');
        } else {
          setError('Invalid barcode detected');
          setState('error');
        }
      } else {
        // No barcode detected (user cancelled or timeout)
        console.log('[Scanner] Scan cancelled or no barcode found');
        setState('idle');
      }
    } catch (err) {
      console.error('[Scanner] Scan failed:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('cancel')) {
          // User cancelled, not an error
          setState('idle');
        } else {
          setError(`Scan error: ${err.message}`);
          setState('error');
        }
      } else {
        setError('Unknown scan error occurred');
        setState('error');
      }
    }
  }, [isPluginAvailable, permissionState, requestPermission, onBarcodeDetected]);

  /**
   * Stop the scanner.
   * Cleans up scanner session and resets state.
   */
  const stopScan = useCallback(async () => {
    if (!isPluginAvailable) {
      return;
    }

    try {
      // ML Kit plugin automatically stops when scan completes or is cancelled
      // This method is here for API consistency
      setState('idle');
      setError(null);
    } catch (err) {
      console.error('[Scanner] Stop scan failed:', err);
    }
  }, [isPluginAvailable]);

  /**
   * Check permission on mount.
   */
  useEffect(() => {
    if (isPluginAvailable) {
      checkPermission();
    }
  }, [isPluginAvailable, checkPermission]);

  return {
    state,
    permissionState,
    startScan,
    stopScan,
    requestPermission,
    error,
    isPluginAvailable,
  };
}
