/**
 * components/scanner/NativeBarcodeScanner.tsx
 *
 * Native barcode scanner UI component using Capacitor ML Kit.
 * Provides a full-screen camera view with barcode detection overlay.
 * Falls back to manual barcode entry when plugin is unavailable or permissions denied.
 *
 * Features:
 * - Native ML Kit barcode scanning on Android/iOS
 * - Permission request flow with user-friendly prompts
 * - Fallback to manual entry on web or permission denial
 * - Loading states and error handling
 * - Accessible UI with clear user feedback
 *
 * Dependencies:
 * - components/scanner/useBarcodeScanner.ts (scanner logic)
 * - @capacitor-mlkit/barcode-scanning (native plugin)
 * - components/ui/* (UI primitives)
 *
 * Integration:
 * - Used by components/scanner/CameraView.tsx
 * - Emits onBarcodeDetected(barcode: string) when scan succeeds
 * - Emits onCancel() when user cancels scan
 */

'use client';

import React, { useState } from 'react';
import { useBarcodeScanner } from './useBarcodeScanner';
import { Camera, X, AlertTriangle, Keyboard } from 'lucide-react';

/**
 * Props for the NativeBarcodeScanner component.
 */
export interface NativeBarcodeScannerProps {
  /** Callback invoked when a barcode is successfully detected */
  onBarcodeDetected: (barcode: string) => void;
  /** Callback invoked when user cancels the scan */
  onCancel: () => void;
  /** Whether to show the component (modal-like behavior) */
  isOpen?: boolean;
}

/**
 * Native barcode scanner component with fallback to manual entry.
 * Manages scanner lifecycle, permissions, and user feedback.
 *
 * @param props - Component props
 * @returns Scanner UI or null if not open
 */
export function NativeBarcodeScanner({
  onBarcodeDetected,
  onCancel,
  isOpen = true,
}: NativeBarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  const {
    state,
    permissionState,
    startScan,
    requestPermission,
    error,
    isPluginAvailable,
  } = useBarcodeScanner(onBarcodeDetected);

  if (!isOpen) {
    return null;
  }

  /**
   * Handle manual barcode submission.
   */
  const handleManualSubmit = () => {
    const trimmed = manualBarcode.trim();
    if (trimmed) {
      onBarcodeDetected(trimmed);
      setManualBarcode('');
    }
  };

  /**
   * Render permission request UI.
   */
  if (permissionState === 'denied' || !isPluginAvailable) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-white text-xl font-bold">Camera Permission Required</h2>
            </div>
            <p className="text-zinc-400 text-sm">
              {isPluginAvailable
                ? 'Camera access is required to scan barcodes. Please enable it in your device settings.'
                : 'Barcode scanning is only available on mobile devices.'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Keyboard className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-300 text-sm">
                  You can enter the barcode manually below.
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter barcode (e.g., 5449000000996)"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit();
                }
              }}
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50"
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={!manualBarcode.trim()}
              className="flex-1 px-4 py-3 bg-neon-green text-black rounded-xl font-semibold hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render manual entry mode.
   */
  if (showManualEntry) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-white text-xl font-bold mb-2">Enter Barcode Manually</h2>
            <p className="text-zinc-400 text-sm">
              Type or paste the barcode number below.
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <input
              type="text"
              placeholder="Barcode number (e.g., 5449000000996)"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit();
                }
              }}
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50"
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={() => setShowManualEntry(false)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Back to Camera
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={!manualBarcode.trim()}
              className="flex-1 px-4 py-3 bg-neon-green text-black rounded-xl font-semibold hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state.
   */
  if (state === 'error' && error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-white text-xl font-bold">Scanner Error</h2>
            </div>
            <p className="text-zinc-400 text-sm">{error}</p>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowManualEntry(true)}
              className="flex-1 px-4 py-3 bg-neon-green text-black rounded-xl font-semibold hover:bg-neon-green/90 transition-colors"
            >
              Enter Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render scanner ready / idle state.
   */
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white text-xl font-bold mb-2">Scan Barcode</h2>
          <p className="text-zinc-400 text-sm">
            {state === 'requesting-permission'
              ? 'Requesting camera permission...'
              : state === 'scanning'
              ? 'Point your camera at a barcode'
              : 'Ready to scan a product barcode'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {permissionState === 'prompt' && state === 'idle' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-300 text-sm">
                  Camera permission is needed to scan barcodes.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center py-8">
            <Camera className="h-24 w-24 text-zinc-600 animate-pulse" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={state === 'requesting-permission' || state === 'scanning'}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            {permissionState === 'prompt' && (
              <button
                onClick={requestPermission}
                disabled={state === 'requesting-permission'}
                className="flex-1 px-4 py-3 bg-neon-green text-black rounded-xl font-semibold hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Request Permission
              </button>
            )}
            {permissionState === 'granted' && (
              <button
                onClick={startScan}
                disabled={state === 'scanning'}
                className="flex-1 px-4 py-3 bg-neon-green text-black rounded-xl font-semibold hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {state === 'scanning' ? 'Scanning...' : 'Start Scan'}
              </button>
            )}
          </div>
          <button
            onClick={() => setShowManualEntry(true)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-zinc-300 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Keyboard className="h-4 w-4" />
            Manual Entry
          </button>
        </div>
      </div>
    </div>
  );
}
