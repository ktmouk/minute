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
      {isOpen && (
        <div className="w-screen h-screen bg-gray-800 opacity-20 z-40 fixed top-0 left-0" />
      )}
      <Dialog onClose={onClose} open={isOpen} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="drop-shadow-sm space-y-4 bg-white rounded">
            {children}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
