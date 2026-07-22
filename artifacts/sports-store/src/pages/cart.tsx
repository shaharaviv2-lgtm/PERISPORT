import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useCart, customizationExtraPrice } from "@/context/cart";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X, Lock } from "lucide-react";

const ADMIN_PHONE_WA = "972507755525";
const PAYBOX_LINK = "https://links.payboxapp.com/YtCtferkl4b";

function buildPayboxUrl(totalShekel: number) {
  const agorot = Math.round(totalShekel * 100);
  return `${PAYBOX_LINK}?amount=${agorot}`;
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${ADMIN_PHONE_WA}?text=${encodeURIComponent(message)}`;
}

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [showPayboxWarning, setShowPayboxWarning] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerHouseNumber, setCustomerHouseNumber] = useState("");
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; email?: string; city?: string; street?: string; houseNumber?: string }>({});

  useEffect(() => {
    document.title = `סל קניות${totalItems > 0 ? ` (${totalItems})` : ""} | PERI Sport`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "סל הקניות שלך ב-PERI Sport — בדוק את הפריטים שבחרת וסיים את הרכישה.");
  }, [totalItems]);

  function validateForm(): boolean {
    const errors: { name?: string; phone?: string; email?: string; city?: string; street?: string; houseNumber?: string } = {};
    if (!customerName.trim()) errors.name = "נא להזין שם";
    if (!customerPhone.trim()) errors.phone = "נא להזין מספר טלפון";
    if (!customerCity.trim()) errors.city = "נא להזין עיר";
    if (!customerStreet.trim()) errors.street = "נא להזין רחוב";
    if (!customerHouseNumber.trim()) errors.houseNumber = "נא להזין מספר בית";
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.email = "כתובת מייל לא תקינה";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildCustomizationText(item: typeof items[0]) {
    const parts: string[] = [];
    if (item.customization?.badge) {
      const label = item.customization.badge === "local" ? "ליגה מקומית" : item.customization.badge === "champions" ? "ליגת האלופות" : "NBA";
      parts.push(`פאץ': ${label}`);
    }
    if (item.customization?.playerName) parts.push(`שם: ${item.customization.playerName}`);
    if (item.customization?.playerNumber) parts.push(`מספר: ${item.customization.playerNumber}`);
    return parts.length > 0 ? ` [${parts.join(", ")}]` : "";
  }

  function buildOrderSummaryText() {
    const lines = items.map(
      (item) => {
        const itemTotal = (item.product.price + customizationExtraPrice(item.customization)) * item.quantity;
        return `• ${item.product.name}${item.size ? ` (מידה ${item.size})` : ""}${buildCustomizationText(item)} × ${item.quantity} — ₪${itemTotal.toFixed(2)}`;
      }
    );
    const customerInfo = `שם: ${customerName}\nטלפון: ${customerPhone}\nכתובת: ${customerStreet} ${customerHouseNumber}, ${customerCity}`;
    return `הזמנה מ-PERI Sport:\n${customerInfo}\n\n${lines.join("\n")}\n\nסה"כ: ₪${totalPrice.toFixed(2)}\n\nשלמתי דרך Paybox ✅`;
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
          customerEmail: customerEmail.trim() || undefined,
          customerCity: customerCity.trim(),
          customerStreet: customerStreet.trim(),
          customerHouseNumber: customerHouseNumber.trim(),
          customerZipCode: customerZipCode.trim() || undefined,
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
    setShowPayboxWarning(true);
  }

  function confirmPaybox() {
    setShowPayboxWarning(false);
    window.open(buildPayboxUrl(totalPrice), "_blank");
    clearCart();
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
                  key={`${item.product.id}_${item.size ?? ""}_${JSON.stringify(item.customization ?? {})}`}
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
                      <div className="min-w-0">
                        <h3 className="font-display font-bold uppercase text-lg leading-tight">{item.product.name}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          {item.size && (
                            <span className="font-mono text-xs text-muted-foreground uppercase">מידה: {item.size}</span>
                          )}
                          {item.customization?.badge && (
                            <span className="font-mono text-xs text-primary/80 uppercase">
                              {item.customization.badge === "local" ? "🏆 ליגה מקומית" : item.customization.badge === "champions" ? "⭐ ליגת האלופות" : "🏀 NBA"}
                            </span>
                          )}
                          {item.customization?.playerName && (
                            <span className="font-mono text-xs text-primary/80 uppercase">שם: {item.customization.playerName}</span>
                          )}
                          {item.customization?.playerNumber && (
                            <span className="font-mono text-xs text-primary/80">#{item.customization.playerNumber}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.customization)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
                        aria-label="הסר"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.customization)}
                          className="p-2 hover:bg-muted transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.customization)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-left">
                        <span className="font-mono text-lg font-bold text-primary">
                          ₪{((item.product.price + customizationExtraPrice(item.customization)) * item.quantity).toFixed(2)}
                        </span>
                        {customizationExtraPrice(item.customization) > 0 && (
                          <div className="font-mono text-[10px] text-muted-foreground">
                            כולל +₪{customizationExtraPrice(item.customization)} התאמה
                          </div>
                        )}
                      </div>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="עיר *"
                      value={customerCity}
                      onChange={(e) => { setCustomerCity(e.target.value); if (formErrors.city) setFormErrors((p) => ({ ...p, city: undefined })); }}
                      className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                      dir="rtl"
                    />
                    {formErrors.city && <p className="font-mono text-xs text-destructive mt-1 text-right">{formErrors.city}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="רחוב *"
                      value={customerStreet}
                      onChange={(e) => { setCustomerStreet(e.target.value); if (formErrors.street) setFormErrors((p) => ({ ...p, street: undefined })); }}
                      className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                      dir="rtl"
                    />
                    {formErrors.street && <p className="font-mono text-xs text-destructive mt-1 text-right">{formErrors.street}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder='מס׳ בית *'
                      value={customerHouseNumber}
                      onChange={(e) => { setCustomerHouseNumber(e.target.value); if (formErrors.houseNumber) setFormErrors((p) => ({ ...p, houseNumber: undefined })); }}
                      className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                      dir="rtl"
                    />
                    {formErrors.houseNumber && <p className="font-mono text-xs text-destructive mt-1 text-right">{formErrors.houseNumber}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="מיקוד"
                      value={customerZipCode}
                      onChange={(e) => setCustomerZipCode(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="אימייל (לסיכום הזמנה)"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className="w-full bg-background border border-border px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-right"
                    dir="ltr"
                  />
                  {formErrors.email && (
                    <p className="font-mono text-xs text-destructive mt-1 text-right">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Amount reminder */}
              <div className="border-2 border-primary bg-primary/10 p-3 mb-4 text-center">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">סכום לתשלום ב-Paybox</p>
                <p className="font-display text-4xl font-bold text-primary">₪{totalPrice.toFixed(2)}</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">הזן סכום זה ידנית ב-Paybox</p>
              </div>

              {/* Secure payment badge */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">תשלום מאובטח</span>
                <Lock className="w-3.5 h-3.5 text-primary" />
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

      {/* Paybox warning popup */}
      {showPayboxWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" dir="rtl">
          <div className="bg-[#111] border border-[#2a2a2a] w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-display text-xl font-bold text-white mb-3">שימו לב!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              יש להעביר את הסכום המדויק בלבד:
            </p>
            <p className="font-display text-3xl font-bold text-primary mb-4">₪{totalPrice.toFixed(2)}</p>
            <p className="text-sm text-red-400 font-semibold leading-relaxed mb-6">
              במידה ולא יועבר הסכום המדויק — ההזמנה תבוטל.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmPaybox}
                className="w-full h-12 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                הבנתי — עבור לתשלום
              </button>
              <button
                onClick={() => setShowPayboxWarning(false)}
                className="w-full font-mono text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
