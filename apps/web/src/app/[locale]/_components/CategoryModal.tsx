import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  DialogTitle,
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOptions,
} from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { PiSquaresFourLight, PiTrash } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { z } from "zod";
import { useToast } from "../_hooks/useToast";
import { ColorOptionList } from "./ColorOptionList";
import { Modal } from "./Modal";
import { MultipleFolderSelect } from "./MultipleFolderSelect";
import { Tooltip } from "./Tooltip";
import { trpc } from "./TrpcProvider";

type Props = {
  onClose: () => void;
  id?: string;
  name?: string;
  emoji?: string;
  color?: string;
  folderIds?: string[];
};

const submitButtonStyle = tv({
  base: "py-2.5 px-4 bg-green-500 text-white text-sm rounded inline-block",
  variants: {
    disabled: {
      true: "bg-gray-400",
    },
  },
});

export const CategoryModal = ({
  onClose,
  emoji,
  id,
  name,
  color,
  folderIds,
}: Props) => {
  const utils = trpc.useUtils();
  const { notify } = useToast();

  const ct = useTranslations("common");
  const t = useTranslations("components.CategoryModal");

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const createCategory = trpc.categories.createCategory.useMutation({
    onSuccess: async () => {
      notify(t("categoryCreated"));
      await utils.categories.invalidate();
    },
  });

  const updateCategory = trpc.categories.updateCategory.useMutation({
    onSuccess: async () => {
      notify(t("categoryUpdated"));
      await utils.categories.invalidate();
    },
  });

  const deleteCategory = trpc.categories.deleteCategory.useMutation({
    onSuccess: async () => {
      notify(t("categoryDeleted"));
      await utils.categories.invalidate();
    },
  });

  const schema = useMemo(
    () =>
      z.strictObject({
        name: z
          .string()
          .min(1, { message: ct("validation.required", { label: t("name") }) }),
        emoji: z.string().min(1, {
          message: ct("validation.required", { label: t("emoji") }),
        }),
        color: z
          .string()
          .min(1, {
            message: ct("validation.required", { label: t("color") }),
          })
          .regex(/^#[0-9a-f]{6}$/, {
            message: ct("validation.invalidFormat", { label: t("color") }),
          }),
        folderIds: z.array(z.string().uuid()).min(1, {
          message: ct("validation.minSelect", {
            label: t("folders"),
            min: 1,
          }),
        }),
      }),
    [ct, t],
  );

  const handleEmojiSelect = ({ native }: { native: string }) => {
    setValue("emoji", native, { shouldValidate: true });
    setIsEmojiPickerOpen(false);
  };

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
      name: name ?? t("defaultCategoryName"),
      folderIds: folderIds ?? [],
      emoji: emoji ?? "😀",
      color: color ?? "#026773",
    },
  });

  const handleSave: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    if (id === undefined) {
      await createCategory.mutateAsync({
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        folderIds: data.folderIds,
      });
    } else {
      await updateCategory.mutateAsync({
        id,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        folderIds: data.folderIds,
      });
    }
    onClose();
  };

  const handleDeleteButtonClick = async () => {
    if (id === undefined || !window.confirm(t("confirmDelete"))) {
      return;
    }
    onClose();
    await deleteCategory.mutateAsync({ id });
  };

  return (
    <Modal onClose={onClose} isOpen>
      <form
        className="w-full"
        onSubmit={(event) => {
          void handleSubmit(handleSave)(event);
        }}
      >
        <header className="p-4 border-b border-gray-300">
          <DialogTitle>
            {t(id === undefined ? "newCategory" : "editCategory")}
          </DialogTitle>
        </header>
        <div className="m-4 flex flex-col">
          <Field className="flex w-full flex-col flex-1 gap-2">
            <Label className="text-sm">{t("color")}</Label>
            <div className="border border-gray-300 rounded overflow-hidden p-1">
              <Listbox
                value={watch("color")}
                onChange={(color) => {
                  setValue("color", color, { shouldValidate: true });
                }}
              >
                <ListboxButton className="py-1.5 rounded flex items-center gap-2 text-left px-2 h-full w-full text-sm hover:bg-gray-200 border-gray-300">
                  <PiSquaresFourLight
                    size={20}
                    style={{ color: watch("color") }}
                  />
                  {watch("color")}
                </ListboxButton>
                <ListboxOptions className="flex outline-none absolute mt-2 animate-fade-down">
                  <ColorOptionList>
                    {(color) => (
                      <PiSquaresFourLight size={20} style={{ color }} />
                    )}
                  </ColorOptionList>
                </ListboxOptions>
              </Listbox>
            </div>
          </Field>
        </div>
        <div className="m-4 flex flex-col">
          <label className="flex w-full flex-col flex-1 gap-2">
            <span className="text-sm">{t("emoji")}</span>
            <div className="border border-gray-300 rounded overflow-hidden p-1">
              <button
                type="button"
                className="py-1 rounded text-left px-3 h-full w-full text-base hover:bg-gray-200 border-gray-300"
                onClick={() => {
                  setIsEmojiPickerOpen(true);
                }}
              >
                {watch("emoji")}
              </button>
              {isEmojiPickerOpen && (
                <div className="absolute mt-2 z-20">
                  <Picker
                    data={data}
                    theme="light"
                    onClickOutside={() => {
                      setIsEmojiPickerOpen(false);
                    }}
                    emojiButtonRadius="0.25rem"
                    previewPosition="none"
                    onEmojiSelect={handleEmojiSelect}
                    emojiSize={18}
                  />
                </div>
              )}
            </div>
          </label>
        </div>
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
        <div className="m-4 flex flex-col">
          <label className="flex w-full flex-col flex-1 gap-2">
            <span className="text-sm">
              {t("folders")}
              {t("multiple")}
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
          {errors.folderIds?.message !== undefined && (
            <p role="alert" className="mt-2 text-red-500 text-sm">
              {errors.folderIds.message}
            </p>
          )}
          <div className="flex mt-6 justify-between w-full">
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
