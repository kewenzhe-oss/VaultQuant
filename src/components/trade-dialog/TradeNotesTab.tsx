"use client";

import { useState, useEffect } from "react";
import { Trades } from "@/types";
import { parseTradeNotes, TradeNote } from "@/lib/tradeNotes";
import { updateTradeNotes } from "@/server/actions/trades";
import { useAppDispatch } from "@/redux/store";
import { updateTradeInList } from "@/redux/slices/tradeRecordsSlice";
import { updateTradeInFilteredList } from "@/redux/slices/historyPageSlice";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { Plus, Trash2, Edit2, Check, X, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

interface TradeNotesTabProps {
    existingTrade: Trades;
    onNotesChange?: (notesJson: string) => void;
}

const CATEGORY_STYLES = {
    thesis: "bg-blue-50 text-blue-700 border-blue-200",
    management: "bg-purple-50 text-purple-700 border-purple-200",
    execution: "bg-orange-50 text-orange-700 border-orange-200",
    review: "bg-emerald-50 text-emerald-700 border-emerald-200",
    general: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

const CATEGORY_LABELS = {
    thesis: "Thesis",
    management: "Management",
    execution: "Execution",
    review: "Review",
    general: "General",
};

export const TradeNotesTab = ({ existingTrade, onNotesChange }: TradeNotesTabProps) => {
    const dispatch = useAppDispatch();
    const [notes, setNotes] = useState<TradeNote[]>([]);
    const [newNoteText, setNewNoteText] = useState("");
    const [newNoteCategory, setNewNoteCategory] = useState<TradeNote["category"]>("general");
    const [isSaving, setIsSaving] = useState(false);
    
    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");
    const [editingCategory, setEditingCategory] = useState<TradeNote["category"]>("general");

    useEffect(() => {
        setNotes(parseTradeNotes(existingTrade.notes, existingTrade.openDate, existingTrade.id));
    }, [existingTrade.notes, existingTrade.openDate, existingTrade.id]);

    const handleSaveNotes = async (updatedNotes: TradeNote[]) => {
        setIsSaving(true);
        try {
            const notesJson = JSON.stringify(updatedNotes);
            const result = await updateTradeNotes(existingTrade.id, notesJson);
            
            if (result.success) {
                // Update local state
                setNotes(updatedNotes);
                
                // Update Redux state
                dispatch(updateTradeInList({
                    ...existingTrade,
                    notes: notesJson
                }));
                dispatch(updateTradeInFilteredList({
                    ...existingTrade,
                    notes: notesJson
                }));
                
                // Synchronize parent form state
                if (onNotesChange) {
                    onNotesChange(notesJson);
                }
            } else {
                toast.error(result.error || "Failed to save note changes");
            }
        } catch {
            toast.error("Failed to save note changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNote = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (!newNoteText.trim()) return;

        const newNote: TradeNote = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            text: newNoteText.trim(),
            category: newNoteCategory,
        };

        const updatedNotes = [newNote, ...notes]; // Add newest note on top
        await handleSaveNotes(updatedNotes);
        
        // Reset inputs on success
        setNewNoteText("");
        setNewNoteCategory("general");
        toast.success("Note added successfully");
    };

    const handleDeleteNote = async (id: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        
        const updatedNotes = notes.filter(n => n.id !== id);
        await handleSaveNotes(updatedNotes);
        toast.success("Note deleted");
    };

    const startEditing = (note: TradeNote) => {
        setEditingId(note.id);
        setEditingText(note.text);
        setEditingCategory(note.category || "general");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingText("");
    };

    const handleSaveEdit = async (id: string) => {
        if (!editingText.trim()) return;

        const updatedNotes = notes.map(n => {
            if (n.id === id) {
                return {
                    id: n.id,
                    createdAt: n.createdAt,
                    text: editingText.trim(),
                    category: editingCategory,
                    updatedAt: new Date().toISOString(),
                };
            }
            return n;
        });

        await handleSaveNotes(updatedNotes);
        setEditingId(null);
        setEditingText("");
        toast.success("Note updated");
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Trade Info Summary header */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex justify-between items-center text-xs">
                <div>
                    <span className="font-semibold text-zinc-700">Trade: </span>
                    <span className="uppercase font-medium text-zinc-600">{existingTrade.symbolName}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase ${
                        existingTrade.positionType === "sell" ? "bg-sell" : "bg-buy"
                    }`}>
                        {existingTrade.positionType === "buy" ? "Long" : "Short"}
                    </span>
                </div>
                <div className="text-zinc-500">
                    Opened {dayjs(existingTrade.openDate).format("DD MMM YYYY")}
                </div>
            </div>

            {/* Add Note Form */}
            <div className="border border-zinc-200 rounded-lg p-4 bg-white flex flex-col gap-3">
                <div>
                    <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Add Trade Update</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                        Trade-specific notes only. For daily market reflection, use the Daily Journal.
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <div className="flex flex-col flex-1 gap-1">
                        <textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Thesis reasoning, scale in/out, execution speed, post-trade review..."
                            rows={3}
                            className="w-full text-sm outline-none rounded-md border border-zinc-200 px-3 py-2 resize-none focus:border-zinc-400 transition-colors"
                        />
                    </div>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-zinc-600">Category:</label>
                        <select
                            value={newNoteCategory}
                            onChange={(e) => setNewNoteCategory(e.target.value as TradeNote["category"])}
                            className="text-xs rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-zinc-800 outline-none focus:border-zinc-400 transition-colors"
                        >
                            <option value="general">General</option>
                            <option value="thesis">Thesis</option>
                            <option value="management">Management</option>
                            <option value="execution">Execution</option>
                            <option value="review">Post-Trade Review</option>
                        </select>
                    </div>

                    <Button 
                        type="button" 
                        onClick={handleAddNote}
                        size="sm" 
                        disabled={isSaving || !newNoteText.trim()}
                        className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Note
                    </Button>
                </div>
            </div>

            {/* Notes Timeline */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-1">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Note Logs ({notes.length})</h4>
                
                {notes.length === 0 ? (
                    <div className="border border-dashed border-zinc-200 rounded-lg p-8 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
                        <MessageSquare className="w-8 h-8 opacity-40 text-zinc-400" />
                        <p className="text-xs">No updates recorded for this trade yet.</p>
                        <p className="text-[11px] text-zinc-400">Document your trade thesis or execution updates above.</p>
                    </div>
                ) : (
                    <div className="space-y-3 relative border-l border-zinc-100 pl-4 ml-2">
                        {notes.map((note) => {
                            const isEditing = editingId === note.id;
                            const catStyle = CATEGORY_STYLES[note.category || "general"];
                            const catLabel = CATEGORY_LABELS[note.category || "general"];

                            return (
                                <div key={note.id} className="relative group bg-white border border-zinc-150 rounded-lg p-3 shadow-sm">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-zinc-300 border-2 border-white" />

                                    {isEditing ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <label className="text-xs font-medium text-zinc-600">Category:</label>
                                                <select
                                                    value={editingCategory}
                                                    onChange={(e) => setEditingCategory(e.target.value as TradeNote["category"])}
                                                    className="text-xs rounded-md border border-zinc-200 bg-white px-2 py-1 text-zinc-800 outline-none focus:border-zinc-400"
                                                >
                                                    <option value="general">General</option>
                                                    <option value="thesis">Thesis</option>
                                                    <option value="management">Management</option>
                                                    <option value="execution">Execution</option>
                                                    <option value="review">Post-Trade Review</option>
                                                </select>
                                            </div>
                                            <textarea
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                rows={3}
                                                className="w-full text-sm outline-none rounded-md border border-zinc-200 p-2 focus:border-zinc-400"
                                            />
                                            <div className="flex gap-2 justify-end mt-1">
                                                <Button 
                                                    type="button"
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={cancelEditing}
                                                    className="h-8 px-2"
                                                >
                                                    <X className="w-3.5 h-3.5 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    size="sm" 
                                                    onClick={() => handleSaveEdit(note.id)}
                                                    className="h-8 px-2 bg-zinc-900 text-white hover:bg-zinc-800"
                                                >
                                                    <Check className="w-3.5 h-3.5 mr-1" />
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Note Header */}
                                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border uppercase tracking-wider ${catStyle}`}>
                                                    {catLabel}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-zinc-400 font-medium">
                                                        {dayjs(note.createdAt).format("DD MMM YYYY, HH:mm")}
                                                        {note.updatedAt && ` (Edited ${dayjs(note.updatedAt).format("DD MMM YYYY, HH:mm")})`}
                                                    </span>
                                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(note)}
                                                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded transition-colors"
                                                            title="Edit note"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete note"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Note Content */}
                                            <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                                {note.text}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
