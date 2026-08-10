"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback, useMemo } from "react";
import { saveJournalEntry, deleteJournalEntry } from "@/server/actions/journal";
import { Loader2, Save, Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2, Heading3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/lib/utils";

interface JournalEditorProps {
    date: string; // YYYY-MM-DD
    initialContent?: Record<string, unknown>;
    hasExistingEntry: boolean;
}

const MenuBar = ({ editor }: { editor: Editor }) => {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!editor) return;

        const updateHandler = () => {
            forceUpdate({});
        };

        editor.on('selectionUpdate', updateHandler);
        editor.on('transaction', updateHandler);

        return () => {
            editor.off('selectionUpdate', updateHandler);
            editor.off('transaction', updateHandler);
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    const buttonClass = (isActive: boolean) =>
        `p-2 rounded hover:bg-zinc-100 transition-colors ${
            isActive ? "bg-zinc-200 text-zinc-900" : "text-zinc-600"
        }`;

    return (
        <div className="border border-zinc-200 rounded-lg p-2 mb-4 flex flex-wrap gap-1 bg-white sticky top-0 z-10">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive("bold"))}
                title="Bold (Cmd+B)">
                <Bold className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive("italic"))}
                title="Italic (Cmd+I)">
                <Italic className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive("strike"))}
                title="Strikethrough">
                <Strikethrough className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive("code"))}
                title="Code">
                <Code className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 1 }))}
                title="Heading 1">
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 2 }))}
                title="Heading 2">
                <Heading2 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 3 }))}
                title="Heading 3">
                <Heading3 className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive("bulletList"))}
                title="Bullet List">
                <List className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive("orderedList"))}
                title="Numbered List">
                <ListOrdered className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive("blockquote"))}
                title="Blockquote">
                <Quote className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-300 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={`${buttonClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Undo (Cmd+Z)">
                <Undo className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={`${buttonClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Redo (Cmd+Shift+Z)">
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
};

export function JournalEditor({ date, initialContent, hasExistingEntry }: JournalEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const router = useRouter();

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);

    // Calculate trade analytics associated with this journal day
    const tradesForDay = useMemo(() => {
        if (!trades) return [];
        return trades.filter((trade) => {
            const openMatches = trade.openDate && dayjs(trade.openDate).format("YYYY-MM-DD") === date;
            const closeMatches = trade.closeDate && dayjs(trade.closeDate).format("YYYY-MM-DD") === date;
            return openMatches || closeMatches;
        });
    }, [trades, date]);

    const openedCount = useMemo(() => {
        return tradesForDay.filter(t => t.openDate && dayjs(t.openDate).format("YYYY-MM-DD") === date).length;
    }, [tradesForDay, date]);

    const closedCount = useMemo(() => {
        return tradesForDay.filter(t => t.closeDate && dayjs(t.closeDate).format("YYYY-MM-DD") === date).length;
    }, [tradesForDay, date]);

    const realizedPnL = useMemo(() => {
        return tradesForDay.reduce((sum, t) => {
            if (t.closeDate && dayjs(t.closeDate).format("YYYY-MM-DD") === date) {
                return sum + (Number(t.result) || 0);
            }
            return sum;
        }, 0);
    }, [tradesForDay, date]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Write something...",
            }),
        ],
        content: initialContent || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-zinc prose-base max-w-none focus:outline-none min-h-[calc(100vh-300px)] text-[16px] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            },
            
        },
        onUpdate: () => {
            setHasUnsavedChanges(true);
        },
    });

    const handleSave = useCallback(async () => {
        if (!editor || !hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            const content = editor.getJSON();
            const result = await saveJournalEntry(date, content);
            
            if (result.success) {
                setHasUnsavedChanges(false);
                toast.success("Entry saved");
            } else {
                toast.error(result.error || "Failed to save entry");
            }
        } catch {
            toast.error("Failed to save entry");
        } finally {
            setIsSaving(false);
        }
    }, [editor, hasUnsavedChanges, date]);

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            const result = await deleteJournalEntry(date);
            if (result.success) {
                toast.success("Entry deleted");
                router.push("/private/journal");
            } else {
                toast.error(result.error || "Failed to delete entry");
            }
        } catch {
            toast.error("Failed to delete entry");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    }, [date, router]);

    // Prevent unsaved data loss on page unload / tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && editor && !editor.isEmpty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges, editor]);

    // Keyboard shortcut for save (Cmd/Ctrl + S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                if (editor && hasUnsavedChanges) {
                    handleSave();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [editor, hasUnsavedChanges, handleSave]);

    const handleClose = () => {
        if (hasUnsavedChanges && editor && !editor.isEmpty) {
            const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
            if (!confirmLeave) return;
        }
        router.push("/private/journal");
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <style>{`
                .tiptap p {
                    font-size: 1.05rem !important;
                    line-height: 1.625;
                    margin-bottom: 0.75rem;
                }
                .tiptap blockquote {
                    border-left: 4px solid #f97316; /* orange-500 */
                    background-color: #fafafa; /* zinc-50 */
                    padding: 0.75rem 1rem;
                    margin: 1.25rem 0;
                    font-style: italic;
                    color: #52525b; /* zinc-600 */
                    border-radius: 0 0.375rem 0.375rem 0;
                }
                .tiptap pre {
                    background-color: #f4f4f5; /* zinc-100 */
                    color: #27272a; /* zinc-800 */
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    padding: 0.75rem 1rem;
                    border-radius: 0.375rem;
                    margin: 1.25rem 0;
                    font-size: 0.875rem;
                    overflow-x: auto;
                }
                .tiptap code {
                    background-color: #f4f4f5; /* zinc-100 */
                    color: #e11d48; /* rose-600 */
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }
                .tiptap pre code {
                    background-color: transparent;
                    color: inherit;
                    padding: 0;
                    font-size: inherit;
                }
                .tiptap h1 {
                    font-size: 1.75rem !important;
                    font-weight: 700;
                    margin-top: 1.75rem;
                    margin-bottom: 0.75rem;
                    color: #18181b;
                }
                .tiptap h2 {
                    font-size: 1.4rem !important;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: #18181b;
                }
                .tiptap h3 {
                    font-size: 1.15rem !important;
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                    color: #18181b;
                }
            `}</style>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-zinc-800">
                    {dayjs(date).format("dddd, MMMM D, YYYY")}
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="text-zinc-500 hover:text-zinc-800"
                    >
                        Close
                    </Button>
                    {hasExistingEntry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={isDeleting || isSaving}
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    )}
                    {hasUnsavedChanges && (
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            size="sm"
                            className="gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Day Trade Activity Card */}
            {tradesForDay.length > 0 && (
                <div className="mb-6 p-4 border border-zinc-200 bg-zinc-50/50 rounded-lg flex flex-col gap-3 select-none">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                Day Trade Activity
                            </h4>
                            <p className="text-sm text-zinc-600 font-medium">
                                You opened <span className="font-semibold text-zinc-800">{openedCount}</span> and closed <span className="font-semibold text-zinc-800">{closedCount}</span> positions on this day.
                            </p>
                        </div>
                        {closedCount > 0 && (
                            <div className="text-left md:text-right">
                                <span className="text-xs text-zinc-400 block font-medium">Realized P&L</span>
                                <span className={`text-lg font-bold ${realizedPnL >= 0 ? "text-buy" : "text-sell"}`}>
                                    {realizedPnL >= 0 ? "+" : ""}${realizedPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3">
                        {tradesForDay.map(t => {
                            const isClosedToday = t.closeDate && dayjs(t.closeDate).format("YYYY-MM-DD") === date;
                            const typeLabel = isClosedToday ? "Closed" : "Opened";
                            const pnlText = isClosedToday ? ` (${Number(t.result) >= 0 ? "+" : ""}${Number(t.result).toFixed(0)})` : "";
                            return (
                                <span 
                                    key={t.id} 
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border",
                                        isClosedToday 
                                            ? Number(t.result) >= 0 
                                                ? "bg-green-50 border-green-200 text-green-700" 
                                                : "bg-red-50 border-red-200 text-red-700"
                                            : "bg-blue-50 border-blue-200 text-blue-700"
                                    )}
                                >
                                    {t.symbolName} • {typeLabel}{pnlText}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
            <MenuBar editor={editor} />
           
            {editor && (
                <BubbleMenu editor={editor}>
                    <div className="flex gap-1.5 bg-zinc-900 border border-zinc-800 text-white rounded-lg p-1.5 shadow-lg items-center select-none">
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={cn(
                                "p-1.5 rounded transition-colors text-xs font-semibold hover:bg-zinc-800",
                                editor.isActive("bold") ? "text-orange-400 bg-zinc-800" : "text-zinc-300"
                            )}
                            title="Bold"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={cn(
                                "p-1.5 rounded transition-colors text-xs italic hover:bg-zinc-800",
                                editor.isActive("italic") ? "text-orange-400 bg-zinc-800" : "text-zinc-300"
                            )}
                            title="Italic"
                        >
                            I
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={cn(
                                "p-1.5 rounded transition-colors text-xs line-through hover:bg-zinc-800",
                                editor.isActive("strike") ? "text-orange-400 bg-zinc-800" : "text-zinc-300"
                            )}
                            title="Strikethrough"
                        >
                            S
                        </button>
                        <div className="w-px h-4 bg-zinc-800 mx-1" />
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={cn(
                                "p-1.5 rounded transition-colors text-xs font-mono hover:bg-zinc-800",
                                editor.isActive("code") ? "text-orange-400 bg-zinc-800" : "text-zinc-300"
                            )}
                            title="Code"
                        >
                            Code
                        </button>
                    </div>
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />
            
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <div className="sm:max-w-[380px] flex flex-col justify-between min-h-[120px]">
                        <DialogHeader className="mb-2">
                            <DialogTitle className="text-lg font-semibold text-zinc-800">
                                Delete Journal Entry
                            </DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-zinc-600">
                            Are you sure you want to delete the journal entry for this day? This action cannot be undone.
                        </p>
                        <div className="flex gap-4 justify-end mt-6">
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
