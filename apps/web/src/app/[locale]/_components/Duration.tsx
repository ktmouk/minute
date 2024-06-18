import { fromS } from "hh-mm-ss";
import { useDuration } from "../_hooks/useDuration";

export type Props = {
  startedAt?: Date | undefined;
  stoppedAt?: Date | undefined;
};

export const Duration = ({ startedAt, stoppedAt }: Props) => {
  const duration = useDuration(startedAt, stoppedAt);
  return <span className="font-mono">{fromS(duration, "hh:mm:ss")}</span>;
};
