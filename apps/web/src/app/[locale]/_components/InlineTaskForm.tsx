import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { PiFile } from "react-icons/pi";
import { useOnClickOutside } from "usehooks-ts";
import { z } from "zod";

type Props = {
  onCancel: () => void;
  onSubmit: (value: { description: string }) => void;
  description: string;
  color: string;
};

const schema = z.strictObject({
  description: z.string().min(1),
});

export const InlineTaskForm = ({
  description,
  color,
  onSubmit,
  onCancel,
}: Props) => {
  const t = useTranslations("components.InlineTaskForm");
  const ref = useRef<HTMLFormElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isValid: isFormValid },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      description,
    },
  });

  const handleSave: SubmitHandler<z.infer<typeof schema>> = (data) => {
    if (!isFormValid) {
      onCancel();
      return;
    }
    onSubmit(data);
  };

  useOnClickOutside(ref as unknown as RefObject<HTMLElement>, () =>
    ref.current?.requestSubmit(),
  );

  return (
    <form
      ref={ref}
      className="mx-3 flex items-center border-gray-300 text-sm shadow-xs border rounded-sm"
      onSubmit={(event) => {
        void handleSubmit(handleSave)(event);
      }}
    >
      <PiFile size={20} className="mx-2 cursor-default" style={{ color }} />
      <input
        type="text"
        className="pr-2 py-1.5 flex-1 outline-hidden bg-transparent"
        placeholder={t("enterTaskName")}
        data-1p-ignore
        data-lpignore
        {...register("description")}
      />
    </form>
  );
};
