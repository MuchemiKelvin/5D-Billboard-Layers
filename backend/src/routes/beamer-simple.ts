import { Router } from 'express';
import { prisma } from '../lib/database';

const router = Router();

// Get Beamer device configuration
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
        message: 'Beamer device not found'
      });
    }

    const config = {
      deviceId: device.id,
      deviceType: device.deviceType,
      name: device.name,
      location: device.location,
      isActive: device.status === 'ONLINE',
      capabilities: {
        maxResolution: '4K',
        refreshRate: 60,
        supportedFormats: ['MP4', 'WebM', 'GIF'],
        arSupport: true,
        hologramSupport: true
      },
      systemHealth: {
        status: 'HEALTHY',
        lastCheck: new Date(),
        uptime: process.uptime()
      }
    };

    return res.json({
      success: true,
      message: 'Beamer configuration retrieved successfully',
      data: { config }
    });
  } catch (error) {
    console.error('Error fetching beamer config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch beamer configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Beamer status
router.get('/status', async (req, res) => {
  try {
    // Get all beamer devices
    const beamerDevices = await prisma.device.findMany({
      where: { deviceType: 'BEAMER' }
    });

    const status = {
      timestamp: new Date(),
      systemStatus: 'OPERATIONAL',
      beamerDevices: beamerDevices.map(device => ({
        id: device.id,
        name: device.name,
        location: device.location,
        status: device.status,
        lastSeen: device.updatedAt
      })),
      totalDevices: beamerDevices.length,
      onlineDevices: beamerDevices.filter(d => d.status === 'ONLINE').length
    };

    return res.json({
      success: true,
      message: 'Beamer status retrieved successfully',
      data: { status }
    });
  } catch (error) {
    console.error('Error fetching beamer status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch beamer status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
