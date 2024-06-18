import "server-only";

import { isAuthed } from "./middlewares";
import { procedure } from "./trpc";

export const protectedProcedure = procedure.use(isAuthed);
