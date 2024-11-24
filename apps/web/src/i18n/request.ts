import type { AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18n-request
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (
    typeof locale !== "string" ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (
      (await import(`../../messages/${locale}.json`)) as {
        default: AbstractIntlMessages;
      }
    ).default,
  };
});
