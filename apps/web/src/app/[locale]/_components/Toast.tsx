"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { useAtom } from "jotai";
import * as React from "react";
import { PiCheckCircleBold } from "react-icons/pi";
import { toastsAtom } from "../../store";

export const Toast = () => {
  const [toasts, setToasts] = useAtom(toastsAtom);

  const handleOpenChange = (open: boolean, id: string) => {
    if (open) return;

    setToasts((prev) =>
      prev.map((value) =>
        value.id === id ? { ...value, open: false } : value,
      ),
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 200);
  };

  return (
    <ToastPrimitive.Provider>
      {toasts.map(({ open, message, id }) => {
        return (
          <ToastPrimitive.Root
            key={id}
            className="rounded-sm py-3 px-4 drop-shadow-sm text-center text-sm bg-green-500 mb-4 text-white data-[state=open]:animate-toast-up data-[state=closed]:animate-toast-down"
            open={open}
            onOpenChange={(open) => {
              handleOpenChange(open, id);
            }}
          >
            <ToastPrimitive.Title className="flex items-center gap-2">
              <PiCheckCircleBold className="text-lg" />
              {message}
            </ToastPrimitive.Title>
          </ToastPrimitive.Root>
        );
      })}

      <ToastPrimitive.Viewport className="fixed bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 m-0 list-none outline-hidden" />
    </ToastPrimitive.Provider>
  );
};
