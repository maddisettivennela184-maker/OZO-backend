const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['ADMIN', 'SUB_ADMIN'],
    default: 'SUB_ADMIN'
  },

  permissions: {
    type: [String],
    default: []
  },

  resetToken: String,
  resetTokenExpire: Date,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
