import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Trash2, CheckCircle2, Filter, ArrowUpDown, Edit, Clock, FolderKanban, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Projects() {
  const queryClient = useQueryClient();
  const { currency, formatCurrencyWithConversionJSX, convertAmount } = useCurrency();
  const { t, language } = useLanguage();
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.getProjects });
  const { data: types = [] } = useQuery({ queryKey: ["project-types"], queryFn: api.getProjectTypes });

  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showCustomType, setShowCustomType] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "type" | "cost" | "deadline">("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [form, setForm] = useState({
    name: "",
    type: "",
    customType: "",
    cost: "",
    startDate: "",
    deadline: "",
    notes: ""
  });


  const sortedProjects = [...projects].sort((a: any, b: any) => {
    switch (sortBy) {
      case "type":
        return sortOrder === "asc" 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      
      case "cost":
        return sortOrder === "asc" 
          ? a.cost - b.cost
          : b.cost - a.cost;
      
      case "deadline":
        return sortOrder === "asc" 
          ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          : new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      
      case "newest":
      default:
        return sortOrder === "asc" 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const calculateDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    
    try {
      const deadlineDate = new Date(deadline);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);
      
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return null;
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as "newest" | "type" | "cost" | "deadline");
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getSortLabel = () => {
    const labels = {
      newest: t('newest'),
      type: t('byType'), 
      cost: t('byCost'),
      deadline: t('byDeadline')
    };
    return labels[sortBy];
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);

    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    setForm({
      name: project.name,
      type: project.type,
      customType: "",
      cost: String(project.cost),
      startDate: formatDateForInput(project.startDate),
      deadline: formatDateForInput(project.deadline),
      notes: project.notes || ""
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.cost || !form.deadline) {
      alert(t('fillRequiredFields'));
      return;
    }

    let projectType = form.type;
    
    if (form.type === "custom" && form.customType) {
      try {
        const newType = await createProjectTypeMutation.mutateAsync(form.customType);
        projectType = newType.name;
      } catch (error) {
        console.error('Failed to create project type:', error);
        alert(t('errorCreatingType'));
        return;
      }
    }

    if (!projectType) {
      alert(t('chooseOrEnterType'));
      return;
    }

    const costInUSD = convertAmount(Number(form.cost), currency, 'USD');
    
    const formatDateForApi = (dateString: string) => {
      if (!dateString) return null;
      return new Date(dateString + 'T00:00:00').toISOString();
    };

    const projectData = {
      name: form.name,
      type: projectType,
      cost: costInUSD,
      startDate: form.startDate ? formatDateForApi(form.startDate) : null,
      deadline: formatDateForApi(form.deadline),
      notes: form.notes || null
    };
    
    console.log("Submitting project data:", projectData);
    
    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        data: projectData
      });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.createProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setOpen(false);
      setForm({ name: "", type: "", customType: "", cost: "", startDate: "", deadline: "", notes: "" });
      setShowCustomType(false);
      setEditingProject(null);
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
      alert(t('errorCreatingProject'));
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setOpen(false);
      setForm({ name: "", type: "", customType: "", cost: "", startDate: "", deadline: "", notes: "" });
      setShowCustomType(false);
      setEditingProject(null);
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
      alert(t('errorUpdatingProject'));
    }
  });

  const createProjectTypeMutation = useMutation({
    mutationFn: (name: string) => api.createProjectType({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-types"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const project = projects.find((p: any) => p.id === id);
      const currentDate = new Date().toISOString().split('T')[0];
      const projectDate = project?.deadline ? project.deadline.split('T')[0] : currentDate;
      
      const completionDate = project?.completed ? null : projectDate;
      
      return api.toggleProject(id, completionDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (error) => {
      console.error('Failed to toggle project:', error);
      alert(t('errorUpdatingProject'));
    }
  });

  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value });
    setShowCustomType(value === "custom");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('notSet') || 'Не указано';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return t('notSet') || 'Не указано';
      }
      
      const locale = language === 'ru' ? 'ru-RU' : 'en-US';
      return date.toLocaleDateString(locale, { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      });
    } catch (error) {
      console.error("Error formatting display date:", dateString, error);
      return t('notSet') || 'Не указано';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{t('projects')}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('sorting')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="type">{t('byType')}</SelectItem>
                <SelectItem value="cost">{t('byCost')}</SelectItem>
                <SelectItem value="deadline">{t('byDeadline')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSortOrder}
              className="h-10 w-10"
              title={sortOrder === "asc" ? t('ascending') : t('descending')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditingProject(null);
              setForm({ name: "", type: "", customType: "", cost: "", startDate: "", deadline: "", notes: "" });
              setShowCustomType(false);
            }
            setOpen(isOpen);
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white rounded-full gap-2">
                <Plus className="h-5 w-5" />
                {t('newProject')}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingProject ? t('edit') : t('newProject')}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Label>{t('projectName')} *</Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder={t('projectNamePlaceholder')} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('projectType')} *</Label>
                  <Select value={form.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('chooseType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type: any) => (
                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                      ))}
                      <SelectItem value="custom">{t('customType')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {showCustomType && (
                    <Input
                      value={form.customType}
                      onChange={e => setForm({ ...form, customType: e.target.value })}
                      placeholder={t('enterCustomType')}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('startDate')} *</Label>
                  <Input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm({ ...form, startDate: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('deadline')} *</Label>
                  <Input 
                    type="date" 
                    value={form.deadline} 
                    onChange={e => setForm({ ...form, deadline: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('cost')} ({currency}) *</Label>
                  <Input 
                    type="number" 
                    value={form.cost} 
                    onChange={e => setForm({ ...form, cost: e.target.value })} 
                    placeholder="1000" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('status')}</Label>
                  <div className="text-sm text-muted-foreground pt-2">
                    {editingProject?.completed ? t('completed') : t('active')}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>{t('notesField')}</Label>
                  <Textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder={t('placeholderNotes')}
                    className="min-h-32"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => {
                  setOpen(false);
                  setEditingProject(null);
                  setForm({ name: "", type: "", customType: "", cost: "", startDate: "", deadline: "", notes: "" });
                  setShowCustomType(false);
                }}>
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                >
                  {editingProject ? 
                    (updateProjectMutation.isPending ? t('saving') : t('save')) : 
                    (createProjectMutation.isPending ? t('creating') : t('create'))
                  }
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('sorting')}:</span>
          <span className="font-medium">{getSortLabel()}</span>
          <span>({sortOrder === "asc" ? t('ascending') : t('descending')})</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {sortedProjects.length} {t('projectsCount')}
        </div>
      </div>

      <div className="grid gap-6">
        {sortedProjects.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-2xl text-muted-foreground mb-4">{t('noProjects')}</p>
            <p className="text-muted-foreground">{t('createFirstProject')}</p>
          </GlassCard>
        ) : (
          sortedProjects.map((p: any, index: number) => {
            const daysRemaining = calculateDaysRemaining(p.deadline);
            let daysRemainingText = "";
            
            if (daysRemaining !== null) {
              if (daysRemaining > 0) {
                daysRemainingText = `Осталось: ${daysRemaining} д.`;
              } else if (daysRemaining === 0) {
                daysRemainingText = "Сегодня";
              } else {
                daysRemainingText = `Просрочено: ${Math.abs(daysRemaining)} д.`;
              }
            }
            
            return (
              <GlassCard
                key={p.id}
                hover={!p.completed}
                className={`p-4 md:p-6 ${p.completed ? 'opacity-60' : ''}`}
                style={{ "--animation-delay": `${index * 0.1}s` } as React.CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${p.completed ? 'line-through' : ''}`}>{p.name}</h3>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <Badge variant="outline" className={p.completed ? 'opacity-70' : ''}>{p.type}</Badge>
                      <div className={`text-xl font-bold ${p.completed ? 'text-muted-foreground line-through' : 'text-primary'}`}>
                        {formatCurrencyWithConversionJSX(p.cost)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(p.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(p.deadline)}
                      </span>
                      {!p.completed && daysRemaining !== null && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span className={daysRemaining < 0 ? "text-destructive" : daysRemaining === 0 ? "text-amber-600" : "text-green-600"}>
                            {daysRemainingText}
                          </span>
                        </span>
                      )}
                      {p.completedAt && (
                        <Badge variant="secondary" className="text-xs">
                          {t('completed')}: {formatDate(p.completedAt)}
                        </Badge>
                      )}
                    </div>
                    {p.notes && <p className={`text-sm mt-3 ${p.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(p)}
                      className="text-blue-500 hover:bg-blue-500/10"
                      title={t('edit')}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleMutation.mutate(p.id)}
                      className={p.completed ? 
                        "text-green-500 hover:bg-green-500/10" : 
                        "text-muted-foreground hover:bg-muted/50"
                      }
                      title={p.completed ? t('projectCompleted') : t('markCompleted')}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}