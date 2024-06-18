import { omitBy } from "remeda";

export const omitUndefined = <T extends object>(object: T) => {
  return omitBy(object, (value: unknown) => value === undefined) as {
    [P in keyof T]: Exclude<T[P], undefined>;
  };
};
