/**
 * __tests__/mocks/capacitor-mlkit-mock.ts
 *
 * Mock implementation of @capacitor-mlkit/barcode-scanning for unit tests.
 * Provides simulated barcode scanning behavior without requiring native plugin.
 *
 * Features:
 * - Mock permission checks and requests
 * - Simulated barcode scan results
 * - Configurable success/failure scenarios
 * - Error simulation (cancelled, permission denied, etc.)
 *
 * Usage:
 * Import this mock before importing the actual plugin in tests.
 * Configure mock behavior using mockBarcodeScanner.setMockResult().
 */

export interface MockPermissionResult {
  camera: 'prompt' | 'granted' | 'denied';
}

export interface MockBarcodeResult {
  barcodes: Array<{
    rawValue: string;
    format: string;
  }>;
}

export interface MockScanOptions {
  formats?: string[];
}

/**
 * Mock barcode scanner implementation.
 * Simulates Capacitor ML Kit barcode scanning plugin behavior.
 */
class MockBarcodeScanner {
  private permissionState: 'prompt' | 'granted' | 'denied' = 'prompt';
  private mockBarcodes: Array<{ rawValue: string; format: string }> = [];
  private shouldThrowError = false;
  private errorMessage = 'User cancelled';

  /**
   * Check current camera permission status.
   */
  async checkPermissions(): Promise<MockPermissionResult> {
    return { camera: this.permissionState };
  }

  /**
   * Request camera permission.
   */
  async requestPermissions(): Promise<MockPermissionResult> {
    // Simulate user granting permission
    if (this.permissionState === 'prompt') {
      this.permissionState = 'granted';
    }
    return { camera: this.permissionState };
  }

  /**
   * Start barcode scanning.
   * Returns mock barcode results or throws an error based on configuration.
   */
  async scan(options?: MockScanOptions): Promise<MockBarcodeResult> {
    if (this.permissionState !== 'granted') {
      throw new Error('Permission denied');
    }

    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    return { barcodes: this.mockBarcodes };
  }

  /**
   * Configure mock to return specific barcode results.
   * @param barcodes - Array of barcode objects to return
   */
  setMockResult(barcodes: Array<{ rawValue: string; format?: string }>): void {
    this.mockBarcodes = barcodes.map((b) => ({
      rawValue: b.rawValue,
      format: b.format || 'EAN_13',
    }));
    this.shouldThrowError = false;
  }

  /**
   * Configure mock to throw an error on scan.
   * @param message - Error message
   */
  setMockError(message: string): void {
    this.shouldThrowError = true;
    this.errorMessage = message;
  }

  /**
   * Set permission state for testing permission flows.
   * @param state - Permission state
   */
  setPermissionState(state: 'prompt' | 'granted' | 'denied'): void {
    this.permissionState = state;
  }

  /**
   * Reset mock to initial state.
   */
  reset(): void {
    this.permissionState = 'prompt';
    this.mockBarcodes = [];
    this.shouldThrowError = false;
    this.errorMessage = 'User cancelled';
  }
}

/**
 * Singleton mock instance.
 */
export const mockBarcodeScanner = new MockBarcodeScanner();

/**
 * Mock module export matching @capacitor-mlkit/barcode-scanning API.
 */
export const BarcodeScanner = mockBarcodeScanner;

/**
 * Default export for convenience.
 */
export default {
  BarcodeScanner: mockBarcodeScanner,
};
