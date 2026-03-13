import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function removeGoogleIdIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('Checking existing indexes...');
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop both googleId indexes
    const googleIdIndexes = indexes.filter(i => i.name.includes('googleId'));
    
    for (const index of googleIdIndexes) {
      try {
        await usersCollection.dropIndex(index.name);
        console.log(`✅ Dropped ${index.name} index`);
      } catch (error) {
        console.log(`ℹ️  Could not drop ${index.name}:`, error.message);
      }
    }

    console.log('\n✅ GoogleId unique constraint removed!');
    console.log('ℹ️  Email field will continue to serve as the unique identifier.');
    console.log('\n✨ Now you can create users without googleId conflicts!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing index:', error);
    process.exit(1);
  }
}

removeGoogleIdIndex();
