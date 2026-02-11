import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { roboto, inter } from "../../../config/fonts";
import { formats } from "../../../config/locale";
import { routing } from "../../i18n/routing";
import { Toast } from "./_components/Toast";
import { TrpcProvider } from "./_components/TrpcProvider";

const Layout = async (props: LayoutProps<"/[locale]">) => {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  // https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#layout
  if (typeof locale !== "string" || !hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${roboto.variable} ${inter.variable} font-sans text-gray-600`}
    >
      <TrpcProvider>
        <Provider>
          <NextIntlClientProvider
            formats={formats}
            locale={locale}
            messages={messages}
            timeZone="Asia/Tokyo"
          >
            <body>
              {children}
              <Toast />
              <ReactQueryDevtools position="right" />
            </body>
          </NextIntlClientProvider>
        </Provider>
      </TrpcProvider>
    </html>
  );
};

export default Layout;
