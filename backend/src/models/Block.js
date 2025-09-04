const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
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
    type: Number, // in hours
    default: 4
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  currentSlotIndex: {
    type: Number,
    default: 0
  },
  
  totalSlots: {
    type: Number,
    default: 24
  },
  
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'paused'],
    default: 'pending'
  },
  
  autoRotate: {
    type: Boolean,
    default: true
  },
  
  rotationInterval: {
    type: Number, // in seconds
    default: 30
  },
  
  slots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot'
  }],
  
  performance: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalScans: {
      type: Number,
      default: 0
    },
    totalARActivations: {
      type: Number,
      default: 0
    },
    averageEngagement: {
      type: Number,
      default: 0
    }
  },
  
  metadata: {
    description: String,
    tags: [String],
    notes: String
  }
}, {
  timestamps: true
});

blockSchema.index({ startTime: 1, endTime: 1 });
blockSchema.index({ status: 1 });
blockSchema.index({ isActive: 1 });

blockSchema.virtual('timeRemaining').get(function() {
  if (!this.endTime) return 0;
  const now = new Date();
  const remaining = this.endTime - now;
  return Math.max(0, Math.floor(remaining / 1000));
});

blockSchema.virtual('progress').get(function() {
  if (this.totalSlots === 0) return 0;
  return (this.currentSlotIndex / this.totalSlots) * 100;
});

blockSchema.virtual('currentSlot').get(function() {
  if (this.slots.length === 0 || this.currentSlotIndex >= this.slots.length) {
    return null;
  }
  return this.slots[this.currentSlotIndex];
});

blockSchema.statics.getActiveBlock = function() {
  const now = new Date();
  return this.findOne({
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gt: now },
    status: 'active'
  }).populate('slots');
};

blockSchema.statics.getUpcomingBlocks = function(limit = 5) {
  const now = new Date();
  return this.find({
    startTime: { $gt: now },
    isActive: true
  }).sort({ startTime: 1 }).limit(limit);
};

blockSchema.methods.advanceToNextSlot = function() {
  if (this.currentSlotIndex < this.totalSlots - 1) {
    this.currentSlotIndex += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

blockSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

blockSchema.methods.resume = function() {
  this.status = 'active';
  return this.save();
};

blockSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

module.exports = mongoose.model('Block', blockSchema);

