import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRole } from "@/lib/roles";
import { ModulePermission } from "./lib/permissions";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/invite",
  "/forgot-password",
  "/send-forgot-password",
  "/two-factor",
  "/change-password",
];

const MODULE_GATES: Record<string, string[]> = {
  "/admin/users": ["USERS_ADMIN"],
  "/admin/rewards": ["USERS_ADMIN_REWARDS"],
  "/admin/vacations": ["USERS_ADMIN_VACATIONS"],
  "/nomina": ["NOMINA"],
};

const TOKEN_KEY = "portal_access_token";
const ADMIN_PATH_PREFIX = "/admin";

function getRoleFromToken(token: string | undefined): string {
  if (!token) return "";

  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return "";
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded)) as { role?: string };
    return decoded.role ?? "";
  } catch {
    return "";
  }
}

function getModulePermissionsFromToken(
  token: string | undefined,
): ModulePermission[] {
  if (!token) return [];

  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return [];
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded)) as {
      modulePermissions?: ModulePermission[];
    };
    return decoded.modulePermissions ?? [];
  } catch {
    return [];
  }
}

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;

  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return true;
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    if (!decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    // Redirect authenticated users away from login
    if (pathname === "/login" && token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated or expired session users to login
  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    if (token) {
      loginUrl.searchParams.set(
        "message",
        "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
      );
    }
    const response = NextResponse.redirect(loginUrl);
    // Clear cookie
    response.cookies.delete(TOKEN_KEY);
    return response;
  }

  // const matched = Object.entries(MODULE_GATES).find(([prefix]) =>
  //   pathname.startsWith(prefix),
  // );

  // if (matched) {
  //   const [, requiredModules] = matched;
  //   const role = getRoleFromToken(token);
  //   const userModules = getModulePermissionsFromToken(token);

  //   console.log({ role, userModules, requiredModules });

  //   const isAdmin = isAdminRole(role);
  //   // const hasModule = requiredModules.some((m) => userModules?.includes());
  //   const hasModule = userModules.some((m) =>
  //     requiredModules.includes(m.module),
  //   );

  //   if (!isAdmin && !hasModule) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  // Restrict admin module to ADMIN role only
  // if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
  //   const role = getRoleFromToken(token);
  //   if (!isAdminRole(role)) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (except auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
