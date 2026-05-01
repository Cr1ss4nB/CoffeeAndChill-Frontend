import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { WorkshopList } from '@/components/organisms/WorkshopList/WorkshopList';
import { WorkshopForm } from '@/components/organisms/WorkshopAdminPanel/WorkshopForm';

export const WorkshopAdminPanel: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const handleNewWorkshop = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar taller..." />
        </div>
        <Button onClick={handleNewWorkshop} icon={<Plus size={16} />} className="w-full sm:w-auto">
          Nuevo Taller
        </Button>
      </div>
      
      {showForm && <WorkshopForm onClose={handleCloseForm} />}
      <WorkshopList adminMode searchTerm={search} />
    </div>
  );
};
