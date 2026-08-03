import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Example seed configuration - Replace with actual data
const stations = [
  { name: 'Station 1', code: 'ST1', order: 1, distanceFromStart: 0 },
  { name: 'Station 2', code: 'ST2', order: 2, distanceFromStart: 50 },
];

const coaches = [
  { name: 'Coach A', type: 'reserved', capacity: 48, coachNumber: 1 },
  { name: 'Coach B', type: 'unreserved', capacity: 64, coachNumber: 2 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await mongoose.model('Station').deleteMany({});
    await mongoose.model('Coach').deleteMany({});
    
    // Insert data
    await mongoose.model('Station').insertMany(stations);
    await mongoose.model('Coach').insertMany(coaches);
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();