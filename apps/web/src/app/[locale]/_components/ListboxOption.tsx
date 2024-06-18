"use client";

import { ListboxOption as ListboxOptionPrimitive } from "@headlessui/react";
import type { ReactNode } from "react";

type Props<T> = {
  value: T;
  children: ReactNode;
};

export const ListboxOption = <T,>({ value, children }: Props<T>) => {
  return (
    <ListboxOptionPrimitive
      value={value}
      className="hover:bg-gray-200 cursor-pointer px-2 py-2"
    >
      {children}
    </ListboxOptionPrimitive>
  );
};
