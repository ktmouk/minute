import { ListboxOption } from "@headlessui/react";
import { PiCheckBold, PiFolder } from "react-icons/pi";

type Props = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  selectedCategoryIds: string[];
};

export const CategorySelectItem = ({
  id,
  name,
  emoji,
  color,
  selectedCategoryIds,
}: Props) => {
  return (
    <li>
      <ListboxOption
        className="block cursor-pointer rounded w-full px-2 text-sm ui-active:bg-gray-200"
        value={id}
      >
        <span className="flex w-full py-1 min-w-0 items-center">
          <span style={{ color }}>
            <PiFolder size={20} className="mr-2" />
          </span>
          <span className="mr-1.5 shrink-0 text-base">{emoji}</span>
          <span className="truncate flex-1">{name}</span>
          {selectedCategoryIds.includes(id) && <PiCheckBold className="ml-2" />}
        </span>
      </ListboxOption>
    </li>
  );
};
