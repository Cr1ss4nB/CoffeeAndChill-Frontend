import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { WorkshopList } from '@/components/organisms/WorkshopList/WorkshopList';
import { WorkshopForm } from '@/components/organisms/WorkshopAdminPanel/WorkshopForm';

export const WorkshopAdminPanel: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const handleNewWorkshop = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  return (
    <div>
      <Button onClick={handleNewWorkshop}>Nuevo Taller</Button>
      {showForm && <WorkshopForm onClose={handleCloseForm} />}
      <WorkshopList adminMode />
    </div>
  );
};
