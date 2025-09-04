const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Event Type
  eventType: {
    type: String,
    enum: ['slot_view', 'qr_scan', 'ar_activation', 'nfc_trigger', 'slot_change', 'error'],
    required: true
  },
  
  // Slot Information
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  
  slotNumber: {
    type: Number,
    required: true
  },
  
  // Block Information
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  
  // Sponsor Information
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor',
    default: null
  },
  
  // Device Information
  deviceType: {
    type: String,
    enum: ['beamer', 'tablet', 'mobile', 'desktop', 'unknown'],
    default: 'unknown'
  },
  
  deviceId: {
    type: String,
    default: null
  },
  
  // User Information
  userId: {
    type: String,
    default: null
  },
  
  sessionId: {
    type: String,
    default: null
  },
  
  // Location & Context
  location: {
    type: String,
    default: null
  },
  
  context: {
    type: String,
    default: null
  },
  
  // AR Specific Data
  arData: {
    modelType: String,
    loadTime: Number, // in milliseconds
    interactionType: String,
    duration: Number // in seconds
  },
  
  // QR/NFC Specific Data
  triggerData: {
    triggerType: {
      type: String,
      enum: ['qr', 'nfc', 'manual', 'auto'],
      default: 'manual'
    },
    triggerCode: String,
    responseTime: Number // in milliseconds
  },
  
  // Performance Metrics
  performance: {
    responseTime: Number, // in milliseconds
    loadTime: Number, // in milliseconds
    errorCount: {
      type: Number,
      default: 0
    },
    success: {
      type: Boolean,
      default: true
    }
  },
  
  // Error Information
  error: {
    code: String,
    message: String,
    stack: String
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    timezone: String
  }
}, {
  timestamps: true
});

analyticsSchema.index({ eventType: 1 });
analyticsSchema.index({ slotId: 1 });
analyticsSchema.index({ blockId: 1 });
analyticsSchema.index({ sponsorId: 1 });
analyticsSchema.index({ deviceType: 1 });
analyticsSchema.index({ 'metadata.timestamp': 1 });
analyticsSchema.index({ eventType: 1, 'metadata.timestamp': 1 });

// Static methods for analytics
analyticsSchema.statics.getEventCounts = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage['metadata.timestamp'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

analyticsSchema.statics.getSlotPerformance = function(slotId, startDate, endDate) {
  const matchStage = { slotId: mongoose.Types.ObjectId(slotId) };
  if (startDate && endDate) {
    matchStage['metadata.timestamp'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$performance.responseTime' },
        avgLoadTime: { $avg: '$performance.loadTime' }
      }
    }
  ]);
};

analyticsSchema.statics.getSponsorPerformance = function(sponsorId, startDate, endDate) {
  const matchStage = { sponsorId: mongoose.Types.ObjectId(sponsorId) };
  if (startDate && endDate) {
    matchStage['metadata.timestamp'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        totalResponseTime: { $sum: '$performance.responseTime' },
        totalLoadTime: { $sum: '$performance.loadTime' }
      }
    }
  ]);
};

analyticsSchema.statics.getDeviceStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage['metadata.timestamp'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$deviceType',
        count: { $sum: 1 },
        eventTypes: { $addToSet: '$eventType' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

analyticsSchema.statics.getHourlyStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage['metadata.timestamp'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          hour: { $hour: '$metadata.timestamp' },
          eventType: '$eventType'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);
};

// Instance methods
analyticsSchema.methods.markAsError = function(errorCode, errorMessage, errorStack) {
  this.error = {
    code: errorCode,
    message: errorMessage,
    stack: errorStack
  };
  this.performance.success = false;
  this.performance.errorCount += 1;
  return this.save();
};

analyticsSchema.methods.updatePerformance = function(responseTime, loadTime) {
  this.performance.responseTime = responseTime;
  this.performance.loadTime = loadTime;
  return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema);

