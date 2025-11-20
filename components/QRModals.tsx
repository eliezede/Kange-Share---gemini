import React, { useEffect, useRef } from 'react';
import { XMarkIcon, SpinnerIcon } from './Icons';

interface QRCodeDisplayModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    hostName: string;
}

// Uses QR Server API to generate QR code image
export const QRCodeDisplayModal: React.FC<QRCodeDisplayModalProps> = ({ isOpen, onClose, requestId, hostName }) => {
    if (!isOpen) return null;

    // We encode the requestId as the payload.
    // In a production app, you might want a signed token here.
    const qrPayload = JSON.stringify({ requestId });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pickup Verification</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Show this code to {hostName} (the host) when you pick up your water.</p>
                
                <div className="bg-white p-4 rounded-xl inline-block shadow-inner border border-gray-100">
                    <img src={qrUrl} alt="Pickup QR Code" className="w-48 h-48 mx-auto" />
                </div>
                
                <p className="text-xs text-gray-400 mt-4">ID: {requestId.slice(0, 8)}...</p>
            </div>
        </div>
    );
};

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen && !scannerRef.current) {
            // Dynamic import check or assuming script loaded in index.html
            const Html5QrcodeScanner = (window as any).Html5QrcodeScanner;
            
            if (Html5QrcodeScanner) {
                 const scanner = new Html5QrcodeScanner(
                    "reader", 
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );
                
                scanner.render((decodedText: string) => {
                    // Success callback
                    onScanSuccess(decodedText);
                    scanner.clear();
                    onClose();
                }, (errorMessage: string) => {
                    // parse error, ignore
                });
                
                scannerRef.current = scanner;
            }
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch((err: any) => console.error("Failed to clear scanner", err));
                } catch(e) {
                    // ignore
                }
                scannerRef.current = null;
            }
        };
    }, [isOpen, onScanSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                 <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 z-10">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="p-4 text-center border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Scan Pickup Code</h3>
                </div>
                <div className="p-4 bg-black">
                    <div id="reader" className="w-full"></div>
                </div>
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Position the requester's QR code within the frame to verify pickup.
                </div>
            </div>
        </div>
    );
};