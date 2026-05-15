const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// Get Dashboard Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id });
    const projectIds = projects.map(p => p._id);
    
    console.log(`[STATS] Fetching for ${req.user.name}. Projects: ${projects.length}`);

    const tasks = await Task.find({ project: { $in: projectIds } });
    console.log(`[STATS] Found ${tasks.length} total tasks`);
    
    const stats = {
      projectCount: projects.length,
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      done: tasks.filter(t => t.status === 'Done').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length,
      tasks: tasks.map(t => ({ _id: t._id, title: t.title, status: t.status, project: t.project, priority: t.priority }))
    };
    
    res.send(stats);
  } catch (error) {
    console.error('[STATS ERROR]', error);
    res.status(500).send({ error: error.message });
  }
});

// Create Task
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
        _id: req.body.project, 
        admin: req.user._id 
    });
    
    if (!project) {
        console.log(`Task creation rejected: User ${req.user.name} is not the Admin of project ${req.body.project}`);
        return res.status(403).send({ error: 'Only Project Admins can create tasks' });
    }

    const taskData = { ...req.body };
    if (taskData.assignedTo === '') delete taskData.assignedTo;
    if (taskData.dueDate === '') delete taskData.dueDate;

    const task = new Task({
      ...taskData,
      creator: req.user._id
    });
    await task.save();
    console.log(`Task created: ${task.title} in project ${project.name}`);
    res.status(201).send(task);
  } catch (error) {
    console.error('Task Create Error:', error);
    res.status(400).send({ error: error.message });
  }
});

// Get Project Tasks
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, members: req.user._id });
    if (!project) return res.status(403).send({ error: 'Not authorized' });

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email');
    res.send(tasks);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update Task Status
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['status', 'title', 'description', 'priority', 'dueDate', 'assignedTo'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates' });

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send();

    const project = await Project.findOne({ _id: task.project, members: req.user._id });
    if (!project) return res.status(403).send({ error: 'Not authorized' });

    // Members can only update status if assigned or if they are admin
    if (project.admin.toString() !== req.user._id.toString() && task.assignedTo?.toString() !== req.user._id.toString()) {
        // Allow status update anyway? Requirement says "View and update assigned tasks only"
        // So if assignedTo matches, they can update.
        // If not assigned, and not admin, they can't.
        // Actually, if they are project member, maybe they can see but update is restricted?
        // Let's stick to the requirement: "Member: View and update assigned tasks only"
        return res.status(403).send({ error: 'You can only update tasks assigned to you' });
    }

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
