import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Station } from '../models/Station';
import { Coach } from '../models/Coach';
import { Seat } from '../models/Seat';

dotenv.config();

const stations = [
  { name: 'Colombo Fort', code: 'CFT', order: 1, distanceFromStart: 0 },
  { name: 'Veyangoda', code: 'VGD', order: 2, distanceFromStart: 32 },
  { name: 'Gampaha', code: 'GPA', order: 3, distanceFromStart: 42 },
  { name: 'Ragama', code: 'RGA', order: 4, distanceFromStart: 48 },
  { name: 'Negombo', code: 'NGB', order: 5, distanceFromStart: 55 },
  { name: 'Kandy', code: 'KDY', order: 6, distanceFromStart: 120 },
  { name: 'Peradeniya', code: 'PDN', order: 7, distanceFromStart: 130 },
  { name: 'Nanu Oya', code: 'NOY', order: 8, distanceFromStart: 250 },
  { name: 'Badulla', code: 'BDL', order: 9, distanceFromStart: 300 },
];

const coaches = [
  { name: 'Coach A', type: 'reserved', capacity: 48, coachNumber: 1 },
  { name: 'Coach B', type: 'reserved', capacity: 48, coachNumber: 2 },
  { name: 'Coach C', type: 'reserved', capacity: 48, coachNumber: 3 },
  { name: 'Coach D', type: 'unreserved', capacity: 64, coachNumber: 4 },
  { name: 'Coach E', type: 'unreserved', capacity: 64, coachNumber: 5 },
  { name: 'Coach F', type: 'unreserved', capacity: 64, coachNumber: 6 },
  { name: 'Coach G', type: 'unreserved', capacity: 64, coachNumber: 7 },
  { name: 'Coach H', type: 'unreserved', capacity: 64, coachNumber: 8 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gamikamalalgoda_db_user:ZtPyWARmxoAHzByO@cluster0.unhthgq.mongodb.net/?appName=Cluster0');
    
    await Station.deleteMany({});
    await Coach.deleteMany({});
    await Seat.deleteMany({});

    const createdStations = await Station.insertMany(stations);
    console.log(`✅ Created ${createdStations.length} stations`);

    const createdCoaches = await Coach.insertMany(coaches);
    console.log(`✅ Created ${createdCoaches.length} coaches`);

    const reservedCoaches = createdCoaches.filter(c => c.type === 'reserved');
    const seats = [];
    for (const coach of reservedCoaches) {
      for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 6; col++) {
          seats.push({
            coachId: coach._id,
            seatNumber: `${String.fromCharCode(64 + row)}${col}`,
            position: { row, column: col },
            isReserved: false,
          });
        }
      }
    }

    await Seat.insertMany(seats);
    console.log(`Created ${seats.length} seats`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();