import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBag, Plus, Minus, X, Check, UtensilsCrossed,
  ChevronDown, ChevronUp, Clock, ChefHat, Bell, PackageCheck,
  LogIn, Coffee, PenLine, Utensils,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logoSrc from '@/assets/foreground-1773528399195.png';
import toast from 'react-hot-toast';
import { buildMediaUrl } from '@/api/api.client';
import { usePublicMenu, usePublicOrderStatus, usePublicTables } from '@/hooks/usePublicMenu';
import { placePublicOrder } from '@/services/public.service';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useAuthStore, isStaffUser } from '@/store/auth.store';

interface MenuProduct {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number;
  category_name: string;
  image_url: string | null;
  available_to_sell: number | null;
}

interface CartItem {
  product: MenuProduct;
  quantity: number;
  specialInstructions?: string;
}

interface TableOption {
  table_id: number;
  table_number: number;
  table_code: string;
  label?: string | null;
  status: string;
}

type OrderType = 'DINE_IN' | 'TAKEAWAY';
type CheckoutStep = 'cart' | 'order-type' | 'table-select';

const TABLE_CODE_KEY = 'coffee-chill:table-code';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Header ───────────────────────────────────────────────────────────────────

function CustomerMenuHeader({
  tableNumber,
  tableLabel,
  hasTable,
}: {
  tableNumber?: number;
  tableLabel?: string | null;
  hasTable: boolean;
}) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-10 glass border-b border-glass-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="Coffee & Chill" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-accent-primary">Menú</p>
            <h1 className="font-display font-bold text-lg text-text-primary leading-none">
              {hasTable && tableNumber ? `Mesa ${tableNumber}` : 'Coffee & Chill'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasTable && tableLabel && (
            <span className="px-3 py-1 rounded-full bg-lavender/40 text-xs font-bold text-purple-700 uppercase tracking-wider">
              {tableLabel}
            </span>
          )}
          {!hasTable && (
            <span className="px-3 py-1 rounded-full bg-blush/30 text-xs font-semibold text-text-secondary">
              Sin mesa
            </span>
          )}
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/30">
              <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-semibold text-text-primary hidden sm:block">{user.name}</span>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 border border-white/30 text-xs font-semibold text-text-secondary hover:bg-white/60 transition-colors"
            >
              <LogIn size={13} />
              <span className="hidden sm:block">Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Category Tabs ────────────────────────────────────────────────────────────

function CategoryTabs({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string | undefined;
  onSelect: (id: string | undefined) => void;
}) {
  return (
    <div className="sticky top-[72px] z-9 bg-cream/90 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-2xl mx-auto px-4 flex gap-2 overflow-x-auto py-3 scrollbar-hide">
        <button
          onClick={() => onSelect(undefined)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            selected === undefined
              ? 'bg-accent-primary text-white shadow-md'
              : 'bg-white/50 text-text-secondary hover:bg-white/70'
          }`}
        >
          Todo
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              selected === cat
                ? 'bg-accent-primary text-white shadow-md'
                : 'bg-white/50 text-text-secondary hover:bg-white/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onAdd,
}: {
  product: MenuProduct;
  onAdd: (product: MenuProduct) => void;
}) {
  const isAvailable = product.available_to_sell == null || product.available_to_sell > 0;

  return (
    <div className={`glass rounded-2xl overflow-hidden flex flex-col card-hover ${!isAvailable ? 'opacity-60' : ''}`}>
      {buildMediaUrl(product.image_url) ? (
        <div className="h-36 overflow-hidden relative">
          <img
            src={buildMediaUrl(product.image_url)!}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-gray-400/40 flex items-center justify-center">
              <span className="bg-gray-800/70 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Agotado</span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-blush/20 to-lavender/20 flex items-center justify-center relative">
          <Coffee size={40} className="text-accent-primary/30" />
          {!isAvailable && (
            <div className="absolute inset-0 bg-gray-400/30 flex items-center justify-center rounded-t-2xl">
              <span className="bg-gray-800/70 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Agotado</span>
            </div>
          )}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-text-primary leading-tight">{product.name}</h3>
            {!isAvailable && (
              <span className="shrink-0 text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Agotado
              </span>
            )}
          </div>
          {product.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
        <div className="flex items-end justify-between mt-2">
          <span className={`text-lg font-bold ${isAvailable ? 'text-accent-primary' : 'text-gray-400'}`}>{formatCOP(product.price)}</span>
          <button
            onClick={() => isAvailable && onAdd(product)}
            disabled={!isAvailable}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform shadow-md ${
              isAvailable
                ? 'bg-accent-primary text-white hover:scale-110 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Type Step ──────────────────────────────────────────────────────────

function OrderTypeStep({
  onSelect,
}: {
  onSelect: (type: OrderType) => void;
}) {
  return (
    <div className="px-5 py-5 space-y-3">
      <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-widest text-center mb-4">
        ¿Cómo es tu pedido?
      </p>

      {/* Para llevar */}
      <button
        onClick={() => onSelect('TAKEAWAY')}
        className="w-full group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-200/40 hover:border-amber-300/60 hover:shadow-md active:scale-[0.98] transition-all text-left"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <ShoppingBag size={26} className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary text-base">Para llevar</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            Recoge en el mostrador cuando esté listo
          </p>
        </div>
        <ChevronDown size={18} className="text-text-secondary/40 -rotate-90 shrink-0" />
      </button>

      {/* En mesa */}
      <button
        onClick={() => onSelect('DINE_IN')}
        className="w-full group flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-lavender/30 to-purple-50/50 border border-lavender/40 hover:border-purple-300/60 hover:shadow-md active:scale-[0.98] transition-all text-left"
      >
        <div className="w-14 h-14 rounded-2xl bg-lavender/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Utensils size={26} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-primary text-base">Voy a sentarme</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            Un mesero te atenderá y asignará una mesa
          </p>
        </div>
        <ChevronDown size={18} className="text-text-secondary/40 -rotate-90 shrink-0" />
      </button>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function PublicCartDrawer({
  cart,
  total,
  onIncrease,
  onDecrease,
  onClearCart,
  onPlaceOrder,
  onUpdateInstructions,
  isSubmitting,
  isOpen,
  onOpen,
  onClose,
  hasTable,
}: {
  cart: CartItem[];
  total: number;
  onIncrease: (product: MenuProduct) => void;
  onDecrease: (product: MenuProduct) => void;
  onClearCart: () => void;
  onPlaceOrder: (notes: string, orderType: OrderType) => void;
  onUpdateInstructions: (productId: number, instructions: string) => void;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hasTable: boolean;
}) {
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<CheckoutStep>('cart');

  // reset step when drawer closes
  useEffect(() => {
    if (!isOpen) setStep('cart');
  }, [isOpen]);

  function handleConfirm() {
    if (hasTable) {
      // Mesa conocida (QR) → directo
      onPlaceOrder(notes, 'DINE_IN');
      onClose();
    } else {
      // Sin mesa → mostrar selector de tipo
      setStep('order-type');
    }
  }

  function handleOrderTypeSelect(type: OrderType) {
    onPlaceOrder(notes, type);
    onClose();
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* ── Cart pill (collapsed) ─────────────────────────────────────── */}
      <AnimatePresence>
        {cart.length > 0 && !isOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 sm:pb-6"
          >
            <div className="max-w-lg mx-auto">
              <button
                onClick={onOpen}
                className="w-full glass rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl border border-glass-border active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center shadow-md">
                      <ShoppingBag size={18} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blush text-white text-[9px] font-bold flex items-center justify-center">
                      {totalItems}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
                      {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                    </p>
                    <p className="font-bold text-text-primary">{formatCOP(total)}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-accent-primary text-white text-sm font-bold shrink-0">
                  Ver pedido <ChevronUp size={13} />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full cart sheet / modal ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && cart.length > 0 && (
          <motion.div
            key="cart-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            // Mobile: bottom sheet. Desktop: centered modal
            className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 38 }}
              // Mobile: full-width bottom sheet. Desktop: floating card, max-w-md
              className="relative glass flex flex-col shadow-2xl
                         rounded-t-3xl border-t border-white/30
                         sm:rounded-3xl sm:border sm:border-glass-border
                         max-h-[88vh] sm:max-h-[80vh]
                         w-full sm:max-w-md"
            >
              {/* Drag handle — mobile only */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-text-secondary/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20">
                <div className="flex items-center gap-2.5">
                  {step !== 'cart' && (
                    <button
                      onClick={() => setStep('cart')}
                      className="w-8 h-8 rounded-xl bg-white/40 flex items-center justify-center text-text-secondary hover:bg-white/60 transition-colors"
                    >
                      <ChevronDown size={16} className="rotate-90" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                    <ShoppingBag size={16} className="text-accent-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base text-text-primary leading-tight">
                      {step === 'order-type' ? 'Tipo de pedido' : 'Tu pedido'}
                    </h2>
                    {step === 'cart' && (
                      <p className="text-[10px] text-text-secondary/60 font-medium">
                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {step === 'cart' && (
                    <button
                      onClick={() => { onClearCart(); onClose(); }}
                      className="text-xs text-text-secondary/50 hover:text-text-secondary transition-colors px-2 py-1.5 rounded-lg hover:bg-white/30"
                    >
                      Vaciar
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-white/40 flex items-center justify-center text-text-secondary hover:bg-white/60 transition-colors ml-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Content — animated step transition */}
              <AnimatePresence mode="wait">

                {/* ── Step: cart ── */}
                {step === 'cart' && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.16 }}
                    className="flex flex-col flex-1 overflow-hidden"
                  >
                    {/* Items list */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                      {cart.map((item) => {
                        const thumb = buildMediaUrl(item.product.image_url);
                        return (
                          <div
                            key={item.product.product_id}
                            className="rounded-2xl bg-white/40 border border-white/30 overflow-hidden"
                          >
                            <div className="flex items-center gap-3 p-3">
                              {/* Thumbnail */}
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={item.product.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blush/30 to-lavender/20 flex items-center justify-center shrink-0">
                                  <Coffee size={20} className="text-accent-primary/40" />
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-primary truncate leading-tight">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-accent-primary font-semibold mt-0.5">
                                  {formatCOP(item.product.price * item.quantity)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-[10px] text-text-secondary/50 mt-0.5">
                                    {formatCOP(item.product.price)} c/u
                                  </p>
                                )}
                              </div>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-1 shrink-0 bg-white/50 rounded-xl p-1 border border-white/30">
                                <button
                                  onClick={() => onDecrease(item.product)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-white/70 active:scale-90 transition-all"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="text-sm font-bold w-6 text-center text-text-primary">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onIncrease(item.product)}
                                  className="w-7 h-7 rounded-lg bg-accent-primary text-white flex items-center justify-center hover:bg-accent-primary/90 active:scale-90 transition-all"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Per-item special instructions */}
                            <div className="px-3 pb-2.5">
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/50 border border-white/40">
                                <PenLine size={11} className="text-text-secondary/40 shrink-0" />
                                <input
                                  type="text"
                                  value={item.specialInstructions ?? ''}
                                  onChange={(e) => onUpdateInstructions(item.product.product_id, e.target.value)}
                                  placeholder="Sin azúcar, sin hielo…"
                                  className="flex-1 text-[11px] bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary/35"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pt-3 pb-5 sm:pb-5 border-t border-white/20 space-y-3">
                      {/* Notes */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 border border-white/30 focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
                        <PenLine size={15} className="text-text-secondary/50 shrink-0" />
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Alguna indicación especial..."
                          className="flex-1 text-sm bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary/40"
                        />
                      </div>

                      {/* Total row */}
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm text-text-secondary font-medium">Total</span>
                        <span className="text-2xl font-bold text-text-primary">{formatCOP(total)}</span>
                      </div>

                      {/* CTA */}
                      <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-2xl bg-accent-primary text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-accent-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-accent-primary/20"
                      >
                        {isSubmitting ? (
                          <Spinner size="sm" />
                        ) : hasTable ? (
                          <>Confirmar pedido <Check size={16} /></>
                        ) : (
                          <>Continuar <ChevronDown size={16} className="-rotate-90" /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step: order-type ── */}
                {step === 'order-type' && (
                  <motion.div
                    key="order-type"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.16 }}
                    className="flex-1 overflow-y-auto pb-2"
                  >
                    <OrderTypeStep onSelect={handleOrderTypeSelect} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Order Tracking ───────────────────────────────────────────────────────────

const ORDER_STEPS: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'PENDING',   label: 'En espera',  icon: <Clock size={18} />,        color: 'text-lavender' },
  { key: 'PREPARING', label: 'Preparando', icon: <ChefHat size={18} />,      color: 'text-peach' },
  { key: 'READY',     label: '¡Listo!',    icon: <Bell size={18} />,         color: 'text-sage' },
  { key: 'DELIVERED', label: 'Entregado',  icon: <PackageCheck size={18} />, color: 'text-green-600' },
];

function OrderTrackingCard({
  orderId,
  orderType,
  onDismiss,
}: {
  orderId: number;
  orderType: OrderType;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { data: order, isLoading, isError } = usePublicOrderStatus(orderId);

  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.key === (order?.status ?? 'PENDING'));
  const isDelivered = order?.status === 'DELIVERED';
  const isReady = order?.status === 'READY';

  const STATUS_BG: Record<string, string> = {
    PENDING:   'from-lavender/30 to-lavender/10',
    PREPARING: 'from-peach/30 to-peach/10',
    READY:     'from-sage/30 to-sage/10',
    DELIVERED: 'from-sage/40 to-sage/20',
  };
  const currentBg = STATUS_BG[order?.status ?? 'PENDING'];

  // Context-aware message for non-QR orders
  const readyMessage = orderType === 'TAKEAWAY'
    ? '¡Pasa al mostrador a recoger tu pedido! ☕'
    : '¡Tu pedido está listo! Un mesero te lo llevará 🪑';

  const deliveredMessage = orderType === 'TAKEAWAY'
    ? '¡Que lo disfrutes! 🎉'
    : '¡Buen provecho! 🎉';

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
    >
      <div className={`max-w-2xl mx-auto glass rounded-2xl shadow-2xl border border-glass-border bg-gradient-to-br ${currentBg} overflow-hidden`}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 gap-3"
        >
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Spinner size="sm" />
            ) : isDelivered ? (
              <div className="w-9 h-9 rounded-full bg-sage/50 flex items-center justify-center">
                <Check size={18} className="text-green-700" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-accent-primary/20 flex items-center justify-center animate-pulse">
                {ORDER_STEPS[currentStepIdx]?.icon}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs text-text-secondary/70 font-medium">
                Pedido #{orderId}
                {orderType === 'TAKEAWAY' && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Para llevar</span>}
                {orderType === 'DINE_IN' && <span className="ml-1.5 text-[10px] bg-lavender/60 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">En mesa</span>}
                {isError && <span className="ml-2 text-red-500 font-bold">· Error de conexión</span>}
              </p>
              <p className="text-sm font-bold text-text-primary">
                {ORDER_STEPS[currentStepIdx]?.label ?? 'Procesando…'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDelivered && (
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className="p-1.5 rounded-lg bg-white/30 text-text-secondary hover:bg-white/50 transition-colors"
              >
                <X size={14} />
              </button>
            )}
            {expanded ? <ChevronDown size={18} className="text-text-secondary" /> : <ChevronUp size={18} className="text-text-secondary" />}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-4 pt-3 pb-4 space-y-4">
                {/* Stepper */}
                <div className="flex items-center gap-0">
                  {ORDER_STEPS.map((step, idx) => {
                    const done = idx < currentStepIdx;
                    const active = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                            done    ? 'bg-accent-primary text-white shadow-sm' :
                            active  ? 'bg-accent-primary/15 text-accent-primary border-2 border-accent-primary/60' :
                                      'bg-white/30 text-text-secondary/40'
                          }`}>
                            {done ? <Check size={14} /> : step.icon}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight ${
                            active ? 'text-accent-primary' : done ? 'text-text-secondary' : 'text-text-secondary/40'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {idx < ORDER_STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all ${
                            done ? 'bg-accent-primary' : 'bg-white/30'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                {order?.items && order.items.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Tu pedido</p>
                    {order.items.map((item: any) => (
                      <div key={item.item_id} className="flex justify-between text-sm">
                        <span className="text-text-secondary">
                          {item.quantity}× {item.product_name ?? `#${item.product_id}`}
                        </span>
                        <span className="font-medium text-text-primary">{formatCOP(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-1 border-t border-white/20 font-bold">
                      <span>Total</span>
                      <span className="text-accent-primary">{formatCOP(order.total_amount)}</span>
                    </div>
                  </div>
                )}

                {/* DINE_IN without table: show waiter note from the start */}
                {orderType === 'DINE_IN' && !isReady && !isDelivered && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-lavender/20 border border-lavender/30">
                    <Utensils size={14} className="text-purple-600 shrink-0" />
                    <p className="text-xs text-purple-700 font-medium leading-snug">
                      Un mesero te atenderá y llevará tu pedido a la mesa
                    </p>
                  </div>
                )}

                {isReady && !isDelivered && (
                  <p className="text-center text-sm font-semibold text-text-primary">
                    {readyMessage}
                  </p>
                )}
                {isDelivered && (
                  <p className="text-center text-sm text-text-secondary/70">
                    {deliveredMessage}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-8 max-w-sm text-center space-y-4">
        <div className="w-16 h-16 bg-blush/30 rounded-full flex items-center justify-center mx-auto">
          <UtensilsCrossed size={32} className="text-blush" />
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Ups</h1>
        <p className="text-text-secondary">{message}</p>
        <Link to="/menu" className="inline-block mt-2 text-sm text-accent-primary font-semibold hover:underline">
          Ver menú →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerMenuPage() {
  const { tableCode: tableCodeParam } = useParams<{ tableCode?: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Staff redirect — this is a customer-only page
  useEffect(() => {
    if (isStaffUser(user)) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Resolve effective tableCode: URL param → sessionStorage → null
  const [tableCode, setTableCode] = useState<string | null>(() => {
    if (tableCodeParam) return tableCodeParam;
    return sessionStorage.getItem(TABLE_CODE_KEY);
  });

  // Persist tableCode from QR to sessionStorage
  useEffect(() => {
    if (tableCodeParam) {
      sessionStorage.setItem(TABLE_CODE_KEY, tableCodeParam);
      setTableCode(tableCodeParam);
    }
  }, [tableCodeParam]);

  // Table info (only when we have a code)
  const {
    data: tableInfo,
    isLoading: tableLoading,
  } = usePublicTables();

  // Find the specific table if we have a code
  const table = tableCode
    ? (tableInfo as TableOption[] | undefined)?.find((t) => t.table_code === tableCode)
    : null;

  const hasTable = !!table;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [lastOrderType, setLastOrderType] = useState<OrderType>('DINE_IN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: menu = [], isLoading: menuLoading } = usePublicMenu();
  const categories = [...new Set((menu as MenuProduct[]).map((p) => p.category_name))] as string[];
  const filteredMenu = selectedCategory
    ? (menu as MenuProduct[]).filter((p) => p.category_name === selectedCategory)
    : (menu as MenuProduct[]);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Show error only when tableCode explicitly provided (QR) but not found
  if (tableCodeParam && tableLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (tableCodeParam && !tableLoading && !table) {
    // The code might be invalid; clear it and continue in tableless mode
    sessionStorage.removeItem(TABLE_CODE_KEY);
    return (
      <ErrorScreen message="No encontramos esta mesa. Asegúrate de escanear un código QR válido." />
    );
  }

  // Table validation for QR mode: check status
  if (tableCodeParam && table) {
    const t = table as TableOption & { status: string };
    if (t.status === 'MAINTENANCE') {
      return <ErrorScreen message="Esta mesa no está disponible en este momento. Habla con un mesero." />;
    }
  }

  function addToCart(product: MenuProduct) {
    const ats = product.available_to_sell;
    if (ats != null && ats <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.product_id === product.product_id);
      if (existing) {
        if (ats != null && existing.quantity >= ats) return prev;
        return prev.map((i) =>
          i.product.product_id === product.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function increaseItem(product: MenuProduct) {
    const ats = product.available_to_sell;
    setCart((prev) =>
      prev.map((i) => {
        if (i.product.product_id !== product.product_id) return i;
        if (ats != null && i.quantity >= ats) return i;
        return { ...i, quantity: i.quantity + 1 };
      })
    );
  }

  function updateItemInstructions(productId: number, instructions: string) {
    setCart((prev) =>
      prev.map((i) =>
        i.product.product_id === productId
          ? { ...i, specialInstructions: instructions }
          : i
      )
    );
  }

  function decreaseItem(product: MenuProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.product_id === product.product_id);
      if (existing && existing.quantity <= 1) {
        return prev.filter((i) => i.product.product_id !== product.product_id);
      }
      return prev.map((i) =>
        i.product.product_id === product.product_id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  }

  async function handlePlaceOrder(notes: string, orderType: OrderType) {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload: Parameters<typeof placePublicOrder>[0] = {
        order_type: orderType,
        items: cart.map((item) => ({
          product_id: item.product.product_id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions?.trim() || undefined,
        })),
        notes: notes.trim() || undefined,
        ...(tableCode ? { table_code: tableCode } : {}),
      };
      const response = await placePublicOrder(payload);
      setLastOrderId(response.order_id);
      setLastOrderType(orderType);
      setCart([]);
      setIsCartOpen(false);
    } catch (err: any) {
      const data = err?.response?.data;
      const status = err?.response?.status;
      let msg = `Error ${status}: `;
      if (typeof data?.detail === 'string') msg += data.detail;
      else if (Array.isArray(data?.detail)) msg += data.detail.map((d: any) => d.msg).join(', ');
      else msg += (data?.detail || err?.message || 'No se pudo enviar el pedido');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`min-h-screen bg-cream ${lastOrderId ? 'pb-52' : cart.length > 0 ? 'pb-28' : 'pb-8'}`}>
      <CustomerMenuHeader
        tableNumber={table?.table_number}
        tableLabel={table?.label}
        hasTable={hasTable}
      />

      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat as string | undefined)}
      />

      <main className="max-w-2xl mx-auto px-4 py-4">
        {menuLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenu.map((product) => (
              <ProductCard key={product.product_id} product={product} onAdd={addToCart} />
            ))}
          </div>
        )}
        {(menu as MenuProduct[]).length === 0 && !menuLoading && (
          <div className="text-center py-12 space-y-3">
            <Coffee size={40} className="mx-auto text-accent-primary/30" />
            <p className="text-text-secondary font-medium">No hay productos disponibles</p>
          </div>
        )}
      </main>

      <PublicCartDrawer
        cart={cart}
        total={total}
        onIncrease={increaseItem}
        onDecrease={decreaseItem}
        onClearCart={() => setCart([])}
        onPlaceOrder={handlePlaceOrder}
        onUpdateInstructions={updateItemInstructions}
        isSubmitting={isSubmitting}
        isOpen={isCartOpen}
        onOpen={() => setIsCartOpen(true)}
        onClose={() => setIsCartOpen(false)}
        hasTable={hasTable}
      />

      <AnimatePresence>
        {lastOrderId && (
          <OrderTrackingCard
            orderId={lastOrderId}
            orderType={lastOrderType}
            onDismiss={() => setLastOrderId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
