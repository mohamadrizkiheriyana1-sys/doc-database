import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("reader");
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                onScan(decodedText);
              }).catch(err => {
                console.error("Failed to stop scanner", err);
                onScan(decodedText);
              });
            }
          },
          (errorMessage) => {
            // Ignore minor errors (like no barcode found in current frame)
          }
        );
      } catch (err: any) {
        setError("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
        console.error(err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-[var(--overlay-90)] z-[300] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-10)] flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-10)]">
          <h3 className="text-[var(--accent)] font-['Syne',sans-serif] uppercase tracking-widest text-sm font-bold">Scan Barcode / QR</h3>
          <button onClick={onClose} className="text-[var(--text-main)]/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center bg-[var(--bg-panel)] min-h-[300px] relative">
          {error ? (
            <div className="text-red-500 text-center text-xs uppercase p-4 border border-red-500/30 bg-red-500/10">
              {error}
            </div>
          ) : (
            <div id="reader" className="w-full h-full overflow-hidden [&>video]:object-cover" style={{ minHeight: '300px' }}></div>
          )}
        </div>
        
        <div className="p-4 border-t border-[var(--border-10)] text-center">
          <p className="text-[0.6rem] uppercase text-[var(--text-main)]/40 tracking-widest">
            Arahkan kamera ke Barcode atau QR Code.
          </p>
        </div>
      </div>
    </div>
  );
}
