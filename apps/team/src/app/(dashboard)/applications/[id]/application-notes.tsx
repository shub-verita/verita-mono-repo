"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@verita/shared";
import { Send, RefreshCw, User } from "lucide-react";

interface Note {
  id: string;
  noteText: string;
  authorName: string;
  createdAt: Date;
}

interface ApplicationNotesProps {
  applicationId: string;
  notes: Note[];
}

export function ApplicationNotes({ applicationId, notes }: ApplicationNotesProps) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteText: newNote,
          authorName: "Team Member", // In production, get from auth
        }),
      });

      if (response.ok) {
        setNewNote("");
        router.refresh();
      } else {
        alert("Failed to add note");
      }
    } catch (error) {
      alert("Error adding note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={addNote} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={isLoading || !newNote.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No notes yet. Add the first note above.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  {note.authorName}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{note.noteText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
