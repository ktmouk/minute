import { useDraggable } from "@dnd-kit/core";
import { tv } from "tailwind-variants";
import { CalendarEvent } from "./CalendarEvent";

export type Props = {
  id: string;
  emoji: string;
  color: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isDragging: boolean;
  onClick: () => void;
};

const containerStyle = tv({
  variants: {
    isDragging: {
      true: "opacity-20",
    },
  },
});

export const CalendarDraggableEvent = ({
  id,
  emoji,
  title,
  color,
  startDate,
  endDate,
  isDragging,
  onClick,
}: Props) => {
  const { setNodeRef, listeners, attributes } = useDraggable({
    id,
    data: { id, emoji, title, color, startDate, endDate },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={containerStyle({ isDragging })}
    >
      <button type="button" className="block" onClick={onClick}>
        <CalendarEvent
          emoji={emoji}
          title={title}
          color={color}
          startDate={startDate}
          endDate={endDate}
        />
      </button>
    </div>
  );
};
