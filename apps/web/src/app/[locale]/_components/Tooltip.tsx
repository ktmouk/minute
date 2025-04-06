import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

type Props = {
  children: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number | undefined;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  variant?: "default" | "coach";
};

const tooltipStyle = tv({
  base: "z-50 animate-fade-down px-3 py-1.5 text-xs",
  variants: {
    variant: {
      default: "bg-gray-700 text-white rounded-2xl",
      coach: "bg-white text-gray-600 rounded-sm drop-shadow-sm",
    },
  },
});

const arrowStyle = tv({
  variants: {
    variant: {
      default: "fill-gray-700",
      coach: "fill-white",
    },
  },
});

export const Tooltip = ({
  children,
  content,
  side,
  sideOffset,
  delayDuration = 700,
  disableHoverableContent = true,
  variant = "default",
}: Props) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root disableHoverableContent={disableHoverableContent}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side ?? "top"}
            className={tooltipStyle({ variant })}
            sideOffset={sideOffset ?? 0}
          >
            {content}
            <TooltipPrimitive.Arrow className={arrowStyle({ variant })} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
