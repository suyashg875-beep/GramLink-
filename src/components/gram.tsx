import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  ArrowRight,
  ChefHat,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  ShoppingBasket,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { STATUS_LABEL, rupees } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5"
      aria-label="ApnaKitchen home"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
        <ChefHat className="h-5 w-5" strokeWidth={2.2} />
      </span>

      <span className="font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        Apna<span className="text-primary">Kitchen</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* BRAND */}
        <Logo />

        {/* RIGHT ACTION */}
        {user ? (
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3.5 py-2.5 text-xs font-extrabold text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/25 hover:bg-primary/5 hover:text-foreground active:scale-[0.97]"
          >
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />

            <span className="hidden sm:inline">
              Log out
            </span>
          </button>
        ) : (
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
          >
            <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />

            <span>Log in</span>
          </Link>
        )}
      </div>
    </header>
  );
}

function NavItem({
  to,
  icon,
  label,
  badge,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors duration-200"
      activeProps={{
        className:
          "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-bold text-primary",
      }}
    >
      <span className="transition-transform duration-200 active:scale-90">
        {icon}
      </span>

      {label}

      {badge ? (
        <span className="absolute right-[27%] top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground shadow-sm">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function BottomNav() {
  const { role } = useAuth();
  const { count } = useCart();

  const iconClass = "h-[20px] w-[20px]";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 shadow-[0_-12px_40px_rgba(0,0,0,0.07)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="grid w-full max-w-md grid-cols-3 gap-1 py-2">
          {role === "seller" ? (
            <>
              <NavItem
                to="/sell"
                icon={<LayoutDashboard className={iconClass} />}
                label="Dashboard"
              />

              <NavItem
                to="/sell/products"
                icon={<Package className={iconClass} />}
                label="Products"
              />

              <NavItem
                to="/sell/orders"
                icon={<ShoppingBasket className={iconClass} />}
                label="Orders"
              />
            </>
          ) : (
            <>
              <NavItem
                to="/"
                icon={<Home className={iconClass} />}
                label="Home"
              />

              <NavItem
                to="/cart"
                icon={<ShoppingBasket className={iconClass} />}
                label="Cart"
                badge={count}
              />

              <NavItem
                to="/orders"
                icon={<Package className={iconClass} />}
                label="Orders"
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function Page({
  title,
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
      {title && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>

          {action}
        </div>
      )}

      {children}
    </main>
  );
}

export function Stars({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            "transition-colors",
            i <= Math.round(value)
              ? "fill-saffron text-saffron"
              : "text-border",
          )}
          strokeWidth={1.8}
        />
      ))}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-bold text-primary">
      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.3} />
      Verified Kitchen
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "completed" || status === "verified"
      ? "border-success/15 bg-success/10 text-success"
      : status === "rejected" || status === "cancelled"
        ? "border-destructive/15 bg-destructive/10 text-destructive"
        : "border-warning/20 bg-warning/10 text-accent-foreground";

  const label =
    STATUS_LABEL[status] ??
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        tone,
      )}
    >
      {label}
    </span>
  );
}

export function Empty({
  emoji: _emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <UtensilsCrossed className="h-6 w-6" />
      </div>

      <h2 className="mt-4 text-xl font-extrabold tracking-tight">
        {title}
      </h2>

      {children && (
        <div className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductThumb({
  url,
  category: _category,
  className,
}: {
  url?: string | undefined;
  category: string;
  className?: string;
}) {
  return url ? (
    <img
      src={url}
      alt=""
      className={cn(
        "h-full w-full object-cover will-change-transform transition-transform duration-500",
        className,
      )}
      loading="lazy"
    />
  ) : (
    <div
      className={cn(
        "grid h-full w-full place-items-center bg-secondary text-secondary-foreground",
        className,
      )}
    >
      <UtensilsCrossed className="h-10 w-10 opacity-45" strokeWidth={1.5} />
    </div>
  );
}

export function ProductCard({
  id,
  name,
  price,
  category,
  image,
  sellerName,
}: {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string | undefined;
  sellerName?: string;
}) {
  const isPuranPoli = name.toLowerCase().includes("puran poli");

  return (
    <Link
      to="/product/$id"
      params={{ id }}
      className="group block overflow-hidden rounded-[1.35rem] border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl hover:shadow-black/5 active:scale-[0.985] active:shadow-sm"
    >
      {/* FOOD IMAGE */}
      <div className="relative aspect-[1.05/1] overflow-hidden bg-secondary">
        <ProductThumb
          url={image}
          category={category}
          className="transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* IMAGE OVERLAY */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5 opacity-80" />

        {/* CATEGORY */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-xl">
            {category}
          </span>
        </div>

        {/* PURAN POLI SPECIAL */}
        {isPuranPoli && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary px-2.5 py-1.5 text-[9px] font-extrabold text-primary-foreground shadow-lg shadow-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              ApnaKitchen Special
            </span>
          </div>
        )}

        {/* VIEW ARROW */}
        <div className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/90 text-foreground opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-h-[2.5rem] flex-1 text-[15px] font-extrabold leading-[1.25rem] tracking-tight text-foreground">
            {name}
          </h3>
        </div>

        {sellerName && (
          <div className="mt-2 flex min-w-0 items-center gap-1.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10">
              <ChefHat className="h-3 w-3 text-primary" />
            </span>

            <span className="truncate text-[11px] font-semibold text-muted-foreground">
              {sellerName}
            </span>
          </div>
        )}

        {/* PRICE ROW */}
        <div className="mt-3.5 flex items-end justify-between gap-2 border-t border-border/60 pt-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Starting from
            </div>

            <div className="mt-0.5 font-display text-lg font-black tracking-tight text-primary">
              {rupees(price)}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1.5 text-[10px] font-extrabold text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
            View
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
export function BigButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-extrabold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-95 hover:shadow-md active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    />
  );
}

export const inputCls =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-sm font-medium text-foreground outline-none shadow-sm transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

export const labelCls =
  "mb-1.5 block text-sm font-bold tracking-tight text-foreground";