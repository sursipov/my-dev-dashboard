import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Planning() {
  // Mock data
  const tasks = [
    {
      id: 1,
      title: "Согласовать дизайн с клиентом",
      date: "2025-11-27",
      completed: false,
      priority: "Высокий",
    },
    {
      id: 2,
      title: "Разработать API для CRM",
      date: "2025-11-28",
      completed: false,
      priority: "Средний",
    },
    {
      id: 3,
      title: "Тестирование интернет-магазина",
      date: "2025-11-29",
      completed: true,
      priority: "Высокий",
    },
    {
      id: 4,
      title: "Встреча с командой",
      date: "2025-11-30",
      completed: false,
      priority: "Низкий",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Высокий":
        return "bg-destructive";
      case "Средний":
        return "bg-secondary";
      case "Низкий":
        return "bg-accent";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Планирование</h1>
        <Button className="gradient-primary text-white rounded-full gap-2">
          <Plus className="h-5 w-5" />
          Новая задача
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {tasks.map((task, index) => (
          <GlassCard key={task.id} hover className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center gap-4">
              <button className="flex-shrink-0">
                {task.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={cn("text-lg font-medium", task.completed && "line-through text-muted-foreground")}>
                    {task.title}
                  </h3>
                  <Badge className={cn(getPriorityColor(task.priority), "text-white text-xs")}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(task.date).toLocaleDateString("ru-RU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
