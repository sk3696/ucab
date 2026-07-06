const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @desc    Submit a support ticket
// @route   POST /api/support/ticket
// @access  Private
router.post('/ticket', async (req, res, next) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and Message are required' });
  }

  try {
    const ticket = await Support.create({
      user: req.user._id,
      subject,
      message,
      status: 'open'
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// @desc    Get tickets submitted by user
// @route   GET /api/support/tickets
// @access  Private
router.get('/tickets', async (req, res, next) => {
  try {
    const tickets = await Support.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
