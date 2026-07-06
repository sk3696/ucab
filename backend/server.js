const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/ride', require('./routes/ride'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/support', require('./routes/support'));
app.use('/api/admin', require('./routes/admin'));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ucab API' });
});

// Error handling middleware
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

let mongod = null;

const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGO_URI;
    
    if (!dbUrl) {
      console.log('No MONGO_URI provided in .env. Starting MongoDB Memory Server...');
      mongod = await MongoMemoryServer.create();
      dbUrl = mongod.getUri();
      console.log(`MongoDB Memory Server started at: ${dbUrl}`);
    }

    await mongoose.connect(dbUrl);
    console.log('MongoDB Connected successfully!');
    
    // Seed default data
    await seedDefaultData();

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedDefaultData = async () => {
  const User = require('./models/User');
  const Driver = require('./models/Driver');
  const bcrypt = require('bcryptjs');

  const adminEmail = 'admin@ucab.com';
  const driverEmail = 'driver@ucab.com';
  const userEmail = 'user@ucab.com';

  try {
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const hashedUserPass = await bcrypt.hash('user123', salt);
      const hashedDriverPass = await bcrypt.hash('driver123', salt);

      // Create Admin
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
      });
      console.log('Seeded Default Admin account: admin@ucab.com / admin123');

      // Create a normal User
      await User.create({
        name: 'John Doe',
        email: userEmail,
        password: hashedUserPass,
        role: 'user',
        status: 'approved'
      });
      console.log('Seeded Default User account: user@ucab.com / user123');

      // Create Driver User (Approved)
      const driverUser = await User.create({
        name: 'Speedy Driver',
        email: driverEmail,
        password: hashedDriverPass,
        role: 'driver',
        status: 'approved'
      });

      await Driver.create({
        user: driverUser._id,
        vehicleModel: 'Toyota Prius (White)',
        vehicleNumber: 'AP-16-MJ-9999',
        vehicleType: 'economy',
        isOnline: true,
        status: 'approved',
        currentLocation: {
          lat: 16.5085,
          lng: 80.6400
        }
      });

      // Create Another Driver User (Pending approval)
      const pendingDriverUser = await User.create({
        name: 'Bob Pending',
        email: 'bob@ucab.com',
        password: hashedDriverPass,
        role: 'driver',
        status: 'approved' // User record is approved, but the Driver details status is pending approval!
      });

      await Driver.create({
        user: pendingDriverUser._id,
        vehicleModel: 'Toyota Fortuner SUV',
        vehicleNumber: 'AP-07-XX-1111',
        vehicleType: 'xl',
        isOnline: false,
        status: 'pending',
        currentLocation: {
          lat: 16.5020,
          lng: 80.6450
        }
      });

      console.log('Seeded Default Drivers: driver@ucab.com (approved/online), bob@ucab.com (pending)');
    }

    // Seed backed-up persistent registrations from json file
    const fs = require('fs');
    const path = require('path');
    const backupPath = path.join(__dirname, 'data/registered_users.json');
    if (fs.existsSync(backupPath)) {
      try {
        const backupUsers = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        for (const item of backupUsers) {
          const userExists = await User.findOne({ email: item.user.email });
          if (!userExists) {
            const newUser = await User.create({
              name: item.user.name,
              email: item.user.email,
              password: item.user.password,
              role: item.user.role,
              status: item.user.status || 'approved'
            });
            if (item.user.role === 'driver' && item.driver) {
              await Driver.create({
                user: newUser._id,
                vehicleModel: item.driver.vehicleModel,
                vehicleNumber: item.driver.vehicleNumber,
                vehicleType: item.driver.vehicleType,
                status: item.driver.status || 'pending',
                currentLocation: {
                  lat: 16.5020 + (Math.random() - 0.5) * 0.02,
                  lng: 80.6450 + (Math.random() - 0.5) * 0.02
                }
              });
            }
          }
        }
        console.log(`Successfully re-seeded ${backupUsers.length} persistent user registrations.`);
      } catch (err) {
        console.error('Failed to seed backup registrations:', err);
      }
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log('MongoDB Memory Server stopped.');
    }
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
