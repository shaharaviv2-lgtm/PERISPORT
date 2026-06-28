import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useListProducts, 
  useListCategories, 
  getListProductsQueryKey, 
  getListCategoriesQueryKey 
} from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { ProductQuickView } from "@/components/product-quick-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@workspace/api-client-react";
import { Filter, SlidersHorizontal, Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SORT_OPTIONS = [
  { value: "newest", label: "נוסף לאחרונה" },
  { value: "price-asc", label: "מחיר: נמוך לגבוה" },
  { value: "price-desc", label: "מחיר: גבוה לנמוך" },
  { value: "name", label: "לפי שם" },
];

const SPORT_FILTERS = [
  { value: "all", label: "הכל" },
  { value: "football", label: "⚽ כדורגל" },
  { value: "basketball", label: "🏀 כדורסל" },
];

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = new URLSearchParams(window.location.search).get('q') || "";

  const [activeTab, setActiveTab] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sportFilter, setSportFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    document.title = "חנות החולצות | PERI Sport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "עיין בכל חולצות הספורט של PERI Sport — כדורגל, כדורסל, ג'רזי רשמיים. סינון לפי ספורט, מידה ומחיר.");
  }, []);

  const { data: categories, isLoading: isCategoriesLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const categoryParam = activeTab === 'all' ? undefined : activeTab;
  const { data: products, isLoading: isProductsLoading } = useListProducts(
    { category: categoryParam },
    { query: { queryKey: getListProductsQueryKey({ category: categoryParam }) } }
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (sportFilter !== "all") {
      result = result.filter((p) => p.sport === sportFilter);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }
    if (maxPrice !== null) {
      result = result.filter((p) => p.price <= maxPrice);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [products, searchQuery, sportFilter, sortBy, inStockOnly, maxPrice]);

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-4">
            חנות החולצות
          </h1>
          <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm mb-6">
            // חולצות ומכנסי כדורגל וכדורסל רשמיים
          </p>

          {/* Search bar + sport filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative max-w-xl w-full sm:w-auto sm:flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש מוצרים..."
                className="pr-9 pl-9 rounded-none bg-card border-border font-mono text-sm h-11 focus-visible:ring-primary focus-visible:border-primary text-right"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {SPORT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSportFilter(f.value)}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-all whitespace-nowrap ${
                    sportFilter === f.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Tabs / Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0 sticky top-24 z-10 bg-background/95 backdrop-blur-sm p-1 md:p-0">
            <div className="flex items-center justify-between md:hidden mb-4 border border-border p-4 bg-card">
              <span className="font-mono font-bold uppercase">קטגוריות</span>
              <Filter className="w-4 h-4 text-primary" />
            </div>
            
            <Tabs 
              orientation="vertical" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 border-b md:border-none border-border pb-4 md:pb-0 overflow-x-auto justify-start hide-scrollbar rounded-none items-stretch">
                <TabsTrigger 
                  value="all"
                  className="rounded-none justify-start px-4 py-3 font-mono uppercase tracking-wider text-xs border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all whitespace-nowrap"
                >
                  כל המוצרים
                </TabsTrigger>
                
                {isCategoriesLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-10 w-full bg-muted animate-pulse border border-border" />
                  ))
                ) : (
                  categories
                    ?.filter((cat) => !["accessories", "equipment"].includes(cat.slug))
                    .map((cat) => (
                      <TabsTrigger 
                        key={cat.slug} 
                        value={cat.slug}
                        className="rounded-none justify-start px-4 py-3 font-mono uppercase tracking-wider text-xs border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all whitespace-nowrap"
                      >
                        {cat.name}
                      </TabsTrigger>
                    ))
                )}
              </TabsList>
            </Tabs>
            
            <div className="hidden md:block mt-8 border border-border p-4 bg-card/50 space-y-5">
              <div className="flex items-center gap-2 text-muted-foreground border-b border-border/50 pb-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-mono text-xs uppercase tracking-widest">סינון ומיון</span>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">מיון</p>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-right font-mono text-xs px-3 py-2 border transition-all ${
                      sortBy === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">מחיר מקסימלי</p>
                {[null, 150, 250, 350].map((price) => (
                  <button
                    key={price ?? "all"}
                    onClick={() => setMaxPrice(price)}
                    className={`w-full text-right font-mono text-xs px-3 py-2 border transition-all ${
                      maxPrice === price
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {price === null ? "הכל" : `עד ₪${price}`}
                  </button>
                ))}
              </div>

              {/* In stock */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">זמינות</p>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-full flex items-center justify-between font-mono text-xs px-3 py-2 border transition-all ${
                    inStockOnly
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <span>במלאי בלבד</span>
                  <div className={`w-3 h-3 border transition-all ${inStockOnly ? "bg-primary border-primary" : "border-current"}`} />
                </button>
              </div>

              {/* Reset */}
              {(sortBy !== "newest" || inStockOnly || maxPrice !== null) && (
                <button
                  onClick={() => { setSortBy("newest"); setInStockOnly(false); setMaxPrice(null); }}
                  className="w-full font-mono text-[10px] uppercase tracking-wider text-destructive hover:text-destructive/80 transition-colors text-right"
                >
                  אפס פילטרים
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-6 gap-4">
              <span className="font-mono text-xs text-muted-foreground uppercase">
                {isProductsLoading ? 'מחפש...' : (
                  searchQuery
                    ? `${filteredProducts.length} מתוך ${products?.length ?? 0} תוצאות עבור "${searchQuery}"`
                    : `מציג ${filteredProducts.length} תוצאות`
                )}
              </span>
              <div className="flex items-center gap-3">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="font-mono text-xs text-primary hover:underline uppercase tracking-wider"
                  >
                    נקה חיפוש
                  </button>
                )}
                {/* Sort dropdown — visible on all screens */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-card border border-border font-mono text-xs uppercase tracking-wider text-foreground px-3 py-2 pr-8 cursor-pointer hover:border-primary/60 focus:outline-none focus:border-primary transition-colors"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isProductsLoading ? (
                Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full py-24 text-center border border-dashed border-border bg-card/30">
                  <span className="font-mono text-muted-foreground uppercase block mb-2">שגיאה 404</span>
                  <h3 className="font-display text-2xl font-bold uppercase text-foreground mb-4">
                    {searchQuery ? `אין תוצאות עבור "${searchQuery}"` : "לא נמצאו מוצרים"}
                  </h3>
                  <div className="flex gap-3 justify-center">
                    {searchQuery && (
                      <Button variant="default" className="rounded-none font-mono uppercase bg-primary" onClick={() => setSearchQuery("")}>
                        נקה חיפוש
                      </Button>
                    )}
                    <Button variant="outline" className="rounded-none font-mono uppercase" onClick={() => { setActiveTab('all'); setSearchQuery(""); }}>
                      אפס סינון
                    </Button>
                  </div>
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
