import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import { useCart } from "@/lib/cart";
import { rupees, useSignedImages } from "@/lib/helpers";
import {
  BigButton,
  Empty,
  Page,
  ProductThumb,
} from "@/components/gram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ApnaKitchen" },
      {
        name: "description",
        content:
          "Review your homemade food from local kitchens before placing your order.",
      },
      {
        property: "og:title",
        content: "Your Cart — ApnaKitchen",
      },
      {
        property: "og:description",
        content:
          "Review your homemade food from local kitchens before placing your order.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  const { data: urls = {} } = useSignedImages(
    items
      .map((i) => i.image)
      .filter((x): x is string => !!x),
  );

  /* ------------------------------------------------------- */
  /* EMPTY CART                                               */
  /* ------------------------------------------------------- */

  if (items.length === 0) {
    return (
      <Page>
        <div className="mx-auto max-w-2xl py-6 sm:py-10">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-lg shadow-black/5">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-secondary px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] border border-primary/15 bg-primary/10 text-primary shadow-sm">
                <ShoppingBag className="h-9 w-9" />
              </div>

              <h1 className="relative mt-6 text-2xl font-black tracking-tight sm:text-3xl">
                Your cart is waiting
              </h1>

              <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Discover homemade favourites from verified local kitchens
                and add something delicious to your cart.
              </p>

              <Link
                to="/"
                className="relative mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              >
                Explore homemade food
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  const sellers = new Set(items.map((i) => i.sellerId)).size;

  return (
    <Page>
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                Your selection
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Your cart
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} from{" "}
              {sellers} {sellers === 1 ? "home kitchen" : "home kitchens"}
            </p>
          </div>

          <Link
            to="/"
            className="hidden items-center gap-2 rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-xs font-bold shadow-sm transition-all duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-primary sm:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Add more
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* CART ITEMS */}
          <section className="space-y-3">
            {items.map((i) => {
              const imageUrl = i.image ? urls[i.image] : undefined;

              return (
                <div
                  key={i.productId}
                  className="group overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:border-primary/15 hover:shadow-md"
                >
                  <div className="flex gap-3 p-3.5 sm:gap-4 sm:p-4">
                    {/* IMAGE */}
                    <Link
                      to="/product/$id"
                      params={{ id: i.productId }}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-28 sm:w-28"
                    >
                      <ProductThumb
                        url={imageUrl}
                        category="Other"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                    </Link>

                    {/* DETAILS */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to="/product/$id"
                            params={{ id: i.productId }}
                            className="line-clamp-2 text-sm font-extrabold leading-5 transition-colors hover:text-primary sm:text-base"
                          >
                            {i.name}
                          </Link>

                          <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                            <ChefHat className="h-3.5 w-3.5 shrink-0 text-primary" />

                            <span className="truncate text-[11px] font-semibold text-muted-foreground">
                              {i.sellerName}
                            </span>
                          </div>
                        </div>

                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() => remove(i.productId)}
                          aria-label={`Remove ${i.name}`}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* PRICE + QUANTITY */}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            Item total
                          </div>

                          <div className="mt-0.5 text-base font-black text-primary">
                            {rupees(i.price * i.quantity)}
                          </div>
                        </div>

                        <div className="flex items-center rounded-xl border border-border/70 bg-secondary/50 p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() =>
                              setQty(i.productId, i.quantity - 1)
                            }
                            disabled={i.quantity <= 1}
                            aria-label="Decrease quantity"
                            className={cn(
                              "grid h-8 w-8 place-items-center rounded-lg transition-all duration-200 active:scale-90",
                              i.quantity <= 1
                                ? "cursor-not-allowed text-muted-foreground/40"
                                : "text-foreground hover:bg-card hover:text-primary hover:shadow-sm",
                            )}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="grid h-8 min-w-8 place-items-center px-1 text-xs font-black">
                            {i.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQty(i.productId, i.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="grid h-8 w-8 place-items-center rounded-lg text-foreground transition-all duration-200 hover:bg-card hover:text-primary hover:shadow-sm active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ADD MORE */}
            <Link
              to="/"
              className="group flex items-center justify-between rounded-[1.25rem] border border-dashed border-border/80 bg-card/60 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-4 w-4" />
                </span>

                <div>
                  <div className="text-xs font-extrabold">
                    Want something else?
                  </div>

                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    Explore more homemade food
                  </div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          </section>

          {/* ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-lg shadow-black/5">
              <div className="border-b border-border/60 p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </span>

                  <div>
                    <h2 className="text-sm font-extrabold">
                      Order summary
                    </h2>

                    <p className="text-[10px] text-muted-foreground">
                      Review before checkout
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {rupees(total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Delivery
                  </span>

                  <span className="font-bold text-muted-foreground">
                    To be confirmed
                  </span>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Total
                      </div>

                      <div className="mt-1 text-2xl font-black tracking-tight">
                        {rupees(total)}
                      </div>
                    </div>

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-extrabold text-primary">
                      Cash on delivery
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-secondary/70 p-3">
                  <div className="flex gap-2">
                    <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <p className="text-[10px] leading-4 text-muted-foreground">
                      Your order is prepared by local home kitchens.
                      {sellers > 1 &&
                        ` Items from ${sellers} kitchens will be placed as ${sellers} separate orders.`}
                    </p>
                  </div>
                </div>

                <BigButton
                  className="mt-1 h-12 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                  onClick={() => navigate({ to: "/checkout" })}
                >
                  Continue to checkout
                  <ArrowRight className="h-4 w-4" />
                </BigButton>

                <Link
                  to="/"
                  className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Continue shopping
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}