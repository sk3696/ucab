const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

const backupPath = path.join(__dirname, '../data/registered_users.json');

const saveToBackup = (userData, driverData) => {
  try {
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let users = [];
    if (fs.existsSync(backupPath)) {
      users = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    }
    if (!users.find(u => u.user.email === userData.email)) {
      users.push({ user: userData, driver: driverData });
      fs.writeFileSync(backupPath, JSON.stringify(users, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Backup write failed', err);
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretucabtokenkey123!', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user or driver
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  const { name, email, password, role, vehicleModel, vehicleNumber, vehicleType } = req.body;

  try {
    const sanitizedEmail = email ? email.toLowerCase().trim() : '';
    const userExists = await User.findOne({ email: sanitizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: sanitizedEmail,
      password: hashedPassword,
      role: role || 'user',
      status: 'approved'
    });

    let driverInfo = null;

    if (user.role === 'driver') {
      if (!vehicleModel || !vehicleNumber) {
        // Cleanup user if driver details are missing
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Vehicle details are required for driver registration' });
      }

      const vehicleExists = await Driver.findOne({ vehicleNumber });
      if (vehicleExists) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Vehicle number already registered' });
      }

      driverInfo = await Driver.create({
        user: user._id,
        vehicleModel,
        vehicleNumber,
        vehicleType: vehicleType || 'economy',
        status: 'pending' // starts as pending verification
      });
    }

    // Save user details to persistent backup JSON
    saveToBackup({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status
    }, driverInfo ? {
      vehicleModel: driverInfo.vehicleModel,
      vehicleNumber: driverInfo.vehicleNumber,
      vehicleType: driverInfo.vehicleType,
      status: driverInfo.status
    } : null);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
      driverInfo
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const sanitizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: sanitizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      let driverInfo = null;
      if (user.role === 'driver') {
        driverInfo = await Driver.findOne({ user: user._id });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
        driverInfo
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let driverInfo = null;

    if (user.role === 'driver') {
      driverInfo = await Driver.findOne({ user: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      driverInfo
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reset password (Forgot Password flow)
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  const { email, newPassword } = req.body;

  try {
    const sanitizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Encrypt new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Also update password in local JSON persistent backup
    if (fs.existsSync(backupPath)) {
      try {
        let users = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const index = users.findIndex(u => u.user.email === sanitizedEmail);
        if (index !== -1) {
          users[index].user.password = hashedPassword;
          fs.writeFileSync(backupPath, JSON.stringify(users, null, 2), 'utf8');
        }
      } catch (err) {
        console.error('Backup reset password update failed', err);
      }
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
