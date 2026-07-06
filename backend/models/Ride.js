const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickupLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  dropoffLocation: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  fare: {
    type: Number,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooty', 'mini', 'economy', 'xl'],
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'requested'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  driverRouteIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ride', RideSchema);
