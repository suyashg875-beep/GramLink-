import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ChefHat,
  ImagePlus,
  MapPin,
  Save,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/gram";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/sell/kitchen")({
  head: () => ({
    meta: [{ title: "My Kitchen — ApnaKitchen" }],
  }),
  component: KitchenPage,
});

function KitchenPage() {
  const { user } = useAuth();

  const [kitchenName, setKitchenName] = useState("");
  const [about, setAbout] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");

  const [kitchenImage, setKitchenImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKitchen();
  }, [user]);

  async function loadKitchen() {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("seller_profiles")
      .select(
        "business_name,about,village_or_area,pincode,address,kitchen_image_url",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setKitchenName(data.business_name ?? "");
      setAbout(data.about ?? "");
      setArea(data.village_or_area ?? "");
      setPincode(data.pincode ?? "");
      setAddress(data.address ?? "");
      setCurrentImage(data.kitchen_image_url ?? "");
    }

    setLoading(false);
  }

  async function saveKitchen(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    if (!kitchenName.trim()) {
      toast.error("Please enter your kitchen name.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = currentImage;

      if (kitchenImage) {
        const fileExt =
          kitchenImage.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("kitchen-images")
          .upload(fileName, kitchenImage, {
            contentType: kitchenImage.type,
            upsert: false,
          });

        if (uploadError) {
          toast.error(`Photo upload failed: ${uploadError.message}`);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("kitchen-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
  .from("seller_profiles")
  .upsert(
    {
      user_id: user.id,
      business_name: kitchenName.trim(),
      about: about.trim(),
      village_or_area: area.trim(),
      pincode: pincode.trim(),
      address: address.trim(),
      kitchen_image_url: imageUrl || null,
    },
    {
      onConflict: "user_id",
    }
  );
      if (error) {
  console.error("SELLER PROFILE SAVE ERROR:", error);
  toast.error(error.message);
  return;
}

      setCurrentImage(imageUrl);
      setKitchenImage(null);

      const fileInput = document.getElementById(
        "kitchen-image",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      toast.success("Kitchen profile saved successfully!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Page title="My Kitchen">
        <div className="space-y-5">
          <div className="h-64 animate-pulse rounded-[2rem] bg-muted" />

          <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-[2rem] bg-muted" />
        </div>
      </Page>
    );
  }

  const previewImage = kitchenImage
    ? URL.createObjectURL(kitchenImage)
    : currentImage;

  return (
    <Page title="My Kitchen">
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-primary text-primary-foreground shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
                <ChefHat className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">
                  Your home kitchen
                </p>

                <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Build your kitchen profile
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 opacity-85">
                  Tell customers the story behind your homemade food and
                  make your kitchen feel trustworthy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Profile preview */}
        <section className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
          <div className="relative aspect-[16/7] min-h-[230px] overflow-hidden bg-muted sm:min-h-[300px]">
            {previewImage ? (
              <img
                src={previewImage}
                alt={kitchenName || "Kitchen"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-background/80">
                  <Store className="h-7 w-7" />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  Add a kitchen photo
                </p>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-5 pt-20 sm:p-7 sm:pt-24">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 text-white">
                  <h2 className="truncate text-2xl font-extrabold sm:text-3xl">
                    {kitchenName || "Your Kitchen Name"}
                  </h2>

                  <div className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {area || "Your area"}
                      {pincode ? ` • ${pincode}` : ""}
                    </span>
                  </div>
                </div>

                <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur sm:flex">
                  <CheckCircle2 className="h-4 w-4" />
                  Home Kitchen
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <form
          onSubmit={saveKitchen}
          className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border bg-card shadow-sm"
        >
          <div className="border-b p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                <Store className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold">
                  Kitchen details
                </h2>

                <p className="text-sm text-muted-foreground">
                  These details will be visible to customers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {/* Kitchen name */}
            <Field label="Kitchen name" required>
              <input
                className={inputClass}
                placeholder="Example: Aai's Swad Home Kitchen"
                value={kitchenName}
                onChange={(e) => setKitchenName(e.target.value)}
              />
            </Field>

            {/* About */}
            <Field label="About your kitchen">
              <textarea
                className={`${inputClass} min-h-32 resize-none`}
                placeholder="Tell customers about your homemade food, your cooking style and what makes your kitchen special..."
                rows={5}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </Field>

            {/* Location */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />

                <h3 className="font-extrabold">
                  Kitchen location
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Area / Village">
                  <input
                    className={inputClass}
                    placeholder="Example: Dhule"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </Field>

                <Field label="Pincode">
                  <input
                    className={inputClass}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="424001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Full address">
                  <textarea
                    className={`${inputClass} min-h-28 resize-none`}
                    placeholder="Enter your complete kitchen address"
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Kitchen photo */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-primary" />

                <h3 className="font-extrabold">
                  Kitchen photo
                </h3>
              </div>

              <div className="overflow-hidden rounded-2xl border border-dashed bg-muted/20 p-4">
                {previewImage && (
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={previewImage}
                      alt="Kitchen preview"
                      className="h-56 w-full object-cover sm:h-72"
                    />

                    <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                      {kitchenImage
                        ? "New photo selected"
                        : "Current kitchen photo"}
                    </div>
                  </div>
                )}

                <label
                  htmlFor="kitchen-image"
                  className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border bg-card p-4 font-bold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
                    <Camera className="h-4 w-4" />
                  </div>

                  {currentImage
                    ? "Choose a new kitchen photo"
                    : "Choose kitchen photo"}
                </label>

                <input
                  id="kitchen-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    setKitchenImage(e.target.files?.[0] ?? null);
                  }}
                />

                {kitchenImage && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary p-3 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />

                    <span className="truncate">
                      {kitchenImage.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-extrabold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-5 w-5" />

              {saving
                ? "Saving kitchen profile..."
                : "Save kitchen profile"}
            </button>
          </div>
        </form>

        {/* Trust note */}
        <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border bg-secondary/60 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <div>
            <p className="text-sm font-bold">
              Make your profile trustworthy
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Use a clear kitchen photo, genuine description and
              accurate location so customers can confidently order
              from your home kitchen.
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
}

const inputClass =
  "w-full rounded-xl border bg-background px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold">
        {label}
        {required && (
          <span className="ml-1 text-primary">*</span>
        )}
      </label>

      {children}
    </div>
  );
}