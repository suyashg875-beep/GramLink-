import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { Page } from "@/components/gram";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/sell/products")({
  head: () => ({
    meta: [
      { title: "My Products — ApnaKitchen" },
      {
        name: "description",
        content: "Manage your homemade food products on ApnaKitchen.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("piece");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  async function loadProducts() {
    if (!user) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    const loadedProducts = data ?? [];
    setProducts(loadedProducts);

    const imagePaths = loadedProducts
      .map((product) => product.image_urls?.[0])
      .filter(Boolean) as string[];

    if (imagePaths.length === 0) {
      setImageUrls({});
      return;
    }

    const urls: Record<string, string> = {};
    const storagePaths: string[] = [];

    for (const value of imagePaths) {
      if (!value.startsWith("http")) {
        storagePaths.push(value);
        continue;
      }

      try {
        const url = new URL(value);

        const marker =
          "/storage/v1/object/public/product-images/";

        const index = url.pathname.indexOf(marker);

        if (index !== -1) {
          const path = decodeURIComponent(
            url.pathname.slice(index + marker.length),
          );

          storagePaths.push(path);
        } else {
          urls[value] = value;
        }
      } catch {
        urls[value] = value;
      }
    }

    if (storagePaths.length > 0) {
      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("product-images")
          .createSignedUrls(storagePaths, 3600);

      if (!signedError) {
        (signedData ?? []).forEach((item) => {
          if (item.path && item.signedUrl) {
            urls[item.path] = item.signedUrl;
          }
        });

        for (const value of imagePaths) {
          if (!value.startsWith("http")) continue;

          try {
            const url = new URL(value);

            const marker =
              "/storage/v1/object/public/product-images/";

            const index = url.pathname.indexOf(marker);

            if (index !== -1) {
              const path = decodeURIComponent(
                url.pathname.slice(index + marker.length),
              );

              if (urls[path]) {
                urls[value] = urls[path];
              }
            }
          } catch {
            // Ignore invalid URLs
          }
        }
      }
    }

    setImageUrls(urls);
  }

  useEffect(() => {
    loadProducts();
  }, [user]);


  async function deleteProduct(product: any) {
  if (!user) return;

  const confirmed = window.confirm(
    `Delete "${product.name}"? This action cannot be undone.`,
  );

  if (!confirmed) return;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("seller_id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product deleted successfully.");

    await loadProducts();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete product.";

    toast.error(message);
  }
}    

function startEditingProduct(product: any) {
  setEditingProduct(product);

  setName(product.name ?? "");
  setDescription(product.description ?? "");
  setCategory(product.category ?? "");
  setPrice(String(product.price ?? ""));
  setPriceUnit(product.price_unit ?? "piece");
  setStock(String(product.stock ?? ""));
  setImageFile(null);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


async function updateProduct(e: React.FormEvent) {
  e.preventDefault();

  if (!user || !editingProduct) return;

  if (!name.trim() || !category || !price) {
    toast.error("Please fill product name, category and price.");
    return;
  }

  setUpdating(true);

  try {
    let imageUrls = editingProduct.image_urls ?? [];

    if (imageFile) {
      const fileExt =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Photo upload failed: ${uploadError.message}`);
        return;
      }

      imageUrls = [fileName];
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        price_unit: priceUnit,
        stock: Number(stock || 0),
        image_urls: imageUrls,
      }as never)
      .eq("id", editingProduct.id)
      .eq("seller_id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Product updated successfully.");

    setEditingProduct(null);
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setPriceUnit("piece");
    setStock("");
    setImageFile(null);

    const cameraInput = document.getElementById(
      "product-camera",
    ) as HTMLInputElement | null;

    const fileInput = document.getElementById(
      "product-file",
    ) as HTMLInputElement | null;

    if (cameraInput) cameraInput.value = "";
    if (fileInput) fileInput.value = "";

    await loadProducts();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update product.";

    toast.error(message);
  } finally {
    setUpdating(false);
  }
}

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first.");
      return;
    }

    if (!name.trim() || !category || !price) {
      toast.error("Please fill product name, category and price.");
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];

      if (imageFile) {
        const fileExt =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) {
          toast.error(`Photo upload failed: ${uploadError.message}`);
          return;
        }

        imageUrls.push(fileName);
      }

      const productData = {
        seller_id: user.id,
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        price_unit: priceUnit,
        stock: Number(stock || 0),
        image_urls: imageUrls,
        is_available: true,
        is_published: true,
      };

      const { error } = await supabase
        .from("products")
        .insert(productData as never);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Product added successfully!");

      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setPriceUnit("piece");
      setStock("");
      setImageFile(null);

      const cameraInput = document.getElementById(
        "product-camera",
      ) as HTMLInputElement | null;

      const fileInput = document.getElementById(
        "product-file",
      ) as HTMLInputElement | null;

      if (cameraInput) cameraInput.value = "";
      if (fileInput) fileInput.value = "";

      await loadProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function removeSelectedPhoto() {
    setImageFile(null);

    const cameraInput = document.getElementById(
      "product-camera",
    ) as HTMLInputElement | null;

    const fileInput = document.getElementById(
      "product-file",
    ) as HTMLInputElement | null;

    if (cameraInput) cameraInput.value = "";
    if (fileInput) fileInput.value = "";
  }

  return (
    <Page title="My Products">
      <div className="space-y-7">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              <Package className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">
                Your food catalogue
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Manage your products
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 opacity-85">
                Add your homemade specialties and let customers discover
                the taste of your kitchen.
              </p>
            </div>
          </div>
        </section>

        {/* Add product */}
        <section className="overflow-hidden rounded-[1.75rem] border bg-card shadow-sm">
          <div className="border-b p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold">
  {editingProduct ? "Edit product" : "Add a new product"}
</h2>

<p className="text-sm text-muted-foreground">
  {editingProduct
    ? "Update your product details and save the changes."
    : "Add the details customers need to order."}
</p>
              </div>
            </div>
          </div>

          <form
  onSubmit={editingProduct ? updateProduct : addProduct}
  className="space-y-6 p-5 sm:p-6"
>
            {/* Product name */}
            <Field label="Product name" required>
              <input
                className={inputClass}
                placeholder="e.g. Homemade Puran Poli"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            {/* Category */}
            <Field label="Category" required>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="Pickles">Pickles</option>
                <option value="Papad">Papad</option>
                <option value="Masalas">Masalas</option>
                <option value="Sweets">Sweets</option>
                <option value="Snacks">Snacks</option>
                <option value="Sweets">Puran Poli</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            {/* Description */}
            <Field label="Description">
              <textarea
                className={`${inputClass} min-h-28 resize-none`}
                placeholder="Tell customers what makes your product special..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            {/* Price + unit */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price" required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    ₹
                  </span>

                  <input
                    className={`${inputClass} pl-9`}
                    type="number"
                    placeholder="Price"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </Field>

              <Field label="Price unit">
                <select
                  className={inputClass}
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                >
                  <option value="kg">Per Kg</option>
                  <option value="500g">Per 500 g</option>
                  <option value="250g">Per 250 g</option>
                  <option value="100g">Per 100 g</option>
                  <option value="piece">Per Piece</option>
                  <option value="packet">Per Packet</option>
                  <option value="dozen">Per Dozen</option>
                </select>
              </Field>
            </div>

            {/* Stock */}
            <Field label="Available stock">
              <input
                className={inputClass}
                type="number"
                placeholder="Enter available quantity"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </Field>

            {/* Image */}
            <Field label="Product photo">
              <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    htmlFor="product-camera"
                    className="group flex cursor-pointer items-center justify-center gap-3 rounded-xl border bg-card p-4 font-bold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
                      <Camera className="h-4 w-4" />
                    </div>
                    Take photo
                  </label>

                  <input
                    id="product-camera"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] ?? null);
                    }}
                  />

                  <label
                    htmlFor="product-file"
                    className="group flex cursor-pointer items-center justify-center gap-3 rounded-xl border bg-card p-4 font-bold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                    Choose from files
                  </label>

                  <input
                    id="product-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      setImageFile(e.target.files?.[0] ?? null);
                    }}
                  />
                </div>

                {imageFile && (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Product preview"
                        className="h-56 w-full object-cover sm:h-64"
                      />

                      <button
                        type="button"
                        onClick={removeSelectedPhoto}
                        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
                        aria-label="Remove photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 p-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="truncate font-medium">
                        {imageFile.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Field>

{editingProduct && (
  <button
    type="button"
    onClick={() => {
      setEditingProduct(null);
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setPriceUnit("piece");
      setStock("");
      setImageFile(null);
    }}
    className="w-full rounded-2xl border bg-background px-5 py-3.5 text-sm font-extrabold transition-all hover:bg-muted active:scale-[0.99]"
  >
    Cancel editing
  </button>
)}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-extrabold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
             {editingProduct ? (
  <CheckCircle2 className="h-5 w-5" />
) : (
  <Plus className="h-5 w-5" />
)}

{editingProduct
  ? updating
    ? "Saving changes..."
    : "Save changes"
  : loading
    ? "Adding product..."
    : "Add product"}
            </button>
          </form>
        </section>

        {/* Products */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Catalogue
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                My products
              </h2>
            </div>

            <div className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-primary">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed bg-card p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
                <UtensilsCrossed className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-extrabold">
                Your catalogue is empty
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Add your first homemade food product above and start
                building your kitchen catalogue.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => {
                const imagePath = product.image_urls?.[0];

                const productImage = imagePath
                  ? imageUrls[imagePath]
                  : undefined;

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.5rem] border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <UtensilsCrossed className="h-10 w-10" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                        {product.category}
                      </div>

                      <div
                        className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur ${
                          product.is_published
                            ? "bg-emerald-500/90 text-white"
                            : "bg-black/55 text-white"
                        }`}
                      >
                        {product.is_published
                          ? "Published"
                          : "Draft"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-extrabold tracking-tight">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">
                            Price
                          </p>

                          <p className="mt-0.5 text-xl font-extrabold text-primary">
                            ₹{product.price}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            / {product.price_unit || "piece"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Stock
                          </p>

                          <p
                            className={`mt-0.5 font-extrabold ${
                              Number(product.stock) > 0
                                ? "text-foreground"
                                : "text-destructive"
                            }`}
                          >
                            {product.stock}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {Number(product.stock) > 0
                              ? "available"
                              : "out of stock"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
  
  <div className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-xs font-semibold text-muted-foreground">
    <CheckCircle2 className="h-4 w-4 text-primary" />
    Product is live in your catalogue
  </div>

<button
  type="button"
  onClick={() => startEditingProduct(product)}
  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-background text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95"
  aria-label={`Edit ${product.name}`}
  title="Edit product"
>
  <Pencil className="h-4 w-4" />
</button>


  <button
    type="button"
    onClick={() => deleteProduct(product)}
    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive transition-all hover:bg-destructive hover:text-white active:scale-95"
    aria-label={`Delete ${product.name}`}
    title="Delete product"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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