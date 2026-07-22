import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetProduct,
  getGetProductQueryKey,
  useListProducts,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCart } from "@/context/cart";
import { ProductCard } from "@/components/product-card";

const SIZES_BY_CATEGORY: Record<string, string[]> = {
  apparel: ["XS", "S", "M", "L", "XL", "XXL"],
  accessories: ["One Size"],
  equipment: ["One Size"],
};

function getSizes(category: string): string[] {
  return SIZES_BY_CATEGORY[category.toLowerCase()] ?? ["S", "M", "L", "XL"];
}

const SIZE_GUIDE_ROWS = [
  { size: "XS",  chestCm: "82–87",   chestIn: '32–34"', waistCm: "68–73",   waistIn: '27–29"', heightCm: "162–167", heightIn: '64–66"' },
  { size: "S",   chestCm: "88–93",   chestIn: '35–37"', waistCm: "74–79",   waistIn: '29–31"', heightCm: "168–172", heightIn: '66–68"' },
  { size: "M",   chestCm: "94–99",   chestIn: '37–39"', waistCm: "80–85",   waistIn: '31–33"', heightCm: "173–177", heightIn: '68–70"' },
  { size: "L",   chestCm: "100–105", chestIn: '39–41"', waistCm: "86–91",   waistIn: '34–36"', heightCm: "178–182", heightIn: '70–72"' },
  { size: "XL",  chestCm: "106–111", chestIn: '42–44"', waistCm: "92–97",   waistIn: '36–38"', heightCm: "183–187", heightIn: '72–74"' },
  { size: "XXL", chestCm: "112–117", chestIn: '44–46"', waistCm: "98–103",  waistIn: '39–41"', heightCm: "188–193", heightIn: '74–76"' },
];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const productId = parseInt(id ?? "");
  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: { queryKey: getGetProductQueryKey(productId), enabled: !!productId },
  });

  const { addItem } = useCart();
  const sizes = product
    ? (product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes : getSizes(product.category))
    : [];
  const hasSizes = sizes.length > 1;
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [playerNumber, setPlayerNumber] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const allImages = [product?.imageUrl, ...(product?.additionalImages ?? [])].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = useState(0);

  const productSport = product?.sport ?? undefined;
  const { data: allProducts } = useListProducts(
    { sport: productSport },
    {
      query: {
        queryKey: getListProductsQueryKey({ sport: productSport }),
        enabled: !!productSport,
      },
    }
  );
  const relatedProducts = allProducts?.filter((p) => p.id !== productId).slice(0, 4) ?? [];

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | PERI Sport`;
    }
  }, [product]);

  function buildCustomization() {
    const c: { badge?: string; playerName?: string; playerNumber?: string } = {};
    if (selectedBadge) c.badge = selectedBadge;
    if (playerName.trim()) c.playerName = playerName.trim();
    if (playerNumber.trim()) c.playerNumber = playerNumber.trim();
    return Object.keys(c).length > 0 ? c : undefined;
  }

  function handleBuy() {
    if (hasSizes && !selectedSize) {
      toast({
        title: "בחר מידה",
        description: "אנא בחר את המידה שלך לפני שתמשיך.",
        variant: "destructive",
      });
      return;
    }
    if (product) {
      addItem(product, selectedSize || undefined, buildCustomization());
      toast({
        title: "נוסף לסל!",
        description: `${product.name}${selectedSize ? ` — מידה ${selectedSize}` : ""} נוסף לסל הקניות.`,
        action: (
          <ToastAction altText="צפה בסל" onClick={() => navigate("/cart")}>
            צפה בסל
          </ToastAction>
        ),
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleCheckout() {
    if (hasSizes && !selectedSize) {
      toast({
        title: "בחר מידה",
        description: "אנא בחר את המידה שלך לפני שתמשיך.",
        variant: "destructive",
      });
      return;
    }
    if (product) {
      addItem(product, selectedSize || undefined, buildCustomization());
      navigate("/cart");
    }
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      בחר מידה
                    </h3>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="מדריך מידות"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
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


            {/* Customization section — only for customizable non-pants products */}
            {product.customizable && product.itemType !== "pants" && (() => {
              const isBasketball = product.sport === "basketball";
              const badgeOptions = isBasketball
                ? [{ value: "", label: "ללא פאץ'" }, { value: "nba", label: "🏀 NBA" }]
                : [{ value: "", label: "ללא פאץ'" }, { value: "local", label: "🏆 ליגה מקומית" }, { value: "champions", label: "⭐ ליגת האלופות" }];
              const extraPrice = (selectedBadge ? 5 : 0) + (playerName.trim() ? 5 : 0) + (playerNumber.trim() ? 5 : 0);
              return (
                <div className="mb-8 border border-primary/20 bg-primary/5 p-4 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary">// התאמה אישית</span>
                    {extraPrice > 0 && (
                      <span className="font-mono text-xs text-primary">+₪{extraPrice} בחירתך</span>
                    )}
                  </div>

                  {/* Badge picker */}
                  <div className="space-y-2">
                    <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      פאץ' ליגה — אופציונלי <span className="text-primary/60">(+₪5)</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {badgeOptions.map(({ value, label }) => (
                        <button
                          key={value || "none"}
                          onClick={() => setSelectedBadge(value)}
                          className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-all ${
                            selectedBadge === value
                              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(153,255,0,0.3)]"
                              : "bg-card border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Player name */}
                  <div className="space-y-2">
                    <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      שם על החולצה — אופציונלי <span className="text-primary/60">(+₪5)</span>
                    </h3>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="לדוגמה: RONALDO"
                      maxLength={20}
                      className="w-full bg-background border border-border px-3 py-2 font-mono text-sm uppercase tracking-wider text-right focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 placeholder:normal-case"
                    />
                  </div>

                  {/* Player number */}
                  <div className="space-y-2">
                    <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      מספר על החולצה — אופציונלי <span className="text-primary/60">(+₪5)</span>
                    </h3>
                    <input
                      type="number"
                      value={playerNumber}
                      onChange={(e) => setPlayerNumber(e.target.value)}
                      placeholder="7"
                      min={1}
                      max={99}
                      className="w-28 bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              );
            })()}

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

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-baseline gap-4 mb-8 border-b border-border pb-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight">
                אולי יעניין אותך גם
              </h2>
              <span className="font-mono text-xs text-primary uppercase tracking-widest">
                // {product.sport === "football" ? "כדורגל" : product.sport === "basketball" ? "כדורסל" : product.sport}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Dialog */}
      <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DialogContent className="max-w-lg bg-card border-border rounded-none sm:rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-tight">מדריך מידות</DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs text-muted-foreground mb-4">מדוד עם בגד תחתון צמוד. בין שתי מידות — בחר את הגדולה.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-right text-xs text-muted-foreground uppercase">מידה</th>
                  <th className="py-2 px-3 text-right text-xs text-muted-foreground uppercase">חזה (ס"מ / אינץ')</th>
                  <th className="py-2 px-3 text-right text-xs text-muted-foreground uppercase">מותן (ס"מ / אינץ')</th>
                  <th className="py-2 px-3 text-right text-xs text-muted-foreground uppercase">גובה (ס"מ / אינץ')</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE_ROWS.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? "bg-background/50" : ""}>
                    <td className="py-2 px-3 font-bold text-primary">{row.size}</td>
                    <td className="py-2 px-3">{row.chestCm} <span className="text-muted-foreground">/ {row.chestIn}</span></td>
                    <td className="py-2 px-3">{row.waistCm} <span className="text-muted-foreground">/ {row.waistIn}</span></td>
                    <td className="py-2 px-3">{row.heightCm} <span className="text-muted-foreground">/ {row.heightIn}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            בין שתי מידות? בחר את הגדולה יותר לנוחות מרבית.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
