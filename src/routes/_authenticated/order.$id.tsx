import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Package,
  ChefHat,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Page, StatusPill } from "@/components/gram";
import { rupees } from "@/lib/helpers";

export const Route = createFileRoute(
  "/_authenticated/order/$id",
)({
  component: OrderTrackingPage,
});

const steps = [
  { key: "pending", label: "Order placed" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing food" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

function OrderTrackingPage() {
  const { id } = Route.useParams();

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (error) throw error;
      return data ?? [];
    },
  });

  if (!order) {
    return (
      <Page title="Order">
        Loading...
      </Page>
    );
  }

  const currentIndex = steps.findIndex(
    (s) => s.key === order.status,
  );

  return (
    <Page title="Track Order">
      <div className="space-y-5">

        {/* Status Card */}
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                Order Status
              </div>

              <div className="mt-1 text-2xl font-bold">
                {order.status}
              </div>
            </div>

            <StatusPill status={order.status} />
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-3xl border bg-card p-5">
          <div className="mb-5 text-lg font-bold">
            Order Progress
          </div>

          <div className="space-y-5">
            {steps.map((step, index) => {
              const done = index <= currentIndex;

              return (
                <div
                  key={step.key}
                  className="flex gap-4"
                >
                  <div>
                    {order.status === "rejected" ? (
                      <XCircle className="h-7 w-7 text-red-500" />
                    ) : done ? (
                      <CheckCircle2 className="h-7 w-7 text-green-500" />
                    ) : (
                      <Clock3 className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold">
                      {step.label}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {done
                        ? "Completed"
                        : "Waiting"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-3xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span className="font-bold">
              Ordered Items
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>

                <span>
                  {rupees(
                    Number(item.price) *
                      item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>
              {rupees(Number(order.total))}
            </span>
          </div>
        </div>

        {/* Delivery */}
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />

            <span className="font-bold">
              Delivery Details
            </span>
          </div>

          <div className="mt-3 text-sm">
            {order.fulfillment_method === "pickup"
              ? "📦 Pickup from seller"
              : "🚚 Delivery to:"}
          </div>

          <div className="mt-2 text-muted-foreground">
            {order.address}
          </div>
        </div>
      </div>
    </Page>
  );
}