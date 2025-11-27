import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, DollarSign, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  // Mock data
  const projects = [
    {
      id: 1,
      name: "Корпоративный сайт для IT компании",
      type: "Лендинг",
      cost: 150000,
      deadline: "2025-12-15",
      status: "В работе",
    },
    {
      id: 2,
      name: "Интернет-магазин косметики",
      type: "Интернет-магазин",
      cost: 250000,
      deadline: "2025-12-20",
      status: "В работе",
    },
    {
      id: 3,
      name: "CRM для агентства недвижимости",
      type: "CRM система",
      cost: 320000,
      deadline: "2026-01-10",
      status: "Планируется",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "В работе":
        return "bg-primary";
      case "Планируется":
        return "bg-secondary";
      case "Завершен":
        return "bg-accent";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Проекты</h1>
        <Button className="gradient-primary text-white rounded-full gap-2">
          <Plus className="h-5 w-5" />
          Новый проект
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, index) => (
          <GlassCard key={project.id} hover className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold">{project.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn(getStatusColor(project.status), "text-white")}>
                    {project.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    {project.type}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex items-center gap-2 text-lg font-bold text-primary">
                  <DollarSign className="h-5 w-5" />
                  {project.cost.toLocaleString("ru-RU")} ₽
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.deadline).toLocaleDateString("ru-RU")}
                </div>
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
