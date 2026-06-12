"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { BrickMark } from "@/components/public/logo";

function LoginForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await login(formData);
      // login redirects on success; if we get here, it failed
      if (result && !result.success) {
        toast.error(result.error);
        setSubmitting(false);
      }
    } catch (error) {
      // Next.js redirect() throws — let it propagate
      throw error;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="from" value={searchParams.get("from") ?? ""} />
      <Field label="Email" required>
        <Input
          name="email"
          type="email"
          placeholder="admin@depozit.ro"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Parolă" required>
        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        <LockKeyhole className="size-4" aria-hidden />
        Autentificare
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-900 px-4">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrickMark className="mb-4 size-14 bg-zinc-800 p-3" />
          <h1 className="text-xl font-bold text-white">Panou de administrare</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Autentifică-te cu contul de angajat sau administrator.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-white">
            ← Înapoi la site
          </Link>
        </p>
      </div>
    </div>
  );
}
