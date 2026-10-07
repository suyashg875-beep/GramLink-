import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChefHat,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSignedImages } from "@/lib/helpers";
import {
  Empty,
  Page,
  ProductCard,
  Stars,
  VerifiedBadge,
} from "@/components/gram";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({
    meta: [
      { title: "Home Kitchen — ApnaKitchen" },
      {
        name: "description",
        content:
          "Explore homemade food, products and reviews from verified ApnaKitchen home kitchens.",
      },
      {
        property: "og:title",
        content: "Home Kitchen — ApnaKitchen",
      },
      {
        property: "og:description",
        content:
          "Discover homemade products and customer reviews from this ApnaKitchen kitchen.",
      },
    ],
  }),
  component: SellerPage,
});

function SellerPage() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["seller-public", id],

    queryFn: async () => {
      const [s, p, r] = await Promise.all([
        supabase
          .from("seller_profiles")
          .select(
            "user_id,business_name,about,village_or_area,pincode,address,status,kitchen_image_url",
          )
          .eq("user_id", id)
          .maybeSingle(),

        supabase
          .from("products")
          .select("id,name,price,category,image_urls")
          .eq("seller_id", id)
          .eq("is_published", true)
          .eq("is_available", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("reviews")
          .select("*")
          .eq("seller_id", id)
          .order("created_at", { ascending: false }),
      ]);

      return {
        seller: s.data,
        products: p.data ?? [],
        reviews: r.data ?? [],
      };
    },
  });

  const { data: urls = {} } = useSignedImages(
    (data?.products ?? [])
      .map((p) => p.image_urls[0])
      .filter(Boolean),
  );

  if (isLoading) {
    return (
      <Page>
        <div className="space-y-5">
          <div className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-[320px] animate-pulse rounded-[1.75rem] bg-muted" />
          <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="h-72 animate-pulse rounded-[1.25rem] bg-muted" />
            <div className="h-72 animate-pulse rounded-[1.25rem] bg-muted" />
            <div className="hidden h-72 animate-pulse rounded-[1.25rem] bg-muted sm:block" />
          </div>
        </div>
      </Page>
    );
  }

  if (!data?.seller) {
    return (
      <Page>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Empty emoji="" title="Kitchen not found" />
        </div>
      </Page>
    );
  }

  const { seller, products, reviews } = data;

  const avg = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length
    : 0;

  return (
    <Page>
      {/* BACK */}
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-muted-foreground shadow-sm transition-all hover:-translate-x-0.5 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to kitchens
      </Link>

      {/* HERO */}
      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
        {/* COVER */}
        <div className="relative h-[250px] overflow-hidden sm:h-[340px]">
          {seller.kitchen_image_url ? (
            <img
              src={seller.kitchen_image_url}
              alt={seller.business_name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-secondary to-primary/5">
              <ChefHat className="h-20 w-20 text-primary/35" />
            </div>
          )}

          {/* COVER OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

          {/* TOP LABEL */}
          <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-md">
              <ChefHat className="h-3.5 w-3.5" />
              Home Kitchen
            </span>
          </div>

          {/* HERO INFO */}
          <div className="absolute bottom-5 left-4 right-4 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
                  {seller.business_name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {seller.village_or_area}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Package className="h-4 w-4" />
                    {products.length} products
                  </span>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-3 py-2 backdrop-blur-md">
                <Stars value={avg} />

                <span className="text-sm font-extrabold text-white">
                  {reviews.length ? avg.toFixed(1) : "New"}
                </span>

                {reviews.length > 0 && (
                  <span className="text-xs text-white/65">
                    ({reviews.length})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            {seller.status === "verified" && <VerifiedBadge />}

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[10px] font-bold text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Homemade & Local
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[10px] font-bold text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5 text-primary" />
              Freshly Prepared
            </span>
          </div>

          {/* ABOUT */}
          {seller.about && (
            <div className="mt-6 max-w-3xl">
              <h2 className="text-lg font-extrabold tracking-tight">
                About this kitchen
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {seller.about}
              </p>
            </div>
          )}

          {/* LOCATION */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-secondary/60 p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Location
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">
                {seller.village_or_area}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Pincode: {seller.pincode}
              </p>
            </div>

            {seller.address && (
              <div className="rounded-2xl border border-border/70 bg-secondary/60 p-4">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    Pickup information
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {seller.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">
                From this kitchen
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Homemade favourites
            </h2>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Fresh food made with traditional home recipes.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-border bg-card p-8">
            <Empty emoji="" title="No products available right now" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={Number(p.price)}
                category={p.category}
                image={urls[p.image_urls[0] ?? ""]}
                sellerName={seller.business_name}
              />
            ))}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="mt-12">
          <div className="mb-5">
            <div className="mb-1 flex items-center gap-2">
              <Stars value={avg} />

              <span className="text-xs font-bold text-primary">
                {avg.toFixed(1)} / 5
              </span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              What customers say
            </h2>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Real experiences from customers of this kitchen.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[1.25rem] border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-extrabold">
                      {review.customer_name || "Customer"}
                    </div>

                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Verified customer experience
                    </div>
                  </div>

                  <Stars value={review.rating} />
                </div>

                {(review.review_text || review.comment) && (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    “{review.review_text || review.comment}”
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* TRUST FOOTER */}
      <section className="mt-12 overflow-hidden rounded-[1.5rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-secondary p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />

              <h2 className="text-lg font-extrabold">
                Homemade. Local. Authentic.
              </h2>
            </div>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
              Discover food prepared by local home kitchens and support
              independent food makers through ApnaKitchen.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-sm">
            <ChefHat className="h-5 w-5 text-primary" />

            <span className="text-xs font-extrabold">
              ApnaKitchen
            </span>
          </div>
        </div>
      </section>
    </Page>
  );
}