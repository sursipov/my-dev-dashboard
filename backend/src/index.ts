import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get('/api/stats', async (req, res) => {
  try {
    const month = req.query.month as string;
    let startOfMonth: Date, endOfMonth: Date;

    if (month) {
      startOfMonth = new Date(month + '-01');
      endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    } else {
      const currentMonth = new Date().toISOString().slice(0, 7);
      startOfMonth = new Date(currentMonth + '-01');
      endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    }

    const completedProjects = await prisma.project.findMany({
      where: { 
        completed: true,
        completionDate: { not: null }
      }
    });

    const totalEarned = completedProjects.reduce((sum, project) => sum + project.cost, 0);
    const completedCount = completedProjects.length;
    const avgCost = completedCount > 0 ? totalEarned / completedCount : 0;

    const monthlyProjectsByDeadline = completedProjects.filter(project => {
      const deadline = new Date(project.deadline);
      return deadline >= startOfMonth && deadline < endOfMonth;
    });

    const monthlyEarned = monthlyProjectsByDeadline.reduce((sum, project) => sum + project.cost, 0);

    let avgTime = 0;
    if (completedProjects.length > 0) {
      const totalDays = completedProjects.reduce((sum, project) => {
        const start = new Date(project.startDate);
        const end = new Date(project.completionDate!);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }, 0);
      avgTime = Math.round(totalDays / completedProjects.length);
    }

    const byType = await prisma.project.groupBy({
      by: ['type'],
      where: { 
        completed: true,
        completionDate: { not: null }
      },
      _sum: { cost: true },
      _count: { id: true }
    });

    const longestProjects = completedProjects
      .map(project => {
        const start = new Date(project.startDate);
        const end = new Date(project.completionDate!);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: project.id,
          name: project.name,
          type: project.type,
          days: days,
          completionDate: project.completionDate,
          startDate: project.startDate
        };
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);

    res.json({
      totalEarned,
      monthlyEarned,
      avgCost,
      completed: completedCount,
      monthlyCompleted: monthlyProjectsByDeadline.length,
      avgTime,
      byType: byType.map(t => ({
        type: t.type,
        earned: t._sum?.cost || 0,
        count: t._count?.id || 0
      })),
      longestProjects
    });

  } catch (e) {
    console.error('Failed to fetch stats:', e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const parsed = notes.map(n => ({
      ...n,
      tags: n.tags ? JSON.parse(n.tags) : [],
    }));
    res.json(parsed);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch notes' }); }
});

app.post('/api/notes', async (req, res) => {
  const { title, content, tags = [] } = req.body;
  try {
    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
      },
    });
    res.json({ ...note, tags });
  } catch (e) { res.status(500).json({ error: 'Failed to create note' }); }
});

app.put('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, tags = [] } = req.body;
  try {
    const note = await prisma.note.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
      },
    });
    res.json({ ...note, tags });
  } catch (e) { res.status(500).json({ error: 'Failed to update note' }); }
});

app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.note.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete note' }); }
});

app.get('/api/dayplans', async (req, res) => {
  try {
    const plans = await prisma.dayPlan.findMany();
    res.json(plans);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch dayplans' }); }
});

app.post('/api/dayplans', async (req, res) => {
  const { date, tasks = [], notes } = req.body;
  try {
    const plan = await prisma.dayPlan.upsert({
      where: { date: new Date(date) },
      update: { tasks, notes },
      create: { date: new Date(date), tasks, notes },
    });
    res.json(plan);
  } catch (e) { res.status(500).json({ error: 'Failed to save dayplan' }); }
});

app.delete('/api/dayplans/:date', async (req, res) => {
  const { date } = req.params;
  try {
    await prisma.dayPlan.delete({ where: { date: new Date(date) } });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: true });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (e) { 
    console.error('Failed to fetch projects:', e);
    res.status(500).json({ error: 'Failed to fetch projects' }); 
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, type, cost, startDate, deadline, notes } = req.body;
  
  if (!name || !type || cost === undefined || !deadline) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, type, cost, deadline' 
    });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        type,
        cost: parseFloat(cost),
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        notes: notes || null,
      },
    });
    res.json(project);
  } catch (e) { 
    console.error('Failed to create project:', e);
    res.status(500).json({ error: 'Failed to create project' }); 
  }
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, cost, startDate, deadline, notes } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        cost: parseFloat(cost),
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        notes,
      },
    });
    res.json(project);
  } catch (e) { 
    console.error('Failed to update project:', e);
    res.status(500).json({ error: 'Failed to update project' }); 
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (e) { 
    console.error('Failed to delete project:', e);
    res.status(500).json({ error: 'Failed to delete project' }); 
  }
});

app.get('/api/project-types', async (req, res) => {
  try {
    const types = await prisma.projectType.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(types);
  } catch (e) {
    console.error('Failed to fetch project types:', e);
    res.status(500).json({ error: 'Failed to fetch project types' });
  }
});

app.post('/api/project-types', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const type = await prisma.projectType.create({
      data: { name },
    });
    res.json(type);
  } catch (e) { 
    console.error('Failed to create project type:', e);
    res.status(500).json({ error: 'Failed to create project type' }); 
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { month: 'desc' },
    });
    res.json(goals);
  } catch (e) { 
    console.error('Failed to fetch goals:', e);
    res.status(500).json({ error: 'Failed to fetch goals' }); 
  }
});

app.post('/api/goals', async (req, res) => {
  const { month, targetAmount } = req.body;
  
  if (!month || targetAmount === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: month, targetAmount' 
    });
  }

  try {
    const goal = await prisma.goal.upsert({
      where: { month },
      update: { targetAmount: parseFloat(targetAmount) },
      create: {
        month,
        targetAmount: parseFloat(targetAmount),
      },
    });
    res.json(goal);
  } catch (e) { 
    console.error('Failed to save goal:', e);
    res.status(500).json({ error: 'Failed to save goal' }); 
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (e) {
    console.error('Failed to delete goal:', e);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

app.patch('/api/projects/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { 
        completed: !project.completed,
        completionDate: project.completed ? null : new Date()
      },
    });
    
    res.json(updatedProject);
  } catch (e) {
    console.error('Failed to toggle project:', e);
    res.status(500).json({ error: 'Failed to toggle project' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend на http://localhost:${PORT}`);
});