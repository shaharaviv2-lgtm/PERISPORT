import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListOrders,
  getListOrdersQueryKey,
  getGetStoreStatsQueryKey,
} from "@workspace/api-client-react";
import type { Order } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag, Phone, User, Clock, CheckCircle2, Mail, MapPin, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ADMIN_PHONE_WA = "972507755525";

interface OrderItem {
  name: string;
  size?: string;
  quantity: number;
  price: number;
  badge?: string;
  playerName?: string;
  playerNumber?: string;
}

function badgeLabel(badge: string) {
  if (badge === "local") return "ליגה מקומית";
  if (badge === "champions") return "ליגת האלופות";
  if (badge === "nba") return "NBA";
  return badge;
}

function buildCustomerWhatsAppUrl(order: Order): string {
  const parsedItems = (() => {
    try { return JSON.parse(order.items) as OrderItem[]; }
    catch { return []; }
  })();
  const lines = parsedItems.map((i) => {
    const custom: string[] = [];
    if (i.badge) custom.push(`פאץ': ${badgeLabel(i.badge)}`);
    if (i.playerName) custom.push(`שם: ${i.playerName}`);
    if (i.playerNumber) custom.push(`מספר: ${i.playerNumber}`);
    const customStr = custom.length ? ` [${custom.join(", ")}]` : "";
    return `• ${i.name}${i.size ? ` (מידה ${i.size})` : ""}${customStr} × ${i.quantity} — ₪${(i.price * i.quantity).toFixed(2)}`;
  });
  const address = [order.customerStreet, order.customerHouseNumber, order.customerCity, order.customerZipCode].filter(Boolean).join(" ");
  const msg =
    `שלום ${order.customerName} 👋\n` +
    `הזמנתך #${String(order.id).padStart(4, "0")} אושרה!\n\n` +
    lines.join("\n") +
    `\n\nסה"כ: ₪${order.totalPrice.toFixed(2)}` +
    (address ? `\nכתובת משלוח: ${address}` : "") +
    `\n\nתודה שקנית ב-PERI Sport 🏆`;
  const phone = order.customerPhone.replace(/\D/g, "").replace(/^0/, "972");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "ממתין",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  confirmed: { label: "אושרה",   color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  shipped:   { label: "נשלחה",   color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  delivered: { label: "נמסרה",   color: "bg-primary/20 text-primary border-primary/30" },
  cancelled: { label: "בוטלה",   color: "bg-destructive/20 text-destructive border-destructive/30" },
};

const STATUS_OPTIONS = [
  { value: "pending",   label: "ממתין" },
  { value: "confirmed", label: "אושרה" },
  { value: "shipped",   label: "נשלחה" },
  { value: "delivered", label: "נמסרה" },
  { value: "cancelled", label: "בוטלה" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function parseItems(itemsJson: string): OrderItem[] {
  try {
    const parsed = JSON.parse(itemsJson);
    if (Array.isArray(parsed)) return parsed as OrderItem[];
    // fallback: old plain-text format — show as single row
    return [{ name: String(parsed), quantity: 1, price: 0 }];
  } catch {
    // plain text (not JSON at all)
    const trimmed = itemsJson.trim();
    if (!trimmed) return [];
    return [{ name: trimmed, quantity: 1, price: 0 }];
  }
}

function OrderRow({ order, onStatusChange, onDelete }: { order: Order; onStatusChange: (id: number, status: string) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const items = parseItems(order.items);
  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setUpdating(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(order.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <div className="bg-card border border-border p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">#ORD-{String(order.id).padStart(4, "0")}</span>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-mono text-sm">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {order.customerName}
            </span>
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {order.customerPhone}
            </a>
            {order.customerEmail && (
              <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                {order.customerEmail}
              </span>
            )}
            {order.customerStreet && (
              <span className="flex items-center gap-1.5 font-mono text-xs text-primary/80">
                <MapPin className="w-3 h-3" />
                {order.customerStreet} {order.customerHouseNumber}, {order.customerCity}{order.customerZipCode ? ` ${order.customerZipCode}` : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(order.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="font-mono font-bold text-lg text-primary">₪{order.totalPrice.toFixed(2)}</span>
          {(updating || deleting) && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {order.status === "pending" && (
            <a
              href={buildCustomerWhatsAppUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleStatusChange("confirmed")}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.427A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.963 7.963 0 01-4.105-1.14l-.295-.175-3.059.877.858-3.023-.192-.31A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
              </svg>
              אשר הזמנה + וואטסאפ ללקוח
            </a>
          )}
          {order.status !== "pending" && (
            <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
              <SelectTrigger className="rounded-none bg-background border-border font-mono text-xs w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="font-mono text-xs">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Delete button */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              title="מחק הזמנה"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 px-3 py-1.5">
              <span className="font-mono text-xs text-destructive">למחוק?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="font-mono text-xs font-bold text-destructive hover:text-destructive/80 transition-colors"
              >
                כן
              </button>
              <span className="text-muted-foreground text-xs">|</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                לא
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="border-t border-border/50 pt-3">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">פריטים</p>
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => {
              const hasCustom = item.badge || item.playerName || item.playerNumber;
              return (
                <div key={idx} className="bg-background border border-border px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-bold leading-tight">{item.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        כמות: {item.quantity}{item.size ? ` · מידה: ${item.size}` : ""} · ₪{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {hasCustom && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {item.badge && (
                          <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5">
                            פאץ': {badgeLabel(item.badge)}
                          </span>
                        )}
                        {item.playerName && (
                          <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5">
                            שם: {item.playerName}
                          </span>
                        )}
                        {item.playerNumber && (
                          <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5">
                            #{item.playerNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.notes && (
        <div className="border-t border-border/50 pt-3">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">הערות</p>
          <p className="font-mono text-xs text-muted-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
}

export function AdminOrdersTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useListOrders({
    query: { queryKey: getListOrdersQueryKey() },
  });

  async function handleStatusChange(id: number, status: string) {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      toast({ title: "סטטוס עודכן" });
    } catch {
      toast({ title: "שגיאה בעדכון סטטוס", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      toast({ title: "הזמנה נמחקה" });
    } catch {
      toast({ title: "שגיאה במחיקת הזמנה", variant: "destructive" });
    }
  }

  const filtered = orders?.filter((o) => statusFilter === "all" || o.status === statusFilter) ?? [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">סינון לפי סטטוס:</span>
        <div className="flex gap-2 flex-wrap">
          {[{ value: "all", label: "הכל" }, ...STATUS_OPTIONS].map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s.label}
              {s.value !== "all" && orders && (
                <span className="mr-1.5 opacity-60">
                  ({orders.filter((o) => o.status === s.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border">
          <ShoppingBag className="w-10 h-10 text-muted-foreground mb-4 opacity-40" />
          <p className="font-mono text-sm text-muted-foreground">
            {orders?.length === 0 ? "אין הזמנות עדיין." : "אין הזמנות בסטטוס זה."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
