import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.analytics.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.aRContent.deleteMany();
    await prisma.hologramEffect.deleteMany();
    await prisma.slot.deleteMany();
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.systemConfig.deleteMany();

    // Create system configuration
    console.log('Creating system configuration...');
    await prisma.systemConfig.createMany({
      data: [
        {
          key: 'rotation_speed',
          value: { seconds: 30 },
          description: 'Time in seconds for each slot rotation'
        },
        {
          key: 'cycles_per_day',
          value: { count: 2880 },
          description: 'Number of rotation cycles per day'
        },
        {
          key: 'auto_rotation',
          value: { enabled: true },
          description: 'Enable automatic slot rotation'
        },
        {
          key: 'maintenance_mode',
          value: { enabled: false },
          description: 'System maintenance mode'
        },
        {
          key: 'timezone',
          value: { zone: 'Africa/Nairobi' },
          description: 'System timezone'
        },
        {
          key: 'currency',
          value: { code: 'KES' },
          description: 'System currency'
        }
      ]
    });

    // Create companies
    console.log('Creating companies...');
    const companies = await prisma.company.createMany({
      data: [
        {
          id: 'COMP-001',
          name: 'Equity Bank',
          category: 'Banking & Financial Services',
          subcategory: 'Commercial Banks',
          tier: 'PREMIUM',
          logo: 'src/assets/logos/equity-bank.png',
          website: 'https://equitybank.co.ke',
          description: 'Leading commercial bank with largest customer base in Kenya',
          industry: 'Banking',
          founded: 1984,
          headquarters: 'Nairobi, Kenya',
          auctionEligible: true,
          maxBidAmount: 1000000
        },
        {
          id: 'COMP-002',
          name: 'Safaricom',
          category: 'Telecommunications & ICT',
          subcategory: 'Mobile Operators',
          tier: 'PREMIUM',
          logo: 'src/assets/logos/safaricom.png',
          website: 'https://safaricom.co.ke',
          description: 'Kenya\'s largest mobile operator and M-Pesa pioneer',
          industry: 'Telecommunications',
          founded: 1997,
          headquarters: 'Nairobi, Kenya',
          auctionEligible: true,
          maxBidAmount: 2000000
        },
        {
          id: 'COMP-003',
          name: 'KCB Group',
          category: 'Banking & Financial Services',
          subcategory: 'Commercial Banks',
          tier: 'PREMIUM',
          logo: 'src/assets/logos/kcb-group.png',
          website: 'https://kcbgroup.com',
          description: 'Largest bank by assets in East Africa',
          industry: 'Banking',
          founded: 1896,
          headquarters: 'Nairobi, Kenya',
          auctionEligible: true,
          maxBidAmount: 1500000
        },
        {
          id: 'COMP-004',
          name: 'Cooperative Bank',
          category: 'Banking & Financial Services',
          subcategory: 'Commercial Banks',
          tier: 'STANDARD',
          logo: 'src/assets/logos/cooperative-bank.png',
          website: 'https://co-opbank.co.ke',
          description: 'Leading cooperative bank in Kenya',
          industry: 'Banking',
          founded: 1965,
          headquarters: 'Nairobi, Kenya',
          auctionEligible: true,
          maxBidAmount: 800000
        },
        {
          id: 'COMP-005',
          name: 'Airtel Kenya',
          category: 'Telecommunications & ICT',
          subcategory: 'Mobile Operators',
          tier: 'STANDARD',
          logo: 'src/assets/logos/airtel-kenya.png',
          website: 'https://airtel.co.ke',
          description: 'Leading telecommunications provider',
          industry: 'Telecommunications',
          founded: 2000,
          headquarters: 'Nairobi, Kenya',
          auctionEligible: true,
          maxBidAmount: 600000
        }
      ]
    });

    // Create users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const users = await prisma.user.createMany({
      data: [
        {
          id: 'USER-001',
          email: 'admin@beamershow.com',
          username: 'admin',
          password: hashedPassword,
          role: 'ADMIN',
          permissions: JSON.stringify(['read', 'write', 'admin', 'delete']),
          isActive: true
        },
        {
          id: 'USER-002',
          email: 'operator@beamershow.com',
          username: 'operator',
          password: hashedPassword,
          role: 'OPERATOR',
          permissions: JSON.stringify(['read', 'write']),
          isActive: true
        },
        {
          id: 'USER-003',
          email: 'sponsor@equitybank.co.ke',
          username: 'equity_sponsor',
          password: hashedPassword,
          role: 'SPONSOR',
          companyId: 'COMP-001',
          permissions: JSON.stringify(['read', 'bid']),
          isActive: true
        },
        {
          id: 'USER-004',
          email: 'sponsor@safaricom.co.ke',
          username: 'safaricom_sponsor',
          password: hashedPassword,
          role: 'SPONSOR',
          companyId: 'COMP-002',
          permissions: JSON.stringify(['read', 'bid']),
          isActive: true
        }
      ]
    });

    // Create slots
    console.log('Creating slots...');
    const slots = [];
    for (let i = 1; i <= 24; i++) {
      const row = Math.ceil(i / 6);
      const col = ((i - 1) % 6) + 1;
      
      let slotType: 'STANDARD' | 'MAIN_SPONSOR' | 'LIVE_BIDDING' = 'STANDARD';
      let currentSponsor: string | null = null;
      let currentBid = 0;
      let status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'AUCTION_ACTIVE' = 'AVAILABLE';
      
      // Assign some slots to companies
      if (i === 1) {
        slotType = 'MAIN_SPONSOR';
        currentSponsor = 'COMP-001';
        currentBid = 500000;
        status = 'OCCUPIED';
      } else if (i === 2) {
        slotType = 'LIVE_BIDDING';
        currentSponsor = 'COMP-002';
        currentBid = 750000;
        status = 'AUCTION_ACTIVE';
      } else if (i === 3) {
        currentSponsor = 'COMP-003';
        currentBid = 300000;
        status = 'OCCUPIED';
      } else if (i === 4) {
        currentSponsor = 'COMP-004';
        currentBid = 200000;
        status = 'OCCUPIED';
      }
      
      slots.push({
        id: `SLOT-${i.toString().padStart(3, '0')}`,
        slotNumber: i,
        slotType,
        position: JSON.stringify({ row, col }),
        currentSponsor,
        currentBid,
        reservePrice: 100000,
        timeRemaining: 3600,
        status,
        totalBids: currentSponsor ? 1 : 0,
        lastBidTime: currentSponsor ? new Date() : null,
        startTime: currentSponsor ? new Date() : null,
        endTime: currentSponsor ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        category: 'Digital Advertising',
        description: `Slot ${i} - Premium advertising position`,
        isActive: true
      });
    }
    
    await prisma.slot.createMany({ data: slots });

    // Create devices
    console.log('Creating devices...');
    await prisma.device.createMany({
      data: [
        {
          id: 'DEV-001',
          deviceId: 'BEAMER-001',
          deviceType: 'BEAMER',
          name: 'Main Projector Display',
          status: 'ONLINE',
          location: JSON.stringify({ lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' }),
          config: JSON.stringify({ resolution: '1920x1080', brightness: 80 }),
          lastSeen: new Date()
        },
        {
          id: 'DEV-002',
          deviceId: 'IPAD-001',
          deviceType: 'IPAD',
          name: 'Mobile Billboard iPad',
          status: 'ONLINE',
          location: JSON.stringify({ lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' }),
          config: JSON.stringify({ orientation: 'portrait', brightness: 70 }),
          lastSeen: new Date()
        },
        {
          id: 'DEV-003',
          deviceId: 'BILLBOARD-001',
          deviceType: 'BILLBOARD',
          name: 'Static Billboard Display',
          status: 'ONLINE',
          location: JSON.stringify({ lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' }),
          config: JSON.stringify({ size: '55inch', resolution: '4K' }),
          lastSeen: new Date()
        }
      ]
    });

    // Create sample bids
    console.log('Creating sample bids...');
    await prisma.bid.createMany({
      data: [
        {
          id: 'BID-001',
          slotId: 'SLOT-001',
          companyId: 'COMP-001',
          userId: 'USER-003',
          amount: 500000,
          status: 'WON',
          bidderInfo: JSON.stringify({ name: 'Equity Bank Marketing', email: 'marketing@equitybank.co.ke' }),
          timestamp: new Date()
        },
        {
          id: 'BID-002',
          slotId: 'SLOT-002',
          companyId: 'COMP-002',
          userId: 'USER-004',
          amount: 750000,
          status: 'ACTIVE',
          bidderInfo: JSON.stringify({ name: 'Safaricom Digital', email: 'digital@safaricom.co.ke' }),
          timestamp: new Date()
        }
      ]
    });

    // Create AR content
    console.log('Creating AR content...');
    await prisma.aRContent.createMany({
      data: [
        {
          id: 'AR-001',
          slotId: 'SLOT-001',
          title: 'Equity Bank 3D Logo',
          description: 'Floating 3D logo hologram',
          contentType: 'LOGO_HOLOGRAM',
          contentData: JSON.stringify({
            model: 'equity_logo_3d.glb',
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            animation: 'float'
          }),
          isActive: true
        },
        {
          id: 'AR-002',
          slotId: 'SLOT-002',
          title: 'Safaricom Product Showcase',
          description: 'Interactive M-Pesa showcase',
          contentType: 'PRODUCT_SHOWCASE',
          contentData: JSON.stringify({
            model: 'mpesa_showcase.glb',
            position: { x: 0, y: 0, z: 0 },
            scale: { x: 1.2, y: 1.2, z: 1.2 },
            animation: 'rotate'
          }),
          isActive: true
        }
      ]
    });

    // Create hologram effects
    console.log('Creating hologram effects...');
    await prisma.hologramEffect.createMany({
      data: [
        {
          id: 'HOLO-001',
          slotId: 'SLOT-001',
          effectType: 'particle_system',
          settings: JSON.stringify({
            intensity: 0.8,
            colorScheme: ['#00ff88', '#0088ff'],
            enableParticles: true,
            enableLightRays: true,
            enableDepthField: true,
            particleDensity: 50,
            lightRayCount: 8
          }),
          isActive: true
        },
        {
          id: 'HOLO-002',
          slotId: 'SLOT-002',
          effectType: 'scanning_lines',
          settings: JSON.stringify({
            intensity: 1.0,
            colorScheme: ['#ff0088', '#ff8800'],
            enableScanningLines: true,
            enableCornerAccents: true,
            animationSpeed: 'fast'
          }),
          isActive: true
        }
      ]
    });

    // Create sample analytics
    console.log('Creating sample analytics...');
    await prisma.analytics.createMany({
      data: [
        {
          id: 'ANALYTICS-001',
          slotId: 'SLOT-001',
          companyId: 'COMP-001',
          userId: 'USER-003',
          eventType: 'SLOT_VIEW',
          metadata: JSON.stringify({ duration: 30, interaction: 'hover' }),
          sessionId: 'SESSION-001',
          deviceInfo: JSON.stringify({ device: 'desktop', browser: 'chrome' }),
          timestamp: new Date()
        },
        {
          id: 'ANALYTICS-002',
          slotId: 'SLOT-002',
          companyId: 'COMP-002',
          userId: 'USER-004',
          eventType: 'BID_PLACEMENT',
          metadata: JSON.stringify({ amount: 750000, previousBid: 500000 }),
          sessionId: 'SESSION-002',
          deviceInfo: JSON.stringify({ device: 'mobile', browser: 'safari' }),
          timestamp: new Date()
        }
      ]
    });

    console.log('Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`   - Companies: 5`);
    console.log(`   - Users: 4`);
    console.log(`   - Slots: 24`);
    console.log(`   - Devices: 3`);
    console.log(`   - Bids: 2`);
    console.log(`   - AR Content: 2`);
    console.log(`   - Hologram Effects: 2`);
    console.log(`   - Analytics: 2`);
    console.log(`   - System Config: 6`);

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
