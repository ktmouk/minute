import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { roboto, inter } from "../../../config/fonts";
import { type Locale, formats } from "../../../config/locale";
import { Toast } from "./_components/Toast";
import { TrpcProvider } from "./_components/TrpcProvider";

export const fetchCache = "only-no-store";

type Props = {
  children: ReactNode;
  params: {
    locale: Locale;
  };
};

const Layout = async ({ children, params: { locale } }: Props) => {
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
              <ReactQueryDevtools position="bottom-right" />
            </body>
          </NextIntlClientProvider>
        </Provider>
      </TrpcProvider>
    </html>
  );
};

export default Layout;
