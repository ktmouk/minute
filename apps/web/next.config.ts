import type { NextConfig } from "next";
import type { Header } from "next/dist/lib/load-custom-routes";
import "./env/server.mjs";
import "./env/client.mjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  {
    key: "Permissions-Policy",
    value:
      "clipboard-read=(),clipboard-write=(),gamepad=(),speaker-selection=(),accelerometer=(),ambient-light-sensor=(),autoplay=(),battery=(),camera=(),cross-origin-isolated=(),display-capture=(),document-domain=(),encrypted-media=(),execution-while-not-rendered=(),execution-while-out-of-viewport=(),fullscreen=(),geolocation=(),gyroscope=(),magnetometer=(),microphone=(),midi=(),navigation-override=(),payment=(),picture-in-picture=(),publickey-credentials-get=(),screen-wake-lock=(),sync-xhr=(),usb=(),web-share=(),xr-spatial-tracking=()",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
] satisfies Header["headers"];

const nextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  headers: () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate",
        },
        { key: "Pragma", value: "no-cache" },
      ],
    },
  ],
} satisfies NextConfig;

export default withNextIntl(nextConfig);
