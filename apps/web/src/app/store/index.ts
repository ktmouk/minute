import { atom } from "jotai";

export const totalDurationVisibleAtom = atom(false);

export const toastsAtom = atom<
  { message: string; id: string; open: boolean }[]
>([]);
