const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Haversine formula to calculate distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fare calculation rate card
const FARE_RATES = {
  bike: { base: 20, perKm: 5 },       // Rs. 20 base + 5/km
  scooty: { base: 25, perKm: 6 },     // Rs. 25 base + 6/km
  mini: { base: 40, perKm: 10 },      // Rs. 40 base + 10/km
  economy: { base: 60, perKm: 13 },   // Rs. 60 base + 13/km
  xl: { base: 100, perKm: 20 }        // Rs. 100 base + 20/km
};

// All routes require authentication
router.use(protect);

// @desc    Get fare estimation and nearby cabs
// @route   POST /api/ride/estimate
// @access  Private/User
router.post('/estimate', async (req, res, next) => {
  const { pickup, dropoff } = req.body;

  if (!pickup || !dropoff || !pickup.lat || !pickup.lng || !dropoff.lat || !dropoff.lng) {
    return res.status(400).json({ message: 'Pickup and Dropoff coordinates are required' });
  }

  try {
    const distance = getDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    
    // Estimate fares
    const estimates = {
      bike: Math.round(FARE_RATES.bike.base + distance * FARE_RATES.bike.perKm),
      scooty: Math.round(FARE_RATES.scooty.base + distance * FARE_RATES.scooty.perKm),
      mini: Math.round(FARE_RATES.mini.base + distance * FARE_RATES.mini.perKm),
      economy: Math.round(FARE_RATES.economy.base + distance * FARE_RATES.economy.perKm),
      xl: Math.round(FARE_RATES.xl.base + distance * FARE_RATES.xl.perKm)
    };

    // Find nearby online approved drivers
    const drivers = await Driver.find({ isOnline: true, status: 'approved' }).populate('user', 'name');
    
    const nearbyDrivers = drivers
      .map(driver => {
        const d = getDistance(pickup.lat, pickup.lng, driver.currentLocation.lat, driver.currentLocation.lng);
        return {
          id: driver._id,
          driverId: driver.user._id,
          name: driver.user.name,
          vehicleModel: driver.vehicleModel,
          vehicleNumber: driver.vehicleNumber,
          vehicleType: driver.vehicleType,
          currentLocation: driver.currentLocation,
          distance: Math.round(d * 10) / 10 // round to 1 decimal
        };
      })
      .filter(d => d.distance <= 10) // within 10km
      .sort((a, b) => a.distance - b.distance);

    res.json({
      distance: Math.round(distance * 10) / 10,
      estimates,
      nearbyDrivers
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Request a cab
// @route   POST /api/ride/request
// @access  Private/User
router.post('/request', async (req, res, next) => {
  const { pickupLocation, dropoffLocation, fare, vehicleType } = req.body;

  try {
    // Check if user already has an active ride
    const activeRide = await Ride.findOne({
      user: req.user._id,
      status: { $in: ['requested', 'accepted', 'arrived', 'started'] }
    });

    if (activeRide) {
      return res.status(400).json({ message: 'You already have an active ride request or booking' });
    }

    const ride = await Ride.create({
      user: req.user._id,
      pickupLocation,
      dropoffLocation,
      fare,
      vehicleType,
      status: 'requested',
      paymentStatus: 'pending'
    });

    res.status(201).json(ride);
  } catch (error) {
    next(error);
  }
});

// @desc    Get active ride (for current user or driver)
// @route   GET /api/ride/active
// @access  Private
router.get('/active', async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'driver') {
      query = {
        driver: req.user._id,
        status: { $in: ['accepted', 'arrived', 'started'] }
      };
    } else {
      query = {
        user: req.user._id,
        status: { $in: ['requested', 'accepted', 'arrived', 'started'] }
      };
    }

    const ride = await Ride.findOne(query)
      .populate('user', 'name email')
      .populate('driver', 'name email');

    if (!ride) {
      return res.json(null);
    }

    let driverProfile = null;
    if (ride.driver) {
      driverProfile = await Driver.findOne({ user: ride.driver._id });
    }

    res.json({
      ride,
      driverProfile
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get incoming ride requests (for drivers matching vehicle type)
// @route   GET /api/ride/incoming
// @access  Private/Driver
router.get('/incoming', async (req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Access denied. Drivers only' });
  }

  try {
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver || !driver.isOnline || driver.status !== 'approved') {
      return res.json([]);
    }

    // Find requested rides matching driver vehicle type
    const rides = await Ride.find({
      status: 'requested',
      vehicleType: driver.vehicleType
    }).populate('user', 'name');

    // Filter to rides close to driver (within 10km)
    const activeIncoming = rides.filter(ride => {
      const dist = getDistance(
        driver.currentLocation.lat,
        driver.currentLocation.lng,
        ride.pickupLocation.lat,
        ride.pickupLocation.lng
      );
      return dist <= 10;
    });

    res.json(activeIncoming);
  } catch (error) {
    next(error);
  }
});

// @desc    Accept a ride request
// @route   PUT /api/ride/:id/accept
// @access  Private/Driver
router.put('/:id/accept', async (req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ message: 'Access denied. Drivers only' });
  }

  try {
    const ride = await Ride.findById(req.id || req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride is already accepted or completed' });
    }

    const driverProfile = await Driver.findOne({ user: req.user._id });
    if (!driverProfile || driverProfile.status !== 'approved' || !driverProfile.isOnline) {
      return res.status(400).json({ message: 'Driver must be online and approved to accept rides' });
    }

    // Check if driver has another active ride
    const currentActive = await Ride.findOne({
      driver: req.user._id,
      status: { $in: ['accepted', 'arrived', 'started'] }
    });

    if (currentActive) {
      return res.status(400).json({ message: 'You are already on an active ride' });
    }

    ride.driver = req.user._id;
    ride.status = 'accepted';
    await ride.save();

    res.json(ride);
  } catch (error) {
    next(error);
  }
});

// @desc    Update ride status (arrived, started, completed)
// @route   PUT /api/ride/:id/status
// @access  Private/Driver
router.put('/:id/status', async (req, res, next) => {
  const { status, driverRouteIndex } = req.body;

  try {
    const ride = await Ride.findById(req.id || req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the driver assigned to this ride' });
    }

    if (status) {
      ride.status = status;

      if (status === 'completed') {
        // Increment driver total rides
        await Driver.findOneAndUpdate(
          { user: req.user._id },
          { $inc: { totalRides: 1 } }
        );
      }
    }

    if (typeof driverRouteIndex === 'number') {
      ride.driverRouteIndex = driverRouteIndex;
    }

    await ride.save();

    res.json(ride);
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel a ride
// @route   PUT /api/ride/:id/cancel
// @access  Private
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.id || req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Users can cancel if requested or accepted, drivers can cancel if accepted
    if (
      ride.user.toString() !== req.user._id.toString() &&
      (!ride.driver || ride.driver.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Unauthorized to cancel this ride' });
    }

    if (ride.status === 'started' || ride.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel an ongoing or completed ride' });
    }

    ride.status = 'cancelled';
    await ride.save();

    res.json(ride);
  } catch (error) {
    next(error);
  }
});

// @desc    Simulate the next step of a ride (for demo base project)
// @route   PUT /api/ride/:id/simulate-next
// @access  Private
router.put('/:id/simulate-next', async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.id || req.params.id);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status === 'requested') {
      // Find default approved driver Speedy Driver
      const Driver = require('../models/Driver');
      const driver = await Driver.findOne({ status: 'approved' }).populate('user');
      if (driver) {
        ride.driver = driver.user._id;
        ride.status = 'accepted';
      } else {
        ride.status = 'accepted';
      }
    } else if (ride.status === 'accepted') {
      ride.status = 'arrived';
    } else if (ride.status === 'arrived') {
      ride.status = 'started';
      ride.driverRouteIndex = 0;
    } else if (ride.status === 'started') {
      ride.driverRouteIndex = (ride.driverRouteIndex || 0) + 10; // move 10 steps each time
      if (ride.driverRouteIndex >= 30) {
        ride.status = 'completed';
        
        // Update driver stats
        if (ride.driver) {
          const Driver = require('../models/Driver');
          await Driver.findOneAndUpdate(
            { user: ride.driver },
            { $inc: { totalRides: 1 } }
          );
        }
      }
    }

    await ride.save();
    res.json(ride);
  } catch (error) {
    next(error);
  }
});

// @desc    Get ride history for user or driver
// @route   GET /api/ride/history
// @access  Private
router.get('/history', async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'driver') {
      query = { driver: req.user._id, status: { $in: ['completed', 'cancelled'] } };
    } else {
      query = { user: req.user._id, status: { $in: ['completed', 'cancelled'] } };
    }

    const history = await Ride.find(query)
      .populate('user', 'name')
      .populate('driver', 'name')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
