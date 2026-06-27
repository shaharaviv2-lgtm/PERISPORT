import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X, CheckCircle2, Loader2 } from "lucide-react";

interface CheckoutForm {
  name: string;
  phone: string;
  notes: string;
}

type ModalState = "idle" | "form" | "loading" | "success" | "error";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [form, setForm] = useState<CheckoutForm>({ name: "", phone: "", notes: "" });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.title = `סל קניות${totalItems > 0 ? ` (${totalItems})` : ""} | PERI Sport`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "סל הקניות שלך ב-PERI Sport — בדוק את הפריטים שבחרת וסיים את הרכישה.");
  }, [totalItems]);

  async function submitOrder() {
    if (!form.name.trim() || !form.phone.trim()) return;
    setModalState("loading");

    const orderItems = items.map((item) => ({
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          items: JSON.stringify(orderItems),
          totalPrice,
          notes: form.notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("server error");
      }

      setModalState("success");
      clearCart();
    } catch {
      setErrorMsg("שגיאה בשליחת ההזמנה. נסה שוב.");
      setModalState("error");
    }
  }

  function closeModal() {
    setModalState("idle");
    setErrorMsg("");
  }

  if (items.length === 0 && modalState !== "success") {
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
                  onClick={() => setModalState("form")}
                >
                  לתשלום
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {modalState !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md relative">

            {/* Success */}
            {modalState === "success" && (
              <div className="p-10 text-center">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="font-display text-3xl font-bold uppercase mb-3">ההזמנה התקבלה!</h2>
                <p className="text-muted-foreground text-sm mb-8">ניצור איתך קשר בהקדם לאישור.</p>
                <Button
                  className="rounded-none font-display font-bold uppercase tracking-wider bg-primary text-primary-foreground"
                  onClick={() => { setModalState("idle"); navigate("/"); }}
                >
                  חזרה לדף הבית
                </Button>
              </div>
            )}

            {/* Error */}
            {modalState === "error" && (
              <div className="p-8 text-center">
                <p className="text-destructive mb-6 text-sm">{errorMsg}</p>
                <Button variant="outline" className="rounded-none" onClick={closeModal}>
                  נסה שוב
                </Button>
              </div>
            )}

            {/* Form */}
            {(modalState === "form" || modalState === "loading") && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                  <h2 className="font-display text-2xl font-bold uppercase">פרטי הזמנה</h2>
                  <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                      שם מלא *
                    </label>
                    <Input
                      className="rounded-none border-border bg-background font-mono"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="ישראל ישראלי"
                      disabled={modalState === "loading"}
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                      טלפון *
                    </label>
                    <Input
                      className="rounded-none border-border bg-background font-mono"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="050-0000000"
                      disabled={modalState === "loading"}
                      dir="ltr"
                      type="tel"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest block mb-1">
                      הערות (אופציונלי)
                    </label>
                    <Textarea
                      className="rounded-none border-border bg-background font-mono resize-none"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="הערות מיוחדות לגבי ההזמנה..."
                      disabled={modalState === "loading"}
                      rows={3}
                      dir="rtl"
                    />
                  </div>

                  {/* Order summary in modal */}
                  <div className="border border-border p-4 bg-background/50 space-y-2">
                    <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">סיכום</h3>
                    {items.map((item) => (
                      <div key={`${item.product.id}_${item.size ?? ""}`} className="flex justify-between text-sm font-mono">
                        <span className="text-muted-foreground truncate ml-4">
                          {item.product.name}{item.size ? ` (${item.size})` : ""} ×{item.quantity}
                        </span>
                        <span>₪{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between font-mono font-bold text-primary">
                      <span>סה"כ</span>
                      <span>₪{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 rounded-none font-display font-bold uppercase tracking-wider h-14 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  onClick={submitOrder}
                  disabled={modalState === "loading" || !form.name.trim() || !form.phone.trim()}
                >
                  {modalState === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      שולח הזמנה...
                    </span>
                  ) : (
                    "אישור הזמנה"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
