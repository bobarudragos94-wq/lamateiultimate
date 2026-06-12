import type { Metadata } from "next";
import { QuoteForm } from "@/components/public/quote-form";

export const metadata: Metadata = {
  title: "Cerere de ofertă",
  description: "Trimite cererea ta de ofertă pentru materiale de construcții.",
};

export default function QuoteRequestPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 animate-fade-in-up">
        <p className="tag-label text-orange-600">Lista ta de materiale</p>
        <h1 className="mt-1 font-display text-5xl font-bold uppercase tracking-tight text-zinc-900 sm:text-6xl">
          Cererea de ofertă
        </h1>
        <p className="mt-2 text-zinc-500">
          Verifică produsele, completează datele și trimite — te contactăm pentru confirmare.
        </p>
      </div>
      <QuoteForm />
    </div>
  );
}
