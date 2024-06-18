import type { ReactNode } from "react";

export type Item<T extends Item<T>> = {
  open: boolean;
  children?: T[];
};

type Props<T> = {
  items: T[];
  depth?: number;
  children: (props: { item: T; depth: number }) => ReactNode;
};

export const Tree = <T extends Item<T>>({
  children,
  items,
  depth = 0,
}: Props<T>) => {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {children({ item, depth })}
          {item.open && item.children !== undefined && (
            <Tree depth={depth + 1} items={item.children}>
              {children}
            </Tree>
          )}
        </li>
      ))}
    </ul>
  );
};
