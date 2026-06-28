import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X } from "lucide-react";

const ADMIN_PHONE_WA = "972507755525";
const PAYBOX_LINK = "https://links.payboxapp.com/YtCtferkl4b";

function buildPayboxUrl() {
  return PAYBOX_LINK;
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${ADMIN_PHONE_WA}?text=${encodeURIComponent(message)}`;
}

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    document.title = `סל קניות${totalItems > 0 ? ` (${totalItems})` : ""} | PERI Sport`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "סל הקניות שלך ב-PERI Sport — בדוק את הפריטים שבחרת וסיים את הרכישה.");
  }, [totalItems]);

  function validateForm(): boolean {
    const errors: { name?: string; phone?: string } = {};
    if (!customerName.trim()) errors.name = "נא להזין שם";
    if (!customerPhone.trim()) errors.phone = "נא להזין מספר טלפון";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildOrderSummaryText() {
    const lines = items.map(
      (item) =>
        `• ${item.product.name}${item.size ? ` (מידה ${item.size})` : ""} × ${item.quantity} — ₪${(item.product.price * item.quantity).toFixed(2)}`
    );
    const customerInfo = `שם: ${customerName}\nטלפון: ${customerPhone}`;
    return `הזמנה מ-PERI Sport:\n${customerInfo}\n\n${lines.join("\n")}\n\nסה"כ: ₪${totalPrice.toFixed(2)}`;
  }

  async function saveOrder() {
    const itemsSummary = items
      .map((i) => `${i.product.name}${i.size ? ` (${i.size})` : ""} x${i.quantity}`)
      .join(", ");
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          items: itemsSummary,
          totalPrice,
        }),
      });
    } catch {
      // best-effort — don't block the customer from paying
    }
  }

  async function handlePaybox() {
    if (!validateForm()) return;
    await saveOrder();
    window.open(buildPayboxUrl(), "_blank");
  }

  async function handleWhatsApp() {
    if (!validateForm()) return;
    await saveOrder();
    window.open(buildWhatsAppUrl(buildOrderSummaryText()), "_blank");
  }

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
                  onClick={() => setShowModal(true)}
                >
                  לתשלום
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md relative">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <h2 className="font-display text-2xl font-bold uppercase">סיכום הזמנה</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="border border-border bg-background/50 p-4 space-y-2 mb-6">
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">הפריטים שלך</h3>
                {items.map((item) => (
                  <div key={`${item.product.id}_${item.size ?? ""}`} className="flex justify-between text-sm font-mono">
                    <span className="text-muted-foreground truncate ml-4">
                      {item.product.name}{item.size ? ` (${item.size})` : ""} ×{item.quantity}
                    </span>
                    <span>₪{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-mono font-bold text-primary text-base">
                  <span>סה"כ לתשלום</span>
                  <span>₪{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Contact details form */}
              <div className="border border-border bg-background/50 p-4 mb-6 space-y-3">
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">פרטי יצירת קשר</h3>
                <div>
                  <input
                    type="text"
                    placeholder="שם מלא *"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                    dir="rtl"
                  />
                  {formErrors.name && (
                    <p className="font-mono text-xs text-destructive mt-1 text-right">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="מספר טלפון *"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                    dir="rtl"
                  />
                  {formErrors.phone && (
                    <p className="font-mono text-xs text-destructive mt-1 text-right">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Payment buttons */}
              <div className="space-y-3">
                {/* Paybox */}
                <button
                  onClick={handlePaybox}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-[#6C3AE8] hover:bg-[#5a2fd4] text-white font-bold text-base transition-colors"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="6" fill="white" fillOpacity="0.2"/>
                    <path d="M7 8h10M7 12h7M7 16h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  שלם עם Paybox
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-base transition-colors"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.427A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.963 7.963 0 01-4.105-1.14l-.295-.175-3.059.877.858-3.023-.192-.31A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
                  </svg>
                  הזמן בוואטסאפ
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full font-mono text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors pt-1"
                >
                  חזרה לסל
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
