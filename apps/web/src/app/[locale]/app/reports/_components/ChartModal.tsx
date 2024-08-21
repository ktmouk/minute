import { DialogTitle } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { PiTrash } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { z } from "zod";
import { Modal } from "../../../_components/Modal";
import { MultipleCategorySelect } from "../../../_components/MultipleCategorySelect";
import { MultipleFolderSelect } from "../../../_components/MultipleFolderSelect";
import { Tooltip } from "../../../_components/Tooltip";
import { trpc } from "../../../_components/TrpcProvider";
import { useToast } from "../../../_hooks/useToast";

type Props = {
  onClose: () => void;
  id?: string;
  name?: string;
  folderIds?: string[];
  categoryIds?: string[];
};

const submitButtonStyle = tv({
  base: "py-2.5 px-4 bg-green-500 text-white text-sm rounded inline-block",
  variants: {
    disabled: {
      true: "bg-gray-400",
    },
  },
});

export const ChartModal = ({
  onClose,
  id,
  name,
  folderIds,
  categoryIds,
}: Props) => {
  const utils = trpc.useUtils();
  const { notify } = useToast();

  const ct = useTranslations("common");
  const t = useTranslations("components.ChartModal");

  const createChart = trpc.charts.createChart.useMutation({
    onSuccess: async () => {
      notify(t("chartCreated"));
      await utils.charts.invalidate();
    },
  });

  const updateChart = trpc.charts.updateChart.useMutation({
    onSuccess: async () => {
      notify(t("chartUpdated"));
      await utils.charts.invalidate();
    },
  });

  const deleteChart = trpc.charts.deleteChart.useMutation({
    onSuccess: async () => {
      notify(t("chartDeleted"));
      await utils.charts.invalidate();
    },
  });

  const schema = useMemo(
    () =>
      z.strictObject({
        name: z
          .string()
          .min(1, { message: ct("validation.required", { label: t("name") }) }),
        folderIds: z.array(z.string().uuid()),
        categoryIds: z.array(z.string().uuid()),
      }),
    [ct, t],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid: isFormValid },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      name: name ?? t("defaultChartName"),
      folderIds: folderIds ?? [],
      categoryIds: categoryIds ?? [],
    },
  });

  const handleSave: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    if (id === undefined) {
      await createChart.mutateAsync({
        name: data.name,
        folderIds: data.folderIds,
        categoryIds: data.categoryIds,
      });
    } else {
      await updateChart.mutateAsync({
        id,
        name: data.name,
        folderIds: data.folderIds,
        categoryIds: data.categoryIds,
      });
    }
    onClose();
  };

  const handleDeleteButtonClick = async () => {
    if (id === undefined || !window.confirm(t("confirmDelete"))) {
      return;
    }
    onClose();
    await deleteChart.mutateAsync({ id });
  };

  return (
    <Modal onClose={onClose} isOpen>
      <form
        className="w-[36rem]"
        onSubmit={(event) => {
          void handleSubmit(handleSave)(event);
        }}
      >
        <header className="p-4 border-b border-gray-300">
          <DialogTitle>
            {t(id === undefined ? "newChart" : "editChart")}
          </DialogTitle>
        </header>
        <div className="m-4 flex flex-col">
          <label className="flex w-full flex-col flex-1 gap-2">
            <span className="text-sm">{t("name")}</span>
            <input
              type="text"
              data-1p-ignore
              data-lpignore
              className="border flex-1 border-gray-300 rounded text-sm p-3"
              {...register("name")}
            />
          </label>
          {errors.name?.message !== undefined && (
            <p role="alert" className="mt-2 text-red-500 text-sm">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="gap-4 mx-4 flex flex-col">
          <label className="flex w-full flex-col flex-1 gap-2">
            <span className="text-sm">
              {t("folders")} {t("multiple")}
            </span>
            <div className="border text-sm border-gray-300 rounded">
              <div className="flex items-center border-gray-300 p-1">
                <MultipleFolderSelect
                  folderIds={watch("folderIds")}
                  onSelect={(folderIds) => {
                    setValue("folderIds", folderIds, { shouldValidate: true });
                  }}
                />
              </div>
            </div>
          </label>
          <label className="flex w-full flex-col flex-1 gap-2">
            <span className="text-sm">
              {t("categories")} {t("multiple")}
            </span>
            <div className="border text-sm border-gray-300 rounded">
              <div className="flex items-center border-gray-300 p-1">
                <MultipleCategorySelect
                  categoryIds={watch("categoryIds")}
                  onSelect={(categoryId) => {
                    setValue("categoryIds", categoryId, {
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            </div>
          </label>
          <div className="flex mt-2 mb-4 justify-between w-full">
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
                  className="p-2.5 hover:bg-gray-200 text-red-400 rounded inline-block"
                  onClick={() => {
                    void handleDeleteButtonClick();
                  }}
                >
                  <PiTrash className="text-xl" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
