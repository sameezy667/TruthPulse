/**
 * Text-to-Speech utility for reading AI responses aloud
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, options?: {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Stop any ongoing speech
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 0.9;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;
  utterance.lang = options?.lang ?? 'en-US';

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stop(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function pause(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.pause();
}

export function resume(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.resume();
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  return window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  return window.speechSynthesis.paused;
}
