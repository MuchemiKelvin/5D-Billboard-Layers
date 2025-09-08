import { Router } from 'express';
import { prisma } from '../lib/database';

const router = Router();

// Get iPad device configuration
router.get('/config/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    // Get device configuration from database
    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'iPad device not found'
      });
    }

    const config = {
      deviceId: device.id,
      deviceType: device.deviceType,
      name: device.name,
      location: device.location,
      isActive: device.status === 'ONLINE',
      capabilities: {
        maxResolution: '2K',
        refreshRate: 60,
        supportedFormats: ['MP4', 'WebM', 'GIF', 'PNG', 'JPG'],
        touchSupport: true,
        nfcSupport: true,
        qrCodeSupport: true,
        arSupport: true
      },
      systemHealth: {
        status: 'HEALTHY',
        lastCheck: new Date(),
        uptime: process.uptime()
      }
    };

    return res.json({
      success: true,
      message: 'iPad configuration retrieved successfully',
      data: { config }
    });
  } catch (error) {
    console.error('Error fetching iPad config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch iPad configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update iPad location
router.post('/location', async (req, res) => {
  try {
    const { deviceId, latitude, longitude } = req.body;

    if (!deviceId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Device ID, latitude, and longitude are required'
      });
    }

    // Update device location
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        location: `${latitude},${longitude}`,
        updatedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'iPad location updated successfully',
      data: { 
        deviceId: updatedDevice.id,
        location: updatedDevice.location,
        updatedAt: updatedDevice.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating iPad location:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update iPad location',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get iPad status
router.get('/status', async (req, res) => {
  try {
    // Get all iPad devices
    const ipadDevices = await prisma.device.findMany({
      where: { deviceType: 'IPAD' }
    });

    const status = {
      timestamp: new Date(),
      systemStatus: 'OPERATIONAL',
      ipadDevices: ipadDevices.map(device => ({
        id: device.id,
        name: device.name,
        location: device.location,
        status: device.status,
        lastSeen: device.updatedAt
      })),
      totalDevices: ipadDevices.length,
      onlineDevices: ipadDevices.filter(d => d.status === 'ONLINE').length
    };

    return res.json({
      success: true,
      message: 'iPad status retrieved successfully',
      data: { status }
    });
  } catch (error) {
    console.error('Error fetching iPad status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch iPad status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
