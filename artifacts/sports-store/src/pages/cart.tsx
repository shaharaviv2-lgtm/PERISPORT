import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X, Phone, User, MessageSquare, Loader2, CheckCircle } from "lucide-react";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `סל קניות${totalItems > 0 ? ` (${totalItems})` : ""} | PERI Sport`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "סל הקניות שלך ב-PERI Sport — בדוק את הפריטים שבחרת וסיים את הרכישה.");
  }, [totalItems]);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("נא למלא שם וטלפון.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          items: JSON.stringify(items),
          totalPrice,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      clearCart();
    } catch {
      setError("שגיאה בשליחת ההזמנה. נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setShowCheckout(false);
    setSuccess(false);
    setName("");
    setPhone("");
    setNotes("");
    setError("");
    if (success) navigate("/products");
  }

  if (items.length === 0 && !success) {
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
    <>
      <div className="min-h-screen bg-background pt-8 pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">

          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            המשך קניות
          </button>

          <div className="flex items-baseline justify-between mb-8 border-b border-border pb-4">
            <h1 className="font-display text-4xl md:text-5xl uppercase font-bold tracking-tight">סל קניות</h1>
            <span className="font-mono text-xs text-muted-foreground uppercase">{totalItems} פריטים</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}_${item.size ?? ""}`}
                  className="bg-card border border-border flex gap-4 p-4"
                >
                  <div className="w-24 h-24 flex-shrink-0 bg-muted overflow-hidden">
                    <img
                      src={item.product.imageUrl || "/images/product-1.png"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                  <div className="border-t border-border pt-3 flex justify-between font-mono font-bold text-lg">
                    <span>סה"כ</span>
                    <span className="text-primary">₪{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 rounded-none font-display font-bold uppercase tracking-wider h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(153,255,0,0.3)] transition-all"
                  onClick={() => setShowCheckout(true)}
                >
                  שליחת הזמנה
                </Button>
                <p className="font-mono text-[10px] text-muted-foreground text-center mt-3">
                  ניצור איתך קשר לאישור ותיאום משלוח
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-md bg-card border border-border relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

            <button
              onClick={closeModal}
              className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              {success ? (
                <div className="text-center py-4 space-y-4">
                  <CheckCircle className="w-14 h-14 text-primary mx-auto" />
                  <h2 className="font-display text-2xl font-bold uppercase tracking-tight">ההזמנה התקבלה!</h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    ניצור איתך קשר בהקדם לאישור ותיאום המשלוח.
                  </p>
                  <Button
                    className="rounded-none font-display font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 w-full h-12"
                    onClick={closeModal}
                  >
                    חזרה לחנות
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-bold uppercase tracking-tight">פרטי הזמנה</h2>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      נא למלא את הפרטים ונחזור אליך לאישור.
                    </p>
                  </div>

                  {/* Order summary mini */}
                  <div className="bg-background border border-border p-4 mb-6 space-y-1">
                    {items.map((item) => (
                      <div key={`${item.product.id}_${item.size}`} className="flex justify-between font-mono text-xs">
                        <span className="text-muted-foreground truncate">{item.product.name}{item.size ? ` (${item.size})` : ""} × {item.quantity}</span>
                        <span className="font-bold mr-4">₪{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2 flex justify-between font-mono font-bold">
                      <span>סה"כ</span>
                      <span className="text-primary">₪{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <User className="w-3 h-3" /> שם מלא
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(""); }}
                        placeholder="ישראל ישראלי"
                        className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-right focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> מספר טלפון
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setError(""); }}
                        placeholder="050-0000000"
                        className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-right focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" /> הערות — אופציונלי
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="הערות לגבי ההזמנה..."
                        rows={2}
                        className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-right focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <p className="font-mono text-xs text-destructive text-right">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-none font-display font-bold uppercase tracking-wider h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> שולח...</>
                      ) : (
                        "אישור הזמנה"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
