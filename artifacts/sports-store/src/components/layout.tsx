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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Gear" },
    { href: "/social", label: "Network" },
    { href: "/about", label: "Intel" },
    { href: "/contact", label: "Comms" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
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
                  location === link.href ? "text-primary" : "text-muted-foreground"
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
                  location === link.href ? "text-primary" : "text-foreground"
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
                Engineered for the uncompromising. Track-tested, street-ready athletic wear for those who push boundaries.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-display font-bold uppercase tracking-wider text-sm text-muted-foreground">Directory</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-sm hover:text-primary transition-colors">All Gear</Link></li>
                <li><Link href="/about" className="text-sm hover:text-primary transition-colors">Intel</Link></li>
                <li><Link href="/social" className="text-sm hover:text-primary transition-colors">Network</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-display font-bold uppercase tracking-wider text-sm text-muted-foreground">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">Comms</Link></li>
                <li><span className="text-sm text-muted-foreground cursor-not-allowed">Returns</span></li>
                <li><span className="text-sm text-muted-foreground cursor-not-allowed">Sizing Guide</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} PERI Sport. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground/50">
              <span>SYS.ONLINE</span>
              <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
