import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Notes() {
  // Mock data
  const notes = [
    {
      id: 1,
      title: "Идеи для нового проекта",
      content: "Рассмотреть использование WebGL для интерактивных элементов. Изучить Three.js и GSAP для анимаций.",
      date: "2025-11-20",
    },
    {
      id: 2,
      title: "Встреча с клиентом",
      content: "Обсудить дизайн главной страницы. Клиент хочет добавить видео-фон и интерактивную галерею.",
      date: "2025-11-22",
    },
    {
      id: 3,
      title: "Технический стек",
      content: "Next.js + TypeScript + Tailwind CSS + Framer Motion. Для бэкенда рассмотреть Supabase.",
      date: "2025-11-25",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Заметки</h1>
        <Button className="gradient-primary text-white rounded-full gap-2">
          <Plus className="h-5 w-5" />
          Новая заметка
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, index) => (
          <GlassCard key={note.id} hover className="animate-scale-in h-full flex flex-col" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-bold">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-4">
                {note.content}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {new Date(note.date).toLocaleDateString("ru-RU")}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
