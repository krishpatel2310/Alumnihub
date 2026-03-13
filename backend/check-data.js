import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check total alumni count
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    console.log(`📊 Total Alumni: ${totalAlumni}\n`);

    // Check featured alumni
    const featured = await User.find({ role: 'alumni', isFeatured: true })
      .select('name email isFeatured achievements city country location coordinates');
    
    console.log(`⭐ Featured Alumni (${featured.length}):`);
    featured.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
      console.log(`    Featured: ${user.isFeatured}`);
      console.log(`    Achievements: ${user.achievements?.join(', ') || 'None'}`);
      console.log(`    Location: ${user.city || 'N/A'}, ${user.country || 'N/A'}`);
      console.log(`    Coordinates: ${user.coordinates?.latitude || 'N/A'}, ${user.coordinates?.longitude || 'N/A'}`);
      console.log('');
    });

    // Check alumni with locations
    const withLocations = await User.find({
      role: 'alumni',
      city: { $ne: null }
    }).select('name city country coordinates');
    
    console.log(`\n🗺️  Alumni with Locations (${withLocations.length}):`);
    withLocations.forEach(user => {
      console.log(`  - ${user.name}: ${user.city}, ${user.country}`);
    });

    // Check our newly created users
    console.log('\n🔍 Checking newly created demo users:');
    const demoEmails = [
      'rahul.mehta.demo@example.com',
      'sarah.johnson.demo@example.com',
      'vikram.singh.demo@example.com'
    ];
    
    for (const email of demoEmails) {
      const user = await User.findOne({ email }).select('name email isFeatured achievements city country coordinates');
      if (user) {
        console.log(`  ✅ ${user.name}: Featured=${user.isFeatured}, Location=${user.city}, ${user.country}`);
      } else {
        console.log(`  ❌ User with email ${email} not found`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
