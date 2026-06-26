import { useLocation } from "wouter";
import { useEffect } from "react";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    document.title = `סל קניות${totalItems > 0 ? ` (${totalItems})` : ""} | PERI Sport`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "סל הקניות שלך ב-PERI Sport — בדוק את הפריטים שבחרת וסיים את הרכישה.");
  }, [totalItems]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-8 pb-24 flex items-center justify-center">
        <div className="text-center border border-dashed border-border p-16 bg-card/30">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
          <span className="font-mono text-muted-foreground uppercase tracking-widest block mb-2 text-xs">// CART_EMPTY</span>
          <h2 className="font-display text-3xl font-bold uppercase mb-4">הסל ריק</h2>
          <p className="text-muted-foreground text-sm mb-8">לא הוספת פריטים לסל עדיין.</p>
          <Button
            className="rounded-none font-display font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("/products")}
          >
            לחנות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">

        {/* Header */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          המשך קניות
        </button>

        <div className="flex items-baseline justify-between mb-8 border-b border-border pb-4">
          <h1 className="font-display text-4xl md:text-5xl uppercase font-bold tracking-tight">
            סל קניות
          </h1>
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {totalItems} פריטים
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}_${item.size ?? ""}`}
                className="bg-card border border-border flex gap-4 p-4"
              >
                {/* Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-muted overflow-hidden">
                  <img
                    src={item.product.imageUrl || "/images/product-1.png"}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold uppercase text-lg leading-tight">{item.product.name}</h3>
                      {item.size && (
                        <span className="font-mono text-xs text-muted-foreground uppercase">מידה: {item.size}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
                      aria-label="הסר"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                        className="p-2 hover:bg-muted transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-mono text-lg font-bold text-primary">
                      ₪{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="font-mono text-xs text-muted-foreground hover:text-destructive uppercase tracking-widest transition-colors mt-2"
            >
              ריקון הסל
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-6 sticky top-24">
              <h2 className="font-display text-xl uppercase font-bold mb-6 pb-4 border-b border-border">
                סיכום הזמנה
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">סה"כ פריטים</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-muted-foreground">משלוח</span>
                  <span className="text-primary">חינם</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-mono font-bold text-lg">
                  <span>סה"כ</span>
                  <span className="text-primary">₪{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6 rounded-none font-display font-bold uppercase tracking-wider h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(153,255,0,0.3)] transition-all"
                onClick={() => {
                  alert("אינטגרציית תשלום תחובר בקרוב.");
                }}
              >
                לתשלום
              </Button>

              <p className="font-mono text-[10px] text-muted-foreground text-center mt-4 uppercase tracking-wide">
                משלוח חינם לכל הארץ
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
