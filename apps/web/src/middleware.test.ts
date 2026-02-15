import type { NextFetchEvent } from "next/server";
import { NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { describe, expect, it, vi } from "vitest";
import middleware from "./middleware";

vi.mock("server-only");

const cspRegxp = new RegExp(
  [
    "^",
    "base-uri 'none'; ",
    "child-src 'none'; ",
    "connect-src 'self'; ",
    "default-src 'self'; ",
    "font-src 'self'; ",
    "form-action 'self'; ",
    "frame-ancestors 'none'; ",
    "frame-src 'none'; ",
    "img-src 'self'; ",
    "manifest-src 'none'; ",
    "media-src 'none'; ",
    "object-src 'none'; ",
    "prefetch-src 'none'; ",
    "worker-src 'none'; ",
    "script-src 'nonce-.+' 'strict-dynamic'; ",
    "style-src 'self' 'nonce-.+' 'sha256-\\+A14ONesVdzkn6nr37Osn\\+rUqNz4oFGZFDbLXrlae04='; ",
    "upgrade-insecure-requests;",
    "$",
  ].join(""),
);

describe("middleware", () => {
  describe("when the path is /robots.txt", () => {
    describe("when the requset has a disallowed ip", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/robots.txt", {
          headers: {
            "x-real-ip": "1.1.1.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });
  });

  describe("when the path starts with /api/trpc", () => {
    describe("when the requset has valid headers", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });

    describe("when the requset has a disallowed ip", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "1.1.1.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });

    describe("when the requset does not have an ip", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });

    describe("when the requset has an empty ip", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });

    describe("when the requset does not have an origin header", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "127.0.0.1",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });

    describe("when the requset has a invalid origin header", () => {
      it("returns 400", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:3000",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(400);
      });
    });

    describe("when the requset method is GET and the content-type header is invalid", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          method: "GET",
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "multipart/form-data",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });

    describe("when the requset method is POST and the content-type header is application/json with charset", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          method: "POST",
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json; charset=utf-8",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });

    describe("when the requset method is POST and the content-type header is application/jsonl", () => {
      it("returns 400", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          method: "POST",
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/jsonl",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(400);
      });
    });

    describe("when the requset method is POST and the content-type header is invalid", () => {
      it("returns 400", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          method: "POST",
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "multipart/form-data",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(400);
      });
    });

    describe("when the requset method is DELETE and the content-type header is invalid", () => {
      it("returns 400", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          method: "DELETE",
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "multipart/form-data",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(400);
      });
    });

    describe("when the requset has an invalid custom header", () => {
      it("returns 400", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "X-Requested-With": "invalid",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(400);
      });
    });

    describe("when the requset does not have a custom header", () => {
      it("returns 400", async () => {
        const req = new NextRequest("http://localhost:3000/api/trpc", {
          headers: {
            "x-real-ip": "127.0.0.1",
            Origin: "http://localhost:4001",
            "Content-Type": "application/json",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(400);
      });
    });
  });

  describe("when the path starts with /_next", () => {
    describe("when the requset has an allowed ip", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/_next", {
          headers: {
            "x-real-ip": "127.0.0.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });

    describe("when the requset has a disallowed ip", () => {
      it("returns 404", async () => {
        const req = new NextRequest("http://localhost:3000/_next", {
          headers: {
            "x-real-ip": "1.1.1.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });
  });

  describe("when the path starts with /api", () => {
    describe("when the requset has an allowed ip", () => {
      it("returns 200", async () => {
        const req = new NextRequest("http://localhost:3000/api", {
          headers: {
            "x-real-ip": "127.0.0.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
      });
    });

    describe("when the requset has a disallowed ip", () => {
      it("returns 404", async () => {
        const req = new NextRequest("http://localhost:3000/api/", {
          headers: {
            "x-real-ip": "1.1.1.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });
  });

  describe("when the path is public", () => {
    describe("when the requset has an allowed ip", () => {
      it("returns 200 and has the csp header", async () => {
        const req = new NextRequest("http://localhost:3000/en/auth/sign-in", {
          headers: {
            "x-real-ip": "127.0.0.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
        expect(res?.headers.get("Content-Security-Policy")).toMatch(cspRegxp);
      });

      it("generates a different nonce on each request", async () => {
        const res1 = await middleware(
          new NextRequest("http://localhost:3000/en/auth/sign-in", {
            headers: { "x-real-ip": "127.0.0.1" },
          }) as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        const res2 = await middleware(
          new NextRequest("http://localhost:3000/en/auth/sign-in", {
            headers: { "x-real-ip": "127.0.0.1" },
          }) as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        const csp1 = res1?.headers.get("Content-Security-Policy");
        const csp2 = res2?.headers.get("Content-Security-Policy");
        expect(csp1).not.toBe(csp2);
      });
    });

    describe("when the requset has a disallowed ip", () => {
      it("returns 404", async () => {
        const req = new NextRequest("http://localhost:3000/en/auth/sign-in", {
          headers: {
            "x-real-ip": "1.1.1.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });
  });

  describe("when the path is private", () => {
    describe("when the requset does not have a session cookie", () => {
      it("redirects to the sign in page", async () => {
        const req = new NextRequest("http://localhost:3000/en/app", {
          headers: {
            "x-real-ip": "127.0.0.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(307);
        expect(res?.headers.get("location")).toBe(
          "http://localhost:3000/auth/sign-in?callbackUrl=%2Fen%2Fapp",
        );
      });
    });

    describe("when the requset has a session cookie", () => {
      it("returns 200 and has the csp header", async () => {
        const req = new NextRequest("http://localhost:3000/en/app", {
          headers: {
            "x-real-ip": "127.0.0.1",
          },
        });
        req.cookies.set("next-auth.session-token", "token");
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(true);
        expect(res?.status).toBe(200);
        expect(res?.headers.get("Content-Security-Policy")).toMatch(cspRegxp);
      });
    });

    describe("when the requset has a disallowed ip", () => {
      it("returns 404", async () => {
        const req = new NextRequest("http://localhost:3000/en/app", {
          headers: {
            "x-real-ip": "1.1.1.1",
          },
        });
        const res = await middleware(
          req as NextRequestWithAuth,
          {} as NextFetchEvent,
        );
        expect(res?.ok).toBe(false);
        expect(res?.status).toBe(404);
      });
    });
  });
});
