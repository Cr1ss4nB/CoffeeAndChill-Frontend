import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/atoms/Button/Button';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { OrderCard } from '@/components/molecules/OrderCard/OrderCard';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import {
  useOrdersBoard,
  useUpdateOrderStatus,
  groupByStatus,
  type KanbanColumn,
  type BoardOrder,
} from '@/hooks/useOrdersBoard';

const COLUMNS: { key: KanbanColumn; label: string; color: string }[] = [
  { key: 'PENDING',     label: 'En espera',  color: 'border-amber-300/50' },
  { key: 'IN_PROGRESS', label: 'En proceso', color: 'border-blue-300/50' },
  { key: 'COMPLETED',   label: 'Terminado',  color: 'border-emerald-300/50' },
];

const STATUS_FLOW: Record<KanbanColumn, string> = {
  PENDING:     'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED:   'COMPLETED',
};

type StatusFilter = 'ALL' | KanbanColumn;
type TypeFilter = 'ALL' | 'DINE_IN' | 'TAKEAWAY';

interface KanbanColumnProps {
  column: typeof COLUMNS[number];
  orders: BoardOrder[];
}

function Column({ column, orders }: Readonly<KanbanColumnProps>) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.key}`,
    data: {
      type: 'column',
      status: column.key,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[200px] p-3 rounded-2xl bg-white/20 border ${column.color} ${isOver ? 'ring-2 ring-accent-primary/30' : ''}`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-sm text-text-primary">{column.label}</h3>
        <span className="text-xs font-bold bg-white/60 text-text-secondary px-2 py-0.5 rounded-full">
          {orders.length}
        </span>
      </div>
      <SortableContext items={orders.map((o) => `order-${o.order_id}`)} strategy={verticalListSortingStrategy}>
        {orders.map((order) => (
          <OrderCard key={order.order_id} order={order} />
        ))}
      </SortableContext>
      {orders.length === 0 && (
        <p className="text-xs text-text-secondary/40 text-center py-6">Sin pedidos</p>
      )}
    </div>
  );
}

export function OrderKanbanBoard() {
  const { data: orders, isLoading, isError, error: queryError } = useOrdersBoard();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const filteredOrders = useMemo(() => {
    return (orders ?? []).filter((order) => {
      const matchesSearch =
        search.trim() === '' ||
        String(order.order_id).includes(search.trim()) ||
        (order.table_id ? String(order.table_id).includes(search.trim()) : false);

      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || order.order_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [orders, search, statusFilter, typeFilter]);

  const grouped = groupByStatus(filteredOrders);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current as { orderId?: number; status?: KanbanColumn } | undefined;
    const overData = over.data.current as { type?: string; status?: KanbanColumn } | undefined;

    const orderId = activeData?.orderId;
    const sourceStatus = activeData?.status;
    let targetColumn: KanbanColumn | undefined;

    if (overData?.type === 'column' || overData?.type === 'order') {
      targetColumn = overData.status;
    }

    if (!orderId || !targetColumn || sourceStatus === targetColumn) return;

    if (Object.keys(STATUS_FLOW).includes(targetColumn)) {
      updateStatus.mutate({ orderId, status: targetColumn });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    const detail = (queryError as any)?.response?.data?.detail;
    const statusCode = (queryError as any)?.response?.status;
    let helperText = detail || 'Revisa la conexión con el backend.';

    if (statusCode === 401) {
      helperText = 'Tu sesión no es válida o expiró. Vuelve a iniciar sesión.';
    } else if (statusCode === 403) {
      helperText = 'Tu usuario no tiene permisos de staff para ver pedidos.';
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-text-secondary font-medium">No se pudo cargar el tablero de pedidos</p>
        <p className="text-sm text-text-secondary/60">{helperText}</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por pedido o mesa..." />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm" variant={statusFilter === 'ALL' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('ALL')}>
            Todos
          </Button>
          <Button size="sm" variant={statusFilter === 'PENDING' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('PENDING')}>
            En espera
          </Button>
          <Button size="sm" variant={statusFilter === 'IN_PROGRESS' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('IN_PROGRESS')}>
            En proceso
          </Button>
          <Button size="sm" variant={statusFilter === 'COMPLETED' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('COMPLETED')}>
            Terminados
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm" variant={typeFilter === 'ALL' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('ALL')}>
            Todos los tipos
          </Button>
          <Button size="sm" variant={typeFilter === 'DINE_IN' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('DINE_IN')}>
            En mesa
          </Button>
          <Button size="sm" variant={typeFilter === 'TAKEAWAY' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('TAKEAWAY')}>
            Para llevar
          </Button>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-text-secondary py-3">No hay pedidos que coincidan con los filtros.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <Column key={col.key} column={col} orders={grouped[col.key]} />
        ))}
      </div>
    </DndContext>
  );
}
