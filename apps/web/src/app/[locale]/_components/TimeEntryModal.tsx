import { DialogTitle } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, isValid, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { PiTrash } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { z } from "zod";
import { Modal } from "../_components/Modal";
import { Tooltip } from "../_components/Tooltip";
import { trpc } from "../_components/TrpcProvider";
import { useToast } from "../_hooks/useToast";
import { FolderSelect } from "../app/(home)/_components/FolderSelect";
import { TimeEntryModalCalendar } from "./TimeEntryModalCalendar";

type Props = {
  onClose: () => void;
  id?: string;
  folderId: string;
  description: string;
  startedAt: Date;
  stoppedAt: Date;
};

const submitButtonStyle = tv({
  base: "py-2.5 px-4 bg-green-500 cursor-pointer text-white text-sm rounded-sm inline-block",
  variants: {
    disabled: {
      true: "bg-gray-400",
    },
  },
});

const parseDateFromInput = (date: string, time: string) => {
  return parseISO(`${date}T${time}`);
};

export const TimeEntryModal = ({
  onClose,
  id,
  folderId,
  description,
  startedAt,
  stoppedAt,
}: Props) => {
  const utils = trpc.useUtils();

  const ct = useTranslations("common");
  const t = useTranslations("components.TimeEntryModal");
  const runningTimeEntry = trpc.runningTimeEntry.getRunningTimeEntry.useQuery();
  const { notify } = useToast();

  const createTimeEntry = trpc.timeEntries.createTimeEntry.useMutation({
    onSuccess: async () => {
      notify(t("timeEntryCreated"));
      await utils.timeEntries.invalidate();
    },
  });

  const updateTimeEntry = trpc.timeEntries.updateTimeEntry.useMutation({
    onSuccess: async () => {
      notify(t("timeEntryUpdated"));
      await utils.timeEntries.invalidate();
    },
  });

  const deleteTimeEntry = trpc.timeEntries.deleteTimeEntry.useMutation({
    onSuccess: async () => {
      notify(t("timeEntryDeleted"));
      await utils.timeEntries.invalidate();
    },
  });

  const schema = useMemo(
    () =>
      z
        .strictObject({
          folderId: z.string().uuid(),
          description: z.string().min(1, {
            message: ct("validation.required", { label: t("description") }),
          }),
          startDate: z.string().min(1, {
            message: ct("validation.required", { label: t("startDate") }),
          }),
          startTime: z.string().min(1, {
            message: ct("validation.required", { label: t("startTime") }),
          }),
          endDate: z.string().min(1, {
            message: ct("validation.required", { label: t("endDate") }),
          }),
          endTime: z.string().min(1, {
            message: ct("validation.required", { label: t("endTime") }),
          }),
        })
        .superRefine(({ startDate, startTime, endDate, endTime }, ctx) => {
          const startedAt = parseDateFromInput(startDate, startTime);
          const stoppedAt = parseDateFromInput(endDate, endTime);

          if (!isValid(startedAt)) {
            ctx.addIssue({
              path: ["startDate"],
              code: z.ZodIssueCode.custom,
              message: ct("validation.invalidFormat", {
                label: t("startDate"),
              }),
            });
            return z.NEVER;
          }
          if (!isValid(stoppedAt)) {
            ctx.addIssue({
              path: ["endDate"],
              code: z.ZodIssueCode.custom,
              message: ct("validation.invalidFormat", { label: t("endDate") }),
            });
            return z.NEVER;
          }
          if (isAfter(startedAt, stoppedAt)) {
            ctx.addIssue({
              path: ["startDate"],
              code: z.ZodIssueCode.custom,
              message: ct("validation.timeBefore", {
                label1: t("endDate"),
                label2: t("startDate"),
              }),
            });
            return z.NEVER;
          }
        }),
    [t, ct],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid: isFormValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      folderId: folderId,
      description: description,
      startDate: format(startedAt, "yyyy-MM-dd"),
      startTime: format(startedAt, "HH:mm:ss"),
      endDate: format(stoppedAt, "yyyy-MM-dd"),
      endTime: format(stoppedAt, "HH:mm:ss"),
    },
  });

  const handleSave: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    const startedAt = parseDateFromInput(data.startDate, data.startTime);
    const stoppedAt = parseDateFromInput(data.endDate, data.endTime);

    if (id === undefined) {
      await createTimeEntry.mutateAsync({
        folderId: data.folderId,
        description: data.description,
        startedAt,
        stoppedAt,
      });
    } else {
      await updateTimeEntry.mutateAsync({
        id: id,
        folderId: data.folderId,
        description: data.description,
        startedAt,
        stoppedAt,
      });
    }
    onClose();
  };

  const handleDeleteButtonClick = async () => {
    if (id === undefined || !window.confirm(t("confirmDelete"))) {
      return;
    }
    onClose();
    await deleteTimeEntry.mutateAsync({ id });
  };

  return (
    <Modal onClose={onClose} isOpen>
      <div className="flex items-stretch h-[30rem]">
        <form
          className="w-full"
          onSubmit={(event) => {
            void handleSubmit(handleSave)(event);
          }}
        >
          <header className="h-14 px-4 flex items-center border-b border-gray-300">
            <DialogTitle>
              {t(id === undefined ? "newTimeEntry" : "editTimeEntry")}
            </DialogTitle>
          </header>
          <div className="m-4 flex flex-col">
            <div className="mb-4">
              <div className="border text-sm border-gray-300 rounded-sm">
                <div className="mx-2 flex items-center border-b border-gray-300 py-1">
                  <div className="mr-2 shrink-0 border-r border-r-gray-300 px-2 pr-4">
                    {t("addTo")}
                  </div>
                  {runningTimeEntry.isLoading ? (
                    <div className="animate-pulse w-32 my-2 h-4 bg-gray-300 rounded-full" />
                  ) : (
                    <FolderSelect
                      folderId={watch("folderId")}
                      onSelect={(folderId) => {
                        setValue("folderId", folderId);
                      }}
                    />
                  )}
                </div>
                <input
                  type="text"
                  required
                  data-1p-ignore
                  data-lpignore
                  className="w-full text-sm rounded-sm bg-transparent py-5 px-6 outline-hidden placeholder-gray-400"
                  {...register("description")}
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>
              {errors.description?.message !== undefined && (
                <p role="alert" className="mt-2 text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm flex items-center">
                  <span className="shrink-0 mr-6 w-20">{t("startedAt")}</span>
                  <input
                    className="text-sm border flex-1 border-gray-300 rounded-sm bg-transparent p-3 outline-hidden placeholder-gray-400"
                    type="date"
                    required
                    {...register("startDate")}
                  />
                  <input
                    className="text-sm ml-4 flex-1 border border-gray-300 rounded-sm bg-transparent p-3 outline-hidden placeholder-gray-400"
                    type="time"
                    step="1"
                    required
                    {...register("startTime")}
                  />
                </label>
                {errors.startDate?.message !== undefined && (
                  <p role="alert" className="mt-2 text-red-500 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
                {errors.startTime?.message !== undefined && (
                  <p role="alert" className="mt-2 text-red-500 text-sm">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm flex items-center">
                  <span className="shrink-0 mr-6 w-20">{t("stoppedAt")}</span>
                  <input
                    className="text-sm border flex-1 border-gray-300 rounded-sm bg-transparent p-3 outline-hidden placeholder-gray-400"
                    type="date"
                    required
                    {...register("endDate")}
                  />
                  <input
                    className="text-sm ml-4 flex-1 border border-gray-300 rounded-sm bg-transparent p-3 outline-hidden placeholder-gray-400"
                    type="time"
                    required
                    step="1"
                    {...register("endTime")}
                  />
                </label>
                {errors.endDate?.message !== undefined && (
                  <p role="alert" className="mt-2 text-red-500 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
                {errors.endTime?.message !== undefined && (
                  <p role="alert" className="mt-2 text-red-500 text-sm">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex mt-4 justify-between w-full">
              <button
                type="submit"
                disabled={!isFormValid}
                className={submitButtonStyle({ disabled: !isFormValid })}
              >
                {t("save")}
              </button>
              {id !== undefined && (
                <Tooltip sideOffset={5} content={t("delete")}>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteButtonClick();
                    }}
                    className="p-2.5 cursor-pointer hover:bg-gray-200 text-red-400 rounded-sm inline-block"
                  >
                    <PiTrash className="text-xl" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </form>
        <div className="w-96 flex-col flex h-full">
          <TimeEntryModalCalendar
            id={id}
            folderId={watch("folderId")}
            description={watch("description")}
            startedAt={parseDateFromInput(
              watch("startDate"),
              watch("startTime"),
            )}
            stoppedAt={parseDateFromInput(watch("endDate"), watch("endTime"))}
          />
        </div>
      </div>
    </Modal>
  );
};
