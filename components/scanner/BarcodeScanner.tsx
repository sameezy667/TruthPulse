'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, X } from 'lucide-react';
import { hapticImpact, hapticSelection } from '@/lib/haptics';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onBarcodeDetected, onClose }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('');

  // Common test barcodes from our database
  const testBarcodes = [
    { code: '5449000000996', name: 'Coca-Cola', category: 'High Sugar' },
    { code: '0001111042565', name: 'Snickers', category: 'High Sugar' },
    { code: '0007874220778', name: 'Greek Yogurt', category: 'Dairy' },
    { code: '0009315830009', name: 'Raw Almonds', category: 'Safe' },
    { code: '0007341200005', name: 'Spinach', category: 'Safe' },
    { code: '0001820000012', name: 'White Bread', category: 'Processed' },
    { code: '0001200000008', name: 'Orange Juice', category: 'High Sugar' },
    { code: '0002800000014', name: 'Potato Chips', category: 'Processed' },
    { code: '0009900000001', name: 'Chicken Breast', category: 'Protein' },
    { code: '0005200000009', name: 'Tofu', category: 'Plant Protein' },
    { code: '0009200000005', name: 'Bananas', category: 'Fruit' },
    { code: '0004900000007', name: 'Ketchup', category: 'High Sugar' },
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      hapticImpact('medium');
      onBarcodeDetected(manualBarcode.trim());
    }
  };

  const handleBarcodeClick = (code: string) => {
    hapticSelection();
    onBarcodeDetected(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 
                 flex items-center justify-center hover:bg-white/20 transition-all"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Scanner Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-[#00FF94]/20 backdrop-blur-xl border-2 border-[#00FF94]/50 
                      flex items-center justify-center">
          <Scan className="w-12 h-12 text-[#00FF94]" />
        </div>
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-2">Scan Barcode</h2>
      <p className="text-zinc-400 text-center mb-8 max-w-sm">
        Enter a barcode manually or select a test product below
      </p>

      {/* Manual Input */}
      <form onSubmit={handleManualSubmit} className="w-full max-w-sm mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Enter barcode..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                     text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FF94]/50"
          />
          <button
            type="submit"
            disabled={!manualBarcode.trim()}
            className="px-6 py-3 rounded-2xl bg-[#00FF94] text-black font-bold
                     hover:bg-[#00FF94]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Scan
          </button>
        </div>
      </form>

      {/* Test Barcodes */}
      <div className="w-full max-w-sm max-h-[50vh] overflow-y-auto">
        <p className="text-xs text-zinc-600 uppercase tracking-wider font-bold mb-3">
          Test Products (50 Available)
        </p>
        <div className="space-y-2">
          {testBarcodes.map((item) => (
            <motion.button
              key={item.code}
              onClick={() => handleBarcodeClick(item.code)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                       hover:border-[#00FF94]/50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-sm font-mono">{item.code}</div>
                </div>
                <Scan className="w-5 h-5 text-zinc-600 group-hover:text-[#00FF94] transition-colors flex-shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-zinc-600 text-center mt-8 max-w-sm">
        In production, this would use your device&apos;s camera to scan real barcodes
      </p>
    </motion.div>
  );
}
