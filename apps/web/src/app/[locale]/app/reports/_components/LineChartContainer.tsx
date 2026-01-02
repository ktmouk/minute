"use client";

import {
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns";
import { fromS } from "hh-mm-ss";
import { useFormatter } from "next-intl";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as R from "remeda";
import { trpc } from "../../../_components/TrpcProvider";
import { ChartToolip } from "./ChartTooltip";

type Props = {
  chartId: string;
  startDate: Date;
  endDate: Date;
  datePart: "day" | "month";
};

const datePartConfigs = {
  day: {
    eachPartOfInterval: eachDayOfInterval,
    isSame: isSameDay,
    dateFormat: {
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    },
  },
  month: {
    eachPartOfInterval: eachMonthOfInterval,
    isSame: isSameMonth,
    dateFormat: {
      year: "2-digit",
      month: "2-digit",
    },
  },
} as const;

export const LineChartContainer = ({
  chartId,
  startDate,
  endDate,
  datePart,
}: Props) => {
  const formatDate = useFormatter();
  const allFolders = trpc.folders.getAllFolders.useQuery();
  const allCategories = trpc.categories.getAllCategories.useQuery();

  const dataset = trpc.charts.getChartDataset.useQuery({
    chartId,
    startDate,
    endDate,
    datePart,
    timeZone: "Asia/Tokyo",
  });

  const config = datePartConfigs[datePart];

  const data = useMemo(() => {
    const dates = config.eachPartOfInterval({
      start: startDate,
      end: endDate,
    });
    return dates.map((date) => ({
      name: formatDate.dateTime(date, config.dateFormat),
      ...R.mapToObj(dataset.data?.folders ?? [], ({ folderId, data }) => {
        const duration =
          data.find(({ localDate }) => config.isSame(parseISO(localDate), date))
            ?.duration ?? 0;
        return [folderId, duration];
      }),
      ...R.mapToObj(dataset.data?.categories ?? [], ({ categoryId, data }) => {
        const duration =
          data.find(({ localDate }) => config.isSame(parseISO(localDate), date))
            ?.duration ?? 0;
        return [categoryId, duration];
      }),
    }));
  }, [config, startDate, endDate, dataset, formatDate]);

  const lineData = useMemo(() => {
    return [
      ...(dataset.data?.folders ?? []).map(({ folderId }) => {
        const folder = allFolders.data?.find(({ id }) => folderId === id);
        if (folder === undefined) return undefined;
        return {
          name: `${folder.emoji} ${folder.name}`,
          dataKey: folder.id,
          stroke: folder.color,
        };
      }),
      ...(dataset.data?.categories ?? []).map(({ categoryId }) => {
        const category = allCategories.data?.find(
          ({ id }) => categoryId === id,
        );
        if (category === undefined) return undefined;
        return {
          name: `${category.emoji} ${category.name}`,
          dataKey: categoryId,
          stroke: category.color,
        };
      }),
    ];
  }, [dataset, allFolders, allCategories]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Legend wrapperStyle={{ fontSize: 14, minHeight: 20 }} />
        <CartesianGrid strokeDasharray="3 3" stroke="#dee1dd" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis
          fontSize={12}
          tickFormatter={(value: number) => fromS(value, "hh:mm:ss")}
        />
        <Tooltip
          cursor={{ stroke: "#8c9da1" }}
          content={({ label, payload }) => (
            <ChartToolip label={label as string} payload={payload} />
          )}
        />
        {lineData.map((data) => {
          if (data === undefined) return undefined;
          return (
            <Line
              key={data.dataKey}
              type="monotone"
              name={data.name}
              dataKey={data.dataKey}
              stroke={data.stroke}
              activeDot={{ r: 8 }}
              strokeWidth={1.5}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};
