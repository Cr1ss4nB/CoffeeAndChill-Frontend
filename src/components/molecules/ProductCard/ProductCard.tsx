import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { isStaffUser, useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import type { Product } from '@/hooks/useCatalog';
import type { Product as StoreProduct } from '@/types';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

interface ProductCardProps {
  readonly product: Product;
}

function toStoreProduct(p: Product): StoreProduct {
  return {
    id: String(p.product_id),
    name: p.name,
    price: p.price,
    category: 'menu' as StoreProduct['category'],
    available: p.status === 'ACTIVE',
    description: p.description ?? '',
    imageUrl: p.image_url,
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const user = useAuthStore((s) => s.user);
  const addToCart = useUIStore((s) => s.addToCart);
  const canAddToCart = !isStaffUser(user);

  const formattedPrice = formatCOP(product.price);

  const handleAddToCart = () => {
    addToCart(toStoreProduct(product));
  };

  return (
    <div className="glass group overflow-hidden flex flex-col h-full hover:border-accent-primary/30 transition-all duration-300">
      <div className="aspect-square bg-gradient-to-br from-blush/20 to-lavender/20 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary/20 font-display text-4xl group-hover:scale-110 transition-transform duration-500">
            {product.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-lg text-text-primary leading-tight">
            {product.name}
          </h3>
          <span className="font-bold text-accent-primary whitespace-nowrap ml-2">
            {formattedPrice}
          </span>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-grow">
          {product.description || 'Delicioso producto preparado con los mejores ingredientes de Coffee & Chill.'}
        </p>

        {canAddToCart ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddToCart}
            className="w-full gap-2 group-hover:bg-accent-primary group-hover:text-white transition-colors"
          >
            <ShoppingCart size={16} />
            Añadir al carrito
          </Button>
        ) : (
          <p className="text-xs text-text-secondary/80 text-center py-2 border-t border-white/20">
            Vista de carta (solo clientes añaden al carrito)
          </p>
        )}
      </div>
    </div>
  );
}
