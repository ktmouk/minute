import { Dialog, DialogPanel } from "@headlessui/react";
import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
};

export const Modal = ({ isOpen, onClose, children }: Props) => {
  return (
    <>
      <Dialog onClose={onClose} open={isOpen} className="relative z-40">
        {isOpen && <div className="fixed inset-0 bg-gray-800 opacity-20" />}
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="drop-shadow-sm space-y-4 bg-white rounded">
            {children}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
