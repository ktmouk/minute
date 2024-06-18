import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales } from "../config/locale";

// https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#i18nts
export default getRequestConfig(async ({ locale }) => {
  if (!(locales as readonly string[]).includes(locale)) notFound();

  return {
    messages: (
      (await import(`../messages/${locale}.json`)) as { default: IntlMessages }
    ).default,
  };
});
