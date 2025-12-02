import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, Trash2, TrendingUp, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Goals() {
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  const { t, language } = useLanguage();
  
  // Получаем цели
  const { data: goals = [] } = useQuery({ 
    queryKey: ["goals"], 
    queryFn: api.getGoals 
  });

  // Получаем проекты для расчета месячного заработка
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });

  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [form, setForm] = useState({
    targetAmount: "",
    month: new Date().toISOString().slice(0, 7)
  });

  const saveMutation = useMutation({
    mutationFn: (data: { month: string; targetAmount: number }) => 
      api.saveGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setOpen(false);
      setForm({ targetAmount: "", month: new Date().toISOString().slice(0, 7) });
      setEditingGoal(null);
    },
    onError: (error) => {
      console.error('Failed to save goal:', error);
      alert(t('errorSavingGoal'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    }
  });

  // Функция для расчета заработка за конкретный месяц по дедлайну
  const getMonthlyEarnings = (month: string) => {
    const completedProjects = projects.filter((project: any) => 
      project.completed && project.completionDate
    );
    
    return completedProjects
      .filter((project: any) => {
        const deadlineMonth = new Date(project.deadline).toISOString().slice(0, 7);
        return deadlineMonth === month;
      })
      .reduce((sum: number, project: any) => sum + project.cost, 0);
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setForm({
      targetAmount: String(goal.targetAmount),
      month: goal.month
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    const targetAmount = Number(form.targetAmount);
    
    if (!form.targetAmount || targetAmount <= 0) {
      alert(t('amountGreaterThanZero'));
      return;
    }
    
    const data = {
      targetAmount: targetAmount,
      month: form.month
    };
    
    saveMutation.mutate(data);
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Функция расчета прогресса для каждой цели
  const calculateProgress = (goal: any) => {
    const monthlyEarned = getMonthlyEarnings(goal.month);
    const targetAmount = goal.targetAmount;
    
    if (!targetAmount || targetAmount <= 0) return 0;
    return Math.min((monthlyEarned / targetAmount) * 100, 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{t('goals')}</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingGoal(null);
            setForm({ targetAmount: "", month: new Date().toISOString().slice(0, 7) });
          }
          setOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white rounded-full gap-2">
              <Plus className="h-5 w-5" />
              {t('newGoal')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingGoal ? t('edit') : t('newGoal')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-6">
              <div>
                <Label>{t('month')}</Label>
                <Input
                  type="month"
                  value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('targetAmount')}</Label>
                <Input
                  type="number"
                  value={form.targetAmount}
                  onChange={e => setForm({ ...form, targetAmount: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => {
                  setOpen(false);
                  setEditingGoal(null);
                  setForm({ targetAmount: "", month: new Date().toISOString().slice(0, 7) });
                }}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? t('saving') : t('save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {goals.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-2xl text-muted-foreground mb-4">{t('noGoals')}</p>
            <p className="text-muted-foreground">{t('setFinancialGoals')}</p>
          </GlassCard>
        ) : (
          goals.map((goal: any, index: number) => {
            const monthlyEarned = getMonthlyEarnings(goal.month);
            const progress = calculateProgress(goal);
            
            return (
              <GlassCard
                key={goal.id}
                hover
                className="p-4 md:p-6"
                style={{ "--animation-delay": `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{getMonthName(goal.month)}</h3>
                      <p className="text-lg text-primary font-bold mt-1">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">
                          {progress.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(monthlyEarned)} / {formatCurrency(goal.targetAmount)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(goal)}
                        className="text-blue-500 hover:bg-blue-500/10"
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(goal.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('progressToGoal')}</span>
                      <span className="font-medium">
                        {formatCurrency(monthlyEarned)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {progress >= 100 && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">
                        🎉 {t('goalAchieved')}
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}