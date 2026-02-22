import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, X } from 'lucide-react';

interface QRScannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (decodedText: string) => void;
    title?: string;
}

export function QRScannerDialog({ open, onOpenChange, onScan, title = "Scanner QR Code" }: QRScannerDialogProps) {
    const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        let sc: Html5QrcodeScanner | null = null;

        if (open) {
            // Un petit délai pour laisser l'animation du Dialog se terminer et l'élément s'insérer
            const timer = setTimeout(() => {
                const element = document.getElementById('qr-reader');
                if (element) {
                    sc = new Html5QrcodeScanner(
                        'qr-reader',
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        false
                    );

                    sc.render(
                        (decodedText) => {
                            onScan(decodedText);
                            onOpenChange(false);
                            if (sc) sc.clear();
                        },
                        () => { }
                    );
                    setScanner(sc);
                }
            }, 300);

            return () => {
                clearTimeout(timer);
                if (sc) {
                    sc.clear().catch(e => console.warn("Cleanup error", e));
                }
            };
        }
    }, [open, onScan, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        Placez le QR code dans le cadre pour le scanner automatiquement.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div id="qr-reader" className="w-full overflow-hidden rounded-lg border-2 border-primary/20 shadow-inner bg-black/5 min-h-[300px]" />
                    <div className="flex justify-end w-full space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
