import { useState } from 'react';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { ProductCard } from '@/components/molecules/ProductCard/ProductCard';
import { AppShellTemplate } from '@/components/templates/AppShellTemplate/AppShellTemplate';
import { Coffee, Palette, Store, Filter } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';

const iconMap: Record<string, any> = {
  'Bebidas Calientes': Coffee,
  'Bebidas Frías': Coffee, // Use coffee as fallback
  'Cerámica': Palette,
};

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const { data: categories } = useCategories();
  const { data: products, isLoading: isLoadingProds } = useProducts(selectedCategory);

  const renderContent = () => {
    if (isLoadingProds) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass aspect-[3/4] animate-pulse" />
          ))}
        </div>
      );
    }

    if ((products ?? []).length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-20 px-4 glass rounded-3xl">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <Filter size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">No se encontraron productos</h2>
        <p className="text-text-secondary max-w-sm mx-auto mb-8">
          Lo sentimos, no hay productos disponibles en esta categoría por el momento.
        </p>
        <Button onClick={() => setSelectedCategory(undefined)}>Ver todo el menú</Button>
      </div>
    );
  };

  return (
    <AppShellTemplate title="Nuestro Menú">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <p className="text-text-secondary text-lg max-w-2xl">
            Descubre nuestra selección de cafés de especialidad, repostería artesanal y experiencias creativas.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 border-2 ${
              selectedCategory === undefined
                ? 'bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20'
                : 'bg-white/50 border-white/50 text-text-secondary hover:border-accent-primary/30'
            }`}
          >
            <Store size={18} />
            Todos
          </button>

          {categories?.map((cat) => {
            const Icon = iconMap[cat.category_name] || Store;
            return (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategory(cat.category_id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 border-2 ${
                  selectedCategory === cat.category_id
                    ? 'bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20'
                    : 'bg-white/50 border-white/50 text-text-secondary hover:border-accent-primary/30'
                }`}
              >
                <Icon size={18} />
                {cat.category_name}
              </button>
            );
          })}
        </div>

        {/* Product Grid Container */}
        {renderContent()}
      </div>
    </AppShellTemplate>
  );
}
