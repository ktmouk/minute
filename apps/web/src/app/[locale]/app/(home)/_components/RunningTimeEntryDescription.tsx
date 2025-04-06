import type { UseComboboxPropGetters } from "downshift";
import { useTranslations } from "next-intl";
import type { FocusEventHandler } from "react";
import { useState } from "react";
import { useRoundRobin } from "../_hooks/useRoundRobin";

const FOCUSED_PLACEHODLERS = [
  "placeholder.focused.0",
  "placeholder.focused.1",
  "placeholder.focused.2",
] as const;

type Props<Item> = {
  isLoading: boolean;
  inputProps: ReturnType<UseComboboxPropGetters<Item>["getInputProps"]>;
};

export const RunningTimeEntryDescription = <Item,>({
  isLoading,
  inputProps,
}: Props<Item>) => {
  const t = useTranslations("components.RunningTimeEntryDescription");
  const [isFocused, setIsFocused] = useState(false);
  const [focusedPlaceholder, nextFocusedPlaceholder] = useRoundRobin(
    FOCUSED_PLACEHODLERS,
    -1,
  );

  const handleFocus = () => {
    setIsFocused(true);
    nextFocusedPlaceholder();
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    setIsFocused(false);
    inputProps.onBlur?.(event);
  };

  return (
    <input
      {...inputProps}
      placeholder={
        isLoading
          ? undefined
          : t(
              isFocused && focusedPlaceholder !== undefined
                ? focusedPlaceholder
                : "placeholder.unfocused",
            )
      }
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={isLoading}
      required
      aria-label={t("description")}
      className="m-2 w-full rounded-sm bg-transparent p-4 text-base outline-hidden placeholder:text-gray-400"
      type="text"
    />
  );
};
