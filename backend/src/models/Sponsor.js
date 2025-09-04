const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  company: {
    type: String,
    required: true,
    trim: true
  },
  
  logo: {
    type: String, // URL to logo file
    default: null
  },
  
  website: {
    type: String,
    default: null
  },
  
  email: {
    type: String,
    default: null
  },
  
  phone: {
    type: String,
    default: null
  },
  
  category: {
    type: String,
    enum: ['premium', 'bidding', 'promotional', 'standard'],
    default: 'standard'
  },
  
  tier: {
    type: String,
    enum: ['gold', 'silver', 'bronze', 'basic'],
    default: 'basic'
  },
  
  // Content Assets
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
  
  // Bidding Information
  bidAmount: {
    type: Number,
    default: 0
  },
  
  bidStatus: {
    type: String,
    enum: ['active', 'won', 'lost', 'expired'],
    default: 'active'
  },
  
  bidExpiry: {
    type: Date,
    default: null
  },
  
  // Performance Metrics
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
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  description: String,
  
  tags: [String],
  
  notes: String,
  
  // Contact Person
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    position: String
  },
  
  // Contract Details
  contractStart: {
    type: Date,
    default: null
  },
  
  contractEnd: {
    type: Date,
    default: null
  },
  
  contractValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

sponsorSchema.index({ name: 1 });
sponsorSchema.index({ company: 1 });
sponsorSchema.index({ category: 1 });
sponsorSchema.index({ tier: 1 });
sponsorSchema.index({ isActive: 1 });

sponsorSchema.virtual('contractDuration').get(function() {
  if (!this.contractStart || !this.contractEnd) return 0;
  const duration = this.contractEnd - this.contractStart;
  return Math.ceil(duration / (1000 * 60 * 60 * 24)); // days
});

sponsorSchema.virtual('engagementRate').get(function() {
  if (this.totalViews === 0) return 0;
  return ((this.totalScans + this.totalARActivations) / this.totalViews) * 100;
});

sponsorSchema.statics.getActiveSponsors = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

sponsorSchema.statics.getSponsorsByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

sponsorSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalViews: -1 })
    .limit(limit);
};

sponsorSchema.methods.incrementViews = function() {
  this.totalViews += 1;
  return this.save();
};

sponsorSchema.methods.incrementScans = function() {
  this.totalScans += 1;
  return this.save();
};

sponsorSchema.methods.incrementARActivations = function() {
  this.totalARActivations += 1;
  return this.save();
};

sponsorSchema.methods.updateEngagement = function() {
  if (this.totalViews > 0) {
    this.averageEngagement = ((this.totalScans + this.totalARActivations) / this.totalViews) * 100;
  }
  return this.save();
};

module.exports = mongoose.model('Sponsor', sponsorSchema);

