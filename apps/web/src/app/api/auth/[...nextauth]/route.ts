import "server-only";

import NextAuth from "next-auth";
import { authOptions } from "../../../../../config/next-auth";

// NextAuth returns any type.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
