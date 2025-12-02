import { GlassCard } from "@/components/GlassCard";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, DollarSign, CheckCircle2, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { checkDeadlinesAndNotify } from "@/lib/telegram";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { formatCurrencyWithConversionJSX } = useCurrency();
  const { t, language } = useLanguage();
  
  const { data: stats = { 
    totalEarned: 0, 
    monthlyEarned: 0,
    avgCost: 0, 
    completed: 0, 
    avgTime: 0, 
    byType: [],
    longestProjects: []
  } } = useQuery({
    queryKey: ["stats", selectedMonth],
    queryFn: () => api.getStats(selectedMonth),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: api.getGoals,
  });

  useEffect(() => {
    if (projects.length > 0) {
      const lastCheck = localStorage.getItem('lastDeadlineCheck');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastCheck !== today) {
        checkDeadlinesAndNotify(projects);
        localStorage.setItem('lastDeadlineCheck', today);
      }
    }
  }, [projects]);

  const currentGoal = goals.find((goal: any) => goal.month === selectedMonth);
  const monthlyGoal = currentGoal?.targetAmount || 0;

  const monthlyEarnings = stats.monthlyEarned || 0;
  const progress = monthlyGoal > 0 ? (monthlyEarnings / monthlyGoal) * 100 : 0;

  const goToPreviousMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const goToNextMonth = () => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + 1);
    const nextMonth = date.toISOString().slice(0, 7);
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (nextMonth > currentMonth) return;
    setSelectedMonth(nextMonth);
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = selectedMonth === currentMonth;

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long'
  });

  const displayStats = [
    { 
      label: t('totalEarned'), 
      value: formatCurrencyWithConversionJSX(stats.totalEarned),
      icon: DollarSign, 
      color: "text-primary" 
    },
    { 
      label: t('averageAmount'), 
      value: formatCurrencyWithConversionJSX(stats.avgCost),
      icon: TrendingUp, 
      color: "text-secondary" 
    },
    { 
      label: t('completedProjects'), 
      value: `${stats.completed} ${t('projects')}`, 
      icon: CheckCircle2, 
      color: "text-accent" 
    },
    { 
      label: t('averageTime'), 
      value: `${stats.avgTime} ${t('days')}`, 
      icon: Clock, 
      color: "text-muted-foreground" 
    },
  ];

  const topProjects = stats.byType
    .map((t: any) => ({
      type: t.type,
      earnings: formatCurrencyWithConversionJSX(t.earned),
      count: t.count,
    }))
    .sort((a: any, b: any) => b.earnings - a.earnings)
    .slice(0, 5);

  // Используем данные из API, а не случайные числа
  const longestProjects = stats.longestProjects || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative">
        <button 
          onClick={goToPreviousMonth}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 p-3 hover:bg-muted/50 rounded-full transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </button>

        <button 
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full transition-all duration-200 ${
            isCurrentMonth 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-muted/50 hover:scale-110'
          }`}
        >
          <ChevronRight className="h-6 w-6 text-primary" />
        </button>

        <GlassCard className="relative overflow-hidden mx-12">
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <p className="text-lg text-muted-foreground">{t('forMonth')} {monthName}:</p>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold text-gradient mb-6 text-center">
              {formatCurrencyWithConversionJSX(monthlyEarnings)}
            </h2>
            {monthlyGoal > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('progressToGoal')}</span>
                  <span>{formatCurrencyWithConversionJSX(monthlyGoal)}</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground text-right">
                  {progress.toFixed(1)}% {t('completed')}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  {t('goalNotSet')}{" "}
                  <a href="/goals" className="text-primary hover:underline">
                    {t('setGoal')}
                  </a>
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={i} hover className="animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl gradient-primary ${stat.color}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {t('topProfitableTypes')}
          </h3>
          <div className="space-y-4">
            {topProjects.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gradient">{i + 1}</span>
                  <div>
                    <p className="font-medium">{p.type}</p>
                    <p className="text-sm text-muted-foreground">{p.count} {t('projects')}</p>
                  </div>
                </div>
                <div className="font-bold text-primary">{p.earnings}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-secondary" />
            {t('topLongest')}
          </h3>
          <div className="space-y-4">
            {longestProjects.length > 0 ? (
              longestProjects.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gradient">{i + 1}</span>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-bold">{p.days} {t('days')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  {t('noCompletedProjects') || "Нет завершенных проектов"}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}