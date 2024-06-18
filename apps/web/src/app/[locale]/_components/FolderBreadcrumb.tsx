import type { ReactNode } from "react";
import { Fragment } from "react";
import { PiCaretRight } from "react-icons/pi";
import { tv } from "tailwind-variants";
import { useFolderBreadcrumb } from "../_hooks/useFolderBreadcrumb";

type Props = {
  folderId: string;
  caretColor?: "gray" | "white";
  fallback?: ReactNode;
};

const caretStyle = tv({
  variants: {
    caretColor: {
      gray: "text-gray-400",
      white: "text-white",
    },
  },
});

export const FolderBreadcrumb = ({
  folderId,
  caretColor = "gray",
  fallback,
}: Props) => {
  const folders = useFolderBreadcrumb({ folderId });

  return (
    <span className="inline-flex items-center gap-0.5">
      {folders[0] !== undefined
        ? folders.map((folder, index) => {
            return (
              folder !== undefined && (
                <Fragment key={index}>
                  {index > 0 ? (
                    <PiCaretRight
                      aria-hidden
                      size={16}
                      className={caretStyle({ caretColor })}
                    />
                  ) : undefined}
                  <span className="text-base">{folder.emoji}</span>
                  {index === folders.length - 1 && (
                    <span className="ml-1">{folder.name}</span>
                  )}
                </Fragment>
              )
            );
          })
        : fallback}
    </span>
  );
};
