const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @desc    Process a simulated payment for a completed ride
// @route   POST /api/payment/process
// @access  Private/User
router.post('/process', async (req, res, next) => {
  const { rideId, paymentMethod } = req.body;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the passenger of this ride' });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only pay for completed rides' });
    }

    if (ride.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This ride has already been paid for' });
    }

    // Mock payment processing (100% success)
    const transactionId = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const payment = await Payment.create({
      ride: rideId,
      user: req.user._id,
      amount: ride.fare,
      paymentMethod: paymentMethod || 'card',
      transactionId,
      status: 'completed'
    });

    // Update ride payment status
    ride.paymentStatus = 'paid';
    await ride.save();

    res.status(201).json({
      message: 'Payment completed successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get payment receipt/details
// @route   GET /api/payment/receipt/:rideId
// @access  Private
router.get('/receipt/:rideId', async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ ride: req.id || req.params.rideId })
      .populate('ride')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
