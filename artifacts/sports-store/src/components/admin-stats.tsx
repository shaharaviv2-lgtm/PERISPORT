import { useGetStoreStats, useListOrders, getGetStoreStatsQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Package, ShoppingBag, TrendingUp, Star, Clock, AlertCircle } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`bg-card border p-6 relative overflow-hidden ${accent ? "border-primary" : "border-border"}`}>
      {accent && <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="font-mono text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`p-2 ${accent ? "text-primary" : "text-muted-foreground"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function TopProductsWidget() {
  const { data: orders } = useListOrders({
    query: { queryKey: getListOrdersQueryKey() },
  });

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-card border border-border p-6">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">מוצרים מובילים</p>
        <p className="font-mono text-xs text-muted-foreground text-center py-8">אין נתוני מכירות עדיין.</p>
      </div>
    );
  }

  const counts: Record<string, { name: string; imageUrl: string; qty: number; revenue: number }> = {};
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    try {
      const items = JSON.parse(order.items) as Array<{
        product: { id: number; name: string; imageUrl: string; price: number };
        quantity: number;
      }>;
      for (const item of items) {
        const key = String(item.product.id ?? item.product.name);
        if (!counts[key]) {
          counts[key] = { name: item.product.name, imageUrl: item.product.imageUrl, qty: 0, revenue: 0 };
        }
        counts[key].qty += item.quantity;
        counts[key].revenue += item.product.price * item.quantity;
      }
    } catch {
      // ignore parse errors
    }
  }

  const top = Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);

  if (top.length === 0) {
    return (
      <div className="bg-card border border-border p-6">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">מוצרים מובילים</p>
        <p className="font-mono text-xs text-muted-foreground text-center py-8">אין נתוני מכירות עדיין.</p>
      </div>
    );
  }

  const maxQty = top[0]?.qty ?? 1;

  return (
    <div className="bg-card border border-border p-6">
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-5">מוצרים מובילים לפי כמות</p>
      <div className="space-y-4">
        {top.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
            <div className="w-8 h-8 bg-muted overflow-hidden flex-shrink-0">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold truncate">{item.name}</p>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(item.qty / maxQty) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono text-xs font-bold">{item.qty} יח׳</p>
              <p className="font-mono text-[10px] text-muted-foreground">₪{item.revenue.toFixed(0)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrdersWidget() {
  const { data: orders } = useListOrders({
    query: { queryKey: getListOrdersQueryKey() },
  });

  const recent = orders?.slice(0, 5) ?? [];

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending:   { label: "ממתין",  color: "text-yellow-400" },
    confirmed: { label: "אושרה",  color: "text-blue-400" },
    shipped:   { label: "נשלחה",  color: "text-purple-400" },
    delivered: { label: "נמסרה",  color: "text-primary" },
    cancelled: { label: "בוטלה",  color: "text-destructive" },
  };

  return (
    <div className="bg-card border border-border p-6">
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-5">הזמנות אחרונות</p>
      {recent.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground text-center py-8">אין הזמנות עדיין.</p>
      ) : (
        <div className="space-y-3">
          {recent.map((order) => {
            const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
            const d = new Date(order.createdAt);
            return (
              <div key={order.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-mono text-xs font-bold">{order.customerName}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {d.toLocaleDateString("he-IL")} · {d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-mono text-xs font-bold text-primary">₪{order.totalPrice.toFixed(2)}</p>
                  <p className={`font-mono text-[10px] ${st.color}`}>{st.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminStatsTab() {
  const { data: stats, isLoading } = useGetStoreStats({
    query: { queryKey: getGetStoreStatsQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center py-16 gap-2 text-muted-foreground">
        <AlertCircle className="w-8 h-8 opacity-40" />
        <p className="font-mono text-sm">לא ניתן לטעון נתונים.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="סה״כ הזמנות" value={stats.totalOrders} accent />
        <StatCard icon={TrendingUp} label="הכנסות כוללות" value={`₪${stats.totalRevenue.toLocaleString("he-IL", { minimumFractionDigits: 0 })}`} sub="לא כולל הזמנות שבוטלו" accent />
        <StatCard icon={Clock} label="הזמנות ממתינות" value={stats.pendingOrders} sub="דורשות טיפול" />
        <StatCard icon={Package} label="מוצרים בחנות" value={stats.totalProducts} />
        <StatCard icon={Star} label="מוצרים מומלצים" value={stats.featuredCount} />
        <StatCard icon={Package} label="קטגוריות" value={stats.totalCategories} />
        <StatCard icon={Package} label="מותגים" value={stats.brandsCount} />
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsWidget />
        <RecentOrdersWidget />
      </div>
    </div>
  );
}
