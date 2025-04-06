import { defineRouting } from "next-intl/routing";

// https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18nts
export const routing = defineRouting({
  locales: ["en", "ja"],
  defaultLocale: "en",
});
