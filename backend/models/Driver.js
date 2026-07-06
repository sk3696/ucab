const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  vehicleModel: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooty', 'mini', 'economy', 'xl'],
    default: 'economy'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  currentLocation: {
    lat: { type: Number, default: 16.5062 }, // default to Vijayawada city center coords
    lng: { type: Number, default: 80.6480 }
  },
  rating: {
    type: Number,
    default: 5.0
  },
  totalRides: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', DriverSchema);
