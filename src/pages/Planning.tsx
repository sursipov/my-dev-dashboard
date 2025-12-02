import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Edit, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Planning() {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const { data: plans = [] } = useQuery({ queryKey: ["dayplans"], queryFn: api.getDayPlans });
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{date: string; index: number} | null>(null);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    date: new Date().toISOString().split("T")[0]
  });

  const sortedPlans = [...plans]
    .filter((plan: any) => plan.tasks && plan.tasks.length > 0)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setExpandedDays(prev => ({ ...prev, [today]: true }));
  }, []);

  const saveDayPlanMutation = useMutation({
    mutationFn: ({ date, tasks }: { date: string; tasks: any[] }) => 
      api.saveDayPlan(date, { tasks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dayplans"] });
    }
  });

  const handleEdit = (date: string, task: any, index: number) => {
    setEditingTask({ date, index });
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      date: date.split('T')[0]
    });
    setOpen(true);
  };

  const addTaskMutation = useMutation({
    mutationFn: () => {
      const existingPlan = plans.find((p: any) => p.date.startsWith(form.date));
      const existingTasks = existingPlan?.tasks || [];
      const newTask = { 
        title: form.title,
        description: form.description,
        priority: form.priority,
        completed: false 
      };
      
      const newTasks = editingTask ? 
        existingTasks.map((task: any, i: number) => i === editingTask.index ? newTask : task) :
        [...existingTasks, newTask];
      
      return api.saveDayPlan(form.date, { tasks: newTasks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dayplans"] });
      setOpen(false);
      setForm({ 
        title: "", 
        description: "", 
        priority: "medium",
        date: new Date().toISOString().split("T")[0] 
      });
      setEditingTask(null);
    }
  });

  const toggleTask = (date: string, index: number) => {
    const plan = plans.find((p: any) => p.date.startsWith(date));
    if (!plan) return;

    const updatedTasks = plan.tasks.map((task: any, i: number) => 
      i === index ? { ...task, completed: !task.completed } : task
    );
    
    saveDayPlanMutation.mutate({ date, tasks: updatedTasks });
  };

  const removeTask = (date: string, index: number) => {
    const plan = plans.find((p: any) => p.date.startsWith(date));
    if (!plan) return;

    const updatedTasks = plan.tasks.filter((_: any, i: number) => i !== index);
    
    if (updatedTasks.length === 0) {
      api.deleteDayPlan(date);
      queryClient.invalidateQueries({ queryKey: ["dayplans"] });
    } else {
      saveDayPlanMutation.mutate({ date, tasks: updatedTasks });
    }
  };

  const toggleDay = (date: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const getColor = (p: string) => {
    if (p === "high") return "bg-destructive";
    if (p === "low") return "bg-accent";
    return "bg-secondary";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('tomorrow');
    } else {
      const locale = language === 'ru' ? 'ru-RU' : 'en-US';
      const options: Intl.DateTimeFormatOptions = { 
        weekday: "long", 
        day: "numeric", 
        month: "long",
      };
      if (date.getFullYear() !== today.getFullYear()) {
        options.year = "numeric";
      }
      return date.toLocaleDateString(locale, options);
    }
  };

  const handleSubmit = () => {
    if (!form.title) {
      alert(t('enterTaskName'));
      return;
    }
    addTaskMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{t('planning')}</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingTask(null);
            setForm({ 
              title: "", 
              description: "", 
              priority: "medium",
              date: new Date().toISOString().split("T")[0] 
            });
          }
          setOpen(isOpen);
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white rounded-full gap-2">
              <Plus className="h-5 w-5" /> {t('newTask')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>{editingTask ? t('edit') : t('newTask')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>{t('executionDate')} *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('taskName')} *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={t('enterTaskName')}
                />
              </div>
              <div>
                <Label>{t('descriptionOptional')}</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>
              <div>
                <Label>{t('priority')}</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t('high')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="low">{t('low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={addTaskMutation.isPending}
                className="w-full"
              >
                {editingTask ? 
                  (addTaskMutation.isPending ? t('saving') : t('save')) : 
                  (addTaskMutation.isPending ? t('adding') : t('addTask'))
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sortedPlans.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-2xl text-muted-foreground mb-4">{t('noTasks')}</p>
          <p className="text-muted-foreground">{t('createFirstTask')}</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {sortedPlans.map((plan: any) => {
            const dateKey = plan.date.split('T')[0];
            const isExpanded = expandedDays[dateKey];
            
            return (
              <GlassCard key={dateKey} className="p-4 md:p-6">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleDay(dateKey)}
                >
                  <h2 className="text-2xl font-bold">
                    {formatDate(plan.date)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {plan.tasks.length} {t('tasksCount')}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="space-y-3 mt-6">
                    {plan.tasks.map((task: any, i: number) => (
                      <GlassCard
                        key={i}
                        hover
                        className="p-3 md:p-4"
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(dateKey, i);
                            }}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                            disabled={saveDayPlanMutation.isPending}
                          >
                            {task.completed ? 
                              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-accent" /> : 
                              <Circle className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-base md:text-lg font-medium ${task.completed && "line-through text-muted-foreground"}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                            )}
                          </div>
                          <Badge className={`${getColor(task.priority)} text-white flex-shrink-0 text-xs md:text-sm`}>
                            {t(task.priority)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(dateKey, task, i);
                              }}
                              className="text-blue-500 hover:scale-110 transition-transform flex-shrink-0"
                              disabled={saveDayPlanMutation.isPending}
                            >
                              <Edit className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTask(dateKey, i);
                              }}
                              className="text-destructive hover:scale-110 transition-transform flex-shrink-0"
                              disabled={saveDayPlanMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}