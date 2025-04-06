"use client";

import { ListboxButton as ListboxButtonPrimitive } from "@headlessui/react";
import type { ReactNode } from "react";
import { PiCaretDownFill } from "react-icons/pi";

type Props = {
  label: ReactNode;
};

export const ListboxButton = ({ label }: Props) => {
  return (
    <ListboxButtonPrimitive className="flex gap-2 items-center border rounded-sm border-gray-300 py-2 px-3 text-sm">
      {label}
      <PiCaretDownFill />
    </ListboxButtonPrimitive>
  );
};
