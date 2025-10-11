import "server-only";

import { ipAddress } from "@vercel/functions";
import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import withAuth from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import * as R from "remeda";
import { locales } from "../config/locale";
import { pageOptions } from "../config/next-auth";
import { serverEnv } from "../env/server.mjs";
import { routing } from "./i18n/routing";

const PUBLIC_PAGES = ["/auth/sign-in"];
const PUBLIC_FILES = ["/favicon.ico", "/robots.txt"];

// Based on https://trezy.gitbook.io/next-safe/configuration-options/contentsecuritypolicy
const generateCsp = (nonce: string) => {
  const isDev = process.env.NODE_ENV === "development";
  const csp = {
    "base-uri": ["none"],
    "child-src": ["none"],
    "connect-src": ["self"],
    "default-src": ["self"],
    "font-src": ["self", `nonce-${nonce}`],
    "form-action": ["self"],
    "frame-ancestors": ["none"],
    "frame-src": ["none"],
    "img-src": ["self"],
    "manifest-src": ["none"],
    "media-src": ["none"],
    "object-src": ["none"],
    "prefetch-src": ["none"],
    "worker-src": ["none"],
    "script-src": [
      `nonce-${nonce}`,
      "strict-dynamic",
      ...(isDev ? ["unsafe-eval"] : []),
    ],
    "style-src": [
      "self",
      ...(isDev
        ? ["unsafe-inline"]
        : [
            `nonce-${nonce}`,
            // emoji-mart
            "sha256-+A14ONesVdzkn6nr37Osn+rUqNz4oFGZFDbLXrlae04=",
          ]),
    ],
  } satisfies Record<string, string[]>;

  return R.entries(csp)
    .map(
      ([key, directives]) =>
        `${key} ${directives
          .filter((directive) => {
            return typeof directive === "string" && directive !== "";
          })
          .map((directive) => `'${directive}'`)
          .join(" ")}`,
    )
    .join("; ");
};

const isAllowedIp = (ip: string | undefined) => {
  if (typeof serverEnv.ALLOWED_IPS !== "string") return true;
  if (typeof ip !== "string") return false;
  return serverEnv.ALLOWED_IPS.split(",").includes(ip);
};

const intlMiddleware = createIntlMiddleware(routing);

const authMiddleware = withAuth(
  function onSuccess(req) {
    const res = intlMiddleware(req);
    const csp = req.headers.get("Content-Security-Policy");
    if (typeof csp !== "string") throw new Error("No CSP header found");
    res.headers.set("Content-Security-Policy", csp);
    return res;
  },
  {
    callbacks: {
      authorized: ({ req: { cookies } }) => {
        // https://github.com/nextauthjs/next-auth/discussions/4265#discussioncomment-7547821
        const sessionToken = cookies.get(
          serverEnv.NEXTAUTH_URL.startsWith("https:")
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token",
        );
        return sessionToken !== undefined;
      },
    },
    pages: pageOptions,
  },
);

const hasJsonContentType = (req: NextRequest) => {
  if (req.method === "GET") return true;

  const contentType = req.headers.get("Content-Type");
  return (
    typeof contentType === "string" &&
    contentType.startsWith("application/json")
  );
};

const hasValidOrigin = (req: NextRequest) => {
  const origin = req.headers.get("Origin");
  return origin === null || origin === serverEnv.ORIGIN;
};

const hasValidXhrHeader = (req: NextRequest) => {
  return req.headers.get("X-Requested-With") === "XMLHttpRequest";
};

export default function middleware(
  req: NextRequestWithAuth,
  event: NextFetchEvent,
) {
  // Always allow accessing robots.txt.
  if (req.nextUrl.pathname === "/robots.txt") {
    return NextResponse.next();
  }

  if (!isAllowedIp(ipAddress(req))) {
    return new NextResponse("not found", { status: 404 });
  }

  if (req.nextUrl.pathname.startsWith("/api/trpc")) {
    const isValidApiRequest =
      hasJsonContentType(req) && hasValidOrigin(req) && hasValidXhrHeader(req);
    if (!isValidApiRequest) {
      return new NextResponse("bad request", { status: 400 });
    }
  }

  // https://github.com/vercel/next.js/discussions/38615#discussioncomment-5841824
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    PUBLIC_FILES.includes(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${PUBLIC_PAGES.flatMap((p) =>
      p === "/" ? ["", "/"] : p,
    ).join("|")})/?$`,
    "i",
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  // https://github.com/amannn/next-intl/discussions/682
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspWithNonce = generateCsp(nonce);
  const headers = new Headers(req.headers);
  headers.set("Content-Security-Policy", cspWithNonce);
  const reqWithCsp = new NextRequest(req, { headers }) as NextRequestWithAuth;

  if (isPublicPage) {
    const res = intlMiddleware(reqWithCsp);
    res.headers.set("Content-Security-Policy", cspWithNonce);
    return res;
  } else {
    return authMiddleware(reqWithCsp, event);
  }
}
