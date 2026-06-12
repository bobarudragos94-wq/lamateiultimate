import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { BrickMark } from "./logo";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-zinc-950 pb-24 text-zinc-300 md:pb-0">
      <div className="hazard-stripe h-2" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <BrickMark className="bg-zinc-800" />
            <span className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-white">
              Depozit<span className="text-orange-500">Construct</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
            Depozit de materiale de construcții. Livrăm rapid pe șantier sau acasă, cu ofertă
            clară și fără bătăi de cap.
          </p>
        </div>
        <div>
          <h3 className="tag-label text-zinc-500">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-orange-500" aria-hidden />
              Str. Depozitelor 10, Cluj-Napoca
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-orange-500" aria-hidden />
              <a href="tel:+40700000000" className="transition-colors hover:text-white">
                0700 000 000
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-orange-500" aria-hidden />
              Luni – Vineri: 07:00 – 18:00
              <br />
            </li>
          </ul>
        </div>
        <div>
          <h3 className="tag-label text-zinc-500">Linkuri</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/catalog" className="transition-colors hover:text-white">
                Catalog produse
              </Link>
            </li>
            <li>
              <Link href="/cerere" className="transition-colors hover:text-white">
                Cere ofertă
              </Link>
            </li>
            <li>
              <Link href="/admin" className="transition-colors hover:text-white">
                Acces angajați
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Depozit Construct. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
