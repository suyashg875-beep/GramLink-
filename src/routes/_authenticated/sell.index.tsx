import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock3,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, StatusPill } from "@/components/gram";
import { rupees } from "@/lib/helpers";

export const Route = createFileRoute("/_authenticated/sell/")({
  head: () => ({
    meta: [
      { title: "Seller Dashboard — ApnaKitchen" },
      {
        name: "description",
        content:
          "Manage your ApnaKitchen homemade food business, products and orders.",
      },
    ],
  }),
  component: SellerDashboardPage,
});

function SellerDashboardPage() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["seller-dashboard-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data ?? [];
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["seller-dashboard-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data ?? [];
    },
  });

  const isLoading = ordersLoading || productsLoading;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  );

  const activeOrders = orders.filter((order) =>
    ["accepted", "preparing", "ready"].includes(order.status),
  );

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  const completedRevenue = completedOrders.reduce(
    (total, order) => total + Number(order.total ?? 0),
    0,
  );

  const publishedProducts = products.filter((product) => {
    if ("published" in product) return product.published !== false;
    if ("is_published" in product) return product.is_published !== false;
    return true;
  });

  const recentOrders = orders.slice(0, 5);

  function getStatusLabel(status: string) {
    switch (status) {
      case "pending":
        return "New order";
      case "accepted":
        return "Accepted";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "completed":
        return "Completed";
      case "rejected":
        return "Rejected";
      default:
        return "Order";
    }
  }

  return (
    <Page title="">
      <div className="space-y-6 pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_24px_70px_-30px_rgba(0,0,0,0.45)] sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
                <ChefHat className="h-3.5 w-3.5" />
                Seller workspace
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Grow your home kitchen.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
                Manage your homemade food business, keep track of orders and
                give customers a taste of food made with care.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/sell/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add product
                </Link>

                <Link
                  to="/sell/orders"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                >
                  View orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="grid h-28 w-28 place-items-center rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-sm">
                <Store className="h-12 w-12 text-white/90" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            label="New orders"
            value={pendingOrders.length}
            description="Waiting for your response"
            icon={Clock3}
            highlight={pendingOrders.length > 0}
          />

          <DashboardStat
            label="Active orders"
            value={activeOrders.length}
            description="Currently being prepared"
            icon={Package}
          />

          <DashboardStat
            label="Products"
            value={publishedProducts.length}
            description="Available in your kitchen"
            icon={UtensilsCrossed}
          />

          <DashboardStat
            label="Completed revenue"
            value={rupees(completedRevenue)}
            description="From completed orders"
            icon={CheckCircle2}
            largeValue
          />
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Quick actions
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                Run your kitchen
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              to="/sell/orders"
              icon={ShoppingBag}
              title="Manage orders"
              description={
                pendingOrders.length > 0
                  ? `${pendingOrders.length} new order${
                      pendingOrders.length > 1 ? "s" : ""
                    } waiting`
                  : "View and manage customer orders"
              }
              badge={
                pendingOrders.length > 0 ? pendingOrders.length : undefined
              }
            />

            <QuickAction
              to="/sell/products"
              icon={UtensilsCrossed}
              title="Manage products"
              description="Add, edit or update your homemade food"
            />

            <QuickAction
              to="/sell/kitchen"
              icon={Store}
              title="Kitchen profile"
              description="Update your kitchen details and photos"
            />
          </div>
        </section>

        {/* Main dashboard content */}
        <section className="grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* Recent orders */}
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border/60 p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Activity
                </p>
                <h2 className="mt-1 text-lg font-extrabold tracking-tight">
                  Recent orders
                </h2>
              </div>

              <Link
                to="/sell/orders"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary transition-colors hover:text-primary/80"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-20 animate-pulse rounded-2xl bg-muted"
                    />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <p className="mt-4 text-sm font-extrabold">
                    No orders yet
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    Your latest customer orders will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to="/sell/orders"
                      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/[0.03] hover:shadow-sm sm:p-4"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-extrabold">
                            {order.customer_name || "Customer"}
                          </p>

                          <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusPill status={order.status} />

                        <span className="text-xs font-extrabold">
                          {rupees(Number(order.total ?? 0))}
                        </span>
                      </div>

                      <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kitchen snapshot */}
          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
            <div className="border-b border-border/60 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Kitchen snapshot
              </p>

              <h2 className="mt-1 text-lg font-extrabold tracking-tight">
                Your business at a glance
              </h2>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              <SnapshotRow
                icon={UtensilsCrossed}
                label="Published products"
                value={String(publishedProducts.length)}
              />

              <SnapshotRow
                icon={Clock3}
                label="Orders waiting"
                value={String(pendingOrders.length)}
                highlight={pendingOrders.length > 0}
              />

              <SnapshotRow
                icon={Package}
                label="Orders in progress"
                value={String(activeOrders.length)}
              />

              <SnapshotRow
                icon={CheckCircle2}
                label="Completed orders"
                value={String(completedOrders.length)}
              />

              <div className="mt-4 rounded-2xl bg-primary/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold">
                      Keep your menu fresh
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Add your best homemade dishes and keep product
                      availability updated for customers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Puran Poli highlight */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-primary/[0.045] p-5 sm:p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ChefHat className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Featured homemade speciality
                </p>

                <h2 className="mt-1 text-lg font-extrabold tracking-tight">
                  Make your Puran Poli stand out
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
                  Showcase traditional homemade favourites with a clear
                  description, attractive photo and accurate availability.
                </p>
              </div>
            </div>

            <Link
              to="/sell/products"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Manage menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </Page>
  );
}

function DashboardStat({
  label,
  value,
  description,
  icon: Icon,
  highlight = false,
  largeValue = false,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Package;
  highlight?: boolean;
  largeValue?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        highlight ? "border-primary/30 ring-1 ring-primary/10" : "border-border/70"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-muted-foreground">{label}</p>

        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            highlight
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <p
        className={`mt-4 font-extrabold tracking-tight ${
          largeValue ? "text-2xl sm:text-3xl" : "text-3xl"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
  badge,
}: {
  to:
    | "/sell/orders"
    | "/sell/products"
    | "/sell/kitchen";
  icon: typeof Package;
  title: string;
  description: string;
  badge?: number | undefined;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex items-center gap-2">
          {badge !== undefined && (
            <span className="grid min-w-6 h-6 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-extrabold text-primary-foreground">
              {badge}
            </span>
          )}

          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </div>

      <h3 className="mt-5 text-base font-extrabold tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-3.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <p className="min-w-0 flex-1 text-sm font-bold">{label}</p>

      <span
        className={`text-sm font-extrabold ${
          highlight ? "text-primary" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}