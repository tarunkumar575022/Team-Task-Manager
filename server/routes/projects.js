const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      admin: req.user._id,
      members: [req.user._id]
    });
    await project.save();
    res.status(201).send(project);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get User's Projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate('admin', 'name email')
      .populate('members', 'name email');
    res.send(projects);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add Member to Project (Admin only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
    if (!project) return res.status(404).send({ error: 'Project not found or not authorized' });

    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).send({ error: 'User not found with this email' });

    if (!project.members.includes(userToAdd._id)) {
      project.members.push(userToAdd._id);
      await project.save();
    }

    // Return populated members
    const updatedProject = await Project.findById(project._id).populate('members', 'name email');
    res.send(updatedProject);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Remove Member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
    if (!project) return res.status(404).send({ error: 'Project not found or not authorized' });

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    res.send(project);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send({ error: 'Project not found' });

    // Only admin can delete
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Only the project admin can delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    // Also delete associated tasks
    await Task.deleteMany({ project: req.params.id });

    res.send({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
