"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export type LoginResult = { success: false; error: string };

export async function login(formData: FormData): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  const { email, password } = parsed.data;

  let user;
  try {
    [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
  } catch (error) {
    console.error("Login query failed:", error);
    return { success: false, error: "Eroare de conexiune. Încearcă din nou." };
  }

  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
    return { success: false, error: "Email sau parolă incorectă" };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const from = formData.get("from");
  const target = typeof from === "string" && from.startsWith("/admin") ? from : "/admin";
  redirect(target);
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
