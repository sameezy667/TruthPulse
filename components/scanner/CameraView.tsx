'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Upload, Barcode } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NativeBarcodeScanner } from './NativeBarcodeScanner';

interface CameraViewProps {
  onScan: (imageBase64: string, barcode?: string) => Promise<void>;
  comparisonMode?: boolean;
  onBack?: () => void;
}

export default function CameraView({ onScan, comparisonMode = false, onBack }: CameraViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor native app
    if (typeof window !== 'undefined') {
      setIsCapacitor(!!(window as any).Capacitor);
    }
  }, []);

  const handleCapacitorCamera = async () => {
    try {
      setIsScanning(true);
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image.base64String) {
        await onScan(image.base64String);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Camera access denied or error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const handleWebUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1]; // Remove data:image prefix
      await onScan(base64Data);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handleBarcodeDetected = async (barcode: string) => {
    setShowBarcodeScanner(false);
    setIsScanning(true);
    
    // Create a placeholder image (1x1 transparent pixel)
    const placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Pass barcode to onScan
    await onScan(placeholderImage, barcode);
    setIsScanning(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBarcodeScanner && (
          <NativeBarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onCancel={() => setShowBarcodeScanner(false)}
            isOpen={showBarcodeScanner}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full bg-gradient-to-b from-emerald-950/50 via-black to-black"
      >
      {/* Back to Home Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-6 left-6 z-30 w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 
                   flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <span className="text-white text-xl">←</span>
        </motion.button>
      )}

      {/* Comparison Mode Banner */}
      {comparisonMode && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 z-20 bg-purple-500/20 backdrop-blur-xl border-b border-purple-500/30 p-4 pt-safe-top"
        >
          <div className="flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 21H5C3.89543 21 3 20.1046 3 19V15M15 3H19C20.1046 3 21 3.89543 21 5V9M15 21H19C20.1046 21 21 20.1046 21 19V15" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 8V16M8 12H16" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="text-center">
              <div className="text-purple-400 font-bold text-sm">Comparison Mode</div>
              <div className="text-purple-300/70 text-xs">Scan second product to compare</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Scanning Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Center Pulse Ring */}
        <div className="relative">
          <motion.div
            animate={{
              scale: isScanning ? [1, 1.5, 1] : 1,
              opacity: isScanning ? [0.5, 0, 0.5] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-neon-green blur-3xl"
          />

          <motion.div
            animate={{
              scale: isScanning ? [1, 1.2] : 1,
              rotate: isScanning ? 360 : 0,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="relative w-64 h-64 rounded-full border-2 border-white/20 flex items-center justify-center"
          >
            {/* Inner circle */}
            <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center">
                <Camera className="w-16 h-16 text-white/80" strokeWidth={1.5} />
              </div>
            </div>

            {/* Corner markers */}
            {[0, 90, 180, 270].map((rotation, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-120px)`,
                }}
                animate={{
                  opacity: isScanning ? [1, 0.3, 1] : 0.5,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              >
                <div className="w-2 h-8 bg-neon-green rounded-full" />
                <div className="w-8 h-2 bg-neon-green rounded-full -mt-2" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scanning Line */}
        {isScanning && (
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent shadow-[0_0_20px_rgba(0,255,148,0.8)]"
            animate={{
              top: ['20%', '80%', '20%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Bottom Instructions & Capture Button */}
      <div className="p-6 pb-8 text-center space-y-4">
        <motion.div
          animate={{
            opacity: isScanning ? [1, 0.5, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <Sparkles className="w-4 h-4 text-neon-green" />
          <span className="text-neon-green text-xs font-bold uppercase tracking-widest">
            {isScanning ? 'Analyzing' : 'Ready to Scan'}
          </span>
        </motion.div>

        <h2 className="text-white text-xl font-bold tracking-tighter">
          {isScanning ? 'Processing Image...' : 'Capture Product Label'}
        </h2>
        <p className="text-zinc-500 text-[0.925rem] font-medium">
          {isScanning
            ? 'AI is analyzing ingredients'
            : 'Take a clear photo of the nutrition label'}
        </p>

        {/* Capture Button */}
        {isCapacitor ? (
          <motion.button
            onClick={handleCapacitorCamera}
            disabled={isScanning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-[#00FF94] text-black font-semibold text-lg h-14 
                     flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-[#00FF94]/20 active:scale-95 transition-transform"
          >
            <Camera className="w-5 h-5" />
            {isScanning ? 'Analyzing...' : 'Open Camera'}
          </motion.button>
        ) : (
          <label className="block w-full">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleWebUpload}
              disabled={isScanning}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-[#00FF94] text-black font-semibold text-lg h-14 
                       flex items-center justify-center gap-2 cursor-pointer
                       shadow-lg shadow-[#00FF94]/20 active:scale-95 transition-transform"
            >
              <Upload className="w-5 h-5" />
              {isScanning ? 'Analyzing...' : 'Upload Photo'}
            </motion.div>
          </label>
        )}

        {/* Barcode Scanner Button */}
        <motion.button
          onClick={() => setShowBarcodeScanner(true)}
          disabled={isScanning}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-base h-12 
                   flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-white/15 transition-all"
        >
          <Barcode className="w-5 h-5" />
          Scan Barcode
        </motion.button>
      </div>
    </motion.div>
    </>
  );
}
