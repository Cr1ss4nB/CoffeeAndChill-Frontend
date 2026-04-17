import type { Order } from '@/types';
import { formatCOP } from '@/components/molecules/ProductCard/productCard.utils';
import { formatCOP } from '@/utils/formatCOP';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PrintTemplate({ order }: { order: Order }) {
  return (
    <div className="print-only hidden invoice-card">
      <h2>Coffee &amp; Chill</h2>
      <p style={{ textAlign: 'center', fontSize: '10pt' }}>NIT: 900.123.456-7</p>
      <div className="divider" />
      <p>Orden: #{order.orderNumber}</p>
      <p>Mesa: {order.tableNumber}</p>
      <p>Fecha: {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: es })}</p>
      <div className="divider" />
      <table>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.quantity}x {item.productName}</td>
              <td style={{ textAlign: 'right' }}>{formatCOP(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" />
      <p className="total">Total: {formatCOP(order.total)}</p>
      <div className="divider" />
      <p style={{ textAlign: 'center', fontSize: '9pt' }}>Gracias por tu visita</p>
    </div>
  );
}
