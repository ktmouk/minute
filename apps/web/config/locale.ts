export const locales = ["ja", "en"] as const;
export const defaultLocale: Locale = "en";

export const formats = {
  dateTime: {
    long: {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
    short: {
      day: "2-digit",
      month: "short",
    },
    week: {
      weekday: "short",
    },
  },
} as const;

export type Locale = (typeof locales)[number];
