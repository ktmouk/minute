import type { NextConfig } from "next";
import type { Header } from "next/dist/lib/load-custom-routes";
import "./env/server.mjs";
import "./env/client.mjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  {
    key: "Feature-Policy",
    value:
      "clipboard-read 'none';clipboard-write 'none';gamepad 'none';speaker-selection 'none';accelerometer 'none';ambient-light-sensor 'none';autoplay 'none';battery 'none';camera 'none';cross-origin-isolated 'none';display-capture 'none';document-domain 'none';encrypted-media 'none';execution-while-not-rendered 'none';execution-while-out-of-viewport 'none';fullscreen 'none';geolocation 'none';gyroscope 'none';magnetometer 'none';microphone 'none';midi 'none';navigation-override 'none';payment 'none';picture-in-picture 'none';publickey-credentials-get 'none';screen-wake-lock 'none';sync-xhr 'none';usb 'none';web-share 'none';xr-spatial-tracking 'none';",
  },
  {
    key: "Permissions-Policy",
    value:
      "clipboard-read=(),clipboard-write=(),gamepad=(),speaker-selection=(),accelerometer=(),ambient-light-sensor=(),autoplay=(),battery=(),camera=(),cross-origin-isolated=(),display-capture=(),document-domain=(),encrypted-media=(),execution-while-not-rendered=(),execution-while-out-of-viewport=(),fullscreen=(),geolocation=(),gyroscope=(),magnetometer=(),microphone=(),midi=(),navigation-override=(),payment=(),picture-in-picture=(),publickey-credentials-get=(),screen-wake-lock=(),sync-xhr=(),usb=(),web-share=(),xr-spatial-tracking=()",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
] satisfies Header["headers"];

const nextConfig = {
  typedRoutes: true,
  reactStrictMode: true,
  headers() {
    return Promise.resolve([
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
    ]);
  },
} satisfies NextConfig;

export default withNextIntl(nextConfig);
