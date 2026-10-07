import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Minus,
  Plus,
  ShoppingBag,
  MapPin,
  MessageCircle,
  ArrowRight,
  Heart,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { rupees, useSignedImages } from "@/lib/helpers";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import {
  BigButton,
  Empty,
  Page,
  ProductThumb,
  Stars,
  VerifiedBadge,
} from "@/components/gram";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Homemade product — ApnaKitchen" },
      {
        name: "description",
        content:
          "Discover homemade food from verified ApnaKitchen home kitchens.",
      },
      {
        property: "og:title",
        content: "Homemade product — ApnaKitchen",
      },
      {
        property: "og:description",
        content:
          "Homemade food from a verified ApnaKitchen home kitchen near you.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const { role } = useAuth();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState(false);
  
  useEffect(() => {
  if (!id) return;

  const saved = localStorage.getItem(`apnakitchen-favorite-${id}`);
  setLiked(saved === "true");
}, [id]);

const toggleFavorite = () => {
  const next = !liked;

  setLiked(next);
  localStorage.setItem(
    `apnakitchen-favorite-${id}`,
    String(next),
  );

  if (next) {
    toast.success("Added to favorites");
  } else {
    toast.success("Removed from favorites");
  }
};
  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "*, seller_profiles(user_id,business_name,village_or_area,pincode,address,status)",
        )
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["seller-reviews", p?.seller_id],
    enabled: !!p,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("seller_id", p!.seller_id)
        .order("created_at", { ascending: false });

      return data ?? [];
    },
  });

  const { data: urls = {} } = useSignedImages(p?.image_urls ?? []);

  if (isLoading) {
    return (
      <Page>
        <div className="space-y-6">
          <div className="aspect-square animate-pulse rounded-[2rem] bg-muted sm:aspect-[1.15/1]" />

          <div className="space-y-4">
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-4/5 animate-pulse rounded-xl bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="h-12 w-36 animate-pulse rounded-xl bg-muted" />
          </div>

          <div className="h-32 animate-pulse rounded-[1.5rem] bg-muted" />
        </div>
      </Page>
    );
  }

  if (!p) {
    return (
      <Page>
        <Empty emoji="" title="Product not found" />
      </Page>
    );
  }

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const canBuy = p.is_available && p.stock > 0 && p.is_published;

  const imagePath = p.image_urls[active] ?? "";
  const imageUrl = urls[imagePath];

  const addToCart = (go: boolean) => {
    add(
      {
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image_urls[0] ?? null,
        sellerId: p.seller_id,
        sellerName: p.seller_profiles?.business_name ?? "",
        stock: p.stock,
      },
      qty,
    );

    toast.success("Added to cart");

    if (go) navigate({ to: "/cart" });
  };

  const previousImage = () => {
    setActive((current) =>
      current === 0 ? p.image_urls.length - 1 : current - 1,
    );
  };

  const nextImage = () => {
    setActive((current) =>
      current === p.image_urls.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <Page>
      {/* PRODUCT GALLERY */}
      <section>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_92px]">
          <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-xl shadow-black/5 sm:aspect-[1.15/1] lg:aspect-[1.08/1]">
            <ProductThumb
              url={imageUrl}
              category={p.category}
              className="transition-transform duration-1000 ease-out group-hover:scale-[1.025]"
            />

            {/* IMAGE OVERLAY */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

            {/* CATEGORY */}
            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-xl">
                {p.category}
              </span>
            </div>

            {/* FAVORITE */}
<button
  type="button"
  onClick={toggleFavorite}
  aria-label={liked ? "Remove from favorites" : "Add to favorites"}
  className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-90 ${
    liked
      ? "border-primary/30 bg-primary text-primary-foreground shadow-primary/25"
      : "border-white/20 bg-black/40 text-white hover:bg-black/55"
  }`}
>
  <Heart
    className={`h-4.5 w-4.5 transition-all duration-300 ${
      liked ? "fill-current scale-110" : "scale-100"
    }`}
  />
</button>

            {/* IMAGE COUNTER */}
            {p.image_urls.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-xl">
                {active + 1} / {p.image_urls.length}
              </div>
            )}

            {/* IMAGE NAVIGATION */}
            {p.image_urls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 shadow-lg backdrop-blur-xl transition-all duration-300 hover:bg-black/60 group-hover:opacity-100 sm:left-5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 shadow-lg backdrop-blur-xl transition-all duration-300 hover:bg-black/60 group-hover:opacity-100 sm:right-5"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* BOTTOM LABEL */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-xl">
              <ChefHat className="h-3.5 w-3.5 text-primary" />
              Homemade & freshly prepared
            </div>
          </div>

          {/* DESKTOP THUMBNAILS */}
          {p.image_urls.length > 1 && (
            <div className="hidden flex-col gap-2.5 lg:flex">
              {p.image_urls.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-card transition-all duration-300 ${
                    active === index
                      ? "scale-[1.03] border-primary shadow-md shadow-primary/15"
                      : "border-border/60 opacity-65 hover:border-primary/40 hover:opacity-100"
                  }`}
                >
                  <ProductThumb
                    url={urls[url] ?? url}
                    category={p.category}
                    className="h-full w-full"
                  />

                  {active === index && (
                    <div className="absolute inset-0 rounded-[0.6rem] ring-1 ring-inset ring-white/40" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MOBILE THUMBNAILS */}
        {p.image_urls.length > 1 && (
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
            {p.image_urls.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-card transition-all duration-300 ${
                  active === index
                    ? "scale-[1.03] border-primary shadow-md shadow-primary/15"
                    : "border-border/60 opacity-65 hover:border-primary/40 hover:opacity-100"
                }`}
              >
                <ProductThumb
                  url={urls[url] ?? url}
                  category={p.category}
                  className="h-full w-full"
                />

                {active === index && (
                  <div className="absolute inset-0 rounded-[0.65rem] ring-1 ring-inset ring-white/30" />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCT INFORMATION */}
      <section className="mt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                {p.category}
              </span>

              {p.seller_profiles?.status === "verified" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-[10px] font-extrabold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified kitchen
                </span>
              )}
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              {p.name}
            </h1>
          </div>
        </div>

        {/* RATING */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {reviews.length > 0 ? (
            <>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                <Stars value={avg} />
                <span className="text-xs font-extrabold text-primary">
                  {avg.toFixed(1)}
                </span>
              </div>

              <span className="text-sm text-muted-foreground">
                {reviews.length}{" "}
                {reviews.length === 1 ? "customer review" : "customer reviews"}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={0} />
              <span>No reviews yet</span>
            </div>
          )}
        </div>

        {/* PRICE */}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-[1.35rem] border border-primary/10 bg-gradient-to-br from-primary/8 via-card to-secondary/40 p-5">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground">
              Price
            </div>

            <div className="mt-1 font-display text-4xl font-black tracking-tight text-primary sm:text-[2.75rem]">
              {rupees(Number(p.price))}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-extrabold ${
              canBuy
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                canBuy ? "bg-success" : "bg-destructive"
              }`}
            />
            {canBuy ? `${p.stock} available` : "Currently unavailable"}
          </div>
        </div>

        {/* DESCRIPTION */}
        {p.description && (
          <div className="mt-5 rounded-[1.35rem] border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>

              <div>
                <h2 className="text-sm font-extrabold">About this food</h2>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Prepared with homemade care
                </p>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-foreground/80">
              {p.description}
            </p>
          </div>
        )}
      </section>

      {/* SELLER / HOME KITCHEN */}
      {p.seller_profiles && (
        <Link
          to="/seller/$id"
          params={{ id: p.seller_id }}
          className="group mt-5 block overflow-hidden rounded-[1.4rem] border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
        >
          <div className="border-b border-border/60 bg-gradient-to-r from-primary/8 via-transparent to-transparent p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ChefHat className="h-4 w-4" />
                </span>

                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary">
                    Your home kitchen
                  </div>
                  <div className="text-sm font-extrabold">
                    Made by a local home cook
                  </div>
                </div>
              </div>

              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <ChefHat className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-black">
                  {p.seller_profiles.business_name}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />

                  <span className="truncate">
                    {p.seller_profiles.village_or_area} ·{" "}
                    {p.seller_profiles.pincode}
                  </span>
                </div>

                {p.seller_profiles.status === "verified" && (
                  <div className="mt-2">
                    <VerifiedBadge />
                  </div>
                )}
              </div>
            </div>

            {p.seller_profiles.address && (
              <div className="mt-4 rounded-xl border border-border/60 bg-secondary/60 px-4 py-3.5 text-sm leading-6">
                <div className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  Pickup location
                </div>

                <span className="text-foreground/80">
                  {p.seller_profiles.address}
                </span>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* PURCHASE BOX */}
      {canBuy && (role === null || role === "customer") && (
        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-primary/15 bg-card shadow-xl shadow-primary/5">
          {/* HEADER */}
          <div className="border-b border-border/60 bg-gradient-to-r from-primary/12 via-primary/5 to-transparent p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </span>

                  <h2 className="text-base font-black">
                    Add to your order
                  </h2>
                </div>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Choose your quantity and order directly from this home
                  kitchen.
                </p>
              </div>

              <div className="shrink-0 rounded-full bg-success/10 px-3 py-1.5 text-[10px] font-extrabold text-success">
                {p.stock} available
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* QUANTITY */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold">Quantity</div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Select how many you want
                </div>
              </div>

              <div className="flex items-center rounded-xl border border-border bg-background p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="grid h-9 w-9 place-items-center rounded-lg transition-all hover:bg-secondary active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="grid h-9 min-w-10 place-items-center text-sm font-black">
                  {qty}
                </span>

                <button
                  type="button"
                  onClick={() => setQty(Math.min(p.stock, qty + 1))}
                  disabled={qty >= p.stock}
                  aria-label="Increase quantity"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all hover:brightness-95 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-5 overflow-hidden rounded-xl border border-border/60 bg-secondary/60">
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Your total
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {qty} × {rupees(Number(p.price))}
                  </div>
                </div>

                <div className="font-display text-2xl font-black text-primary">
                  {rupees(Number(p.price) * qty)}
                </div>
              </div>
            </div>

         {/* ACTIONS */}
<div className="mt-4 grid gap-2.5 sm:grid-cols-2">
  <BigButton
    onClick={() => addToCart(true)}
    className="min-h-12 rounded-xl shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
  >
    <ShoppingBag className="h-4.5 w-4.5" />
    Buy now
  </BigButton>

  <BigButton
    onClick={() => addToCart(false)}
    className="min-h-12 rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/15 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
  >
    <ShoppingBag className="h-4.5 w-4.5" />
    Add to cart
  </BigButton>
</div>
            {/* TRUST */}
            <div className="mt-5 flex items-center justify-center gap-2 border-t border-border/60 pt-4 text-[10px] font-semibold text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Homemade food from a verified local kitchen
            </div>
          </div>
        </section>
      )}

      {/* UNAVAILABLE MESSAGE */}
      {!canBuy && (
        <div className="mt-6 flex items-center gap-3 rounded-[1.25rem] border border-destructive/15 bg-destructive/5 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <ShoppingBag className="h-4 w-4" />
          </span>

          <div>
            <div className="text-sm font-extrabold">
              This food is currently unavailable
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Please check back later for availability.
            </p>
          </div>
        </div>
      )}

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="mt-9">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">
                  Customer feedback
                </span>
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                What customers say
              </h2>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Real feedback from people who ordered from this kitchen.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-primary/15 bg-primary/10 px-3 py-2 sm:flex">
              <Stars value={avg} size={14} />

              <span className="text-sm font-black text-primary">
                {avg.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="rounded-[1.25rem] border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/15 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <MessageCircle className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold">
                        {r.customer_name || "Customer"}
                      </div>

                      <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                        Verified customer feedback
                      </div>
                    </div>
                  </div>

                  <Stars value={r.rating} size={14} />
                </div>

                {r.comment && (
                  <p className="mt-4 rounded-xl bg-secondary/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    “{r.comment}”
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TRUST FOOTER */}
      <div className="mt-9 overflow-hidden rounded-[1.4rem] border border-border/60 bg-secondary/50">
        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <TrustPoint
            icon={<ChefHat className="h-4 w-4" />}
            title="Home kitchen"
            text="Prepared by a local home cook."
          />

          <TrustPoint
            icon={<BadgeCheck className="h-4 w-4" />}
            title="Verified"
            text="Discover food from trusted kitchens."
          />

          <TrustPoint
            icon={<Sparkles className="h-4 w-4" />}
            title="Homemade"
            text="Traditional flavours made with care."
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-7 text-[10px] font-semibold text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        ApnaKitchen · घरसारखा स्वाद, थेट तुमच्या घरापर्यंत
      </div>
    </Page>
  );
}

function TrustPoint({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>

      <div>
        <div className="text-xs font-extrabold">{title}</div>

        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}