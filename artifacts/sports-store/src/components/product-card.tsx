import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@workspace/api-client-react";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [, navigate] = useLocation();

  return (
    <div
      className="group relative bg-card border border-border rounded-none overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(153,255,0,0.1)] flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.badge && (
            <Badge variant="default" className="rounded-none font-mono uppercase tracking-wider text-[10px] px-2 py-0.5 bg-primary text-primary-foreground border-none">
              {product.badge}
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="destructive" className="rounded-none font-mono uppercase tracking-wider text-[10px] px-2 py-0.5">
              אזל מהמלאי
            </Badge>
          )}
        </div>

        {/* Image */}
        <img
          src={product.imageUrl || "/images/product-1.png"}
          alt={product.name}
          className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-[opacity,transform] duration-300 ease-out"
        />

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
          {onQuickView && (
            <Button 
              size="icon" 
              variant="outline" 
              className="bg-background/50 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-none transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button 
            size="icon" 
            variant="outline"
            className="bg-background/50 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-none transition-colors"
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 border-t border-border">
        <div className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">
          {product.category}
        </div>
        <h3 className="font-display font-bold text-lg leading-tight uppercase mb-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-mono font-bold text-primary text-lg">
            ₪{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="font-mono text-xs text-muted-foreground line-through">
              ₪{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      
      {/* Decorative tech accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-none overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-[4/5] bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      </div>
      <div className="p-4 flex flex-col flex-1 border-t border-border gap-2">
        <div className="h-3 w-16 bg-muted rounded-none" />
        <div className="h-5 w-3/4 bg-muted rounded-none" />
        <div className="h-5 w-1/2 bg-muted rounded-none mt-auto" />
      </div>
    </div>
  );
}
