import { fromS } from "hh-mm-ss";
import type {
  NameType,
  Payload,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { z } from "zod";

type Props = {
  label: string;
  payload: Payload<ValueType, NameType>[] | undefined;
};

const payloadSchema = z.array(
  // eslint-disable-next-line no-restricted-syntax
  z.object({
    name: z.string(),
    value: z.number(),
  }),
);

export const ChartToolip = ({ payload, label }: Props) => {
  return (
    <section className="text-xs bg-gray-600 text-white rounded p-3">
      <h4>{label}</h4>
      <ul className="text-xs flex flex-col gap-1 mt-2">
        {payloadSchema
          .parse(payload)
          .sort((a, b) => b.value - a.value)
          .map(({ name, value }) => (
            <li key={name}>
              <span>{name}: </span>
              {fromS(value, "hh:mm:ss")}
            </li>
          ))}
      </ul>
    </section>
  );
};
