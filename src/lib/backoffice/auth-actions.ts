"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withPerf } from "@/lib/backoffice/perf";

export type LoginActionState = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

const loginSchema = z.object({
  email: z.string().trim().min(1, "Introduza o email.").email("Introduza um email válido."),
  password: z.string().min(1, "Introduza a palavra-passe."),
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
  return withPerf("auth.login", async (perf) => {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      perf.mark("validation", { ok: false });
      return {
        message: "Verifique os campos assinalados.",
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      };
    }

    perf.mark("validation", { ok: true });
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return {
        message: "Não foi possível iniciar sessão. Tente novamente.",
      };
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    perf.mark("auth", { ok: !error });
    if (error) {
      console.error("[backoffice] login failed", { name: error.name, status: error.status });
      return {
        message:
          error.status === 400
            ? "Email ou palavra-passe incorretos."
            : "Não foi possível iniciar sessão. Tente novamente.",
      };
    }

    redirect(safeNextPath(String(formData.get("nextPath") ?? "")));
  });
}

export async function logoutAction(): Promise<void> {
  await withPerf("auth.logout", async (perf) => {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      perf.mark("auth", { ok: !error });
    } else {
      perf.mark("auth", { ok: false });
    }

    redirect("/backoffice/login");
  });
}
