"use client";

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Trash2 } from "lucide-react";

type DeleteTradeDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
    symbolName?: string;
    onConfirm: () => Promise<void> | void;
};

export default function DeleteTradeDialog({
    isOpen,
    onOpenChange,
    message,
    symbolName,
    onConfirm,
}: DeleteTradeDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 flex items-center justify-center shrink-0">
                            <Trash2 className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    Delete Trade
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {message || `Are you sure you want to delete trade record for ${symbolName ? `"${symbolName}"` : "this item"}?`}
                    </p>

                    <div className="flex items-center justify-end gap-2.5 pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer">
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            type="button"
                            onClick={async () => {
                                await onConfirm();
                                onOpenChange(false);
                            }}
                            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
