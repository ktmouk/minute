import "server-only";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { headers } from "next/headers";
import type { Account, AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import {
  createSampleData,
  createUserSecurityLog,
} from "../../../packages/services/src";
import { serverEnv } from "../env/server.mjs";
import { db } from "./db";
import { nextAuthPageOptions } from "./next-auth-page-options";

const isAllowedGithubId = (id: string | undefined) => {
  if (typeof serverEnv.ALLOWED_GITHUB_IDS !== "string") return true;
  if (typeof id !== "string") return false;
  return serverEnv.ALLOWED_GITHUB_IDS.split(",").includes(id);
};

const sendUserSecurityLog = async ({
  type,
  name,
  account,
}: {
  type:
    | "SIGN_IN"
    | "SIGN_OUT"
    | "BLOCK_SIGN_IN"
    | "CREATE_USER"
    | "LINK_ACCOUNT";
  name?: string | null | undefined;
  account?: Account | null;
}) => {
  // https://github.com/nextauthjs/next-auth/discussions/8991#discussioncomment-7441559
  const userAgent = (await headers()).get("user-agent") ?? undefined;
  const ipAddress = (await headers()).get("x-real-ip") ?? undefined;

  try {
    await createUserSecurityLog(db)({
      type,
      name: name ?? undefined,
      userAgent,
      ipAddress,
      provider: account?.provider ?? undefined,
      providerAccountId: account?.providerAccountId ?? undefined,
    });
  } catch {
    // Suppress the error so that the user cannot see the detail.
    return;
  }
};

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  callbacks: {
    async signIn({ user, account }) {
      if (isAllowedGithubId(account?.providerAccountId)) {
        return true;
      }
      await sendUserSecurityLog({
        type: "BLOCK_SIGN_IN",
        name: user.name,
        account,
      });
      return false;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        id: user.id,
      },
    }),
  },
  providers: [
    GithubProvider({
      clientId: serverEnv.GITHUB_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
    }),
  ],
  pages: nextAuthPageOptions,
  events: {
    signIn: async ({ user, account }) => {
      await sendUserSecurityLog({ type: "SIGN_IN", name: user.name, account });
    },
    signOut: async () => {
      await sendUserSecurityLog({ type: "SIGN_OUT" });
    },
    linkAccount: async ({ user, account }) => {
      await sendUserSecurityLog({
        type: "LINK_ACCOUNT",
        name: user.name,
        account,
      });
    },
    createUser: async ({ user }) => {
      const userId = user.id;
      await sendUserSecurityLog({ type: "CREATE_USER", name: user.name });
      await createSampleData(db)({ userId });
    },
  },
};
