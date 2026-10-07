import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  ChefHat,
  MapPin,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  useArea,
  useSignedImages,
} from "@/lib/helpers";
import { useAuth } from "@/lib/auth";
import {
  BigButton,
  Empty,
  Page,
  ProductCard,
  VerifiedBadge,
  inputCls,
} from "@/components/gram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "ApnaKitchen — घरसारखा स्वाद, थेट तुमच्या घरापर्यंत",
      },
      {
        name: "description",
        content:
          "Discover homemade food, traditional recipes and authentic flavours from verified home kitchens near you.",
      },
      {
        property: "og:title",
        content:
          "ApnaKitchen — घरसारखा स्वाद, थेट तुमच्या घरापर्यंत",
      },
      {
        property: "og:description",
        content:
          "Discover homemade food from verified home kitchens near you.",
      },
    ],
  }),
  component: Home,
});

/* ========================================================= */
/* AREA PICKER                                               */
/* ========================================================= */

function AreaPicker({ onPick }: { onPick: (p: string) => void }) {
  const [value, setValue] = useState("");
  const valid = /^\d{6}$/.test(value);

  return (
    <Page>
      <div className="space-y-5">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary via-primary to-primary/85 p-6 text-primary-foreground shadow-xl shadow-primary/15 sm:p-8 lg:p-10">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-black/10 blur-sm" />
          <div className="pointer-events-none absolute right-20 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

          <div className="relative max-w-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/15 shadow-sm backdrop-blur-sm">
              <ChefHat className="h-6 w-6" />
            </div>

            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary-foreground/75">
                Welcome to ApnaKitchen
              </p>
            </div>

            <h1 className="max-w-xl text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              घरसारखा स्वाद,
              <br />
              <span className="text-primary-foreground/95">
                थेट तुमच्या घरापर्यंत
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/80 sm:text-base">
              Discover authentic homemade food prepared with care by
              trusted home kitchens around you.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-primary-foreground/75">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                Homemade
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                Freshly prepared
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                Local kitchens
              </span>
            </div>
          </div>
        </section>

        {/* LOCATION SEARCH */}
        <form
          className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-lg shadow-black/5 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault();

            if (valid) onPick(value);
          }}
        >
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </span>

              <div>
                <label className="block text-sm font-extrabold">
                  Find homemade food near you
                </label>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Enter your pincode to discover nearby kitchens
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />

              <input
                className={cn(
                  inputCls,
                  "h-13 rounded-xl border-border/70 bg-background pl-11 text-base tracking-[0.14em] transition-all duration-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
                )}
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit pincode"
                value={value}
                onChange={(e) =>
                  setValue(e.target.value.replace(/\D/g, ""))
                }
              />

              {value.length > 0 && !valid && (
                <span className="absolute bottom-1.5 left-11 text-[9px] font-semibold text-destructive">
                  Enter a valid 6-digit pincode
                </span>
              )}
            </div>

            <div className="sm:w-56">
              <BigButton
                disabled={!valid}
                className="h-13 rounded-xl text-sm shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Search className="h-4 w-4" />
                Explore kitchens
              </BigButton>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Your location helps us show relevant local kitchens.
          </div>
        </form>
      </div>
    </Page>
  );
}

/* ========================================================= */
/* HOME                                                       */
/* ========================================================= */

function Home() {
  const { pincode, setPincode, ready } = useArea();
  const { role } = useAuth();

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const prefix = pincode?.slice(0, 3);

  /* ------------------------------------------------------- */
  /* KITCHENS QUERY                                           */
  /* ------------------------------------------------------- */

  const { data: kitchens = [], isLoading: kitchensLoading } = useQuery({
    queryKey: ["home-kitchens", showAll ? "all" : prefix],

    enabled: !!pincode,

    queryFn: async () => {
      let q = supabase
        .from("seller_profiles")
        .select(
          "user_id,business_name,about,village_or_area,pincode,address,kitchen_image_url,status",
        )
        .eq("status", "verified")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!showAll && prefix) {
        q = q.like("pincode", `${prefix}%`);
      }

      const { data, error } = await q;

      if (error) throw error;

      return data ?? [];
    },
  });

  const filteredKitchens = kitchens.filter(
    (kitchen) =>
      !search ||
      kitchen.business_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      kitchen.village_or_area
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  /* ------------------------------------------------------- */
  /* PRODUCTS QUERY                                           */
  /* ------------------------------------------------------- */

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["home-products", showAll ? "all" : prefix],

    enabled: !!pincode,

    queryFn: async () => {
      let q = supabase
        .from("products")
        .select(
          "id,name,price,category,image_urls,description,stock,is_available,seller_profiles!inner(business_name,pincode,village_or_area)",
        )
        .eq("is_published", true)
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!showAll && prefix) {
        q = q.like("seller_profiles.pincode", `${prefix}%`);
      }

      const { data, error } = await q;

      if (error) throw error;

      return data ?? [];
    },
  });

  const filtered = products.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.seller_profiles.business_name
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  const { data: urls = {} } = useSignedImages(
    filtered
      .map((p) => p.image_urls[0])
      .filter(Boolean),
  );

  /* ------------------------------------------------------- */
  /* LOADING                                                  */
  /* ------------------------------------------------------- */

  if (!ready) {
    return (
      <Page>
        <div className="space-y-5">
          <div className="h-72 animate-pulse rounded-[2rem] bg-muted" />

          <div className="h-28 animate-pulse rounded-[1.5rem] bg-muted" />

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[1/1.2] animate-pulse rounded-[1.25rem] bg-muted"
              />
            ))}
          </div>
        </div>
      </Page>
    );
  }

  /* ------------------------------------------------------- */
  /* AREA SELECTION                                           */
  /* ------------------------------------------------------- */

  if (!pincode) {
    return <AreaPicker onPick={setPincode} />;
  }

  return (
    <Page>
      {/* --------------------------------------------------- */}
      {/* SELLER QUICK ACCESS                                  */}
      {/* --------------------------------------------------- */}

      {role === "seller" && (
        <Link
          to="/sell"
          className="group mb-5 flex items-center justify-between gap-3 rounded-[1.25rem] border border-primary/15 bg-primary/5 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ChefHat className="h-5 w-5" />
            </span>

            <div>
              <div className="text-sm font-extrabold text-primary">
                Your kitchen
              </div>

              <div className="mt-0.5 text-xs text-muted-foreground">
                Manage products and orders
              </div>
            </div>
          </div>

          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {/* --------------------------------------------------- */}
      {/* LOCATION BAR                                         */}
      {/* --------------------------------------------------- */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPincode(null)}
          className="group flex min-w-0 items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-bold shadow-sm transition-all duration-200 hover:border-primary/25 hover:bg-primary/5"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10">
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </span>

          <span className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Delivering near
            </span>

            <span className="block truncate text-xs font-extrabold text-foreground">
              {showAll ? "All areas" : pincode}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className={cn(
            "shrink-0 rounded-xl border px-3 py-2 text-[10px] font-extrabold transition-all duration-200",
            showAll
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:text-primary",
          )}
        >
          {showAll ? "Nearby" : "All areas"}
        </button>
      </div>

      {/* --------------------------------------------------- */}
      {/* SEARCH                                                */}
      {/* --------------------------------------------------- */}

      <section className="relative">
        <div className="rounded-[1.5rem] border border-border/70 bg-card p-2 shadow-sm transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-lg focus-within:shadow-primary/5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />

            <input
              className={cn(
                inputCls,
                "h-13 rounded-xl border-0 bg-transparent pl-12 pr-12 text-[15px] shadow-none focus:border-0 focus:ring-0",
              )}
              placeholder="Search homemade food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-secondary text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-90"
              >
                <span className="text-lg font-medium leading-none">
                  ×
                </span>
              </button>
            ) : (
              <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg bg-secondary px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:block">
                Search
              </div>
            )}
          </div>
        </div>
        {search && (
  <div className="mt-3 flex items-center justify-between gap-3 px-1">
    <p className="text-xs font-semibold text-muted-foreground">
      {filtered.length} {filtered.length === 1 ? "result" : "results"} for{" "}
      <span className="font-extrabold text-foreground">"{search}"</span>
    </p>

    <button
      type="button"
      onClick={() => setSearch("")}
      className="shrink-0 text-xs font-extrabold text-primary transition-colors hover:text-primary/70"
    >
      Clear
    </button>
  </div>
)}
        {!search && (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                Popular searches
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                {
                  label: "Puran Poli",
                  featured: true,
                },
                {
                  label: "Pickles",
                  featured: false,
                },
                {
                  label: "Papad",
                  featured: false,
                },
                {
                  label: "Masala",
                  featured: false,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSearch(item.label)}
                  className={cn(
                    "group flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-95",
                    item.featured
                      ? "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
                      : "border-border/70 bg-card text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  {item.featured && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.10)]" />
                  )}

                  {item.label}

                  <ArrowRight className="h-3 w-3 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* --------------------------------------------------- */}
{/* PURAN POLI FEATURED                                  */}
{/* --------------------------------------------------- */}

{!search && (
  <section className="group relative mt-8 overflow-hidden rounded-[2rem] border border-primary/15 bg-card shadow-xl shadow-primary/5">
    {/* BACKGROUND */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-transparent to-secondary/80" />

    <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">
      {/* CONTENT */}
      <div className="relative z-10 flex flex-col justify-center p-6 sm:p-9 lg:p-12">
        {/* LABEL */}
        <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          ApnaKitchen Special
        </div>

        {/* TITLE */}
        <h2 className="max-w-xl text-[2rem] font-black leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[3.15rem]">
          The taste of
          <br />
          <span className="text-primary">
            real Maharashtra.
          </span>
        </h2>

        <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-[15px]">
          Soft, warm and freshly prepared Puran Poli from local home
          kitchens — made using traditional recipes and the comfort
          of homemade food.
        </p>

        {/* HIGHLIGHTS */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[10px] font-bold text-muted-foreground backdrop-blur-sm">
            Traditional recipe
          </span>

          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[10px] font-bold text-muted-foreground backdrop-blur-sm">
            Homemade
          </span>

          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[10px] font-bold text-muted-foreground backdrop-blur-sm">
            Freshly prepared
          </span>
        </div>

        {/* CTA */}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setSearch("Puran Poli")}
            className="group/button inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
          >
            Explore Puran Poli

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10">
              <ChefHat className="h-3.5 w-3.5 text-primary" />
            </span>

            Made in local home kitchens
          </div>
        </div>
      </div>

      {/* FOOD VISUAL */}
      <div className="relative min-h-[290px] overflow-hidden sm:min-h-[360px] lg:min-h-[430px]">
        <img
          src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=90"
          alt="Traditional homemade Puran Poli"
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
        />

        {/* IMAGE OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" />

        <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-card via-card/40 to-transparent lg:block" />

        {/* FEATURE CARD */}
        <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-auto">
          <div className="rounded-2xl border border-white/20 bg-black/45 px-4 py-3.5 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <ChefHat className="h-4 w-4" />
              </span>

              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">
                  Traditional favourite
                </div>

                <div className="mt-0.5 text-sm font-extrabold">
                  Homemade Puran Poli
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RATING */}
        <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-white shadow-lg backdrop-blur-xl">
          <span className="text-xs font-extrabold">4.9</span>
          <span className="text-[11px] text-primary">★</span>
          <span className="text-[10px] font-medium text-white/65">
            loved locally
          </span>
        </div>

        {/* DECORATIVE GLOW */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/25 blur-3xl" />
      </div>
    </div>
  </section>
)}

      {/* --------------------------------------------------- */}
      {/* HOME KITCHENS                                       */}
      {/* --------------------------------------------------- */}

<section className="mt-12">
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary/10">
          <ChefHat className="h-3.5 w-3.5 text-primary" />
        </span>

        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
          Discover local kitchens
        </span>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Home kitchens near you
      </h2>

      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        Discover authentic homemade food prepared by local home chefs.
      </p>
    </div>

    {kitchens.length > 4 && (
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="hidden shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-2.5 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:flex"
      >
        {showAll ? "Show less" : "View all"}

        <ArrowRight
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            showAll && "rotate-180",
          )}
        />
      </button>
    )}
  </div>

  {kitchensLoading ? (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-card shadow-sm"
        >
          <div className="aspect-[1.55/1] animate-pulse bg-muted" />

          <div className="space-y-3.5 p-4.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  ) : kitchens.length === 0 ? (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
        <ChefHat className="h-7 w-7 text-primary" />
      </div>

      <h3 className="mt-5 text-base font-extrabold">
        No home kitchens found
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Try changing your location or search for another homemade food.
      </p>
    </div>
  ) : filteredKitchens.length === 0 ? (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>

      <h3 className="mt-5 text-base font-extrabold">
        No matching kitchens
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Try a different kitchen name or location.
      </p>
    </div>
  ) : (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredKitchens
        .slice(0, showAll ? filteredKitchens.length : 4)
        .map((kitchen) => (
          <Link
            key={kitchen.user_id}
            to="/seller/$id"
            params={{ id: kitchen.user_id }}
            className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-2xl hover:shadow-black/8 active:scale-[0.985]"
          >
            {/* IMAGE */}
            <div className="relative aspect-[1.55/1] overflow-hidden bg-secondary">
              {kitchen.kitchen_image_url ? (
                <img
                  src={kitchen.kitchen_image_url}
                  alt={kitchen.business_name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/15 via-secondary to-primary/5">
                  <ChefHat className="h-14 w-14 text-primary/30 transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}

              {/* IMAGE OVERLAY */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />

              {/* VERIFIED */}
              <div className="absolute left-3.5 top-3.5">
                <VerifiedBadge />
              </div>

              {/* RATING */}
              <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-white shadow-lg backdrop-blur-xl">
                <span className="text-xs font-extrabold">4.8</span>

                <span className="text-[11px] font-bold text-primary">
                  ★
                </span>
              </div>

              {/* KITCHEN INFO ON IMAGE */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5">
                <h3 className="truncate text-[17px] font-extrabold tracking-tight text-white drop-shadow-md">
                  {kitchen.business_name}
                </h3>

                {kitchen.village_or_area && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                    <MapPin className="h-3 w-3 shrink-0" />

                    <span className="truncate">
                      {kitchen.village_or_area}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="p-4.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <ChefHat className="h-4 w-4 text-primary" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-foreground">
                    Homemade food
                  </p>

                  <p className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground">
                    Freshly prepared in a home kitchen
                  </p>
                </div>
              </div>

              {/* META */}
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  Fresh daily
                </span>

                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  Local kitchen
                </span>
              </div>

              {/* CTA */}
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                  Explore kitchen
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-extrabold text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  View kitchen

                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
    </div>
  )}

  {kitchens.length > 4 && (
    <button
      type="button"
      onClick={() => setShowAll((v) => !v)}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-xs font-bold shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:hidden"
    >
      {showAll
        ? "Show less"
        : `View all ${filteredKitchens.length} kitchens`}

      <ArrowRight
        className={cn(
          "h-3.5 w-3.5 transition-transform duration-200",
          showAll && "rotate-180",
        )}
      />
    </button>
  )}
</section>

      {/* --------------------------------------------------- */}
{/* CATEGORIES                                          */}
{/* --------------------------------------------------- */}

<section className="mt-12">
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary/10">
          <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
        </span>

        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
          Browse menu
        </span>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Explore by category
      </h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        Find the homemade food you're craving.
      </p>
    </div>
  </div>

  {/* CATEGORY SELECTOR */}
  <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex min-w-max gap-2.5">
      {/* ALL */}
      <Chip
        active={!cat}
        onClick={() => setCat(null)}
      >
        All
      </Chip>

      {/* CATEGORIES */}
      {CATEGORIES.map((c) => {
        const isPuranPoli = c.toLowerCase().includes("puran poli");

        return (
          <button
            key={c}
            type="button"
            onClick={() => setCat(cat === c ? null : c)}
            className={cn(
              "group inline-flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-[0.97]",
              cat === c
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : isPuranPoli
                  ? "border-primary/25 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10"
                  : "border-border/70 bg-card text-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary",
            )}
          >
            {isPuranPoli && (
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full",
                  cat === c
                    ? "bg-white/15"
                    : "bg-primary/10",
                )}
              >
                <ChefHat className="h-3 w-3.5" />
              </span>
            )}

            <span>{c}</span>

            {isPuranPoli && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider",
                  cat === c
                    ? "bg-white/15 text-white"
                    : "bg-primary/10 text-primary",
                )}
              >
                Special
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
</section>

      {/* --------------------------------------------------- */}
{/* PRODUCTS                                            */}
{/* --------------------------------------------------- */}

<section className="mt-12">
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-primary/10">
          <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
        </span>

        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">
          From local kitchens
        </span>
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Homemade favourites
      </h2>

      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        Fresh food, made with care by local home chefs.
      </p>
    </div>

    <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm sm:grid">
      <UtensilsCrossed className="h-4 w-4" />
    </div>
  </div>

  {isLoading ? (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-card shadow-sm"
        >
          <div className="aspect-[1.05/1] animate-pulse bg-muted" />

          <div className="space-y-3.5 p-3.5 sm:p-4.5">
            <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted" />

            <div className="h-3 w-3/5 animate-pulse rounded-md bg-muted" />

            <div className="h-8 w-2/5 animate-pulse rounded-md bg-muted" />

            <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  ) : filtered.length === 0 ? (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-card/70 p-8 sm:p-10">
      <Empty
        emoji=""
        title="No homemade food found"
      >
        <p className="mt-1 text-sm text-muted-foreground">
          Try another category, search term or nearby area.
        </p>

        {!showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97]"
          >
            Explore all kitchens

            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </Empty>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
      {filtered.map((p) => {
        const isPuranPoli = p.name
          .toLowerCase()
          .includes("puran poli");

        return (
          <div
            key={p.id}
            className={cn(
              "relative rounded-[1.5rem] transition-all duration-300",
              isPuranPoli &&
                "rounded-[1.6rem] ring-1 ring-primary/15",
            )}
          >
            {isPuranPoli && (
              <div className="pointer-events-none absolute -top-2.5 left-3 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-primary shadow-sm">
                  <ChefHat className="h-2.5 w-2.5" />
                  ApnaKitchen Special
                </span>
              </div>
            )}

            <ProductCard
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              category={p.category}
              image={urls[p.image_urls[0] ?? ""]}
              sellerName={p.seller_profiles.business_name}
            />
          </div>
        );
      })}
    </div>
  )}
</section>



      {/* --------------------------------------------------- */}
{/* BOTTOM TRUST STRIP                                  */}
{/* --------------------------------------------------- */}

{!search && (
  <section className="mt-12 overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
    <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.08] via-transparent to-primary/[0.04] px-5 py-5 sm:px-7">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
            Why ApnaKitchen
          </p>

          <h2 className="mt-0.5 text-base font-extrabold tracking-tight sm:text-lg">
            Homemade food, the way it should be.
          </h2>
        </div>
      </div>
    </div>

    <div className="grid divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <TrustItem
        icon={<ChefHat className="h-4 w-4" />}
        title="Real home kitchens"
        text="Food prepared by local home chefs, not commercial chains."
      />

      <TrustItem
        icon={<MapPin className="h-4 w-4" />}
        title="Local & fresh"
        text="Discover homemade food from kitchens around your area."
      />

      <TrustItem
        icon={<Sparkles className="h-4 w-4" />}
        title="Traditional flavours"
        text="Authentic recipes made with the warmth of home."
      />
    </div>
  </section>
)}
    </Page>
  );
}

/* ========================================================= */
/* CHIP                                                       */
/* ========================================================= */

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-[0.97]",
        active
  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
  : "border-border/70 bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

/* ========================================================= */
/* TRUST ITEM                                                  */
/* ========================================================= */

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3.5 p-5 sm:p-6">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <h3 className="text-xs font-extrabold tracking-tight sm:text-sm">
          {title}
        </h3>

        <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground sm:text-[11px]">
          {text}
        </p>
      </div>
    </div>
  );
}