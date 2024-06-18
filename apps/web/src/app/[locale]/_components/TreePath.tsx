import type { ReactNode } from "react";
import * as R from "remeda";

type Props = {
  depth: number;
  children?: ReactNode;
};

export const TreePath = ({ depth, children }: Props) => {
  return (
    <span className="flex h-full items-center">
      {depth > 0 &&
        R.times(depth, (index) => (
          <span
            key={index}
            className="flex w-4 shrink-0 justify-center self-stretch before:inline-block before:w-px before:border-l before:border-gray-300"
          />
        ))}
      {children}
    </span>
  );
};
