/**
 * ============================================================================
 * Experiment 12 B: Session-Based To-Do List Manager (Exercise 2)
 * ============================================================================
 * Implements:
 * - Session-isolated storage (req.session.todos)
 * - Add, Toggle, Delete, and Clear to-do items
 * - Demonstrates that data is bound strictly to the current session cookie
 */

const express = require('express');
const router = express.Router();

// Middleware to ensure session todos array exists
router.use((req, res, next) => {
    if (!req.session.todos) {
        req.session.todos = [];
    }
    next();
});

// GET /todos - View session to-do list
router.get('/', (req, res) => {
    res.render('todos', {
        title: 'Session To-Do Manager - State Management Demo',
        todos: req.session.todos,
        sessionID: req.sessionID,
        user: req.session.user || null
    });
});

// POST /todos/add - Add new item to session
router.post('/add', (req, res) => {
    const { todoItem } = req.body;
    if (todoItem && todoItem.trim()) {
        req.session.todos.push({
            id: Date.now().toString(),
            text: todoItem.trim(),
            completed: false,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }
    res.redirect('/todos');
});

// POST /todos/toggle/:id - Toggle task status
router.post('/toggle/:id', (req, res) => {
    const { id } = req.params;
    const todo = req.session.todos.find(item => item.id === id);
    if (todo) {
        todo.completed = !todo.completed;
    }
    res.redirect('/todos');
});

// POST /todos/delete/:id - Delete item from session
router.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    req.session.todos = req.session.todos.filter(item => item.id !== id);
    res.redirect('/todos');
});

// POST /todos/clear - Clear all todos for this session
router.post('/clear', (req, res) => {
    req.session.todos = [];
    res.redirect('/todos');
});

module.exports = router;
