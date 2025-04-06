const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  title: String,
  description: String,
  address: String,
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  commission: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Pickup', pickupSchema);
