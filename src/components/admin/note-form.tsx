"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { addInternalNote } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function NoteForm({ requestId }: { requestId: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("content") ?? "").trim();
    if (!content) {
      toast.error("Scrie ceva în notiță mai întâi");
      return;
    }
    setSubmitting(true);
    const result = await addInternalNote(requestId, content);
    setSubmitting(false);
    if (result.success) {
      formRef.current?.reset();
      toast.success("Notiță adăugată");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        name="content"
        placeholder="Adaugă o notiță internă (vizibilă doar pentru echipă)..."
        className="min-h-20"
        maxLength={1000}
        required
      />
      <Button type="submit" size="sm" loading={submitting}>
        <Send className="size-3.5" aria-hidden />
        Adaugă notița
      </Button>
    </form>
  );
}
