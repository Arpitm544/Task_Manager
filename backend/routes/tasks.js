const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const { getTask, updateTask, deleteTask, createTask, getAllTasks } = require('../controllers/taskController');

// Get all tasks
router.get('/', auth, getAllTasks);

// Create a new task
router.post('/', auth, [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').trim().notEmpty().withMessage('Task description is required'),
    body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status')
], createTask);

// Get a specific task
router.get('/:id', auth, getTask);

// Update a task
router.patch('/:id', auth, updateTask);

// Delete a task
router.delete('/:id', auth, deleteTask);

module.exports = router; 