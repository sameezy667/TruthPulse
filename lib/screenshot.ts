/**
 * Utility for capturing screenshots of result views
 */

import html2canvas from 'html2canvas';

export async function captureElementAsImage(
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    scale?: number;
    quality?: number;
  }
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: options?.backgroundColor ?? '#0A0A0A',
    scale: options?.scale ?? 2,
    logging: false,
    useCORS: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      'image/jpeg',
      options?.quality ?? 0.95
    );
  });
}

export async function shareImage(
  blob: Blob,
  options?: {
    title?: string;
    text?: string;
    fileName?: string;
  }
): Promise<void> {
  const file = new File([blob], options?.fileName ?? 'sach-ai-analysis.jpg', {
    type: 'image/jpeg',
  });

  const shareData = {
    title: options?.title ?? 'Sach.ai Analysis',
    text: options?.text ?? 'Check out my food analysis from Sach.ai',
    files: [file],
  };

  if (navigator.share && navigator.canShare(shareData)) {
    await navigator.share(shareData);
  } else {
    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = options?.fileName ?? 'sach-ai-analysis.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
