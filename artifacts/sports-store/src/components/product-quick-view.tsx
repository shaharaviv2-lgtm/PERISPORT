import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@workspace/api-client-react/src/generated/api.schemas";

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-border rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-none">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto bg-muted">
            <img
              src={product.imageUrl || "/images/product-1.png"}
              alt={product.name}
              className="object-cover w-full h-full mix-blend-luminosity"
            />
            {/* Overlay Grid lines for tech aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badge && (
                <Badge variant="default" className="rounded-none font-mono uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground border-none">
                  {product.badge}
                </Badge>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-10 flex flex-col h-full bg-card relative">
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary/20 pointer-events-none" />
            
            <DialogHeader className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  // {product.category}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  ID: {product.id.toString().padStart(4, '0')}
                </span>
              </div>
              <DialogTitle className="font-display text-3xl md:text-4xl uppercase leading-none tracking-tight">
                {product.name}
              </DialogTitle>
              
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl text-primary font-bold">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="font-mono text-lg text-muted-foreground line-through decoration-destructive decoration-2">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-6 flex-1">
              <div>
                <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/50 pb-2">Specs</h4>
                <DialogDescription className="text-foreground text-sm md:text-base leading-relaxed">
                  {product.description || "Premium athletic gear engineered for peak performance. Constructed with advanced materials for durability and comfort under extreme conditions."}
                </DialogDescription>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border border-border p-3">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase block mb-1">Status</span>
                  <span className={`font-mono text-sm font-bold uppercase ${product.inStock ? 'text-primary' : 'text-destructive'}`}>
                    {product.inStock ? 'IN STOCK' : 'UNAVAILABLE'}
                  </span>
                </div>
                <div className="bg-background border border-border p-3">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase block mb-1">Shipping</span>
                  <span className="font-mono text-sm font-bold uppercase">
                    NEXT DAY
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button 
                className="flex-1 rounded-none font-display font-bold uppercase tracking-wider h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(153,255,0,0.3)] transition-all group"
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {product.inStock ? 'Acquire Gear' : 'Out of Stock'}
              </Button>
              <Button 
                variant="outline" 
                className="rounded-none font-mono uppercase tracking-wider h-14 border-border hover:bg-secondary hover:text-foreground transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
