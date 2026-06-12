"use client";

import { useState } from "react";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/db/schema";
import { createCategory, deleteCategory, updateCategory } from "@/actions/admin";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";

export function CategoryManager({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<number, number>;
}) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button variant="secondary" onClick={() => setCreating(true)}>
          <Plus className="size-4" aria-hidden />
          Categorie nouă
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nicio categorie"
          description="Adaugă prima categorie pentru a organiza produsele."
        />
      ) : (
        <ul className="stagger space-y-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-zinc-300",
                !category.isActive && "opacity-55"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-zinc-900">{category.name}</p>
                  {!category.isActive && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                      Dezactivată
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {productCounts[category.id] ?? 0} produse
                  {category.description ? ` · ${category.description}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  className="flex size-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-90"
                  aria-label={`Editează ${category.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <DeleteButton category={category} />
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
        title={editing ? "Editează categoria" : "Categorie nouă"}
      >
        <CategoryForm
          key={editing?.id ?? "new"}
          category={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "") || undefined,
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      isActive: formData.get("isActive") === "on",
    };

    setSubmitting(true);
    const result = category
      ? await updateCategory(category.id, input)
      : await createCategory(input);
    setSubmitting(false);
    if (result.success) {
      toast.success(category ? "Categorie actualizată" : "Categorie adăugată");
      onDone();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nume categorie" required>
        <Input name="name" defaultValue={category?.name ?? ""} required maxLength={100} />
      </Field>
      <Field label="Descriere">
        <Textarea name="description" defaultValue={category?.description ?? ""} maxLength={500} />
      </Field>
      <Field label="Ordine afișare" hint="Număr mai mic = apare mai sus">
        <Input
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
          required
        />
      </Field>
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.isActive ?? true}
          className="size-4 rounded accent-orange-500"
        />
        Categorie activă (vizibilă în catalog)
      </label>
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="secondary" className="flex-1" loading={submitting}>
          {category ? "Salvează modificările" : "Adaugă categoria"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Anulează
        </Button>
      </div>
    </form>
  );
}

function DeleteButton({ category }: { category: Category }) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    const result = await deleteCategory(category.id);
    setSubmitting(false);
    setConfirming(false);
    if (result.success) {
      toast.success("Categorie ștearsă");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex size-10 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-90"
        aria-label={`Șterge ${category.name}`}
      >
        <Trash2 className="size-4" />
      </button>
      <Modal open={confirming} onClose={() => setConfirming(false)} title="Confirmă ștergerea">
        <p className="text-sm leading-relaxed text-zinc-600">
          Sigur vrei să ștergi categoria{" "}
          <strong className="text-zinc-900">{category.name}</strong>? Categoriile cu produse
          asociate nu pot fi șterse.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="danger" className="flex-1" loading={submitting} onClick={handleDelete}>
            Da, șterge
          </Button>
          <Button variant="outline" onClick={() => setConfirming(false)}>
            Anulează
          </Button>
        </div>
      </Modal>
    </>
  );
}
