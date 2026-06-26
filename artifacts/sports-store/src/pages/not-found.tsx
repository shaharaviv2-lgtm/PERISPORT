import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg w-full border border-border bg-card p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        <h1 className="font-display text-8xl font-bold text-destructive glitch-hover mb-4" data-text="404">404</h1>
        <h2 className="font-display text-2xl uppercase font-bold mb-4 tracking-tight">אות אבד</h2>
        
        <p className="font-mono text-muted-foreground mb-8 text-sm leading-relaxed">
          הסקטור המבוקש אינו פעיל או אינו קיים. אמת קואורדינטות ונסה שוב.
        </p>
        
        <Button asChild className="w-full rounded-none font-display font-bold uppercase tracking-wider h-12 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(153,255,0,0.3)] transition-all">
          <Link href="/products">חזרה לחנות</Link>
        </Button>
      </div>
    </div>
  );
}
