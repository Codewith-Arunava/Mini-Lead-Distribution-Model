require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Lead = require('../models/Lead');

const SOURCES = ['Website', 'Facebook', 'LinkedIn', 'Referral', 'Email', 'Cold Call', 'Other'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const COMPANIES = [
  'TechCorp Ltd', 'InnovateSoft', 'DataDriven Inc', 'CloudFirst Systems', 'PeakSales Co',
  'Nexus Technologies', 'BrightPath Solutions', 'Momentum Digital', 'CoreLogic Group', 'AlphaStream',
  'Vertex Dynamics', 'SilverBell Corp', 'BlueSky Ventures', 'Ironclad Systems', 'Cascade Software',
  'Summit Analytics', 'Pioneer Digital', 'Orion Technologies', 'Echo Enterprises', 'Zephyr Labs',
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@leadflow.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create Agents
    const agentData = [
      { name: 'Alex Johnson', email: 'agent1@leadflow.com', password: 'Agent@123', role: 'agent' },
      { name: 'Sarah Williams', email: 'agent2@leadflow.com', password: 'Agent@123', role: 'agent' },
      { name: 'Mike Chen', email: 'agent3@leadflow.com', password: 'Agent@123', role: 'agent' },
    ];

    const agents = await User.insertMany(
      await Promise.all(
        agentData.map(async (a) => ({
          ...a,
          password: await bcrypt.hash(a.password, 12),
        }))
      )
    );
    console.log(`✅ ${agents.length} agents created`);

    // Create 24 sample leads
    const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Mia',
      'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Alexander', 'Harper', 'Michael', 'Evelyn',
      'Ethan', 'Abigail', 'Daniel', 'Emily', 'Matthew', 'Elizabeth', 'Joseph', 'Mila'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
      'White', 'Harris', 'Martin', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis',
      'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green'];

    const leadsData = firstNames.map((first, i) => {
      const last = lastNames[i];
      const agentIndex = i % agents.length;
      return {
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
        phone: `+1${Math.floor(2000000000 + Math.random() * 7999999999)}`,
        company: COMPANIES[i % COMPANIES.length],
        source: SOURCES[i % SOURCES.length],
        status: STATUSES[i % STATUSES.length],
        assignedTo: agents[agentIndex]._id,
        notes: i % 3 === 0 ? `Follow up scheduled. Interested in premium plan.` : '',
      };
    });

    // Add 4 unassigned leads for distribution demo
    for (let i = 0; i < 4; i++) {
      leadsData.push({
        name: `Unassigned Lead ${i + 1}`,
        email: `unassigned${i + 1}@example.com`,
        phone: `+1${Math.floor(3000000000 + Math.random() * 6999999999)}`,
        company: COMPANIES[(i + 5) % COMPANIES.length],
        source: SOURCES[i % SOURCES.length],
        status: 'New',
        assignedTo: null,
        notes: '',
      });
    }

    await Lead.insertMany(leadsData);
    console.log(`✅ ${leadsData.length} leads created (${leadsData.length - 4} assigned, 4 unassigned)`);

    console.log('\n✨ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin:  admin@leadflow.com  / Admin@123');
    console.log('🔑 Agent1: agent1@leadflow.com / Agent@123');
    console.log('🔑 Agent2: agent2@leadflow.com / Agent@123');
    console.log('🔑 Agent3: agent3@leadflow.com / Agent@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
