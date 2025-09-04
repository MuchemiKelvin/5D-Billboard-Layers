const cron = require('node-cron');
const { logger } = require('../utils/logger');
const FirebaseService = require('./FirebaseService');

class SlotScheduler {
  constructor() {
    this.currentBlock = null;
    this.currentSlot = null;
    this.rotationTimer = null;
    this.isRunning = false;
    this.autoRotate = true;
    this.rotationInterval = 30; // seconds
  }

  async initialize() {
    try {
      logger.info('🔄 Initializing Slot Scheduler...');
      
      // Get or create current block
      await this.setupCurrentBlock();
      
      // Start the scheduler
      await this.start();
      
      logger.info('✅ Slot Scheduler initialized successfully');
    } catch (error) {
              logger.error('❌ Failed to initialize Slot Scheduler: ' + error.message);
      throw error;
    }
  }

    async setupCurrentBlock() {
    try {
      // Check if there's an active block
      let activeBlock = await FirebaseService.getActiveBlock();
      
      if (!activeBlock) {
        // Create a new block if none exists
        activeBlock = await this.createNewBlock();
      }
      
      this.currentBlock = activeBlock;
      this.currentSlot = activeBlock.currentSlot;
      
      logger.info(`📅 Current block: ${activeBlock.name} (${activeBlock.slots.length} slots)`);
      
      // Setup AR rotation schedule (4x daily)
      await this.setupARRotationSchedule();
      
    } catch (error) {
      logger.error('❌ Failed to setup current block: ' + error.message);
      throw error;
    }
  }

  async createNewBlock() {
    try {
      const now = new Date();
      const blockStart = new Date(now);
      blockStart.setHours(Math.floor(now.getHours() / 4) * 4, 0, 0, 0);
      
      const blockEnd = new Date(blockStart);
      blockEnd.setHours(blockEnd.getHours() + 4);
      
      const blockName = `Block_${blockStart.toISOString().slice(0, 10)}_${blockStart.getHours()}-${blockEnd.getHours()}`;
      
      const newBlock = new Block({
        name: blockName,
        startTime: blockStart,
        endTime: blockEnd,
        duration: 4,
        status: 'active',
        autoRotate: true,
        rotationInterval: this.rotationInterval
      });
      
      const savedBlock = await FirebaseService.create('blocks', newBlock);
      
      // Create 24 slots for this block
      await this.createSlotsForBlock(savedBlock.id);
      
      logger.info(`🆕 Created new block: ${blockName}`);
      
      return newBlock;
    } catch (error) {
              logger.error('❌ Failed to create new block: ' + error.message);
      throw error;
    }
  }

  async createSlotsForBlock(blockId) {
    try {
      const slots = [];
      
      for (let i = 1; i <= 24; i++) {
        const slotStart = new Date();
        slotStart.setSeconds(slotStart.getSeconds() + (i - 1) * this.rotationInterval);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setSeconds(slotEnd.getSeconds() + this.rotationInterval);
        
        const slot = new Slot({
          slotNumber: i,
          blockId: blockId,
          startTime: slotStart,
          endTime: slotEnd,
          duration: this.rotationInterval,
          arRotationTimes: [
            { time: '09:00', isActive: true },
            { time: '13:00', isActive: true },
            { time: '17:00', isActive: true },
            { time: '21:00', isActive: true }
          ]
        });
        
        slots.push(slot);
      }
      
      // Create slots using batch operation
      const slotOperations = slots.map(slot => ({
        type: 'create',
        collection: 'slots',
        data: slot
      }));
      
      await FirebaseService.batchWrite(slotOperations);
      
      // Update block with slot references
      await FirebaseService.update('blocks', blockId, {
        slots: slots.map(s => s.id),
        totalSlots: slots.length
      });
      
      logger.info(`🎯 Created ${slots.length} slots for block ${blockId}`);
      
    } catch (error) {
      logger.error('❌ Failed to create slots for block:', error);
      throw error;
    }
  }

  async setupARRotationSchedule() {
    try {
      // Schedule AR rotation 4x daily
      cron.schedule('0 9,13,17,21 * * *', async () => {
        await this.rotateARContent();
      }, {
        scheduled: true,
        timezone: 'UTC'
      });
      
      logger.info('🔄 AR rotation schedule set (4x daily)');
    } catch (error) {
      logger.error('❌ Failed to setup AR rotation schedule:', error);
    }
  }

  async start() {
    try {
      if (this.isRunning) {
        logger.warn('⚠️ Slot Scheduler is already running');
        return;
      }
      
      this.isRunning = true;
      
      // Start rotation timer
      this.startRotationTimer();
      
      // Schedule next block creation
      this.scheduleNextBlock();
      
      logger.info('🚀 Slot Scheduler started');
    } catch (error) {
      logger.error('❌ Failed to start Slot Scheduler:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (!this.isRunning) {
        logger.warn('⚠️ Slot Scheduler is not running');
        return;
      }
      
      this.isRunning = false;
      
      if (this.rotationTimer) {
        clearTimeout(this.rotationTimer);
        this.rotationTimer = null;
      }
      
      logger.info('⏹️ Slot Scheduler stopped');
    } catch (error) {
      logger.error('❌ Failed to stop Slot Scheduler:', error);
      throw error;
    }
  }

  startRotationTimer() {
    if (!this.isRunning || !this.autoRotate) return;
    
    this.rotationTimer = setTimeout(async () => {
      await this.advanceToNextSlot();
      this.startRotationTimer(); // Schedule next rotation
    }, this.rotationInterval * 1000);
  }

  async advanceToNextSlot() {
    try {
      if (!this.currentBlock) return;
      
      // Log slot change
      if (this.currentSlot) {
        await this.logSlotChange(this.currentSlot.id, 'slot_change');
      }
      
      // Advance to next slot
      await this.currentBlock.advanceToNextSlot();
      
      // Update current slot
      this.currentSlot = this.currentBlock.currentSlot;
      
      // Emit slot change event
      this.emitSlotChange();
      
      logger.info(`🔄 Advanced to slot ${this.currentBlock.currentSlotIndex + 1}`);
      
    } catch (error) {
      logger.error('❌ Failed to advance to next slot:', error);
    }
  }

  async logSlotChange(slotId, eventType) {
    try {
      const analyticsData = {
        eventType,
        slotId,
        slotNumber: this.currentSlot?.slotNumber || 0,
        blockId: this.currentBlock.id,
        sponsorId: this.currentSlot?.sponsor || null,
        deviceType: 'beamer',
        metadata: {
          timestamp: new Date(),
          userAgent: 'BeamerShow-Scheduler',
          ipAddress: 'localhost'
        }
      };
      
      await FirebaseService.logEvent(analyticsData);
      
    } catch (error) {
      logger.error('❌ Failed to log slot change:', error);
    }
  }

  emitSlotChange() {
    // This will be implemented with Socket.IO
    logger.info('📡 Slot change event emitted');
  }

  scheduleNextBlock() {
    try {
      const now = new Date();
      const nextBlockTime = new Date(now);
      nextBlockTime.setHours(Math.ceil(now.getHours() / 4) * 4, 0, 0, 0);
      
      const timeUntilNextBlock = nextBlockTime - now;
      
      setTimeout(async () => {
        await this.transitionToNextBlock();
      }, timeUntilNextBlock);
      
      logger.info(`⏰ Next block scheduled for ${nextBlockTime.toISOString()}`);
    } catch (error) {
      logger.error('❌ Failed to schedule next block:', error);
    }
  }

  async transitionToNextBlock() {
    try {
      // Complete current block
      if (this.currentBlock) {
        await this.currentBlock.complete();
      }
      
      // Create new block
      await this.setupCurrentBlock();
      
      // Restart scheduler
      await this.start();
      
      logger.info('🔄 Transitioned to new block');
    } catch (error) {
      logger.error('❌ Failed to transition to next block:', error);
    }
  }

  async rotateARContent() {
    try {
      logger.info('🔄 Rotating AR content...');
      
      // This would trigger AR content rotation across all slots
      // Implementation depends on specific AR content management
      
      logger.info('✅ AR content rotation completed');
    } catch (error) {
      logger.error('❌ Failed to rotate AR content:', error);
    }
  }

  // Public methods for external control
  async pause() {
    try {
      if (this.currentBlock) {
        await this.currentBlock.pause();
      }
      this.autoRotate = false;
      logger.info('⏸️ Slot rotation paused');
    } catch (error) {
      logger.error('❌ Failed to pause slot rotation:', error);
    }
  }

  async resume() {
    try {
      if (this.currentBlock) {
        await this.currentBlock.resume();
      }
      this.autoRotate = true;
      this.startRotationTimer();
      logger.info('▶️ Slot rotation resumed');
    } catch (error) {
      logger.error('❌ Failed to resume slot rotation:', error);
    }
  }

  async getStatus() {
    return {
      isRunning: this.isRunning,
      autoRotate: this.autoRotate,
      currentBlock: this.currentBlock?.name || 'None',
      currentSlot: this.currentSlot?.slotNumber || 0,
      rotationInterval: this.rotationInterval,
      timeRemaining: this.currentSlot?.timeRemaining || 0
    };
  }
}

module.exports = new SlotScheduler();

