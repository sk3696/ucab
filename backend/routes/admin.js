const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Support = require('../models/Support');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication & admin role
router.use(protect);
router.use(authorize('admin'));

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalRides = await Ride.countDocuments({});
    
    // Total Revenue (sum of fares from completed paid rides)
    const completedRides = await Ride.find({ status: 'completed', paymentStatus: 'paid' });
    const totalRevenue = completedRides.reduce((sum, ride) => sum + ride.fare, 0);

    const pendingDrivers = await Driver.countDocuments({ status: 'pending' });
    const openTickets = await Support.countDocuments({ status: 'open' });

    res.json({
      totalUsers,
      totalDrivers,
      totalRides,
      totalRevenue,
      pendingDrivers,
      openTickets
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pending drivers
// @route   GET /api/admin/drivers/pending
// @access  Private/Admin
router.get('/drivers/pending', async (req, res, next) => {
  try {
    const pending = await Driver.find({ status: 'pending' }).populate('user', 'name email');
    res.json(pending);
  } catch (error) {
    next(error);
  }
});

// @desc    Approve/Reject a driver registration
// @route   PUT /api/admin/drivers/:id/verify
// @access  Private/Admin
router.put('/drivers/:id/verify', async (req, res, next) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid verification status' });
  }

  try {
    const driver = await Driver.findById(req.id || req.params.id).populate('user', 'name');
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    driver.status = status;
    await driver.save();

    res.json({
      message: `Driver profile for ${driver.user.name} has been ${status}`,
      driver
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all rides in the system
// @route   GET /api/admin/rides
// @access  Private/Admin
router.get('/rides', async (req, res, next) => {
  try {
    const rides = await Ride.find({})
      .populate('user', 'name')
      .populate('driver', 'name')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all support tickets
// @route   GET /api/admin/tickets
// @access  Private/Admin
router.get('/tickets', async (req, res, next) => {
  try {
    const tickets = await Support.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

// @desc    Reply to a support ticket
// @route   PUT /api/admin/tickets/:id/reply
// @access  Private/Admin
router.put('/tickets/:id/reply', async (req, res, next) => {
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: 'Reply content is required' });
  }

  try {
    const ticket = await Support.findById(req.id || req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.reply = reply;
    ticket.status = 'resolved';
    await ticket.save();

    res.json({
      message: 'Reply sent and ticket resolved',
      ticket
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pending riders
// @route   GET /api/admin/riders/pending
// @access  Private/Admin
router.get('/riders/pending', async (req, res, next) => {
  try {
    const pending = await User.find({ role: 'user', status: 'pending' });
    res.json(pending);
  } catch (error) {
    next(error);
  }
});

// @desc    Approve rider
// @route   PUT /api/admin/rider/:id/approve
// @access  Private/Admin
router.put('/rider/:id/approve', async (req, res, next) => {
  try {
    const rider = await User.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }
    rider.status = 'approved';
    await rider.save();
    res.json({ message: 'Rider approved successfully', rider });
  } catch (error) {
    next(error);
  }
});

// @desc    Reject rider
// @route   PUT /api/admin/rider/:id/reject
// @access  Private/Admin
router.put('/rider/:id/reject', async (req, res, next) => {
  try {
    const rider = await User.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }
    rider.status = 'rejected';
    await rider.save();
    res.json({ message: 'Rider rejected successfully', rider });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve driver
// @route   PUT /api/admin/driver/:id/approve
// @access  Private/Admin
router.put('/driver/:id/approve', async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    driver.status = 'approved';
    await driver.save();
    res.json({ message: 'Driver approved successfully', driver });
  } catch (error) {
    next(error);
  }
});

// @desc    Reject driver
// @route   PUT /api/admin/driver/:id/reject
// @access  Private/Admin
router.put('/driver/:id/reject', async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    driver.status = 'rejected';
    await driver.save();
    res.json({ message: 'Driver rejected successfully', driver });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
