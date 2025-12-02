import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Notes() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: notes = [] } = useQuery({ queryKey: ["notes"], queryFn: api.getNotes });

  const [open, setOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    content: ""
  });

  const createMutation = useMutation({
    mutationFn: () => api.createNote(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setOpen(false);
      setForm({ title: "", content: "" });
      setEditingNote(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setOpen(false);
      setForm({ title: "", content: "" });
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setForm({
      title: note.title,
      content: note.content
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      alert(t('noteTitleRequired'));
      return;
    }

    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data: form });
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{t('notes')}</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingNote(null);
            setForm({ title: "", content: "" });
          }
          setOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white rounded-full gap-2">
              <Plus className="h-5 w-5" />
              {t('newNote')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingNote ? t('editNote') : t('newNote')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{t('title')} *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={t('noteTitlePlaceholder')}
                />
              </div>
              <div>
                <Label>{t('content')}</Label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder={t('noteContentPlaceholder')}
                  className="min-h-48"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => {
                  setOpen(false);
                  setEditingNote(null);
                  setForm({ title: "", content: "" });
                }}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingNote ? 
                    (updateMutation.isPending ? t('saving') : t('save')) : 
                    (createMutation.isPending ? t('creating') : t('create'))
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {notes.length === 0 ? (
          <div className="col-span-full">
            <GlassCard className="p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-2xl text-muted-foreground mb-4">{t('noNotes')}</p>
              <p className="text-muted-foreground">{t('createFirstNote')}</p>
            </GlassCard>
          </div>
        ) : (
          notes.map((note: any, index: number) => (
            <GlassCard
              key={note.id}
              hover
              className="p-4 md:p-6"
              style={{ "--animation-delay": `${index * 0.1}s` } as React.CSSProperties}
            >
              <div className="space-y-4">
                <h3 className="text-xl font-bold truncate">{note.title}</h3>
                <p className="text-muted-foreground line-clamp-4">{note.content}</p>
                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}