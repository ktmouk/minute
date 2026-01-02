import "next-auth";

// https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module "next-auth" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Session {
    user: {
      id: string;
    };
  }
}
