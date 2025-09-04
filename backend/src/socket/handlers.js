const { logger } = require('../utils/logger');
const FirebaseService = require('../services/FirebaseService');
const SlotScheduler = require('../services/SlotScheduler');

const connectedDevices = new Map();
const deviceRooms = new Map();

const setupSocketHandlers = (io) => {
  logger.info('🔌 Setting up Socket.IO handlers...');

  io.on('connection', (socket) => {
    logger.info(`📱 New device connected: ${socket.id}`);

    // Handle device registration
    socket.on('register_device', async (data) => {
      try {
        const { deviceType, deviceId, location, capabilities } = data;
        
        // Store device information
        connectedDevices.set(socket.id, {
          deviceType,
          deviceId,
          location,
          capabilities,
          connectedAt: new Date(),
          lastSeen: new Date()
        });

        // Join device-specific room
        socket.join(`device_${deviceId}`);
        deviceRooms.set(deviceId, socket.id);

        // Send current system status
        const status = await SlotScheduler.getStatus();
        socket.emit('system_status', status);

        // Send current slot information
        const currentSlot = await SlotScheduler.currentSlot;
        if (currentSlot) {
          socket.emit('current_slot', {
            slotNumber: currentSlot.slotNumber,
            sponsor: currentSlot.sponsor,
            timeRemaining: currentSlot.timeRemaining,
            layers: {
              layer1: currentSlot.layer1Active,
              layer2: currentSlot.layer2Active,
              layer3: currentSlot.layer3Active
            }
          });
        }

        logger.info(`📱 Device registered: ${deviceType} (${deviceId}) at ${location}`);
        
        // Notify other devices
        socket.broadcast.emit('device_connected', {
          deviceType,
          deviceId,
          location,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('❌ Device registration failed: ' + error.message);
        socket.emit('error', { message: 'Device registration failed' });
      }
    });

    // Handle slot view tracking
    socket.on('slot_view', async (data) => {
      try {
        const { slotId, slotNumber, deviceType, deviceId } = data;
        
        // Log the view
        const analyticsData = {
          eventType: 'slot_view',
          slotId,
          slotNumber,
          blockId: SlotScheduler.currentBlock?.id,
          sponsorId: null, // Will be populated if slot has sponsor
          deviceType: deviceType || 'unknown',
          deviceId,
          metadata: {
            timestamp: new Date(),
            userAgent: 'BeamerShow-Client',
            ipAddress: socket.handshake.address
          }
        };

        await FirebaseService.logEvent(analyticsData);

        // Increment slot view count
        const slot = await FirebaseService.getById('slots', slotId);
        if (slot) {
          await FirebaseService.update('slots', slotId, {
            viewCount: (slot.viewCount || 0) + 1
          });
        }

        logger.info(`👁️ Slot view logged: Slot ${slotNumber} by ${deviceType} (${deviceId})`);

        // Broadcast to all connected devices
        io.emit('slot_viewed', {
          slotId,
          slotNumber,
          deviceType,
          deviceId,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('❌ Failed to log slot view: ' + error.message);
        socket.emit('error', { message: 'Failed to log slot view' });
      }
    });

    // Handle QR code scans
    socket.on('qr_scan', async (data) => {
      try {
        const { slotId, slotNumber, qrCode, deviceType, deviceId } = data;
        
        // Log the QR scan
        const analytics = new Analytics({
          eventType: 'qr_scan',
          slotId,
          slotNumber,
          blockId: SlotScheduler.currentBlock?._id,
          sponsorId: null,
          deviceType: deviceType || 'unknown',
          deviceId,
          triggerData: {
            triggerType: 'qr',
            triggerCode: qrCode,
            responseTime: Date.now()
          },
          metadata: {
            timestamp: new Date(),
            userAgent: 'BeamerShow-Client',
            ipAddress: socket.handshake.address
          }
        });

        await analytics.save();

        // Increment slot scan count
        const slot = await Slot.findById(slotId);
        if (slot) {
          await slot.incrementScan();
        }

        logger.info(`📱 QR scan logged: Slot ${slotNumber}, Code: ${qrCode} by ${deviceType} (${deviceId})`);

        // Broadcast to all connected devices
        io.emit('qr_scanned', {
          slotId,
          slotNumber,
          qrCode,
          deviceType,
          deviceId,
          timestamp: new Date()
        });

        // Trigger AR content if available
        if (slot && slot.arModel) {
          socket.emit('ar_trigger', {
            slotId,
            slotNumber,
            arModel: slot.arModel,
            sponsor: slot.sponsor
          });
        }

      } catch (error) {
        logger.error('❌ Failed to log QR scan: ' + error.message);
        socket.emit('error', { message: 'Failed to log QR scan' });
      }
    });

    // Handle NFC triggers
    socket.on('nfc_trigger', async (data) => {
      try {
        const { slotId, slotNumber, nfcTag, deviceType, deviceId } = data;
        
        // Log the NFC trigger
        const analytics = new Analytics({
          eventType: 'nfc_trigger',
          slotId,
          slotNumber,
          blockId: SlotScheduler.currentBlock?._id,
          sponsorId: null,
          deviceType: deviceType || 'unknown',
          deviceId,
          triggerData: {
            triggerType: 'nfc',
            triggerCode: nfcTag,
            responseTime: Date.now()
          },
          metadata: {
            timestamp: new Date(),
            userAgent: 'BeamerShow-Client',
            ipAddress: socket.handshake.address
          }
        });

        await analytics.save();

        logger.info(`📱 NFC trigger logged: Slot ${slotNumber}, Tag: ${nfcTag} by ${deviceType} (${deviceId})`);

        // Broadcast to all connected devices
        io.emit('nfc_triggered', {
          slotId,
          slotNumber,
          nfcTag,
          deviceType,
          deviceId,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('❌ Failed to log NFC trigger: ' + error.message);
        socket.emit('error', { message: 'Failed to log NFC trigger' });
      }
    });

    // Handle AR activations
    socket.on('ar_activation', async (data) => {
      try {
        const { slotId, slotNumber, arModel, interactionType, duration, deviceType, deviceId } = data;
        
        // Log the AR activation
        const analytics = new Analytics({
          eventType: 'ar_activation',
          slotId,
          slotNumber,
          blockId: SlotScheduler.currentBlock?._id,
          sponsorId: null,
          deviceType: deviceType || 'unknown',
          deviceId,
          arData: {
            modelType: arModel,
            interactionType,
            duration
          },
          metadata: {
            timestamp: new Date(),
            userAgent: 'BeamerShow-Client',
            ipAddress: socket.handshake.address
          }
        });

        await analytics.save();

        // Increment slot AR activation count
        const slot = await Slot.findById(slotId);
        if (slot) {
          await slot.incrementARActivation();
        }

        logger.info(`🎯 AR activation logged: Slot ${slotNumber}, Model: ${arModel} by ${deviceType} (${deviceId})`);

        // Broadcast to all connected devices
        io.emit('ar_activated', {
          slotId,
          slotNumber,
          arModel,
          interactionType,
          duration,
          deviceType,
          deviceId,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('❌ Failed to log AR activation: ' + error.message);
        socket.emit('error', { message: 'Failed to log AR activation' });
      }
    });

    // Handle device sync requests
    socket.on('sync_request', async (data) => {
      try {
        const { deviceId, lastSyncTime } = data;
        
        // Get updates since last sync
        const updates = await getUpdatesSince(lastSyncTime);
        
        socket.emit('sync_response', {
          updates,
          timestamp: new Date(),
          currentSlot: SlotScheduler.currentSlot,
          systemStatus: await SlotScheduler.getStatus()
        });

        logger.info(`🔄 Sync completed for device: ${deviceId}`);

      } catch (error) {
        logger.error('❌ Sync request failed: ' + error.message);
        socket.emit('error', { message: 'Sync failed' });
      }
    });

    // Handle device heartbeat
    socket.on('heartbeat', (data) => {
      const device = connectedDevices.get(socket.id);
      if (device) {
        device.lastSeen = new Date();
        socket.emit('heartbeat_ack', { timestamp: new Date() });
      }
    });

    // Handle device disconnect
    socket.on('disconnect', () => {
      const device = connectedDevices.get(socket.id);
      if (device) {
        logger.info(`📱 Device disconnected: ${device.deviceType} (${device.deviceId})`);
        
        // Remove from connected devices
        connectedDevices.delete(socket.id);
        deviceRooms.delete(device.deviceId);
        
        // Notify other devices
        socket.broadcast.emit('device_disconnected', {
          deviceType: device.deviceType,
          deviceId: device.deviceId,
          timestamp: new Date()
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
              logger.error('❌ Socket error: ' + error.message);
    });
  });

  // Setup periodic broadcasts
  setupPeriodicBroadcasts(io);

  logger.info('✅ Socket.IO handlers setup completed');
};

const setupPeriodicBroadcasts = (io) => {
  // Broadcast system status every 30 seconds
  setInterval(async () => {
    try {
      const status = await SlotScheduler.getStatus();
      io.emit('system_status_update', status);
    } catch (error) {
              logger.error('❌ Failed to broadcast system status: ' + error.message);
    }
  }, 30000);

  // Broadcast current slot info every 10 seconds
  setInterval(async () => {
    try {
      const currentSlot = SlotScheduler.currentSlot;
      if (currentSlot) {
        io.emit('slot_update', {
          slotNumber: currentSlot.slotNumber,
          timeRemaining: currentSlot.timeRemaining,
          sponsor: currentSlot.sponsor
        });
      }
    } catch (error) {
              logger.error('❌ Failed to broadcast slot update: ' + error.message);
    }
  }, 10000);
};

const getUpdatesSince = async (lastSyncTime) => {
  try {
    const updates = {
      slots: [],
      blocks: [],
      analytics: []
    };

    if (lastSyncTime) {
      const since = new Date(lastSyncTime);
      
      // Get updated slots
      updates.slots = await Slot.find({
        updatedAt: { $gt: since }
      }).select('slotNumber slotType category sponsor isActive');

      // Get updated blocks
      updates.blocks = await Block.find({
        updatedAt: { $gt: since }
      }).select('name status currentSlotIndex totalSlots');

      // Get recent analytics
      updates.analytics = await Analytics.find({
        'metadata.timestamp': { $gt: since }
      }).select('eventType slotNumber deviceType').limit(100);
    }

    return updates;
  } catch (error) {
            logger.error('❌ Failed to get updates: ' + error.message);
    return { slots: [], blocks: [], analytics: [] };
  }
};

const broadcastToDevice = (deviceId, event, data) => {
  const socketId = deviceRooms.get(deviceId);
  if (socketId) {
    const io = require('../server').io;
    io.to(socketId).emit(event, data);
  }
};

const broadcastToAllDevices = (event, data) => {
  const io = require('../server').io;
  io.emit(event, data);
};

module.exports = {
  setupSocketHandlers,
  broadcastToDevice,
  broadcastToAllDevices,
  getConnectedDevices: () => connectedDevices,
  getDeviceRooms: () => deviceRooms
};

