import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

// Comprehensive list of global locations
const locations = [
  // India
  { city: 'Bangalore', country: 'India', coordinates: { latitude: 12.9716, longitude: 77.5946 } },
  { city: 'Mumbai', country: 'India', coordinates: { latitude: 19.0760, longitude: 72.8777 } },
  { city: 'Delhi', country: 'India', coordinates: { latitude: 28.7041, longitude: 77.1025 } },
  { city: 'Hyderabad', country: 'India', coordinates: { latitude: 17.3850, longitude: 78.4867 } },
  { city: 'Chennai', country: 'India', coordinates: { latitude: 13.0827, longitude: 80.2707 } },
  { city: 'Pune', country: 'India', coordinates: { latitude: 18.5204, longitude: 73.8567 } },
  { city: 'Kolkata', country: 'India', coordinates: { latitude: 22.5726, longitude: 88.3639 } },
  
  // USA
  { city: 'San Francisco', country: 'USA', coordinates: { latitude: 37.7749, longitude: -122.4194 } },
  { city: 'Seattle', country: 'USA', coordinates: { latitude: 47.6062, longitude: -122.3321 } },
  { city: 'New York', country: 'USA', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
  { city: 'Austin', country: 'USA', coordinates: { latitude: 30.2672, longitude: -97.7431 } },
  { city: 'Boston', country: 'USA', coordinates: { latitude: 42.3601, longitude: -71.0589 } },
  { city: 'Los Angeles', country: 'USA', coordinates: { latitude: 34.0522, longitude: -118.2437 } },
  
  // Europe
  { city: 'London', country: 'UK', coordinates: { latitude: 51.5074, longitude: -0.1278 } },
  { city: 'Paris', country: 'France', coordinates: { latitude: 48.8566, longitude: 2.3522 } },
  { city: 'Berlin', country: 'Germany', coordinates: { latitude: 52.5200, longitude: 13.4050 } },
  { city: 'Amsterdam', country: 'Netherlands', coordinates: { latitude: 52.3676, longitude: 4.9041 } },
  { city: 'Dublin', country: 'Ireland', coordinates: { latitude: 53.3498, longitude: -6.2603 } },
  
  // Asia-Pacific
  { city: 'Singapore', country: 'Singapore', coordinates: { latitude: 1.3521, longitude: 103.8198 } },
  { city: 'Tokyo', country: 'Japan', coordinates: { latitude: 35.6762, longitude: 139.6503 } },
  { city: 'Dubai', country: 'UAE', coordinates: { latitude: 25.2048, longitude: 55.2708 } },
  { city: 'Hong Kong', country: 'Hong Kong', coordinates: { latitude: 22.3193, longitude: 114.1694 } },
  { city: 'Sydney', country: 'Australia', coordinates: { latitude: -33.8688, longitude: 151.2093 } },
];

const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Adobe', 'Salesforce', 'Oracle', 'IBM'];
const positions = ['Software Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer'];
const achievements = [
  'Tech Leader',
  'Industry Expert', 
  'Community Mentor',
  'Open Source Contributor',
  'Innovation Award Winner',
  'Speaker',
  'Published Author',
  'Startup Founder',
  'Patent Holder'
];

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Sample location updates for existing users
async function updateExistingUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all alumni users
    const alumni = await User.find({ 
      role: 'alumni'
    });

    console.log(`Found ${alumni.length} alumni users`);

    if (alumni.length === 0) {
      console.log('⚠️  No alumni users found. Please create some alumni users first.');
      process.exit(0);
    }

    let updated = 0;
    let featured = 0;

    for (let i = 0; i < alumni.length; i++) {
      const user = alumni[i];
      
      // Get random location
      const loc = locations[Math.floor(Math.random() * locations.length)];
      
      user.city = loc.city;
      user.country = loc.country;
      user.location = `${loc.city}, ${loc.country}`;
      user.coordinates = loc.coordinates;
      
      // Add some professional details if missing
      if (!user.company) {
        user.company = companies[Math.floor(Math.random() * companies.length)];
      }
      if (!user.currentPosition) {
        user.currentPosition = positions[Math.floor(Math.random() * positions.length)];
      }
      
      // Add a bio if missing
      if (!user.bio) {
        user.bio = `Passionate professional working at ${user.company}. Committed to innovation and helping fellow alumni succeed.`;
      }
      
      // Feature first 3 alumni with achievements
      if (i < 3) {
        user.isFeatured = true;
        user.achievements = getRandomItems(achievements, 3);
        featured++;
        console.log(`⭐ Featured: ${user.name} - ${loc.city}, ${loc.country}`);
      } else {
        console.log(`✅ Updated: ${user.name} - ${loc.city}, ${loc.country}`);
      }
      
      await user.save();
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} alumni with location data!`);
    console.log(`⭐ Featured ${featured} alumni in spotlight`);
    console.log('\n📊 Summary:');
    console.log(`  - Total alumni: ${alumni.length}`);
    console.log(`  - With locations: ${updated}`);
    console.log(`  - Featured: ${featured}`);
    
    console.log('\n✨ Refresh your dashboard (http://localhost:5173) to see:');
    console.log('  - Alumni World Map with all locations');
    console.log('  - Alumni Spotlight with featured profiles');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  }
}

updateExistingUsers();
