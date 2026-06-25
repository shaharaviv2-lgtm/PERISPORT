import { useState, useMemo } from "react";
import { useParams } from "wouter";
import {
  useListProducts,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { ProductQuickView } from "@/components/product-quick-view";
import type { Product } from "@workspace/api-client-react";
import { Trophy } from "lucide-react";

const SPORT_META: Record<string, { title: string; subtitle: string }> = {
  football: {
    title: "כדורגל",
    subtitle: "// גופיות ומכנסי כדורגל רשמיים",
  },
  basketball: {
    title: "כדורסל",
    subtitle: "// גופיות ומכנסי כדורסל רשמיים",
  },
};

const TYPE_FILTERS = [
  { value: "all", label: "הכל" },
  { value: "shirt", label: "חולצות" },
  { value: "pants", label: "מכנסיים" },
];

export default function Category() {
  const params = useParams<{ sport: string }>();
  const sport = params.sport ?? "football";
  const meta = SPORT_META[sport] ?? { title: sport, subtitle: "" };

  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useListProducts(
    { sport },
    { query: { queryKey: getListProductsQueryKey({ sport }) } }
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (typeFilter === "all") return products;
    return products.filter((p) => p.itemType === typeFilter);
  }, [products, typeFilter]);

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-7 h-7 text-primary" />
            <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tighter">
              {meta.title}
            </h1>
          </div>
          <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm mb-6">
            {meta.subtitle}
          </p>

          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`rounded-none px-5 py-2.5 font-mono uppercase tracking-wider text-xs border transition-all ${
                  typeFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {isLoading ? "מחפש..." : `מציג ${filteredProducts.length} תוצאות`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-24 text-center border border-dashed border-border bg-card/30">
              <span className="font-mono text-muted-foreground uppercase block mb-2">
                ריק
              </span>
              <h3 className="font-display text-2xl font-bold uppercase text-foreground">
                אין מוצרים בקטגוריה זו עדיין
              </h3>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))
          )}
        </div>
      </div>

      <ProductQuickView
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
