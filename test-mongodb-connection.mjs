// Test MongoDB Connection Script (ES Module)
// Run this with: node test-mongodb-connection.mjs
// This is a standalone script to test the MongoDB connection

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://admin:admin@evolutionapi.ipbubyl.mongodb.net/?appName=EvolutionAPI';

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Connection Details:');
    console.log('   - Database Name:', mongoose.connection.name || 'Default');
    console.log('   - Host:', mongoose.connection.host || 'N/A');
    console.log('   - Port:', mongoose.connection.port || 'N/A');
    console.log('   - Ready State:', mongoose.connection.readyState);
    console.log('   - Connection State:', getConnectionState(mongoose.connection.readyState));

    // List available databases
    try {
      const adminDb = mongoose.connection.db.admin();
      const { databases } = await adminDb.listDatabases();
      console.log('\n📁 Available Databases:');
      databases.forEach(db => {
        console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      });
    } catch (err) {
      console.log('\n⚠️  Could not list databases (permissions may be limited)');
    }

    // Close connection
    await mongoose.disconnect();
    console.log('\n✅ Connection closed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('   This usually means:');
      console.error('   - Network connectivity issues');
      console.error('   - IP address not whitelisted in MongoDB Atlas');
      console.error('   - Incorrect connection string');
    }
    process.exit(1);
  }
}

function getConnectionState(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return states[state] || 'unknown';
}

testConnection();


