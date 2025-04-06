import { ListboxOption } from "@headlessui/react";
import type { ReactNode } from "react";
import * as R from "remeda";

const COLORS = [
  "#026773",
  "#e34b77",
  "#9c3e00",
  "#6e8c03",
  "#f24405",
  "#348888",
  "#486966",
  "#bd2a2e",
  "#3b3936",
  "#889c9b",
  "#f2b705",
  "#d955d0",
  "#b4cf66",
  "#919151",
  "#a67165",
] as const;

type Props = {
  children: (color: string) => ReactNode;
};

export const ColorOptionList = ({ children }: Props) => {
  return (
    <ul className="p-2 bg-white rounded-sm border border-gray-300 text-sm shadow-xs">
      {R.chunk(COLORS, 5).flatMap((colors) => (
        <li key={colors.join("-")} className="flex">
          {colors.map((color) => {
            return (
              <ListboxOption
                key={color}
                value={color}
                className="flex items-center cursor-pointer justify-center ui-active:bg-gray-200 rounded-sm p-1.5"
              >
                {children(color)}
              </ListboxOption>
            );
          })}
        </li>
      ))}
    </ul>
  );
};
