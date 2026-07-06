const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const { protect, authorize } = require('../middleware/auth');

// Apply protect & driver check to all driver routes
router.use(protect);
router.use(authorize('driver'));

// @desc    Toggle driver online/offline status
// @route   PUT /api/driver/status
// @access  Private/Driver
router.put('/status', async (req, res, next) => {
  const { isOnline } = req.body;

  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    if (driver.status !== 'approved') {
      return res.status(403).json({ message: 'Your profile is pending admin approval' });
    }

    driver.isOnline = isOnline;
    await driver.save();

    res.json({
      message: `Driver is now ${isOnline ? 'Online' : 'Offline'}`,
      isOnline: driver.isOnline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update driver current GPS location
// @route   PUT /api/driver/location
// @access  Private/Driver
router.put('/location', async (req, res, next) => {
  const { lat, lng } = req.body;

  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    driver.currentLocation = { lat, lng };
    await driver.save();

    res.json({
      message: 'Location updated successfully',
      currentLocation: driver.currentLocation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get driver stats and earnings
// @route   GET /api/driver/earnings
// @access  Private/Driver
router.get('/earnings', async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    // Get all completed rides for this driver
    const completedRides = await Ride.find({
      driver: req.user._id,
      status: 'completed'
    });

    const totalRides = completedRides.length;
    const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.fare, 0);

    res.json({
      totalRides,
      totalEarnings,
      rating: driver.rating,
      status: driver.status,
      isOnline: driver.isOnline
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
