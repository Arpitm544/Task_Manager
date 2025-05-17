const Automation = require('../models/Automation');
const Project = require('../models/Project');

const createAutomation = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.body.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    if (!project) return res.status(404).json({ message: 'Project not found or access denied' });

    const automation = await new Automation({ ...req.body, createdBy: req.user._id }).save();
    res.status(201).json(automation);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjectAutomations = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    if (!project) return res.status(404).json({ message: 'Project not found or access denied' });

    const automations = await Automation.find({ project: req.params.projectId })
      .populate('createdBy', 'name email');
    res.json(automations);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('project', 'name');
    if (!automation) return res.status(404).json({ message: 'Automation not found' });

    const project = await Project.findOne({
      _id: automation.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    if (!project) return res.status(404).json({ message: 'Access denied' });

    res.json(automation);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) return res.status(404).json({ message: 'Automation not found' });

    const project = await Project.findOne({
      _id: automation.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    if (!project) return res.status(404).json({ message: 'Access denied' });

    const allowed = ['name', 'trigger', 'conditions', 'actions', 'isActive'];
    const updates = Object.keys(req.body);
    if (!updates.every(k => allowed.includes(k)))
      return res.status(400).json({ message: 'Invalid updates' });

    updates.forEach(k => automation[k] = req.body[k]);
    await automation.save();
    res.json(automation);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) return res.status(404).json({ message: 'Automation not found' });

    const project = await Project.findOne({
      _id: automation.project,
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    });
    if (!project) return res.status(404).json({ message: 'Access denied' });

    await automation.deleteOne();
    res.json(automation);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAutomation,
  getProjectAutomations,
  getAutomation,
  updateAutomation,
  deleteAutomation
};