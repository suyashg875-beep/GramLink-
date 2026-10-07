import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChefHat,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { errMsg } from "@/lib/helpers";
import { BigButton, Page, inputCls, labelCls } from "@/components/gram";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — ApnaKitchen" },
      {
        name: "description",
        content:
          "Join ApnaKitchen to discover homemade food from local home kitchens.",
      },
      {
        property: "og:title",
        content: "Log in or sign up — ApnaKitchen",
      },
      {
        property: "og:description",
        content:
          "Discover homemade pickles, papad, masalas, sweets and traditional favourites from local kitchens.",
      },
    ],
  }),
  component: AuthPage,
});

export function homeFor(role: string | null) {
  if (role === "seller") return "/sell";
  if (role === "customer") return "/";
  return "/choose-role";
}

function AuthPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [chosenRole, setChosenRole] = useState<"customer" | "seller">(
    "customer",
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: homeFor(role) });
    }
  }, [user, role, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: {
              full_name: form.name,
              phone: form.phone,
              role: chosenRole,
            },
          },
        });

        if (error) throw error;

        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Page>
        <div className="relative mx-auto flex min-h-[70vh] max-w-md items-center justify-center py-10">
          <div className="absolute inset-x-8 top-1/2 -z-10 h-56 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="w-full rounded-[2rem] border border-border/60 bg-card/95 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-7 w-7" />
            </div>

            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
              Almost there
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Check your email
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-bold text-foreground">{form.email}</span>.
              Tap the link to activate your ApnaKitchen account.
            </p>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setMode("login");
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Back to login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="relative mx-auto max-w-5xl py-4 sm:py-8">
        <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="grid overflow-hidden rounded-[2rem] border border-border/60 bg-card/90 shadow-[0_24px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          {/* Brand panel */}
          <div className="relative hidden overflow-hidden bg-secondary/50 p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3 py-2 text-xs font-extrabold text-primary shadow-sm">
                <ChefHat className="h-4 w-4" />
                ApnaKitchen
              </div>

              <h2 className="mt-10 max-w-sm text-4xl font-black leading-[1.08] tracking-tight">
                Gharacha
                <br />
                <span className="text-primary">swad.</span>
                <br />
                Tumchya ghari.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
                Discover authentic homemade food prepared by local home
                kitchens — fresh, personal and made with care.
              </p>
            </div>

            <div className="relative mt-10 overflow-hidden rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-extrabold">
                    Homemade. Local. Fresh.
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    From real kitchens near you
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              {/* Mobile brand */}
              <div className="mb-8 flex items-center gap-2 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <ChefHat className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-black tracking-tight">
                    ApnaKitchen
                  </p>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    घरसारखा स्वाद, थेट तुमच्या घरापर्यंत
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                  {mode === "login" ? "Welcome back" : "Get started"}
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {mode === "login"
                    ? "Welcome to ApnaKitchen"
                    : "Create your account"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {mode === "login"
                    ? "Log in and discover homemade food from local kitchens."
                    : "Join a community built around authentic homemade food."}
                </p>
              </div>

              {/* Mode switch */}
              <div className="mt-7 grid grid-cols-2 rounded-2xl border border-border/60 bg-muted/60 p-1">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "h-11 rounded-xl text-sm font-extrabold transition-all duration-200",
                      mode === m
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-7 space-y-4">
                {mode === "signup" && (
                  <>
                    {/* Role */}
                    <div>
                      <span className={labelCls}>I want to</span>

                      <div className="grid grid-cols-2 gap-3">
                        {(
                          [
                            [
                              "customer",
                              UserRound,
                              "Buy homemade food",
                            ],
                            [
                              "seller",
                              ChefHat,
                              "Sell my homemade food",
                            ],
                          ] as const
                        ).map(([r, Icon, label]) => (
                          <button
                            type="button"
                            key={r}
                            onClick={() => setChosenRole(r)}
                            className={cn(
                              "group relative rounded-2xl border-2 p-4 text-left transition-all duration-200",
                              chosenRole === r
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/70 bg-card hover:border-primary/30 hover:bg-primary/[0.03]",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                                chosenRole === r
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <p className="mt-3 text-sm font-extrabold leading-5">
                              {label}
                            </p>

                            {chosenRole === r && (
                              <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AuthField
                      label="Full name"
                      icon={<UserRound className="h-4 w-4" />}
                    >
                      <input
                        required
                        className={cn(inputCls, "pl-11")}
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                      />
                    </AuthField>

                    <AuthField
                      label="Phone number"
                      icon={<Phone className="h-4 w-4" />}
                    >
                      <input
                        required
                        type="tel"
                        inputMode="tel"
                        className={cn(inputCls, "pl-11")}
                        placeholder="Your phone number"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone: e.target.value,
                          })
                        }
                      />
                    </AuthField>
                  </>
                )}

                <AuthField
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                >
                  <input
                    required
                    type="email"
                    className={cn(inputCls, "pl-11")}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </AuthField>

                <AuthField
                  label="Password"
                  icon={<LockKeyhole className="h-4 w-4" />}
                >
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      className={cn(inputCls, "pl-11 pr-12")}
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </AuthField>

                <BigButton disabled={busy}>
                  {busy ? (
                    "Please wait…"
                  ) : (
                    <>
                      {mode === "login"
                        ? "Log in to ApnaKitchen"
                        : "Create my account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </BigButton>
              </form>

              {/* Trust */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <TrustItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  text="Secure account"
                />
                <TrustItem
                  icon={<Sparkles className="h-4 w-4" />}
                  text="Real home kitchens"
                />
              </div>

              <p className="mt-6 text-center text-[11px] leading-5 text-muted-foreground">
                By continuing, you agree to use ApnaKitchen responsibly and
                respect our local food community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function AuthField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>

      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>

        {children}
      </div>
    </div>
  );
}

function TrustItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
      <span className="text-primary">{icon}</span>
      <span className="text-[11px] font-bold text-muted-foreground">
        {text}
      </span>
    </div>
  );
}