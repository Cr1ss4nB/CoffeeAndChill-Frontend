import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';

interface QRCardProps {
  tableNumber: number;
  baseUrl: string;
}

export function QRCard({ tableNumber, baseUrl }: QRCardProps) {
  const url = `${baseUrl}/menu?mesa=${tableNumber}`;

  function handleDownload() {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300);
      const a = document.createElement('a');
      a.download = `mesa-${tableNumber}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <div className="glass p-5 card-hover flex flex-col items-center">
      <span className="font-display font-bold text-lg text-text-primary mb-3">Mesa {tableNumber}</span>
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG id={`qr-${tableNumber}`} value={url} size={140} level="M" />
      </div>
      <p className="text-[10px] text-text-secondary mt-2 truncate max-w-full">{url}</p>
      <Button size="sm" variant="ghost" className="mt-3" onClick={handleDownload} icon={<Download size={14} />}>
        Descargar PNG
      </Button>
    </div>
  );
}
