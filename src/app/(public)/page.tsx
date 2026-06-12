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
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, type Category } from "@/db/schema";

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

// hero collage — real items from the depot, shown as inventory tags
const heroTags = [
  {
    image: "/images/products/ciment-holcim-structo-plus-40kg.svg",
    label: "Ciment · sac 40 kg",
    rotate: "-rotate-3",
  },
  {
    image: "/images/products/bca-ytong-nf.svg",
    label: "BCA · zidărie",
    rotate: "rotate-2",
  },
  {
    image: "/images/products/amorsa-perete-10l.svg",
    label: "Amorsă · 10 L",
    rotate: "-rotate-1",
  },
];

export default async function HomePage() {
  let categoryList: Category[] = [];
  let productCount = 0;
  try {
    const [cats, [count]] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder)),
      db
        .select({ n: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.isActive, true)),
    ]);
    categoryList = cats;
    productCount = count?.n ?? 0;
  } catch (error) {
    console.error("Failed to load categories:", error);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="hazard-stripe h-2" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_360px]">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="tag-label text-orange-400">
              Depozit materiale · Cluj-Napoca · livrare pe șantier
            </p>
            <h1 className="mt-5 font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Ciment, rigips, BCA. Trimiți lista,{" "}
              <span className="text-orange-500">noi încărcăm camionul.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              Alegi produsele din catalog, trimiți cererea de ofertă și te sunăm noi cu prețul
              final și data livrării. Fără telefoane pierdute, fără mesaje uitate pe WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
              >
                Deschide catalogul
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                href="#cum-functioneaza"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 text-base font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                Cum funcționează
              </Link>
            </div>
            {productCount > 0 && (
              <p className="tag-label mt-8 text-zinc-500">
                {productCount} produse în stoc · {categoryList.length} categorii · program L–V
                07:00–18:00
              </p>
            )}
          </div>

          {/* inventory-tag collage with real products */}
          <div className="stagger hidden gap-4 lg:grid" aria-hidden>
            {heroTags.map((tag) => (
              <div
                key={tag.label}
                className={`flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-xl shadow-black/30 transition-transform duration-300 hover:rotate-0 ${tag.rotate}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tag.image}
                  alt=""
                  className="size-20 shrink-0 rounded-xl bg-white object-cover"
                />
                <div>
                  <p className="tag-label text-zinc-400">{tag.label}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-200">În stoc azi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tag-label text-orange-600">Catalog pe sectoare</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-zinc-900 sm:text-5xl">
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
          {categoryList.map((category, index) => (
            <Link
              key={category.id}
              href="/catalog"
              className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <p className="tag-label text-zinc-400 group-hover:text-orange-500">
                Sector {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-semibold text-zinc-900 group-hover:text-orange-600">
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
          <p className="tag-label text-orange-600">Comanda organizată</p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-zinc-900 sm:text-5xl">
            De ce aici, nu pe WhatsApp
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
      <section id="cum-functioneaza" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <p className="tag-label text-orange-600">De la listă la livrare</p>
        <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-tight text-zinc-900 sm:text-5xl">
          Cum funcționează
        </h2>
        <div className="stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <span
                className="absolute right-5 top-3 font-display text-6xl font-bold leading-none text-zinc-100"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="relative mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-100">
                <Icon className="size-6 text-orange-600" aria-hidden />
              </div>
              <h3 className="relative font-semibold text-zinc-900">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 pb-14 pt-16 text-center text-white sm:px-12">
          <div className="hazard-stripe absolute inset-x-0 top-0 h-2" aria-hidden />
          <h2 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
            Ai un proiect în lucru?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-zinc-400">
            Trimite-ne lista de materiale și primești oferta completă, cu transport inclus.
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-base font-semibold shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Începe cererea de ofertă
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
