import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { prisma } from '../lib/database';

const connectedDevices = new Map<string, any>();
const deviceRooms = new Map<string, string>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  logger.info('Setting up Socket.IO handlers...');

  io.on('connection', (socket: Socket) => {
    logger.info(`New device connected: ${socket.id}`);

    // Handle device registration
    socket.on('register_device', async (data: any) => {
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

        logger.info(`Device registered: ${deviceType} (${deviceId})`);
        
        // Notify other devices about new connection
        socket.broadcast.emit('device_connected', {
          deviceId,
          deviceType,
          location,
          timestamp: new Date()
        });

        socket.emit('registration_success', {
          message: 'Device registered successfully',
          deviceId,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Device registration error:', error);
        socket.emit('registration_error', {
          message: 'Failed to register device',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle bid placement
    socket.on('place_bid', async (data: any) => {
      try {
        const { slotId, companyId, amount, bidderInfo } = data;
        
        logger.info(`New bid placed: ${amount} for slot ${slotId} by company ${companyId}`);

        // Create bid in database
        const bid = await prisma.bid.create({
          data: {
            slotId,
            companyId,
            userId: bidderInfo.userId || 'anonymous',
            amount,
            status: 'ACTIVE',
            bidderInfo: bidderInfo || undefined,
            timestamp: new Date()
          },
          include: {
            slot: true,
            company: true
          }
        });

        // Broadcast bid to all connected devices
        io.emit('bid_placed', {
          bidId: bid.id,
          slotId,
          companyId,
          amount,
          bidderInfo,
          timestamp: new Date(),
          slot: bid.slot,
          company: bid.company
        });

        // Update slot status if needed
        await prisma.slot.update({
          where: { id: slotId },
          data: {
            currentBid: amount,
            lastBidTime: new Date(),
            totalBids: { increment: 1 }
          }
        });

        // Broadcast slot update
        io.emit('slot_updated', {
          slotId,
          currentBid: amount,
          lastBidTime: new Date(),
          timestamp: new Date()
        });

        socket.emit('bid_success', {
          message: 'Bid placed successfully',
          bidId: bid.id,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Bid placement error:', error);
        socket.emit('bid_error', {
          message: 'Failed to place bid',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle slot status updates
    socket.on('update_slot_status', async (data: any) => {
      try {
        const { slotId, status, currentSponsor, currentBid } = data;
        
        logger.info(`Updating slot ${slotId} status to ${status}`);

        // Update slot in database
        const updatedSlot = await prisma.slot.update({
          where: { id: slotId },
          data: {
            status: status as any,
            currentSponsor,
            currentBid,
            updatedAt: new Date()
          },
          include: {
            company: true
          }
        });

        // Broadcast slot update to all devices
        io.emit('slot_updated', {
          slotId,
          status,
          currentSponsor,
          currentBid,
          slot: updatedSlot,
          timestamp: new Date()
        });

        socket.emit('slot_update_success', {
          message: 'Slot updated successfully',
          slotId,
          timestamp: new Date()
        });

      } catch (error) {
        logger.error('Slot update error:', error);
        socket.emit('slot_update_error', {
          message: 'Failed to update slot',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle device synchronization
    socket.on('sync_request', async (data: any) => {
      try {
        const { deviceId, syncType } = data;
        
        logger.info(`Sync request from device ${deviceId} for ${syncType}`);

        // Get current system state
        const [slots, companies, activeBids] = await Promise.all([
          prisma.slot.findMany({
            include: { company: true }
          }),
          prisma.company.findMany(),
          prisma.bid.findMany({
            where: { status: 'ACTIVE' },
            include: { slot: true, company: true }
          })
        ]);

        // Send sync data to requesting device
        socket.emit('sync_data', {
          syncType,
          data: {
            slots,
            companies,
            activeBids,
            timestamp: new Date()
          }
        });

        logger.info(`Sync data sent to device ${deviceId}`);

      } catch (error) {
        logger.error('Sync request error:', error);
        socket.emit('sync_error', {
          message: 'Failed to sync data',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle device heartbeat
    socket.on('heartbeat', (data: any) => {
      const deviceInfo = connectedDevices.get(socket.id);
      if (deviceInfo) {
        deviceInfo.lastSeen = new Date();
        connectedDevices.set(socket.id, deviceInfo);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const deviceInfo = connectedDevices.get(socket.id);
      if (deviceInfo) {
        logger.info(`Device disconnected: ${deviceInfo.deviceType} (${deviceInfo.deviceId})`);
        
        // Notify other devices about disconnection
        socket.broadcast.emit('device_disconnected', {
          deviceId: deviceInfo.deviceId,
          deviceType: deviceInfo.deviceType,
          timestamp: new Date()
        });

        // Clean up device data
        connectedDevices.delete(socket.id);
        if (deviceInfo.deviceId) {
          deviceRooms.delete(deviceInfo.deviceId);
        }
      }
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to BeamerShow 24-Slot System',
      socketId: socket.id,
      timestamp: new Date(),
      availableEvents: [
        'register_device',
        'place_bid',
        'update_slot_status',
        'sync_request',
        'heartbeat'
      ]
    });
  });

  logger.info('Socket.IO handlers setup complete');
};
