import type en from "../messages/en.json";

// https://next-intl-docs.vercel.app/docs/workflows/typescript
declare global {
  type IntlMessages = typeof en;
}
