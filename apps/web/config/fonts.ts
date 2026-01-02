import { Roboto, Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const roboto = Roboto({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});
