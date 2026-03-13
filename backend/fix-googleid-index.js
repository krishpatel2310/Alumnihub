import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixGoogleIdIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('Checking existing indexes...');
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the problematic googleId index if it exists
    try {
      await usersCollection.dropIndex('googleId_1');
      console.log('✅ Dropped old googleId_1 index');
    } catch (error) {
      console.log('ℹ️  googleId_1 index does not exist or already dropped');
    }

    // Create a new sparse unique index for googleId
    await usersCollection.createIndex(
      { googleId: 1 },
      { unique: true, sparse: true, name: 'googleId_1_sparse' }
    );
    console.log('✅ Created new sparse unique index for googleId');

    console.log('\n✅ Index fix complete! You can now create users without googleId.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
}

fixGoogleIdIndex();
