const mongoose = require('mongoose');

const SupportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  reply: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Support', SupportSchema);
