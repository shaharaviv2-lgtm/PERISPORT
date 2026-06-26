import { useListProducts, useGetStoreStats, getListProductsQueryKey, getGetStoreStatsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Activity, Globe, Box, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { ProductQuickView } from "@/components/product-quick-view";
import { useState } from "react";
import type { Product } from "@workspace/api-client-react";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: featuredProducts, isLoading: isFeaturedLoading } = useListProducts(
    { newest: true, limit: 5 },
    { query: { queryKey: getListProductsQueryKey({ newest: true, limit: 5 }) } }
  );

  const { data: storeStats, isLoading: isStatsLoading } = useGetStoreStats({
    query: { queryKey: getGetStoreStatsQueryKey() }
  });


  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/images/category-apparel.png" 
            alt="Hero background" 
            className="object-cover w-full h-full mix-blend-luminosity opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/90 to-transparent md:via-background/50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-3xl mr-0 ml-auto space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/50 border border-border backdrop-blur-sm">
              <span className="w-2 h-2 bg-primary animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-primary">המערכת פעילה // גרסה 2.4</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold uppercase leading-[0.9] tracking-tighter">
              לבש את<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">האלופים.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground font-mono max-w-xl leading-relaxed">
              גופיות ומכנסי כדורגל וכדורסל רשמיים.
              קבוצות מהליגות המובילות בעולם — במשלוח לישראל.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="rounded-none font-display font-bold uppercase tracking-wider text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(153,255,0,0.3)] transition-all group">
                <Link href="/products">
                  לחנות
                  <ArrowRight className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none font-mono uppercase tracking-wider h-14 border-border hover:bg-secondary transition-colors">
                <Link href="/about">עוד עלינו</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 p-8 hidden md:block">
          <div className="flex items-end gap-4 opacity-30 font-mono text-[10px]">
            <div className="flex flex-col items-end gap-1">
              <span>LAT: 37.7749 N</span>
              <span>LNG: 122.4194 W</span>
            </div>
            <div className="w-16 h-[1px] bg-foreground" />
            <span>PERI_SYS</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm relative z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center gap-2">
              <Activity className="w-6 h-6 text-primary mb-2 opacity-50" />
              <span className="font-display text-3xl md:text-4xl font-bold">
                {isStatsLoading ? <span className="animate-pulse">--</span> : storeStats?.totalProducts}
              </span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">פריטים פעילים</span>
            </div>
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center gap-2">
              <Box className="w-6 h-6 text-primary mb-2 opacity-50" />
              <span className="font-display text-3xl md:text-4xl font-bold">
                {isStatsLoading ? <span className="animate-pulse">--</span> : storeStats?.totalCategories}
              </span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">קטגוריות</span>
            </div>
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center gap-2">
              <Award className="w-6 h-6 text-primary mb-2 opacity-50" />
              <span className="font-display text-3xl md:text-4xl font-bold">
                {isStatsLoading ? <span className="animate-pulse">--</span> : storeStats?.featuredCount}
              </span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">פריטים מובחרים</span>
            </div>
            <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center gap-2">
              <Globe className="w-6 h-6 text-primary mb-2 opacity-50" />
              <span className="font-display text-3xl md:text-4xl font-bold">חינם</span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">משלוח לישראל</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-mono text-primary text-sm uppercase tracking-widest mb-2">// הגיע לאחרונה</h2>
              <h3 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">חדש בחנות</h3>
            </div>
            <Button asChild variant="ghost" className="rounded-none font-mono uppercase tracking-wider hover:bg-secondary group">
              <Link href="/products">
                לכל המוצרים <ChevronRight className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isFeaturedLoading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              featuredProducts?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={setSelectedProduct} 
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-mono text-primary text-sm uppercase tracking-widest mb-2 text-center">// קטגוריות</h2>
          <h3 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-center mb-16">מה אתה מחפש?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                label: "כדורגל",
                sub: "01",
                href: "/category/football",
                img: "/images/uploads/1782411677960-qg8c3u.jpg",
                alt: "גופיית כדורגל",
              },
              {
                label: "כדורסל",
                sub: "02",
                href: "/category/basketball",
                img: "/images/uploads/1782411301659-1ebdq8.jpg",
                alt: "גופיית כדורסל",
              },
            ].map((sport) => (
              <Link
                key={sport.href}
                href={sport.href}
                className="group relative aspect-[4/3] border border-border overflow-hidden bg-background block"
              >
                <img
                  src={sport.img}
                  alt={sport.alt}
                  className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-[opacity,transform] duration-300 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-primary mb-2 block uppercase tracking-widest">{sport.sub}</span>
                      <h4 className="font-display text-3xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{sport.label}</h4>
                    </div>
                    <div className="w-10 h-10 border border-border flex items-center justify-center bg-background/50 backdrop-blur group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-background border-t border-border flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(153,255,0,0.1)_0%,transparent_70%)]" />
        </div>
        
        <div className="container relative z-10 px-4 max-w-4xl mx-auto space-y-8">
          <div className="inline-block p-4 border-2 border-primary/20 relative">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary" />
            
            <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter">
              פאן אמיתי?
            </h2>
          </div>
          
          <p className="font-mono text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            עקוב אחרינו לעדכונים על קולקציות חדשות, מבצעים בלעדיים ומשלוחים מהירים לפני כולם.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Button asChild size="lg" className="rounded-none font-display font-bold uppercase tracking-wider text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="https://instagram.com/perisport" target="_blank" rel="noopener noreferrer">Instagram</a>
            </Button>
          </div>
        </div>
      </section>

      <ProductQuickView 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
