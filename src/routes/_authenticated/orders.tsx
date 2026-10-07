import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquareText,
  Package,
  Star,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Empty, Page, StatusPill } from "@/components/gram";
import { rupees } from "@/lib/helpers";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [{ title: "My Orders — ApnaKitchen" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const sellerIds = [...new Set(orders.map((o) => o.seller_id))];

  const { data: sellers = [] } = useQuery({
    queryKey: ["my-order-sellers", sellerIds],
    enabled: sellerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select(
          "user_id,business_name,village_or_area,pincode,address",
        )
        .in("user_id", sellerIds);

      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["my-order-items", orders.map((o) => o.id)],
    enabled: orders.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .in(
          "order_id",
          orders.map((o) => o.id),
        );

      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: existingReviews = [] } = useQuery({
    queryKey: ["my-order-reviews", user?.id, orders.map((o) => o.id)],
    enabled: !!user && orders.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("order_id,rating,review_text")
        .eq("customer_id", user!.id)
        .in(
          "order_id",
          orders.map((o) => o.id),
        );

      if (error) throw error;
      return data ?? [];
    },
  });

  const sellerById = new Map(
    sellers.map((s) => [s.user_id, s]),
  );

  const itemsByOrder = new Map<string, typeof items>();

  for (const item of items) {
    itemsByOrder.set(item.order_id, [
      ...(itemsByOrder.get(item.order_id) ?? []),
      item,
    ]);
  }

  const reviewByOrder = new Map(
    existingReviews.map((review) => [
      review.order_id,
      review,
    ]),
  );

  async function submitReview(order: any) {
    if (!user) {
      toast.error("Please login first.");
      return;
    }

    const rating = ratings[order.id];

    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }

    setSubmittingReview(order.id);

    try {
      const { error } = await supabase.from("reviews").insert({
        order_id: order.id,
        customer_id: user.id,
        seller_id: order.seller_id,
        rating,
        review_text: reviews[order.id]?.trim() || null,
      } as never);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Thank you for your review!");

      setRatings((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });

      setReviews((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-order-reviews"],
      });
    } finally {
      setSubmittingReview(null);
    }
  }

  return (
    <Page title="My Orders">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                My Orders
              </h1>

              <p className="mt-0.5 text-sm text-muted-foreground">
                Track your homemade food orders and share your experience.
              </p>
            </div>
          </div>

          {orders.length > 0 && !isLoading && (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {orders.length}
              </span>
              {orders.length === 1 ? "order" : "orders"} placed
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border bg-card shadow-sm"
              >
                <div className="animate-pulse p-5">
                  <div className="flex justify-between">
                    <div className="space-y-3">
                      <div className="h-5 w-40 rounded-full bg-muted" />
                      <div className="h-3 w-28 rounded-full bg-muted" />
                    </div>

                    <div className="h-8 w-24 rounded-full bg-muted" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="h-12 rounded-2xl bg-muted" />
                    <div className="h-12 rounded-2xl bg-muted" />
                  </div>

                  <div className="mt-5 h-14 rounded-2xl bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border bg-card p-8 shadow-sm sm:p-12">
            <Empty emoji="" title="No orders yet">
              <p className="mt-2 text-sm text-muted-foreground">
                Your delicious homemade food journey starts here.
              </p>
            </Empty>

            <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-2 rounded-2xl bg-primary/5 px-4 py-3 text-sm font-medium text-muted-foreground">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Discover homemade food near you
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const seller = sellerById.get(order.seller_id);
              const existingReview = reviewByOrder.get(order.id);
              const orderItems = itemsByOrder.get(order.id) ?? [];

              return (
                <article
                  key={order.id}
                  className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Order top bar */}
                  <div className="border-b bg-gradient-to-r from-primary/[0.06] via-transparent to-transparent p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Store className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate text-base font-extrabold">
                              {seller?.business_name ?? "Home Kitchen"}
                            </h2>

                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(order.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>

                            <span className="text-border">•</span>

                            <span>
                              {new Date(order.created_at).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <StatusPill status={order.status} />
                    </div>
                  </div>

                  {/* Order body */}
                  <div className="p-5 sm:p-6">
                    {/* Items */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Order items
                        </span>

                        <span className="text-xs font-semibold text-muted-foreground">
                          {orderItems.length}{" "}
                          {orderItems.length === 1 ? "item" : "items"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/60 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {item.product_name}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Qty {item.quantity} ×{" "}
                                {rupees(Number(item.price))}
                              </p>
                            </div>

                            <span className="shrink-0 text-sm font-extrabold">
                              {rupees(
                                Number(item.price) * item.quantity,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mt-5 flex items-center justify-between rounded-2xl border bg-background px-4 py-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">
                          Order total
                        </p>

                        <p className="mt-0.5 text-xl font-extrabold">
                          {rupees(Number(order.total))}
                        </p>
                      </div>

                      <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                        Cash on Delivery
                      </div>
                    </div>

                    {/* Fulfillment */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border bg-background p-4">
                        <div className="flex items-center gap-2">
                          {order.fulfillment_method === "pickup" ? (
                            <Package className="h-4 w-4 text-primary" />
                          ) : (
                            <Truck className="h-4 w-4 text-primary" />
                          )}

                          <span className="text-sm font-extrabold">
                            {order.fulfillment_method === "pickup"
                              ? "Pickup"
                              : "Home Delivery"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {order.fulfillment_method === "pickup"
                            ? "Collect your order directly from the kitchen."
                            : "Your order will be delivered to your address."}
                        </p>
                      </div>

                      <div className="rounded-2xl border bg-background p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />

                          <span className="text-sm font-extrabold">
                            {order.fulfillment_method === "pickup"
                              ? "Pickup from"
                              : "Deliver to"}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {order.fulfillment_method === "pickup"
                            ? seller?.address ||
                              `${seller?.village_or_area ?? ""}, ${
                                seller?.pincode ?? ""
                              }`
                            : order.address || "Address not available"}
                        </p>
                      </div>
                    </div>

                    {/* Kitchen information */}
                    {seller && (
                      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-secondary/50 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                            <Store className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {seller.business_name}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {seller.village_or_area ||
                                seller.pincode ||
                                "Home Kitchen"}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    )}

                    {/* Review */}
                    {order.status === "completed" && (
                      <div className="mt-5 overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/[0.05] to-transparent">
                        {existingReview ? (
                          <div className="p-5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <MessageSquareText className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-extrabold">
                                  Your review
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  Thanks for sharing your experience
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= existingReview.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>

                            {existingReview.review_text && (
                              <p className="mt-3 rounded-2xl bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
                                “{existingReview.review_text}”
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Star className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-extrabold">
                                  Rate your experience
                                </p>

                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  How was your experience with{" "}
                                  {seller?.business_name ?? "this kitchen"}?
                                </p>
                              </div>
                            </div>

                            {/* Stars */}
                            <div className="mt-4 flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setRatings((prev) => ({
                                      ...prev,
                                      [order.id]: star,
                                    }))
                                  }
                                  className="rounded-xl p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10"
                                  aria-label={`Rate ${star} stars`}
                                >
                                  <Star
                                    className={`h-7 w-7 transition-colors ${
                                      star <= (ratings[order.id] ?? 0)
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Review input */}
                            <textarea
                              className="mt-3 min-h-[96px] w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                              placeholder="Tell us what you loved about the food or kitchen..."
                              value={reviews[order.id] ?? ""}
                              onChange={(e) =>
                                setReviews((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                            />

                            <button
                              type="button"
                              disabled={
                                !ratings[order.id] ||
                                submittingReview === order.id
                              }
                              onClick={() => submitReview(order)}
                              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                            >
                              {submittingReview === order.id ? (
                                <>
                                  <Clock3 className="h-4 w-4 animate-spin" />
                                  Submitting review...
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4" />
                                  Submit Review
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}