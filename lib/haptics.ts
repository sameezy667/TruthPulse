import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic feedback utilities for mobile devices
 */

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      await Haptics.impact({ style: styleMap[style] });
    }
  } catch (error) {
    // Haptics not available, silently fail
    console.debug('Haptics not available:', error);
  }
}

export async function hapticSuccess() {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  } catch (error) {
    console.debug('Haptics not available:', error);
  }
}

export async function hapticWarning() {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  } catch (error) {
    console.debug('Haptics not available:', error);
  }
}

export async function hapticError() {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  } catch (error) {
    console.debug('Haptics not available:', error);
  }
}

export async function hapticSelection() {
  try {
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      await Haptics.selectionStart();
      setTimeout(() => Haptics.selectionEnd(), 100);
    }
  } catch (error) {
    console.debug('Haptics not available:', error);
  }
}
