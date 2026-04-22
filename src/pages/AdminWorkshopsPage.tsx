import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { WorkshopAdminPanel } from '@/components/organisms/WorkshopAdminPanel/WorkshopAdminPanel';

export default function AdminWorkshopsPage() {
  return (
    <DashboardTemplate title="Administrar Talleres">
      <WorkshopAdminPanel />
    </DashboardTemplate>
  );
}
