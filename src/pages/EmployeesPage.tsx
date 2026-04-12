import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { EmployeeTable } from '@/components/organisms/EmployeeTable/EmployeeTable';

export default function EmployeesPage() {
  return (
    <DashboardTemplate title="Empleados">
      <EmployeeTable />
    </DashboardTemplate>
  );
}
