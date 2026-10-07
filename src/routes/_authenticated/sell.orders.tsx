import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Empty, Page, StatusPill } from "@/components/gram";
import { rupees } from "@/lib/helpers";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/sell/orders")({
  head: () => ({
  meta: [
    { title: "Orders — ApnaKitchen" },
    {
      name: "description",
      content: "Manage and fulfil your ApnaKitchen customer orders.",
    },
  ],
}),
  component: SellerOrdersPage,
});

function SellerOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: items = [] } = useQuery({
    queryKey: ["seller-order-items", orders.map((o) => o.id)],
    enabled: orders.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").in("order_id", orders.map((o) => o.id));
      if (error) throw error;
      return data ?? [];
    },
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const updateStatus = async (
    orderId: string,
    status: "accepted" | "rejected" | "preparing" | "ready" | "completed",
  ): Promise<void> => {
    if (updatingOrderId) return;

    setUpdatingOrderId(orderId);

    try {
      const { error } = await supabase.rpc("update_order_status", {
        _order_id: orderId,
        _status: status,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(`Order marked as ${getStatusLabel(status).toLowerCase()}.`);

      await queryClient.invalidateQueries({
        queryKey: ["seller-orders"],
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const activeCount = orders.filter((order) =>
    ["accepted", "preparing", "ready"].includes(order.status),
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "completed",
  ).length;



  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) itemsByOrder.set(item.order_id, [...(itemsByOrder.get(item.order_id) ?? []), item]);

 function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "New order";
    case "accepted":
      return "Accepted";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready for customer";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
    default:
      return "Order update";
  }
}
  return (
    <Page title="Orders inbox">
      <div className="mb-7 space-y-5">
  <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] sm:p-8">
    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
          <Package className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">
            Seller workspace
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Orders & fulfilment
          </h1>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 opacity-85">
        Manage incoming orders, prepare homemade food and keep your
        customers updated at every stage.
      </p>
    </div>
  </section>

  <div className="grid gap-3 sm:grid-cols-3">
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          New orders
        </p>
        <Clock3 className="h-5 w-5 text-primary" />
      </div>

      <p className="mt-3 text-3xl font-extrabold tracking-tight">
        {pendingCount}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Waiting for your response
      </p>
    </div>

    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          Active
        </p>
        <Package className="h-5 w-5 text-primary" />
      </div>

      <p className="mt-3 text-3xl font-extrabold tracking-tight">
        {activeCount}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Being prepared or ready
      </p>
    </div>

    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">
          Completed
        </p>
        <CheckCircle2 className="h-5 w-5 text-primary" />
      </div>

      <p className="mt-3 text-3xl font-extrabold tracking-tight">
        {completedCount}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Successfully fulfilled
      </p>
    </div>
  </div>
</div>
      {isLoading ? <div className="h-32 animate-pulse rounded-3xl bg-muted" /> : orders.length === 0 ? <Empty emoji="📦" title="No orders yet" /> : (
        <div className="space-y-4">
          {orders.map((order) => (
  <article
    key={order.id}
    className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
  >
    {/* Order header */}
    <div className="border-b border-border/60 bg-muted/20 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-tight">
                {order.customer_name}
              </p>

              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs font-medium text-muted-foreground">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <StatusPill status={order.status} />

          <span className="hidden rounded-full border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground sm:inline-flex">
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>
    </div>

    {/* Order items */}
    <div className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />

        <h2 className="text-sm font-extrabold">
          Order items
        </h2>
      </div>

      <div className="space-y-2">
        {itemsByOrder.get(order.id)?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {item.product_name}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Quantity: {item.quantity}
              </p>
            </div>

            <p className="shrink-0 text-sm font-extrabold">
              {rupees(Number(item.price) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">
            Order total
          </p>

          <p className="mt-0.5 text-lg font-extrabold tracking-tight">
            {rupees(Number(order.total))}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-bold">
          Cash / Pickup
        </div>
      </div>

      {/* Customer details */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={`tel:${order.phone}`}
          className="group rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Phone className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Customer phone
              </p>

              <p className="mt-1 truncate text-sm font-extrabold group-hover:text-primary">
                {order.phone}
              </p>
            </div>
          </div>
        </a>

        <div className="rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Customer address
              </p>

              <p className="mt-1 text-sm font-bold leading-5">
                {order.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      {order.customer_lat !== null &&
        order.customer_lng !== null && (
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps?q=${order.customer_lat},${order.customer_lng}`}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-extrabold text-primary transition-all hover:bg-primary/10 active:scale-[0.99]"
          >
            <MapPin className="h-4 w-4" />
            Open customer location on map
          </a>
        )}

      {/* Status actions */}
     {order.status === "pending" && (
  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
    <div className="mb-4 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Clock3 className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-extrabold">New order received</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Review the order details and choose whether you can prepare it.
        </p>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => updateStatus(order.id, "accepted")}
        disabled={updatingOrderId === order.id}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CheckCircle2 className="h-4 w-4" />
        {updatingOrderId === order.id ? "Updating..." : "Accept order"}
      </button>

      <button
        type="button"
        onClick={() => updateStatus(order.id, "rejected")}
        disabled={updatingOrderId === order.id}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-background px-5 py-3.5 text-sm font-extrabold text-destructive transition-all hover:bg-destructive/5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Reject order
      </button>
    </div>
  </div>
)}

      {order.status === "accepted" && (
  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
    <div className="mb-3 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Clock3 className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-extrabold">Ready to start preparing?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Start preparing when you have begun making this order.
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={() => updateStatus(order.id, "preparing")}
      disabled={updatingOrderId === order.id}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Clock3 className="h-4 w-4" />
      {updatingOrderId === order.id ? "Updating..." : "Start preparing"}
    </button>
  </div>
)}

      {order.status === "preparing" && (
  <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
    <div className="mb-3 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-extrabold">Food is being prepared</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Once the order is packed and ready for the customer, mark it as ready.
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={() => updateStatus(order.id, "ready")}
      disabled={updatingOrderId === order.id}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CheckCircle2 className="h-4 w-4" />
      {updatingOrderId === order.id ? "Updating..." : "Mark order ready"}
    </button>
  </div>
)}

      {order.status === "ready" && (
  <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
    <div className="mb-3 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-extrabold">Order is ready</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          The food is ready for the customer. Mark the order completed after handover.
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={() => updateStatus(order.id, "completed")}
      disabled={updatingOrderId === order.id}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CheckCircle2 className="h-4 w-4" />
      {updatingOrderId === order.id ? "Updating..." : "Mark order completed"}
    </button>
  </div>
)}

      {order.status === "completed" && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Order successfully completed
        </div>
      )}

      {order.status === "rejected" && (
        <div className="mt-5 flex items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-3.5 text-sm font-extrabold text-destructive">
          Order rejected
        </div>
      )}
    </div>
  </article>
))}
        </div>
      )}
    </Page>
  );
}
