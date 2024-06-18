import { useDroppable } from "@dnd-kit/core";
import { tv } from "tailwind-variants";

type Props = {
  id: string;
  action: "before" | "after";
  parentId: string | null;
  order: number;
  disabled?: boolean;
};

const lineStyle = tv({
  base: "block border-b -mt-0.5 h-0.5 w-full bg-green-500",
  variants: {
    isOver: {
      true: "visible",
      false: "invisible",
    },
  },
});

export const FolderTreeItemDropLine = ({
  id,
  parentId,
  order,
  action,
  disabled = false,
}: Props) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `${action}:${id}`,
    disabled,
    data: { action, id, parentId, order },
  });

  return (
    <span
      ref={setNodeRef}
      className={lineStyle({
        isOver:
          isOver && active?.data.current?.["type"] === "folder" && !disabled,
      })}
    />
  );
};
