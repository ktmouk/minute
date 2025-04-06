import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { useRef, useState } from "react";
import { PiFolder } from "react-icons/pi";
import { useOnClickOutside } from "usehooks-ts";
import { ColorOptionList } from "./ColorOptionList";
import { Tooltip } from "./Tooltip";

type Props = {
  onCancel: () => void;
  onSubmit: (value: { color: string; emoji: string; name: string }) => void;
  defaultName?: string;
  defaultEmoji?: string;
  defaultColor?: string;
};

export const InlineFolderForm = ({
  defaultName = "",
  defaultEmoji = "😃",
  defaultColor = "#026773",
  onSubmit,
  onCancel,
}: Props) => {
  const t = useTranslations("components.InlineFolderForm");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const ref = useRef(null);
  const [name, setName] = useState(defaultName);
  const [color, setColor] = useState(defaultColor);
  const [emoji, setEmoji] = useState(defaultEmoji);

  const handleEmojiSelect = ({ native }: { native: string }) => {
    setEmoji(native);
    setIsEmojiPickerOpen(false);
  };

  const handleSubmit = () => {
    if (name === "") {
      onCancel();
      return;
    }
    onSubmit({ color, emoji, name });
  };

  useOnClickOutside(ref as unknown as RefObject<HTMLElement>, handleSubmit);

  return (
    <form
      ref={ref}
      className="mx-3 flex border-gray-300 text-sm shadow-xs border rounded-sm"
      onSubmit={(event) => {
        handleSubmit();
        event.preventDefault();
      }}
    >
      <div className="relative">
        <Listbox
          value={color}
          onChange={(color) => {
            setColor(color);
          }}
        >
          <Tooltip sideOffset={3} side="bottom" content={t("changeColor")}>
            <ListboxButton
              style={{ color }}
              className="py-1 px-1.5 h-full hover:bg-gray-200 border-r border-gray-300"
            >
              <PiFolder size={20} />
            </ListboxButton>
          </Tooltip>

          <ListboxOptions className="flex outline-hidden absolute mt-2 animate-fade-down">
            <ColorOptionList>
              {(color) => <PiFolder size={20} style={{ color }} />}
            </ColorOptionList>
          </ListboxOptions>
        </Listbox>
      </div>
      <div>
        <Tooltip
          disableHoverableContent={isEmojiPickerOpen}
          sideOffset={3}
          side="bottom"
          content={t("changeEmoji")}
        >
          <button
            type="button"
            className="py-1 cursor-pointer px-2 h-full text-base hover:bg-gray-200 border-r border-gray-300"
            onClick={() => {
              setIsEmojiPickerOpen(true);
            }}
          >
            {emoji}
          </button>
        </Tooltip>
        {isEmojiPickerOpen && (
          <div className="absolute mt-2 z-10">
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
      <input
        type="text"
        className="px-2 flex-1 outline-hidden bg-transparent"
        placeholder={t("enterFolderName")}
        value={name}
        data-1p-ignore
        data-lpignore
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
    </form>
  );
};
