import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { InventoryTable } from '@/components/organisms/InventoryTable/InventoryTable';

export default function InventoryPage() {
  return (
    <DashboardTemplate title="Inventario">
      <InventoryTable />
    </DashboardTemplate>
  );
}
