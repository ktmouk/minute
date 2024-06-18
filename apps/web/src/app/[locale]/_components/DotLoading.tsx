import { useTranslations } from "next-intl";
import * as R from "remeda";

export const DotLoading = () => {
  const t = useTranslations("components.DotLoading");

  return (
    <span className="flex gap-x-2" aria-live="off" role="status">
      <span className="sr-only">{t("loading")}</span>
      {R.times(3, (index) => (
        <span
          key={index}
          className="inline-block h-2 w-2 shrink-0 animate-blink rounded-full bg-green-500"
          style={{
            animationDelay: `${index * 0.2}s`,
            opacity: `${30 * index}%`,
          }}
        />
      ))}
    </span>
  );
};
