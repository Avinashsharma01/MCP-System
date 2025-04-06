const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
},
  role: {
    type: String,
    enum: ['MCP', 'PickupPartner'],
    required: true
  },
  walletBalance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('partner', PartnerSchema);
