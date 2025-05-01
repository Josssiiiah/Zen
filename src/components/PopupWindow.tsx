import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql"; // Import the SQL plugin
import { X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input"; // Import Input component
import { Textarea } from "./ui/textarea"; // Import Textarea component
import { useEffect, useState, useCallback } from "react"; // Import React hooks
import { cn } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ScrollArea } from "./ui/scroll-area"; // Import ScrollArea
import { Separator } from "./ui/separator"; // Import Separator

// Define the Note type mirroring the Rust struct
interface Note {
  id: number;
  title: string;
  body: string;
  // Add created_at if you need it in the frontend
  // created_at: string;
}

// No dbPromise here, assume loaded by main.tsx

export default function PopupWindow() {
  // Restore db state, but initialize differently
  const [db, setDb] = useState<Database | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start as true until DB is confirmed loaded
  const [error, setError] = useState<string | null>(null);

  // Effect to get the DB instance on mount
  useEffect(() => {
    try {
      // Use Database.get() which should return the instance loaded by main.tsx
      const dbInstance = Database.get("sqlite:notes.db");
      setDb(dbInstance);
    } catch (err) {
      // Log the specific error
      console.error("Error getting database instance in PopupWindow:", err);
      setError(
        "Failed to get database instance. Was it loaded successfully on startup? See console for details."
      );
      setIsLoading(false); // Set loading false if DB instance fails
    }
  }, []); // Run once on mount

  // Function to fetch notes - uses the db instance from state
  const fetchNotes = useCallback(async () => {
    if (!db) {
      // setError("Database connection not available."); // Optional: more specific error
      setIsLoading(false);
      return; // Don't proceed if db state is null
    }
    setIsLoading(true);
    try {
      setError(null);
      // Use the instance method db.select()
      const fetchedNotes = await db.select<Note[]>(
        "SELECT id, title, body FROM notes ORDER BY id DESC"
      );
      setNotes(fetchedNotes);
    } catch (err) {
      // Log the specific error
      console.error("Error during db.select in fetchNotes:", err);
      setError("Failed to fetch notes. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [db]); // Depends on the db instance state

  // Effect to fetch notes when db instance is ready
  useEffect(() => {
    if (db) {
      fetchNotes();
    }
  }, [db, fetchNotes]); // Run when db state is set or fetchNotes changes

  // Function to add a new note - uses the db instance from state
  const handleAddNote = async () => {
    // Check db instance exists before proceeding
    if (!db) {
      setError("Database connection not available.");
      return;
    }
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    // Consider adding loading state here too
    try {
      setError(null);
      // Use the instance method db.execute()
      await db.execute("INSERT INTO notes (title, body) VALUES ($1, $2)", [
        title,
        body,
      ]);
      setTitle("");
      setBody("");
      fetchNotes(); // Refresh notes list
    } catch (err) {
      // Log the specific error
      console.error("Error during db.execute in handleAddNote:", err);
      setError("Failed to add note. See console for details.");
    }
  };

  // Function to delete a note
  const handleDeleteNote = async (id: number) => {
    // Check db instance exists before proceeding
    if (!db) {
      setError("Database connection not available.");
      return;
    }
    // Consider adding a temporary loading/disabled state for the specific note being deleted
    try {
      setError(null);
      // Use db.execute directly from the frontend instance
      await db.execute("DELETE FROM notes WHERE id = $1", [id]);
      fetchNotes(); // Refresh notes list
    } catch (err) {
      // Log the specific error
      console.error("Error during db.execute in handleDeleteNote:", err);
      setError("Failed to delete note. See console for details.");
    }
  };

  return (
    <div
      className="fixed bg-background/80 rounded-xl inset-0 p-4 flex flex-col h-full"
      style={
        {
          // paddingTop: 32, // Adjust padding, maybe standard p-4 is enough now
        }
      }
    >
      {/* Keep drag region and close button for window management */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-8" // Title bar height
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />
      <div className="absolute top-1 right-1">
        <Button
          onClick={() => invoke("close_popup_window").catch(console.error)}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Main Content Area - takes remaining space, starts below drag region */}
      <div className="flex flex-col flex-grow pt-8 space-y-3 overflow-hidden">
        {/* Input Section */}
        <div className="space-y-2 shrink-0 px-2">
          {" "}
          {/* Added padding */}
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              // Simplify styling, rely on default input style
              className="flex-grow bg-transparent border-border/60"
            />
            {/* Icon Button */}
            <Button
              size="icon"
              variant="ghost" // Make it less prominent until hover
              onClick={handleAddNote}
              disabled={!db || isLoading || !title.trim()} // Also disable if title is empty
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50" // Adjust size/styling
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Add Note</span>
            </Button>
          </div>
          <Textarea
            placeholder="Note Body (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            // Simplify styling, rely on default textarea style
            className="bg-transparent border-border/60 h-16 text-sm" // Adjust height/font size
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-xs text-red-500 px-2 shrink-0">{error}</p>}

        {/* Separator */}
        <Separator className="shrink-0 bg-border/50" />

        {/* Notes List Section */}
        <ScrollArea className="flex-grow px-2">
          {" "}
          {/* Added padding */}
          {isLoading ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Loading notes...
            </p>
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No notes yet.
            </p>
          ) : (
            <div className="space-y-3 pb-4">
              {" "}
              {/* Add bottom padding */}
              {notes.map(
                (
                  note // No separator needed inside map now
                ) => (
                  <div
                    key={note.id}
                    className="p-2 rounded-md hover:bg-muted/50 flex justify-between items-start group" // Use flex, group for hover effect
                  >
                    {/* Note Content */}
                    <div className="flex-grow">
                      <div className="text-sm font-medium">{note.title}</div>
                      {note.body && (
                        <p className="text-xs text-muted-foreground pt-1 whitespace-pre-wrap">
                          {note.body}
                        </p>
                      )}
                    </div>
                    {/* Delete Button - Show on group hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
