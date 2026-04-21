import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const grouped = groupByStatus(orders ?? []);

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
    const detail = queryError?.response?.data?.detail;
    const statusCode = queryError?.response?.status;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <Column key={col.key} column={col} orders={grouped[col.key]} />
        ))}
      </div>
    </DndContext>
  );
}
