import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import type { Product } from '@/hooks/useCatalog';

interface ProductCardProps {
  readonly product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Format price (assuming COP or similar)
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="glass group overflow-hidden flex flex-col h-full hover:border-accent-primary/30 transition-all duration-300">
      <div className="aspect-square bg-gradient-to-br from-blush/20 to-lavender/20 flex items-center justify-center overflow-hidden">
        {/* Placeholder image using Lucide if no URL - for now let's use a colored box */}
        <div className="w-full h-full flex items-center justify-center text-text-secondary/20 font-display text-4xl group-hover:scale-110 transition-transform duration-500">
          {product.name.charAt(0)}
        </div>
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
        
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-full gap-2 group-hover:bg-accent-primary group-hover:text-white transition-colors"
        >
          <ShoppingCart size={16} />
          Añadir al carrito
        </Button>
      </div>
    </div>
  );
}
