const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// Get expenses for user (optional query: startDate, endDate)
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user.id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    const expense = new Expense({ user: req.user.id, title, amount, category, date, notes });
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const e = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if(!e) return res.status(404).json({ message: 'Not found' });
    res.json(e);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const e = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if(!e) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
