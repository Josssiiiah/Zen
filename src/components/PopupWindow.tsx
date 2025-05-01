import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql"; // Import the SQL plugin
import { X } from "lucide-react";
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

  return (
    <div
      className="fixed inset-0 p-6 flex flex-col h-full"
      style={{
        paddingTop: 32, // Adjust padding to account for custom title bar
      }}
    >
      {/* This invisible div fills the title bar area and enables window dragging */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-8"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />

      {/* Close Button Area */}
      <div className="flex justify-between items-center pb-2 absolute top-0 right-0 p-1">
        {/* Placeholder for potential title text if needed later */}
        {/* <div className="text-sm font-medium text-foreground/80">Notes</div> */}
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

      {/* Content Area (takes remaining space) */}
      <div className="flex flex-col flex-grow pt-6 space-y-4 overflow-hidden">
        {/* Input Card */}
        <Card className="bg-background/80 backdrop-blur-sm border border-border/50 shrink-0">
          <CardHeader className="p-3">
            <CardTitle className="text-base">Add New Note</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-border/60"
            />
            <Textarea
              placeholder="Note Body (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-background/50 border-border/60 h-16"
            />
          </CardContent>
          <CardFooter className="p-3 flex justify-end">
            <Button
              size="sm"
              onClick={handleAddNote}
              // Check db state in disabled condition
              disabled={!db || isLoading}
              className="bg-primary/80 hover:bg-primary/90 text-primary-foreground"
            >
              Add Note
            </Button>
          </CardFooter>
        </Card>

        {/* Error Message */}
        {error && <p className="text-xs text-red-500 px-3">{error}</p>}

        {/* Notes List Card */}
        <Card className="bg-card/30 backdrop-blur-sm border border-border/50 flex-grow flex flex-col overflow-hidden">
          <CardHeader className="p-3">
            <CardTitle className="text-base">Saved Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full px-3">
              {isLoading ? (
                <p className="text-muted-foreground text-sm p-3">
                  Loading notes...
                </p>
              ) : notes.length === 0 ? (
                <p className="text-muted-foreground text-sm p-3">
                  No notes yet.
                </p>
              ) : (
                <div className="space-y-3 pb-3">
                  {notes.map((note, index) => (
                    <div key={note.id}>
                      {index > 0 && <Separator className="my-2 bg-border/50" />}
                      <div className="text-sm font-medium">{note.title}</div>
                      {note.body && (
                        <p className="text-xs text-muted-foreground pt-1 whitespace-pre-wrap">
                          {note.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
