type Props = {
  emoji: string;
  name: string;
};

export const CategoryName = ({ emoji, name }: Props) => {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="text-base">{emoji}</span>
      <span className="ml-1">{name}</span>
    </span>
  );
};
