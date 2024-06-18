import { useAtom } from "jotai";
import { useCallback } from "react";
import { toastsAtom } from "../../store";

export const useToast = () => {
  const [toast, setToast] = useAtom(toastsAtom);

  const notify = useCallback(
    (message: string) => {
      setToast([
        ...toast,
        { message, id: Math.random().toString(32), open: true },
      ]);
    },
    [toast, setToast],
  );

  return { notify };
};
