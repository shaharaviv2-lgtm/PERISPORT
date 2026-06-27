import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart";

const WHATSAPP_URL = "https://wa.me/972507755525";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
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
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:text-primary hover:bg-primary/10">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground rounded-full text-[10px] font-mono font-bold flex items-center justify-center px-1">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

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
            <Link href="/cart" className="flex items-center gap-2 text-2xl font-display font-bold tracking-wider uppercase text-foreground hover:text-primary transition-colors">
              <ShoppingBag className="w-6 h-6" />
              סל קניות
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full text-sm font-mono px-2 py-0.5">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}

      <main className="flex-1 pt-16 flex flex-col">
        {children}
      </main>

      {/* WhatsApp Floating Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_28px_rgba(37,211,102,0.6)] transition-all hover:scale-105"
        aria-label="שלח הודעה ב-WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

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
