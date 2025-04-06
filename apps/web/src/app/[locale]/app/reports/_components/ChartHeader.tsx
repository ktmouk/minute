import { useTranslations } from "next-intl";
import { PiNotePencil } from "react-icons/pi";
import { Tooltip } from "../../../_components/Tooltip";

type Props = {
  name: string;
  onEditClick: () => void;
};

export const ChartHeader = ({ name, onEditClick }: Props) => {
  const t = useTranslations("components.ChartHeader");

  return (
    <header className="flex justify-between items-center">
      <h3 className="flex ml-3 items-center text-base">{name}</h3>
      <Tooltip sideOffset={5} content={t("edit")}>
        <button
          type="button"
          onClick={onEditClick}
          className="hover:bg-gray-200 p-2 rounded-sm"
        >
          <PiNotePencil className="text-xl" />
        </button>
      </Tooltip>
    </header>
  );
};
