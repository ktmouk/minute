import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number | undefined;
  delayDuration?: number;
  disableHoverableContent?: boolean;
};

export const Tooltip = ({
  children,
  content,
  side,
  sideOffset,
  delayDuration = 700,
  disableHoverableContent = false,
}: Props) => {
  return (
    <TooltipPrimitive.Provider
      disableHoverableContent={disableHoverableContent}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Root disableHoverableContent>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side ?? "top"}
            className="pointer-events-none z-50 animate-fade-down rounded-2xl bg-gray-700 px-3 py-1.5 text-xs text-white"
            sideOffset={sideOffset ?? 0}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-700" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
