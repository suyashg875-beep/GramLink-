import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import {
  BigButton,
  Empty,
  Page,
  inputCls,
  labelCls,
} from "@/components/gram";
import { rupees } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      {
        title: "Checkout — ApnaKitchen",
      },
      {
        name: "description",
        content:
          "Complete your ApnaKitchen order from trusted local home kitchens.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] =
    useState<"delivery" | "pickup">("delivery");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [locating, setLocating] = useState(false);
  const [placing, setPlacing] = useState(false);

  const sellerIds = [...new Set(items.map((i) => i.sellerId))];

  const { data: sellers = [], isLoading: sellersLoading } =
    useQuery({
      queryKey: ["checkout-sellers", sellerIds],
      enabled: sellerIds.length > 0,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("seller_profiles")
          .select(
            "user_id,business_name,village_or_area,pincode,address,status",
          )
          .in("user_id", sellerIds);

        if (error) throw error;

        return data ?? [];
      },
    });

  /* ------------------------------------------------------- */
  /* LOCATION                                                 */
  /* ------------------------------------------------------- */

  const useLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Location is not supported by this browser",
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude);
        setLng(coords.longitude);
        setLocating(false);

        toast.success("Your location was added");
      },
      () => {
        setLocating(false);

        toast.error(
          "Could not get your location. Please enter the address manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  /* ------------------------------------------------------- */
  /* EMPTY CART                                               */
  /* ------------------------------------------------------- */

  if (!items.length) {
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
            <div className="bg-gradient-to-br from-primary/10 via-card to-secondary px-6 py-14 text-center sm:px-10">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-primary/10 text-primary">
                <ShoppingBag className="h-9 w-9" />
              </div>

              <h1 className="mt-6 text-2xl font-black tracking-tight">
                Your cart is empty
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Add something delicious from a local home kitchen
                before coming to checkout.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
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

  /* ------------------------------------------------------- */
  /* PLACE ORDER                                              */
  /* ------------------------------------------------------- */

  const placeOrder = async (): Promise<void> => {
    if (!user) return;

    if (!name.trim() || !phone.trim()) {
      toast.error(
        "Please enter your name and phone number",
      );
      return;
    }

    if (method === "delivery" && !address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    setPlacing(true);

    try {
      const { error } = await supabase.rpc("place_order", {
        _items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
        _name: name.trim(),
        _phone: phone.trim(),
        _address:
          method === "pickup"
            ? "Pickup from seller location"
            : address.trim(),
        _fulfillment_method: method,
        _customer_lat:
          method === "delivery" ? lat : null,
        _customer_lng:
          method === "delivery" ? lng : null,
      });

      if (error) throw error;

      clear();

      toast.success("Order placed successfully!");

      navigate({
        to: "/orders",
      });
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not place order",
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Page>
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-7">
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10">
                  <PackageCheck className="h-3.5 w-3.5 text-primary" />
                </span>

                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                  Almost there
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Checkout
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Confirm your details and place your homemade food
                order.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-[10px] font-extrabold text-primary sm:flex">
              <Check className="h-3.5 w-3.5" />
              Secure checkout
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* MAIN */}
          <div className="space-y-5">
            {/* SELLERS */}
            <section className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-sm">
              <div className="border-b border-border/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ChefHat className="h-4 w-4" />
                  </span>

                  <div>
                    <h2 className="text-sm font-extrabold">
                      Your home kitchens
                    </h2>

                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Your order will be prepared by these local
                      sellers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border/60">
                {sellersLoading ? (
                  <div className="space-y-3 p-5">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-muted"
                      />
                    ))}
                  </div>
                ) : (
                  sellers.map((seller) => (
                    <div
                      key={seller.user_id}
                      className="p-4 transition-colors hover:bg-secondary/30 sm:p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Store className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="truncate text-sm font-extrabold">
                              {seller.business_name}
                            </div>

                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-primary">
                              Verified kitchen
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>
                              {seller.village_or_area} ·{" "}
                              {seller.pincode}
                            </span>
                          </div>

                          <div className="mt-2 rounded-lg bg-secondary/70 px-3 py-2 text-[10px] leading-4 text-muted-foreground">
                            <span className="font-bold text-foreground">
                              Pickup address:
                            </span>{" "}
                            {seller.address ||
                              `${seller.village_or_area}, ${seller.pincode}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* FULFILLMENT */}
            <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="h-4 w-4" />
                </span>

                <div>
                  <h2 className="text-sm font-extrabold">
                    How do you want to receive it?
                  </h2>

                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Choose delivery or collect it yourself.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* DELIVERY */}
                <button
                  type="button"
                  onClick={() => setMethod("delivery")}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300",
                    method === "delivery"
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border/70 bg-card hover:border-primary/20 hover:bg-primary/5",
                  )}
                >
                  {method === "delivery" && (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}

                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl transition-colors",
                      method === "delivery"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary",
                    )}
                  >
                    <Truck className="h-5 w-5" />
                  </span>

                  <div className="mt-3 text-sm font-extrabold">
                    Delivery
                  </div>

                  <div className="mt-1 max-w-[230px] text-[11px] leading-5 text-muted-foreground">
                    Seller delivers your homemade food to your
                    address.
                  </div>
                </button>

                {/* PICKUP */}
                <button
                  type="button"
                  onClick={() => setMethod("pickup")}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-300",
                    method === "pickup"
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border/70 bg-card hover:border-primary/20 hover:bg-primary/5",
                  )}
                >
                  {method === "pickup" && (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}

                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl transition-colors",
                      method === "pickup"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary",
                    )}
                  >
                    <PackageCheck className="h-5 w-5" />
                  </span>

                  <div className="mt-3 text-sm font-extrabold">
                    Pickup
                  </div>

                  <div className="mt-1 max-w-[230px] text-[11px] leading-5 text-muted-foreground">
                    Collect your order directly from the seller's
                    kitchen.
                  </div>
                </button>
              </div>
            </section>

            {/* CUSTOMER DETAILS */}
            <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="h-4 w-4" />
                </span>

                <div>
                  <h2 className="text-sm font-extrabold">
                    Customer details
                  </h2>

                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    These details help the seller complete your
                    order.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>
                    Full name
                  </label>

                  <input
                    className={cn(
                      inputCls,
                      "rounded-xl transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
                    )}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Phone number
                  </label>

                  <input
                    className={cn(
                      inputCls,
                      "rounded-xl transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
                    )}
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    placeholder="10-digit mobile number"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* DELIVERY ADDRESS */}
              {method === "delivery" && (
                <div className="mt-5 border-t border-border/60 pt-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <label className={labelCls}>
                        Delivery address
                      </label>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Enter the address where your order should
                        arrive.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={useLocation}
                      disabled={locating}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] font-extrabold text-primary transition-all duration-200 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}

                      {locating ? "Locating..." : "Use my location"}
                    </button>
                  </div>

                  <textarea
                    className="min-h-28 w-full resize-none rounded-xl border-2 border-input bg-card p-4 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House no., street, area, city, pincode"
                    autoComplete="street-address"
                  />

                  {lat !== null && lng !== null && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-[10px] font-semibold text-primary">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      Current location added
                    </div>
                  )}

                  <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                    Your address is still required so the seller
                    clearly knows where to deliver your order.
                  </p>
                </div>
              )}

              {/* PICKUP INFO */}
              {method === "pickup" && (
                <div className="mt-5 flex gap-3 rounded-xl bg-secondary/70 p-4">
                  <Store className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <div>
                    <div className="text-xs font-extrabold">
                      Pickup addresses
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                      The pickup location for each seller is shown
                      above. Please collect your order from the
                      respective home kitchen.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-lg shadow-black/5">
              <div className="border-b border-border/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </span>

                  <div>
                    <h2 className="text-sm font-extrabold">
                      Order summary
                    </h2>

                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {items.length}{" "}
                      {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {/* ITEMS */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-xs font-bold">
                          {item.name}
                        </div>

                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {item.quantity} × {rupees(item.price)}
                        </div>
                      </div>

                      <span className="shrink-0 text-xs font-extrabold">
                        {rupees(
                          item.price * item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal
                    </span>

                    <span className="font-bold">
                      {rupees(total)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Delivery
                    </span>

                    <span className="font-bold text-muted-foreground">
                      To be confirmed
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-secondary/70 p-4">
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Store className="h-4 w-4" />
                    </span>

                    <div>
                      <div className="text-xs font-extrabold">
                        {sellerIds.length === 1
                          ? "One seller order"
                          : `${sellerIds.length} seller orders`}
                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        {sellerIds.length > 1
                          ? "Products from different kitchens will be created as separate orders."
                          : "Your items will be prepared by this local home kitchen."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Total payable
                      </div>

                      <div className="mt-1 text-2xl font-black tracking-tight">
                        {rupees(total)}
                      </div>
                    </div>

                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-extrabold text-primary">
                      Cash on{" "}
                      {method === "pickup"
                        ? "pickup"
                        : "delivery"}
                    </span>
                  </div>
                </div>

                <BigButton
                  onClick={placeOrder}
                  disabled={placing}
                  className="h-12 rounded-xl text-sm shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Placing order...
                    </>
                  ) : (
                    <>
                      Place order
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </BigButton>

                <div className="flex items-center justify-center gap-1.5 text-center text-[9px] leading-4 text-muted-foreground">
                  <Check className="h-3 w-3 text-primary" />
                  You will pay when the order is received or picked
                  up.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}