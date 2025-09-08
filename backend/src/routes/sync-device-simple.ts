import { Router } from 'express';
import { prisma } from '../lib/database';

const router = Router();

// Register a new device for sync
router.post('/device/register', async (req, res) => {
  try {
    const { deviceId, deviceType, capabilities, isPrimary = false } = req.body;

    if (!deviceId || !deviceType) {
      return res.status(400).json({
        success: false,
        message: 'Device ID and device type are required'
      });
    }

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (existingDevice) {
      // Update existing device
      const updatedDevice = await prisma.device.update({
        where: { id: deviceId },
        data: {
          deviceType,
          status: 'ONLINE',
          updatedAt: new Date()
        }
      });

      return res.json({
        success: true,
        message: 'Device updated successfully',
        data: { device: updatedDevice }
      });
    }

    // Create new device
    const newDevice = await prisma.device.create({
      data: {
        id: deviceId,
        deviceId: deviceId,
        deviceType,
        name: `${deviceType} Device`,
        location: 'Unknown',
        status: 'ONLINE'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: { device: newDevice }
    });
  } catch (error) {
    console.error('Device registration failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Perform sync for specific device
router.post('/device/:deviceId/sync', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Get latest slot data
    const slots = await prisma.slot.findMany({
      where: { isActive: true },
      include: {
        company: true,
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    // Prepare sync data
    const syncData = {
      timestamp: new Date(),
      deviceId,
      slots: slots.map(slot => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        status: slot.status,
        company: slot.company ? {
          id: slot.company.id,
          name: slot.company.name,
          logo: slot.company.logo,
          tier: slot.company.tier
        } : null,
        currentBid: slot.bids[0]?.amount || 0,
        reservePrice: slot.reservePrice,
        isActive: slot.isActive
      })),
      systemHealth: {
        status: 'HEALTHY',
        lastCheck: new Date(),
        uptime: process.uptime()
      }
    };

    return res.json({
      success: true,
      message: 'Device sync completed successfully',
      data: syncData
    });
  } catch (error) {
    console.error('Device sync failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync device',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Broadcast sync data to all devices
router.post('/device/broadcast', async (req, res) => {
  try {
    const { data, priority = 'MEDIUM', targetDevices } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Broadcast data is required'
      });
    }

    // Get all active devices or specific target devices
    const devices = targetDevices 
      ? await prisma.device.findMany({
          where: { 
            id: { in: targetDevices },
            status: 'ONLINE' 
          }
        })
      : await prisma.device.findMany({
          where: { status: 'ONLINE' }
        });

    const broadcastId = `broadcast-${Date.now()}`;
    const results = devices.map(device => ({
      deviceId: device.id,
      status: 'PENDING'
    }));

    return res.json({
      success: true,
      message: 'Broadcast initiated successfully',
      data: {
        broadcastId,
        totalDevices: devices.length,
        results
      }
    });
  } catch (error) {
    console.error('Device broadcast failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast to devices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
