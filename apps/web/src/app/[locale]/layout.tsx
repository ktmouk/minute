import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { roboto, inter } from "../../../config/fonts";
import { formats } from "../../../config/locale";
import { routing } from "../../i18n/routing";
import { Toast } from "./_components/Toast";
import { TrpcProvider } from "./_components/TrpcProvider";

export const fetchCache = "only-no-store";

type Props = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

const Layout = async (props: Props) => {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  // https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#layout
  if (
    typeof locale !== "string" ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
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
