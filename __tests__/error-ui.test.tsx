import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Error UI', () => {
  describe('Toast Component', () => {
    const toastPath = join(process.cwd(), 'components/ui/Toast.tsx');
    let toastContent: string;

    try {
      toastContent = readFileSync(toastPath, 'utf-8');
    } catch (error) {
      toastContent = '';
    }

    it('should accept message prop', () => {
      expect(toastContent).toContain('message');
      expect(toastContent).toContain('message: string');
    });

    it('should accept variant prop with destructive option', () => {
      expect(toastContent).toContain('variant');
      expect(toastContent).toContain('destructive');
    });

    it('should have destructive variant styling', () => {
      expect(toastContent).toContain('destructive:');
      expect(toastContent).toContain('bg-red-950');
    });

    it('should render message text', () => {
      expect(toastContent).toContain('{message}');
    });

    it('should have close button', () => {
      expect(toastContent).toContain('onClick={handleClose}');
      expect(toastContent).toContain('<X');
    });

    it('should use framer-motion for animations', () => {
      expect(toastContent).toContain("from 'framer-motion'");
      expect(toastContent).toContain('motion.div');
    });

    it('should have proper accessibility attributes', () => {
      expect(toastContent).toContain('role="alert"');
      expect(toastContent).toContain('aria-live="assertive"');
    });

    it('should export as default', () => {
      expect(toastContent).toContain('export default function Toast');
    });
  });

  describe('Error Handling in app/page.tsx', () => {
    const pagePath = join(process.cwd(), 'app/page.tsx');
    let pageContent: string;

    try {
      pageContent = readFileSync(pagePath, 'utf-8');
    } catch (error) {
      pageContent = '';
    }

    it('should import Toast component', () => {
      expect(pageContent).toContain("import Toast from '@/components/ui/Toast'");
    });

    it('should use error state from useObject hook', () => {
      expect(pageContent).toContain('error');
      expect(pageContent).toContain('useObject');
    });

    it('should conditionally render Toast when error is present', () => {
      expect(pageContent).toContain('{error &&');
      expect(pageContent).toContain('<Toast');
    });

    it('should display correct error message', () => {
      expect(pageContent).toContain('Analysis failed. Please try again.');
    });

    it('should set Toast variant to destructive', () => {
      expect(pageContent).toContain('variant="destructive"');
    });

    it('should provide onClose handler to Toast', () => {
      expect(pageContent).toContain('onClose={handleCloseError}');
      expect(pageContent).toContain('const handleCloseError');
    });
  });
});
