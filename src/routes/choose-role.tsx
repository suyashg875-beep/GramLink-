import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChefHat,
  Check,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { errMsg } from "@/lib/helpers";
import { Page } from "@/components/gram";
import { homeFor } from "./auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/choose-role")({
  head: () => ({
    meta: [
      { title: "Choose your ApnaKitchen journey" },
      {
        name: "description",
        content:
          "Choose whether you want to discover homemade food or sell food from your home kitchen.",
      },
      {
        property: "og:title",
        content: "Choose your ApnaKitchen journey",
      },
      {
        property: "og:description",
        content:
          "Discover homemade food or start selling from your home kitchen.",
      },
    ],
  }),
  component: ChooseRole,
});

function ChooseRole() {
  const { user, role, loading, refreshRole } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<
    "customer" | "seller" | null
  >(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/auth" });
    } else if (role) {
      navigate({ to: homeFor(role) });
    }
  }, [user, role, loading, navigate]);

  const pick = async (r: "customer" | "seller") => {
    setSelected(r);
    setBusy(true);

    const { error } = await supabase.rpc("choose_role", {
      _role: r,
    });

    if (error) {
      toast.error(errMsg(error));
      setSelected(null);
      setBusy(false);
      return;
    }

    await refreshRole();
    setBusy(false);
  };

  return (
    <Page>
      <div className="relative mx-auto max-w-3xl py-6 sm:py-10">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ChefHat className="h-7 w-7" />
          </div>

          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            Welcome to ApnaKitchen
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            How would you like to use ApnaKitchen?
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            Choose your journey. You can discover homemade food or bring your
            own home-kitchen specialties to customers.
          </p>
        </div>

        {/* Role cards */}
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <RoleCard
            selected={selected === "customer"}
            disabled={busy}
            icon={<ShoppingBag className="h-7 w-7" />}
            title="I want to buy food"
            description="Discover homemade food from local kitchens and order your favourites."
            points={[
              "Explore nearby home kitchens",
              "Order homemade favourites",
              "Track your orders",
            ]}
            onClick={() => pick("customer")}
          />

          <RoleCard
            selected={selected === "seller"}
            disabled={busy}
            icon={<Store className="h-7 w-7" />}
            title="I want to sell my food"
            description="Turn your home kitchen into a local food business and reach customers."
            points={[
              "Create your kitchen profile",
              "Add homemade products",
              "Manage orders and sales",
            ]}
            onClick={() => pick("seller")}
          />
        </div>

        {/* Trust */}
        <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Your choice helps us personalize your ApnaKitchen experience.</span>
        </div>
      </div>
    </Page>
  );
}

function RoleCard({
  selected,
  disabled,
  icon,
  title,
  description,
  points,
  onClick,
}: {
  selected: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  points: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border-2 bg-card p-6 text-left shadow-sm transition-all duration-300 sm:p-7",
        selected
          ? "border-primary bg-primary/[0.04] shadow-lg shadow-primary/10"
          : "border-border/60 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5",
        disabled && "cursor-wait opacity-80",
      )}
    >
      <div
        className={cn(
          "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity",
          selected
            ? "bg-primary/20 opacity-100"
            : "bg-primary/10 opacity-0 group-hover:opacity-100",
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300",
              selected
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            {icon}
          </div>

          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-background text-transparent",
            )}
          >
            <Check className="h-4 w-4" />
          </div>
        </div>

        <h2 className="mt-6 text-xl font-black tracking-tight sm:text-2xl">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 space-y-2.5">
          {points.map((point) => (
            <div
              key={point}
              className="flex items-center gap-2.5 text-xs font-bold text-foreground/80"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="h-3 w-3" />
              </span>
              {point}
            </div>
          ))}
        </div>

        <div
          className={cn(
            "mt-7 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold transition-all",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          <span>
            {selected ? "Setting up your account…" : "Continue"}
          </span>

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}