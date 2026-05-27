import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink } from 'lucide-react';

interface QRCardProps {
  tableCode: string;
  tableNumber: number;
  baseUrl: string;
}

export function QRCard({ tableCode, tableNumber, baseUrl }: QRCardProps) {
  const url = `${baseUrl}/menu/${tableCode}`;

  const downloadQR = () => {
    const svg = document.getElementById(`qr-table-${tableCode}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR-Mesa-${tableCode}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.onerror = () => {
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR-Mesa-${tableCode}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgStr)}`;
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="bg-white p-3 rounded-2xl shadow-inner border border-white/40">
        <QRCodeSVG
          id={`qr-table-${tableCode}`}
          value={url}
          size={140}
          level="M"
          includeMargin={false}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-display font-bold text-text-primary">Mesa {tableNumber}</p>
        <p className="text-xs text-accent-primary font-bold tracking-widest uppercase">{tableCode}</p>
      </div>
      <div className="flex gap-2 w-full justify-center">
        <button
          onClick={downloadQR}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 border border-white/40 text-text-secondary hover:bg-white/70 text-xs font-medium transition-colors"
          title="Descargar QR"
        >
          <Download size={14} />
          <span>PNG</span>
        </button>
        <button
          onClick={() => window.open(url, '_blank')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 border border-white/40 text-text-secondary hover:bg-white/70 text-xs font-medium transition-colors"
          title="Probar enlace"
        >
          <ExternalLink size={14} />
          <span>Probar</span>
        </button>
      </div>
    </div>
  );
}
