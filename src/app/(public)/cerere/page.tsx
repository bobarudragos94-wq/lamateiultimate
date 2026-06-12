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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Cererea ta de ofertă
        </h1>
        <p className="mt-1 text-zinc-500">
          Verifică produsele, completează datele și trimite — te contactăm pentru confirmare.
        </p>
      </div>
      <QuoteForm />
    </div>
  );
}
