import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { QRCard } from '@/components/molecules/QRCard/QRCard';

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function QRManagementPage() {
  const baseUrl = window.location.origin;

  return (
    <DashboardTemplate title="QR Mesas">
      <p className="text-text-secondary mb-6">
        Descarga e imprime los códigos QR para cada mesa. Los clientes escanearán para ver la carta digital.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TABLES.map((num) => (
          <QRCard key={num} tableNumber={num} baseUrl={baseUrl} />
        ))}
      </div>
    </DashboardTemplate>
  );
}
