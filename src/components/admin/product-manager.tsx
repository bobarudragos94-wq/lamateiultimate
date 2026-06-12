"use client";

import { useMemo, useState } from "react";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AVAILABILITY,
  PRODUCT_UNITS,
  type Availability,
  type Category,
  type Product,
  type ProductUnit,
} from "@/db/schema";
import { createProduct, deleteProduct, updateProduct } from "@/actions/admin";
import { AVAILABILITY_LABELS, cn, formatPrice, UNIT_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { AvailabilityBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export function ProductManager({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => product.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută produs..."
            className="pl-11"
            aria-label="Caută produs"
          />
        </div>
        <Button variant="secondary" onClick={() => setCreating(true)}>
          <Plus className="size-4" aria-hidden />
          Produs nou
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Niciun produs"
          description={query ? "Niciun produs nu corespunde căutării." : "Adaugă primul produs în catalog."}
        />
      ) : (
        <ul className="stagger space-y-3">
          {filtered.map((product) => (
            <li
              key={product.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-300",
                !product.isActive && "opacity-55"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-zinc-900">{product.name}</p>
                  {!product.isActive && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                      Dezactivat
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {categoryNames.get(product.categoryId) ?? "Fără categorie"} ·{" "}
                  {product.price == null ? "Preț la cerere" : formatPrice(product.price)} /{" "}
                  {UNIT_LABELS[product.unit]}
                </p>
              </div>
              <div className="hidden shrink-0 sm:block">
                <AvailabilityBadge availability={product.availability} />
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(product)}
                  className="flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-90"
                  aria-label={`Editează ${product.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(product)}
                  className="flex size-10 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-90"
                  aria-label={`Șterge ${product.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? "Editează produsul" : "Produs nou"}
      >
        <ProductForm
          key={editing?.id ?? "new"}
          product={editing}
          categories={categories}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Confirmă ștergerea">
        {deleting && (
          <DeleteConfirm product={deleting} onDone={() => setDeleting(null)} />
        )}
      </Modal>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onDone,
}: {
  product: Product | null;
  categories: Category[];
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [priceOnRequest, setPriceOnRequest] = useState(product ? product.price == null : false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = {
      name: String(formData.get("name") ?? ""),
      categoryId: Number(formData.get("categoryId")),
      description: String(formData.get("description") ?? "") || undefined,
      unit: String(formData.get("unit")) as ProductUnit,
      price: priceOnRequest ? null : Number(formData.get("price") ?? 0),
      availability: String(formData.get("availability")) as Availability,
      isActive: formData.get("isActive") === "on",
    };

    setSubmitting(true);
    const result = product ? await updateProduct(product.id, input) : await createProduct(input);
    setSubmitting(false);
    if (result.success) {
      toast.success(product ? "Produs actualizat" : "Produs adăugat");
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nume produs" required>
        <Input name="name" defaultValue={product?.name ?? ""} required maxLength={150} />
      </Field>
      <Field label="Categorie" required>
        <Select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Descriere">
        <Textarea name="description" defaultValue={product?.description ?? ""} maxLength={1000} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Unitate de măsură" required>
          <Select name="unit" defaultValue={product?.unit ?? "bucata"}>
            {PRODUCT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {UNIT_LABELS[unit]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Disponibilitate" required>
          <Select name="availability" defaultValue={product?.availability ?? "IN_STOCK"}>
            {AVAILABILITY.map((availability) => (
              <option key={availability} value={availability}>
                {AVAILABILITY_LABELS[availability]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Preț (RON)">
        <div className="space-y-2">
          <Input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? ""}
            disabled={priceOnRequest}
            required={!priceOnRequest}
            placeholder="ex: 32.50"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={priceOnRequest}
              onChange={(e) => setPriceOnRequest(e.target.checked)}
              className="size-4 rounded accent-orange-500"
            />
            Preț la cerere (nu se afișează preț)
          </label>
        </div>
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.isActive ?? true}
          className="size-4 rounded accent-orange-500"
        />
        Produs activ (vizibil în catalog)
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="secondary" className="flex-1" loading={submitting}>
          {product ? "Salvează modificările" : "Adaugă produsul"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Anulează
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirm({ product, onDone }: { product: Product; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    const result = await deleteProduct(product.id);
    setSubmitting(false);
    if (result.success) {
      toast.success("Produs șters sau dezactivat");
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-zinc-600">
        Sigur vrei să ștergi <strong className="text-zinc-900">{product.name}</strong>? Dacă
        produsul apare în cereri existente, va fi doar dezactivat, nu șters definitiv.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="danger" className="flex-1" loading={submitting} onClick={handleDelete}>
          Da, șterge
        </Button>
        <Button variant="outline" onClick={onDone}>
          Anulează
        </Button>
      </div>
    </div>
  );
}
