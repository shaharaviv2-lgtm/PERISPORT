import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Zap, CheckCircle2, Package, Truck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SIZES_BY_CATEGORY: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  accessories: ["One Size"],
  equipment: ["One Size"],
};

function getSizes(category: string): string[] {
  return SIZES_BY_CATEGORY[category.toLowerCase()] ?? ["S", "M", "L", "XL"];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const productId = parseInt(id ?? "");
  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: { queryKey: getGetProductQueryKey(productId), enabled: !!productId },
  });

  const sizes = product ? getSizes(product.category) : [];
  const hasSizes = sizes.length > 1;
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const allImages = [product?.imageUrl, ...(product?.additionalImages ?? [])].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = useState(0);

  function handleBuy() {
    if (hasSizes && !selectedSize) {
      toast({ title: "בחר מידה", description: "אנא בחר את המידה שלך לפני שתמשיך.", variant: "destructive" });
      return;
    }
    toast({
      title: "נוסף לסל!",
      description: `${product?.name}${selectedSize ? ` — מידה ${selectedSize}` : ""} מוכן לתשלום.`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleCheckout() {
    if (hasSizes && !selectedSize) {
      toast({ title: "בחר מידה", description: "אנא בחר את המידה שלך לפני שתמשיך.", variant: "destructive" });
      return;
    }
    toast({
      title: "תשלום בקרוב",
      description: "אינטגרציית תשלום תחובר כאן בקרוב.",
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-8 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-6 w-32 bg-muted rounded-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-none" />
              <div className="space-y-4">
                <div className="h-4 w-24 bg-muted rounded-none" />
                <div className="h-10 w-3/4 bg-muted rounded-none" />
                <div className="h-8 w-32 bg-muted rounded-none" />
                <div className="h-24 bg-muted rounded-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background pt-8 pb-24 flex items-center justify-center">
        <div className="text-center border border-dashed border-border p-16 bg-card/30">
          <span className="font-mono text-muted-foreground uppercase block mb-2">Error 404</span>
          <h2 className="font-display text-3xl font-bold uppercase mb-6">מוצר לא נמצא</h2>
          <Button variant="outline" className="rounded-none font-mono uppercase" onClick={() => navigate("/products")}>
            חזרה לחנות
          </Button>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6">

        {/* Back link */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          חזרה לחנות
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* Image panel */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square bg-card border border-border overflow-hidden">
              <img
                src={allImages[activeImage] || "/images/product-1.png"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.badge && (
                  <Badge className="rounded-none font-mono uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground border-none text-[10px]">
                    {product.badge}
                  </Badge>
                )}
                {discount && (
                  <Badge className="rounded-none font-mono uppercase tracking-wider px-2 py-1 bg-destructive text-destructive-foreground border-none text-[10px]">
                    -{discount}%
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="destructive" className="rounded-none font-mono uppercase tracking-wider px-2 py-1 text-[10px]">
                    אזל מהמלאי
                  </Badge>
                )}
              </div>

              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/30 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/30 pointer-events-none" />
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 border overflow-hidden transition-all ${
                      activeImage === idx
                        ? "border-primary shadow-[0_0_8px_rgba(153,255,0,0.3)]"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`תמונה ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="flex flex-col">

            {/* Category + ID */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-primary uppercase tracking-widest">
                // {product.category}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                מק"ט: {product.id.toString().padStart(5, "0")}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase leading-none tracking-tighter mb-6">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-border">
              <span className="font-mono text-4xl font-bold text-primary">
                ₪{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-xl text-muted-foreground line-through decoration-destructive decoration-2">
                  ₪{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3 pb-2 border-b border-border/50">
                  מפרט
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size picker */}
            {hasSizes && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                  <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    בחר מידה
                  </h3>
                  {selectedSize && (
                    <span className="font-mono text-xs text-primary uppercase">
                      נבחר: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        min-w-[3rem] px-4 py-2 font-mono text-sm uppercase tracking-wider border transition-all duration-150
                        ${selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(153,255,0,0.3)]"
                          : "bg-card text-foreground border-border hover:border-primary/60 hover:text-primary"
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Truck, label: "משלוח מהיר" },
                { icon: Shield, label: "אותנטי" },
                { icon: Package, label: "החזרה חינם" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-card border border-border p-3 text-center">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Button
                onClick={handleBuy}
                disabled={!product.inStock}
                className="flex-1 rounded-none font-display font-bold uppercase tracking-wider h-14 text-base bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(153,255,0,0.35)] transition-all group"
              >
                {added ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                    נוסף!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                    {product.inStock ? "הוסף לסל" : "אזל מהמלאי"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={!product.inStock}
                variant="outline"
                className="flex-1 rounded-none font-display font-bold uppercase tracking-wider h-14 text-base border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Zap className="w-5 h-5 ml-2" />
                קנה עכשיו
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
