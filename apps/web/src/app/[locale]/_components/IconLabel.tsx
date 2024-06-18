import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  name: ReactNode;
};

export const IconLabel = ({ icon, name }: Props) => {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-base">{icon}</span>
      <span>{name}</span>
    </span>
  );
};
