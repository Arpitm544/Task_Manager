const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const { getProjectAutomations, getAutomation, updateAutomation, deleteAutomation, createAutomation } = require('../controllers/automationController');

// Create a new automation
router.post('/', auth, [
    body('name').trim().notEmpty().withMessage('Automation name is required'),
    body('project').notEmpty().withMessage('Project ID is required'),
    body('trigger').isIn(['task_created', 'task_completed', 'due_date_approaching', 'status_changed'])
        .withMessage('Invalid trigger type'),
    body('actions').isArray({ min: 1 }).withMessage('At least one action is required')
], createAutomation);

// Get all automations for a project
router.get('/project/:projectId', auth, getProjectAutomations);

// Get a specific automation
router.get('/:id', auth, getAutomation);

// Update an automation
router.patch('/:id', auth, updateAutomation);

// Delete an automation
router.delete('/:id', auth, deleteAutomation);

module.exports = router; 