import { useTranslations } from "next-intl";
import { PiPlus } from "react-icons/pi";

type Props = {
  onClick: () => void;
};

export const NewChartButton = ({ onClick }: Props) => {
  const t = useTranslations("components.NewChartButton");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center p-2 pr-4 rounded text-sm gap-2 hover:bg-gray-200"
    >
      <PiPlus className="text-base" />
      {t("addNewChart")}
    </button>
  );
};
