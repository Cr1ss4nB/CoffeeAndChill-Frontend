import { useState } from 'react';
import { DollarSign, TrendingUp, Receipt, Users } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { usePayments } from '@/hooks/usePayments';

const PAYMENT_LABELS: Record<string, string> = {
  CASH:     'Efectivo',
  CARD:     'Tarjeta',
  TRANSFER: 'Transferencia',
  WALLET:   'Billetera',
  CRYPTO:   'Crypto',
};

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function SalesHistoryPage() {
  const [date, setDate] = useState(todayISO());
  const { data, isLoading, isError } = usePayments(date);

  const summary = data?.summary;
  const payments = data?.payments ?? [];

  return (
    <DashboardTemplate title="Historial de Ventas">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Registro de pagos y cierres de mesa del día seleccionado.
        </p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayISO()}
          className="px-4 py-2 rounded-xl text-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50 text-text-primary"
        />
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass p-4 !rounded-2xl border-l-4 border-sage">
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={14} className="text-green-600" />
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Transacciones</p>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{summary.count}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-sky">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-blue-600" />
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Ventas</p>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{formatCOP(summary.total_ventas)}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-lavender">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-purple-600" />
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Propinas</p>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{formatCOP(summary.total_propinas)}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-blush">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-red-500" />
              <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total con propinas</p>
            </div>
            <p className="text-2xl font-display font-bold text-text-primary">{formatCOP(summary.total_con_propinas)}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-text-secondary">
          <p className="font-medium">Error cargando el historial.</p>
          <p className="text-sm mt-1">Verifica tu conexión e intenta de nuevo.</p>
        </div>
      )}

      {!isLoading && !isError && payments.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">📋</p>
          <p className="text-text-secondary font-medium">Sin ventas para esta fecha</p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20 bg-white/20">
                  <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Mesa</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Subtotal</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Propina</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Cajero</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.payment_id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                    <td className="px-4 py-3 text-text-secondary font-medium">
                      {new Date(p.payment_date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {p.table_number ? (
                        <span className="font-bold text-text-primary">Mesa {p.table_number}</span>
                      ) : (
                        <span className="text-text-secondary/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-lavender/30 text-purple-700 text-xs font-bold">
                        {PAYMENT_LABELS[p.payment_method] ?? p.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCOP(p.amount)}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {p.tip_amount > 0 ? formatCOP(p.tip_amount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-accent-primary">{formatCOP(p.total)}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{p.cashier ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardTemplate>
  );
}
