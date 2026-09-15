import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

function loginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/backoffice/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (
    nextPath.startsWith("/backoffice/") &&
    !nextPath.startsWith("//") &&
    nextPath !== "/backoffice/login"
  ) {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = request.nextUrl.pathname === "/backoffice/login";
  if (!user && !isLogin) {
    return loginRedirect(request);
  }

  if (user && isLogin) {
    return NextResponse.redirect(new URL("/backoffice", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
