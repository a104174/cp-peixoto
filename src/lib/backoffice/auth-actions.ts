"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
};

const loginSchema = z.object({
  email: z.string().trim().email("Introduza um email válido."),
  password: z.string().min(1, "Introduza a password."),
});

function safeNextPath(value: string): string {
  return value.startsWith("/backoffice/") &&
    !value.startsWith("//") &&
    value !== "/backoffice/login"
    ? value
    : "/backoffice";
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados de login inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      error:
        "Supabase ainda não está configurado. Defina as variáveis no ambiente local.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email ou password inválidos." };
  }

  redirect(safeNextPath(String(formData.get("nextPath") ?? "")));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/backoffice/login");
}

