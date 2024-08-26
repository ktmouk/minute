import { Listbox, ListboxButton, ListboxOptions } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CategoryName } from "./CategoryName";
import { CategorySelectItem } from "./CategorySelectItem";
import { trpc } from "./TrpcProvider";

type Props = {
  categoryIds: string[];
  onSelect: (categoryIds: string[]) => void;
};

export const MultipleCategorySelect = ({ categoryIds, onSelect }: Props) => {
  const t = useTranslations("components.MultipleCategorySelect");
  const categories = trpc.categories.getAllCategories.useQuery();

  const selectedCategories = useMemo(() => {
    return categories.data?.filter(({ id }) => categoryIds.includes(id)) ?? [];
  }, [categories, categoryIds]);

  return (
    <Listbox value={categoryIds} onChange={onSelect} multiple>
      <div className="relative w-full">
        <ListboxButton className="inline-flex flex-wrap w-full rounded gap-1 outline-none p-1 hover:bg-gray-200">
          {selectedCategories.length > 0 ? (
            selectedCategories.map(({ id, name, emoji }) => (
              <span
                key={id}
                className="bg-gray-500 rounded-full px-2 text-white"
              >
                <CategoryName name={name} emoji={emoji} />
              </span>
            ))
          ) : (
            <p className="p-0.5 px-2 text-gray-500">{t("selectCategory")}</p>
          )}
        </ListboxButton>
        <ListboxOptions className="absolute z-10 w-full outline-none mt-1 animate-fade-down">
          <div className="w-72 rounded border border-gray-300 bg-white text-sm drop-shadow-sm">
            <h3 className="border-b border-gray-300 px-4 py-2">
              {t("selectCategory")}
            </h3>
            <ul className="m-2 ">
              {categories.data?.map((category) => (
                <CategorySelectItem
                  key={category.id}
                  id={category.id}
                  color={category.color}
                  emoji={category.emoji}
                  name={category.name}
                  selectedCategoryIds={categoryIds}
                />
              ))}
            </ul>
          </div>
        </ListboxOptions>
      </div>
    </Listbox>
  );
};
