import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  MessageSquareOff,
  PackageCheck,
  Phone,
  Search,
  Truck,
} from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, type Category } from "@/db/schema";

// Rendered on demand so the build never depends on a populated database.
export const dynamic = "force-dynamic";

const benefits = [
  {
    icon: MessageSquareOff,
    title: "Fără mesaje pierdute",
    description:
      "Cererea ta ajunge direct în sistemul nostru, nu se pierde printre sute de conversații pe WhatsApp.",
  },
  {
    icon: Clock,
    title: "Răspuns rapid",
    description:
      "Vezi imediat ce produse avem și primești confirmarea de preț și livrare în cel mai scurt timp.",
  },
  {
    icon: Truck,
    title: "Livrare pe șantier",
    description: "Livrăm direct la adresa ta, cu camionul potrivit pentru cantitatea comandată.",
  },
  {
    icon: PackageCheck,
    title: "Stoc real, prețuri clare",
    description:
      "Catalogul arată disponibilitatea reală și prețuri estimative, ca să-ți faci calculele din timp.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Alegi produsele",
    description: "Cauți în catalog și adaugi produsele și cantitățile de care ai nevoie.",
  },
  {
    icon: ClipboardList,
    title: "Trimiți cererea",
    description: "Completezi numele, telefonul și adresa de livrare. Durează sub un minut.",
  },
  {
    icon: Phone,
    title: "Te contactăm",
    description: "Confirmăm telefonic prețul final, transportul și data livrării.",
  },
  {
    icon: CheckCircle2,
    title: "Primești materialele",
    description: "Pregătim comanda și o livrăm la adresa ta sau o ridici din depozit.",
  },
];

export default async function HomePage() {
  let categoryList: Category[] = [];
  try {
    categoryList = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));
  } catch (error) {
    console.error("Failed to load categories:", error);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-orange-500/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-1.5 text-xs font-medium text-zinc-300">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-orange-500" />
              Depozit de materiale de construcții
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Comanzi materiale de construcții{" "}
              <span className="text-orange-500">rapid</span>, fără telefoane pierdute și mesaje
              uitate pe WhatsApp.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              Alegi produsele din catalog, trimiți cererea de ofertă și te contactăm noi cu prețul
              final și data livrării. Simplu, clar, organizat.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                Cere ofertă
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 text-base font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                Vezi catalogul
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Categorii de produse
            </h2>
            <p className="mt-2 text-zinc-500">Tot ce ai nevoie pe șantier, într-un singur loc.</p>
          </div>
          <Link
            href="/catalog"
            className="hidden items-center gap-1 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 sm:inline-flex"
          >
            Vezi tot catalogul <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categoryList.map((category) => (
            <Link
              key={category.id}
              href="/catalog"
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <h3 className="font-semibold text-zinc-900 group-hover:text-orange-600">
                {category.name}
              </h3>
              {category.description && (
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            De ce să comanzi aici, nu pe WhatsApp
          </h2>
          <div className="stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-orange-50/60">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-zinc-900">
                  <Icon className="size-6 text-orange-500" aria-hidden />
                </div>
                <h3 className="font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Cum funcționează
        </h2>
        <div className="stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-4 text-4xl font-bold text-zinc-100">
                {index + 1}
              </span>
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-100">
                <Icon className="size-6 text-orange-600" aria-hidden />
              </div>
              <h3 className="font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-orange-500/20 blur-3xl" aria-hidden />
          <h2 className="relative text-2xl font-bold tracking-tight sm:text-3xl">
            Ai un proiect în lucru?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-zinc-400">
            Trimite-ne lista de materiale și primești oferta completă, cu transport inclus.
          </p>
          <Link
            href="/catalog"
            className="relative mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-base font-semibold shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Începe cererea de ofertă
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
