import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  "Pickles",
  "Papad",
  "Masalas",
  "Sweets",
  "Snacks",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  Pickles: "🥭",
  Papad: "🫓",
  Masalas: "🌶️",
  Sweets: "🍬",
  Snacks: "🥨",
  Other: "🧺",
};

export const rupees = (n: number) =>
  "₹" +
  Number(n).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export const errMsg = (e: unknown) =>
  e &&
  typeof e === "object" &&
  "message" in e
    ? String((e as { message: string }).message)
    : "Something went wrong";

/** Customer's chosen pincode, saved on this device. */
export function useArea() {
  const [pincode, setPincodeState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPincodeState(localStorage.getItem("Gramlink-pincode"));
    setReady(true);
  }, []);

  const setPincode = (p: string | null) => {
    if (p) {
      localStorage.setItem("Gramlink-pincode", p);
    } else {
      localStorage.removeItem("Gramlink-pincode");
    }

    setPincodeState(p);
  };

  return { pincode, setPincode, ready };
}

/**
 * Product photos live in private storage.
 * Supports both:
 * 1. New storage paths
 * 2. Old full Supabase public URLs
 */
export function useSignedImages(
  input: (string | null | undefined)[],
) {
  const items = input
    .filter((value): value is string => !!value)
    .map((original) => {
      let path = original;

      // New format: storage path
      if (!original.startsWith("http")) {
        return {
          original,
          path,
        };
      }

      // Old format: full Supabase public URL
      try {
        const url = new URL(original);

        const marker =
          "/storage/v1/object/public/product-images/";

        const index = url.pathname.indexOf(marker);

        if (index !== -1) {
          path = decodeURIComponent(
            url.pathname.slice(index + marker.length),
          );
        }
      } catch {
        // Keep original value if URL parsing fails
      }

      return {
        original,
        path,
      };
    });

  const storagePaths = Array.from(
    new Set(
      items
        .filter((item) => !item.path.startsWith("http"))
        .map((item) => item.path),
    ),
  );

  const key = items
    .map((item) => `${item.original}:${item.path}`)
    .join("|");

  return useQuery({
    queryKey: ["signed-images", key],
    enabled: items.length > 0,
    staleTime: 50 * 60 * 1000,

    queryFn: async () => {
      const map: Record<string, string> = {};

      // Get signed URLs for private product images
      if (storagePaths.length > 0) {
        const { data, error } = await supabase.storage
          .from("product-images")
          .createSignedUrls(storagePaths, 3600);

        if (!error) {
          (data ?? []).forEach((item) => {
            if (item.path && item.signedUrl) {
              map[item.path] = item.signedUrl;
            }
          });
        }
      }

      // Map original values to signed URLs
      items.forEach((item) => {
        const signedUrl = map[item.path];

        if (signedUrl) {
          map[item.original] = signedUrl;
        } else if (item.path.startsWith("http")) {
          map[item.original] = item.path;
        }
      });

      return map;
    },
  });
}

export const ORDER_STEPS = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for seller",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};