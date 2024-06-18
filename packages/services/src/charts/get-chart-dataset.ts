import { type PrismaClient } from "@minute/prisma";
import { contract } from "@minute/utils";
import { format, isBefore } from "date-fns";
import * as R from "remeda";
import { z } from "zod";

export const getChartDataset = (db: PrismaClient) =>
  contract(
    {
      input: z.strictObject({
        userId: z.string().uuid(),
        chartId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
        datePart: z.enum(["day", "month"]),
        timeZone: z.enum(
          Intl.supportedValuesOf("timeZone") as [string, ...string[]],
        ),
      }),
      output: z.promise(
        z.strictObject({
          folders: z.array(
            z.strictObject({
              folderId: z.string().uuid(),
              data: z.array(
                z.strictObject({
                  localDate: z.string(),
                  duration: z.number(),
                }),
              ),
            }),
          ),
          categories: z.array(
            z.strictObject({
              categoryId: z.string().uuid(),
              data: z.array(
                z.strictObject({
                  localDate: z.string(),
                  duration: z.number(),
                }),
              ),
            }),
          ),
        }),
      ),
    },
    async (input) => {
      if (isBefore(input.endDate, input.startDate)) {
        throw Error("The start date must be earlier than end date.");
      }
      const chart = await db.chart.findFirst({
        where: {
          id: input.chartId,
          userId: input.userId,
        },
      });
      if (chart === null) {
        throw Error("The chart does not exist.");
      }
      const chartFolderIds = (
        await db.chartFolder.findMany({
          select: {
            folderId: true,
          },
          where: {
            chartId: chart.id,
            folder: {
              userId: input.userId,
            },
          },
        })
      ).map(({ folderId }) => folderId);
      const chartCategoryIds = (
        await db.chartCategory.findMany({
          select: {
            categoryId: true,
          },
          where: {
            chartId: chart.id,
            category: {
              userId: input.userId,
            },
          },
        })
      ).map(({ categoryId }) => categoryId);
      const categoryFolders = await db.categoryFolder.findMany({
        select: {
          categoryId: true,
          folderId: true,
        },
        where: {
          category: {
            userId: input.userId,
            id: {
              in: chartCategoryIds,
            },
          },
          folder: {
            userId: input.userId,
          },
        },
      });
      const categoryFolderIds = categoryFolders.map(({ folderId }) => folderId);
      const folders = await Promise.all(
        R.unique([...chartFolderIds, ...categoryFolderIds]).map(
          async (folderId) => {
            const targetFolderIds = (
              await db.folderHierarchy.findMany({
                distinct: ["descendantId"],
                select: {
                  descendantId: true,
                },
                where: {
                  userId: input.userId,
                  ancestorId: folderId,
                },
              })
            ).map(({ descendantId }) => descendantId);
            const data = await z.promise(
              z.array(
                z.strictObject({
                  date: z.date(),
                  duration: z.bigint().nullable(),
                }),
              ),
            ).parse(db.$queryRaw`
            SELECT
              date_trunc(${input.datePart}, "TimeEntry"."startedAt" AT TIME ZONE ${input.timeZone}) AS date,
              SUM("TimeEntry"."duration") as "duration"
            FROM "Folder"
              JOIN "Task" ON "Folder"."id" = "Task"."folderId" AND "Folder"."userId" = "Task"."userId"
              JOIN "TimeEntry" ON "Task"."id" = "TimeEntry"."taskId"
            WHERE
              "TimeEntry"."startedAt" >= ${input.startDate}
              AND "TimeEntry"."startedAt" <= ${input.endDate}
              AND "Task"."userId" = ${input.userId}::uuid
              AND "Folder"."userId" = ${input.userId}::uuid
              AND "Folder"."id" = ANY(${`{${targetFolderIds.join(",")}}`}::uuid[])
            GROUP BY
              date
          `);
            return {
              folderId,
              data: data.map((item) => ({
                localDate: format(item.date, "yyy-MM-dd"),
                duration: Number(item.duration),
              })),
            };
          },
        ),
      );
      return {
        folders: folders.filter(({ folderId }) =>
          chartFolderIds.includes(folderId),
        ),
        categories: chartCategoryIds.map((categoryId) => {
          const targetFolderIds = categoryFolders
            .filter((data) => data.categoryId === categoryId)
            .map(({ folderId }) => folderId);

          const sumByLocalDate = R.mapValues(
            R.groupBy(
              folders
                .filter(({ folderId }) => targetFolderIds.includes(folderId))
                .flatMap(({ data }) => data),
              ({ localDate }) => localDate,
            ),
            (data) => R.sumBy(data, ({ duration }) => duration),
          );
          return {
            categoryId,
            data: R.entries(sumByLocalDate).map(([localDate, duration]) => ({
              localDate,
              duration,
            })),
          };
        }),
      };
    },
  );
