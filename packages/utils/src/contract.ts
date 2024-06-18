import type { ZodTypeAny } from "zod";
import { z } from "zod";

export const contract = <
  I extends ZodTypeAny,
  O extends ZodTypeAny,
  F extends (input: z.infer<I>) => z.infer<O>,
>(
  { input, output }: { input: I; output: O },
  implement: F,
) => {
  return z.function().args(input).returns(output).implement(implement);
};
