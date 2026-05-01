import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';

interface QRCardProps {
  tableNumber: number;
  baseUrl: string;
}

export function QRCard({ tableNumber, baseUrl }: QRCardProps) {
  const url = `${baseUrl}/menu?table=${tableNumber}`;

  const downloadQR = () => {
    const svg = document.getElementById(`qr-table-${tableNumber}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Mesa-${tableNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-inner border border-white/40">
        <QRCodeSVG
          id={`qr-table-${tableNumber}`}
          value={url}
          size={160}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/logo.png",
            x: undefined,
            y: undefined,
            height: 30,
            width: 30,
            excavate: true,
          }}
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<Download size={16} />} 
          onClick={downloadQR}
          className="text-xs"
        >
          Descargar PNG
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={<ExternalLink size={16} />}
          onClick={() => window.open(url, '_blank')}
          className="text-xs"
        >
          Probar enlace
        </Button>
      </div>
    </div>
  );
}
