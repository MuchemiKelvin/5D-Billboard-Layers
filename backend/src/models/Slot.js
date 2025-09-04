const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 24,
    unique: true
  },
  
  slotType: {
    type: String,
    enum: ['premium', 'bidding', 'promotional', 'standard', 'live-bidding'],
    default: 'standard'
  },
  
  category: {
    type: String,
    enum: ['premium', 'bidding', 'promotional', 'standard'],
    default: 'standard'
  },
  
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor',
    default: null
  },
  
  staticLogo: {
    type: String,
    default: null
  },
  
  hologramVideo: {
    type: String,
    default: null
  },
  
  arModel: {
    type: String,
    default: null
  },
  
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number,
    default: 30
  },
  
  layer1Active: {
    type: Boolean,
    default: true
  },
  
  layer2Active: {
    type: Boolean,
    default: true
  },
  
  layer3Active: {
    type: Boolean,
    default: true
  },
  
  arRotationTimes: [{
    time: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  viewCount: {
    type: Number,
    default: 0
  },
  
  scanCount: {
    type: Number,
    default: 0
  },
  
  arActivationCount: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  tags: [String],
  notes: String
}, {
  timestamps: true
});

slotSchema.index({ slotNumber: 1 });
slotSchema.index({ blockId: 1 });
slotSchema.index({ startTime: 1, endTime: 1 });

slotSchema.virtual('timeRemaining').get(function() {
  if (!this.endTime) return 0;
  const now = new Date();
  const remaining = this.endTime - now;
  return Math.max(0, Math.floor(remaining / 1000));
});

slotSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startTime) return 'pending';
  if (now >= this.startTime && now < this.endTime) return 'active';
  return 'completed';
});

slotSchema.statics.getActiveSlots = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gt: now }
  }).populate('sponsor').populate('blockId');
};

slotSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

slotSchema.methods.incrementScan = function() {
  this.scanCount += 1;
  return this.save();
};

slotSchema.methods.incrementARActivation = function() {
  this.arActivationCount += 1;
  return this.save();
};

module.exports = mongoose.model('Slot', slotSchema);

