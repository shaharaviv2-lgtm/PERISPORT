import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "דף הבית" },
    { href: "/category/football", label: "כדורגל" },
    { href: "/category/basketball", label: "כדורסל" },
    { href: "/contact", label: "צור קשר" },
  ];

  const isNavActive = (href: string) => {
    const path = href.split("?")[0];
    const q = new URLSearchParams(href.split("?")[1] ?? "").get("q");
    const currentQ = new URLSearchParams(window.location.search).get("q");
    if (q) return location === path && currentQ === q;
    return location === href;
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark" dir="rtl">
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 border-b border-border"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="PERI"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                  isNavActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex relative hover:text-primary hover:bg-primary/10">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:text-primary hover:bg-primary/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden pt-16">
          <nav className="flex flex-col items-center justify-center h-full gap-8 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-display font-bold tracking-wider uppercase transition-colors ${
                  isNavActive(link.href) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 pt-16 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 opacity-50">
                <img
                  src="/images/logo.png"
                  alt="PERI"
                  className="h-10 w-auto object-contain opacity-60"
                />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                מהונדס עבור חסרי הפשרות. ביגוד ספורט שנבדק במגרש ומוכן לרחוב — לאלה שדוחפים גבולות.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-display font-bold uppercase tracking-wider text-sm text-muted-foreground">ניווט</h4>
              <ul className="space-y-2">
                <li><Link href="/category/football" className="text-sm hover:text-primary transition-colors">כדורגל</Link></li>
                <li><Link href="/category/basketball" className="text-sm hover:text-primary transition-colors">כדורסל</Link></li>
                <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">צור קשר</Link></li>
              </ul>
            </div>

          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} PERI Sport. כל הזכויות שמורות.</p>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground/50">
              <span>המערכת פעילה</span>
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <Link href="/admin" className="hover:text-primary transition-colors">מנהל</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
