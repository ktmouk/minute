import { PiCaretDown, PiCaretRight } from "react-icons/pi";

type Props = {
  isOpen: boolean;
};

export const TreeItemArrowIcon = ({ isOpen }: Props) => {
  return (
    <span className="mr-2 w-4 py-2">
      {isOpen ? <PiCaretDown size={16} /> : <PiCaretRight size={16} />}
    </span>
  );
};
