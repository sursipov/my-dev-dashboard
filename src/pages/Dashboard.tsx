import { GlassCard } from "@/components/GlassCard";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  // Mock data - будет заменено на реальные данные из backend
  const monthlyEarnings = 487000;
  const monthlyGoal = 1000000;
  const progress = (monthlyEarnings / monthlyGoal) * 100;

  const stats = [
    { label: "Всего заработано", value: "2 345 000 ₽", icon: DollarSign, color: "text-primary" },
    { label: "Средняя сумма", value: "125 000 ₽", icon: TrendingUp, color: "text-secondary" },
    { label: "Выполнено", value: "18 проектов", icon: CheckCircle2, color: "text-accent" },
    { label: "Среднее время", value: "12 дней", icon: Clock, color: "text-muted-foreground" },
  ];

  const topProjects = [
    { type: "Лендинг", earnings: "450 000 ₽", count: 5 },
    { type: "Интернет-магазин", earnings: "380 000 ₽", count: 3 },
    { type: "CRM система", earnings: "320 000 ₽", count: 2 },
    { type: "Мобильное приложение", earnings: "280 000 ₽", count: 4 },
    { type: "Dashboard", earnings: "215 000 ₽", count: 4 },
  ];

  const longestProjects = [
    { type: "CRM система", days: 28 },
    { type: "Мобильное приложение", days: 21 },
    { type: "Интернет-магазин", days: 18 },
    { type: "Dashboard", days: 14 },
    { type: "Лендинг", days: 8 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Main earnings card */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative z-10">
          <p className="text-lg text-muted-foreground mb-2">В этом месяце уже:</p>
          <h2 className="text-6xl md:text-7xl font-bold text-gradient mb-6">
            {monthlyEarnings.toLocaleString("ru-RU")} ₽
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Прогресс к цели</span>
              <span>{monthlyGoal.toLocaleString("ru-RU")} ₽</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </GlassCard>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={index} hover className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl gradient-primary", stat.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Top projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Топ-5 прибыльных типов
          </h3>
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gradient">{index + 1}</span>
                  <div>
                    <p className="font-medium">{project.type}</p>
                    <p className="text-sm text-muted-foreground">{project.count} проектов</p>
                  </div>
                </div>
                <p className="font-bold text-primary">{project.earnings}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-secondary" />
            Топ-5 самых долгих
          </h3>
          <div className="space-y-4">
            {longestProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gradient">{index + 1}</span>
                  <p className="font-medium">{project.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-bold">{project.days} дн.</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
