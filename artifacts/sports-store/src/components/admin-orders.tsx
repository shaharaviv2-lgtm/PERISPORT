import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListOrders,
  getListOrdersQueryKey,
  getGetStoreStatsQueryKey,
} from "@workspace/api-client-react";
import type { Order } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Phone, User, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

function parseItems(itemsJson: string) {
  try {
    return JSON.parse(itemsJson) as Array<{ product: { name: string; imageUrl: string }; quantity: number; size?: string }>;
  } catch {
    return [];
  }
}

function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: number, status: string) => Promise<void> }) {
  const [updating, setUpdating] = useState(false);
  const items = parseItems(order.items);
  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    await onStatusChange(order.id, newStatus);
    setUpdating(false);
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
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(order.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-lg text-primary">₪{order.totalPrice.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            {updating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
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
          </div>
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="border-t border-border/50 pt-3">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">פריטים</p>
          <div className="flex flex-wrap gap-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-background border border-border px-3 py-2">
                <div className="w-8 h-8 bg-muted overflow-hidden flex-shrink-0">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-mono text-xs font-bold leading-tight">{item.product.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    כמות: {item.quantity}{item.size ? ` · מידה: ${item.size}` : ""}
                  </p>
                </div>
              </div>
            ))}
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
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
