"use client";

import { ListboxOptions as ListboxOptionsPrimitive } from "@headlessui/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const ListboxOptions = ({ children }: Props) => {
  return (
    <div className="relative">
      <ListboxOptionsPrimitive className="absolute w-full bg-white drop-shadow-sm text-sm border border-gray-300 mt-2 rounded overflow-hidden">
        {children}
      </ListboxOptionsPrimitive>
    </div>
  );
};
