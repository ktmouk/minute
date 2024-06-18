import { faker } from "@faker-js/faker";
import { differenceInSeconds, addHours } from "date-fns";
import { defineTimeEntryFactory } from "../../generated/factories";
import { taskFactory } from "./task-factory";
import { db } from "@minute/prisma/vitest/helpers";

export const timeEntryFactory = defineTimeEntryFactory(db)
  .props({
    id: () => faker.string.uuid(),
    stoppedAt: async ({ props }) => addHours(await props.startedAt, 1),
    duration: async ({ props }) =>
      differenceInSeconds(await props.stoppedAt, await props.startedAt),
  })
  .vars({
    task: async () => await taskFactory.create(),
  });
