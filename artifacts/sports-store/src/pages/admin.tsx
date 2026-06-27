import { useState } from "react";
import { ShieldAlert, Package, ShoppingBag, BarChart3, LogOut } from "lucide-react";
import { AdminProductsTab } from "@/components/admin-products";
import { AdminOrdersTab } from "@/components/admin-orders";
import { AdminStatsTab } from "@/components/admin-stats";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";

const ADMIN_USER = "7zonot";
const ADMIN_PASS = "4578932";
const SESSION_KEY = "peri_admin_auth";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm border border-border bg-card p-8 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="mb-8 text-center">
          <img src="/images/logo.png" alt="PERI" className="h-14 mx-auto mb-4 object-contain" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-tighter">כניסה למנהל</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-widest">גישה מוגבלת</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-right focus:outline-none focus:border-primary transition-colors"
              autoComplete="username"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-background border border-border px-3 py-2 font-mono text-sm text-right focus:outline-none focus:border-primary transition-colors"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="font-mono text-xs text-destructive text-right">שם משתמש או סיסמה שגויים</p>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider py-3 hover:bg-primary/90 transition-colors"
          >
            כניסה
          </button>
        </form>
      </div>
    </div>
  );
}

type Tab = "products" | "orders" | "stats";

function PendingBadge() {
  const { data: orders } = useListOrders({
    query: { queryKey: getListOrdersQueryKey() },
  });
  const pending = orders?.filter((o) => o.status === "pending").length ?? 0;
  if (pending === 0) return null;
  return (
    <span className="mr-1.5 bg-destructive text-destructive-foreground rounded-full font-mono text-[9px] w-4 h-4 flex items-center justify-center">
      {pending}
    </span>
  );
}

function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: React.ReactNode }[] = [
    { id: "products", label: "מוצרים",   icon: Package },
    { id: "orders",   label: "הזמנות",   icon: ShoppingBag, badge: <PendingBadge /> },
    { id: "stats",    label: "סטטיסטיקה", icon: BarChart3 },
  ];

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-background w-full pb-24">
      {/* Admin Header */}
      <div className="border-b border-border bg-card sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary">פאנל ניהול</span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:block">// גישת מנהל</span>

          {/* Tabs */}
          <div className="flex items-center gap-1 mr-4 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.badge}
              </button>
            ))}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mr-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">יציאה</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 md:px-6 py-10">
        {activeTab === "products" && <AdminProductsTab />}
        {activeTab === "orders"   && <AdminOrdersTab />}
        {activeTab === "stats"    && <AdminStatsTab />}
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminPanel />;
}
