const { logger } = require('../utils/logger');

class FirebaseService {
  constructor() {
    this.isMockMode = true;
    this.db = null;
    this.storage = null;
    logger.info('📋 FirebaseService initialized in mock mode');
  }

  // Mock data for development
  getMockData(collection) {
    const mockData = {
      sponsors: [
        { id: '1', name: 'Demo Sponsor 1', company: 'Demo Corp', category: 'premium', tier: 'gold', isActive: true, viewCount: 150, scanCount: 25, arActivationCount: 10 },
        { id: '2', name: 'Demo Sponsor 2', company: 'Demo Inc', category: 'standard', tier: 'silver', isActive: true, viewCount: 120, scanCount: 18, arActivationCount: 8 },
        { id: '3', name: 'Demo Sponsor 3', company: 'Demo Ltd', category: 'bidding', tier: 'bronze', isActive: true, viewCount: 95, scanCount: 12, arActivationCount: 5 }
      ],
      slots: [
        { id: '1', slotNumber: 1, sponsorId: '1', isActive: true, layer: 'layer-1-static', startTime: new Date(), endTime: new Date(Date.now() + 20000) },
        { id: '2', slotNumber: 2, sponsorId: '2', isActive: true, layer: 'layer-1-static', startTime: new Date(), endTime: new Date(Date.now() + 20000) },
        { id: '3', slotNumber: 3, sponsorId: '3', isActive: true, layer: 'layer-1-static', startTime: new Date(), endTime: new Date(Date.now() + 20000) }
      ],
      blocks: [
        { id: '1', blockNumber: 1, startTime: '09:00', endTime: '13:00', isActive: true, totalSlots: 24 },
        { id: '2', blockNumber: 2, startTime: '13:00', endTime: '17:00', isActive: false, totalSlots: 24 },
        { id: '3', blockNumber: 3, startTime: '17:00', endTime: '21:00', isActive: false, totalSlots: 24 }
      ]
    };
    return mockData[collection] || [];
  }

  // Generic CRUD operations
  async create(collection, data) {
    try {
      logger.info(`📋 Mock mode: Creating document in ${collection}`);
      const mockId = Date.now().toString();
      const newDoc = { id: mockId, ...data };
      logger.info(`✅ Mock document created in ${collection}: ${mockId}`);
      return newDoc;
    } catch (error) {
      logger.error(`❌ Failed to create mock document in ${collection}: ${error.message}`);
      throw error;
    }
  }

  async getById(collection, id) {
    try {
      const mockData = this.getMockData(collection);
      const doc = mockData.find(item => item.id === id);
      logger.info(`📋 Mock mode: Returning document ${id} from ${collection}`);
      return doc || null;
    } catch (error) {
      logger.error(`❌ Failed to get mock document from ${collection}: ${error.message}`);
      throw error;
    }
  }

  async getAll(collection, query = {}) {
    try {
      const mockData = this.getMockData(collection);
      logger.info(`📋 Mock mode: Returning ${mockData.length} documents from ${collection}`);
      return mockData;
    } catch (error) {
      logger.error(`❌ Failed to get mock documents from ${collection}: ${error.message}`);
      throw error;
    }
  }

  async update(collection, id, data) {
    try {
      logger.info(`📋 Mock mode: Updating document in ${collection}: ${id}`);
      const updatedDoc = { id, ...data };
      logger.info(`✅ Mock document updated in ${collection}: ${id}`);
      return updatedDoc;
    } catch (error) {
      logger.error(`❌ Failed to update mock document in ${collection}: ${error.message}`);
      throw error;
    }
  }

  async delete(collection, id) {
    try {
      logger.info(`📋 Mock mode: Deleting document from ${collection}: ${id}`);
      logger.info(`✅ Mock document deleted from ${collection}: ${id}`);
      return { id };
    } catch (error) {
      logger.error(`❌ Failed to delete mock document from ${collection}: ${error.message}`);
      throw error;
    }
  }

  // Slot-specific operations
  async getSlotsByBlock(blockId) {
    try {
      const mockData = this.getMockData('slots');
      const slots = mockData.filter(slot => slot.blockId === blockId);
      logger.info(`📋 Mock mode: Returning ${slots.length} slots for block ${blockId}`);
      return slots;
    } catch (error) {
      logger.error(`❌ Failed to get mock slots for block ${blockId}: ${error.message}`);
      throw error;
    }
  }

  async getActiveSlots() {
    try {
      const mockData = this.getMockData('slots');
      const activeSlots = mockData.filter(slot => slot.isActive);
      logger.info(`📋 Mock mode: Returning ${activeSlots.length} active slots`);
      return activeSlots;
    } catch (error) {
      logger.error(`❌ Failed to get mock active slots: ${error.message}`);
      throw error;
    }
  }

  // Block-specific operations
  async getActiveBlock() {
    try {
      const mockData = this.getMockData('blocks');
      const activeBlock = mockData.find(block => block.isActive);
      logger.info(`📋 Mock mode: Returning active block`);
      return activeBlock || null;
    } catch (error) {
      logger.error(`❌ Failed to get mock active block: ${error.message}`);
      throw error;
    }
  }

  // Analytics operations
  async logEvent(eventData) {
    try {
      logger.info(`📋 Mock mode: Logging analytics event: ${eventData.eventType}`);
      logger.info(`✅ Mock analytics event logged: ${eventData.eventType}`);
    } catch (error) {
      logger.error(`❌ Failed to log mock analytics event: ${error.message}`);
      throw error;
    }
  }

  // File storage operations (mock)
  async uploadFile(bucketName, filePath, destination) {
    try {
      logger.info(`📋 Mock mode: File upload to ${destination}`);
      logger.info(`✅ Mock file uploaded to ${destination}`);
      return `mock://${bucketName}/${destination}`;
    } catch (error) {
      logger.error(`❌ Failed to upload mock file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(bucketName, destination) {
    try {
      logger.info(`📋 Mock mode: File deletion: ${destination}`);
      logger.info(`✅ Mock file deleted: ${destination}`);
    } catch (error) {
      logger.error(`❌ Failed to delete mock file: ${error.message}`);
      throw error;
    }
  }

  // Batch operations (mock)
  async batchWrite(operations) {
    try {
      logger.info(`📋 Mock mode: Batch write with ${operations.length} operations`);
      logger.info(`✅ Mock batch write completed: ${operations.length} operations`);
    } catch (error) {
      logger.error(`❌ Mock batch write failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FirebaseService();
