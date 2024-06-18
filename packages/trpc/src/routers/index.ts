import "server-only";

import { createCallerFactory, router } from "../trpc";
import { categoriesRouter } from "./categories-router";
import { chartsRouter } from "./charts-router";
import { currentUserRouter } from "./current-user-router";
import { folderHierarchiesRouter } from "./folder-hierarchies-router";
import { foldersRouter } from "./folders-router";
import { runningTimeEntryRouter } from "./running-time-entry-router";
import { tasksRouter } from "./tasks-router";
import { timeEntriesRouter } from "./time-entries-router";
import { timeEntrySummariesRouter } from "./time-entry-summaries-router";
import { totalTimeEntryDurationRouter } from "./total-time-entry-duration-router";

export const appRouter = router({
  folders: foldersRouter,
  folderHierarchies: folderHierarchiesRouter,
  runningTimeEntry: runningTimeEntryRouter,
  timeEntries: timeEntriesRouter,
  timeEntrySummaries: timeEntrySummariesRouter,
  tasks: tasksRouter,
  charts: chartsRouter,
  categories: categoriesRouter,
  currentUser: currentUserRouter,
  totalTimeEntryDuration: totalTimeEntryDurationRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
