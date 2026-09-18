import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "./env";
import type { Database } from "./database.types";

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database> | null
> {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          return;
        }
      },
    },
  });
}

type AuthenticatedSupabase = {
  client: SupabaseClient<Database>;
  user: {
    id: string;
    email?: string;
  };
};

/**
 * React's request cache deduplicates auth work shared by a protected layout,
 * its page loader and sibling data loaders. The Supabase client remains
 * request-scoped because this function still reads the current request's
 * cookies before creating it.
 */
const getAuthenticatedSupabaseCached = cache(
  async (): Promise<AuthenticatedSupabase | null> => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return null;
    }

    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims) {
      return null;
    }

    return {
      client: supabase,
      user: { id: claims.sub, email: claims.email },
    };
  },
);

const getCurrentUserCached = cache(async () => {
  const authenticated = await getAuthenticatedSupabaseCached();
  return authenticated?.user ?? null;
});

export function getCurrentUser(): ReturnType<typeof getCurrentUserCached> {
  return getCurrentUserCached();
}

export function getAuthenticatedSupabase(): ReturnType<typeof getAuthenticatedSupabaseCached> {
  return getAuthenticatedSupabaseCached();
}
