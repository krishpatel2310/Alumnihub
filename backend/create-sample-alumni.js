import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

const sampleAlumni = [
  {
    name: 'Rahul Mehta',
    email: 'rahul.mehta.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-001',  // Fake unique ID to avoid index conflicts
    role: 'alumni',
    graduationYear: 2018,
    course: 'Computer Science',
    currentPosition: 'Senior Software Engineer',
    company: 'Microsoft',
    city: 'Seattle',
    country: 'USA',
    location: 'Seattle, USA',
    coordinates: { latitude: 47.6062, longitude: -122.3321 },
    bio: 'Building cloud infrastructure at Microsoft. Passionate about distributed systems and mentoring.',
    skills: ['Azure', 'C#', 'Distributed Systems', 'Kubernetes'],
    interests: ['Cloud Computing', 'Open Source', 'Basketball'],
    isFeatured: true,
    achievements: ['Microsoft MVP', 'Cloud Innovator', 'Tech Speaker'],
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-002',
    role: 'alumni',
    graduationYear: 2019,
    course: 'Data Science',
    currentPosition: 'Lead Data Scientist',
    company: 'Amazon',
    city: 'San Francisco',
    country: 'USA',
    location: 'San Francisco, USA',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    bio: 'Leveraging AI to solve complex business problems. Machine learning enthusiast and mentor.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Big Data'],
    interests: ['AI', 'Women in Tech', 'Hiking'],
    isFeatured: true,
    achievements: ['AI Excellence Award', 'Kaggle Expert', 'Published Researcher'],
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-003',
    role: 'alumni',
    graduationYear: 2017,
    course: 'Information Technology',
    currentPosition: 'Engineering Manager',
    company: 'Google',
    city: 'London',
    country: 'UK',
    location: 'London, UK',
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
    bio: 'Leading engineering teams at Google. Building products that impact billions of users.',
    skills: ['Go', 'System Design', 'Leadership', 'Product Development'],
    interests: ['Technology', 'Travel', 'Photography'],
    isFeatured: true,
    achievements: ['Engineering Excellence', 'Team Leader', 'Innovation Award'],
  },
  {
    name: 'Ananya Patel',
    email: 'ananya.patel.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-004',
    role: 'alumni',
    graduationYear: 2020,
    course: 'Computer Engineering',
    currentPosition: 'Full Stack Developer',
    company: 'Adobe',
    city: 'Mumbai',
    country: 'India',
    location: 'Mumbai, India',
    coordinates: { latitude: 19.0760, longitude: 72.8777 },
    bio: 'Creating amazing user experiences with modern web technologies.',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    interests: ['Web Development', 'UI/UX', 'Teaching'],
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-005',
    role: 'alumni',
    graduationYear: 2016,
    course: 'Software Engineering',
    currentPosition: 'DevOps Architect',
    company: 'Netflix',
    city: 'Singapore',
    country: 'Singapore',
    location: 'Singapore',
    coordinates: { latitude: 1.3521, longitude: 103.8198 },
    bio: 'Building scalable infrastructure for streaming millions of users worldwide.',
    skills: ['AWS', 'Docker', 'CI/CD', 'Terraform'],
    interests: ['Cloud Infrastructure', 'Automation', 'Gaming'],
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-006',
    role: 'alumni',
    graduationYear: 2021,
    course: 'Artificial Intelligence',
    currentPosition: 'ML Engineer',
    company: 'Meta',
    city: 'New York',
    country: 'USA',
    location: 'New York, USA',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    bio: 'Working on cutting-edge AI solutions to enhance social connectivity.',
    skills: ['Python', 'Deep Learning', 'PyTorch', 'Computer Vision'],
    interests: ['AI Research', 'Art', 'Music'],
  },
  {
    name: 'Arjun Kumar',
    email: 'arjun.kumar.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-007',
    role: 'alumni',
    graduationYear: 2015,
    course: 'Computer Science',
    currentPosition: 'Principal Engineer',
    company: 'Salesforce',
    city: 'Bangalore',
    country: 'India',
    location: 'Bangalore, India',
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
    bio: 'Building enterprise SaaS solutions. Helping businesses transform digitally.',
    skills: ['Java', 'Salesforce', 'Cloud Architecture', 'APIs'],
    interests: ['Enterprise Software', 'Startups', 'Cricket'],
  },
  {
    name: 'Sophie Martin',
    email: 'sophie.martin.demo@example.com',
    password: 'password123',
    googleId: 'fake-google-id-008',
    role: 'alumni',
    graduationYear: 2019,
    course: 'Cybersecurity',
    currentPosition: 'Security Engineer',
    company: 'Apple',
    city: 'Dublin',
    country: 'Ireland',
    location: 'Dublin, Ireland',
    coordinates: { latitude: 53.3498, longitude: -6.2603 },
    bio: 'Protecting user privacy and security in Apple products.',
    skills: ['Security', 'Penetration Testing', 'Cryptography', 'Compliance'],
    interests: ['Cybersecurity', 'Privacy', 'Running'],
  },
];

async function createSampleAlumni() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Creating sample alumni users...\n');

    let created = 0;
    let skipped = 0;
    let featured = 0;

    for (const alumniData of sampleAlumni) {
      try {
        // Check if user already exists
        const existing = await User.findOne({ email: alumniData.email });
        if (existing) {
          console.log(`⏭️  Skipped: ${alumniData.name} (already exists)`);
          skipped++;
          continue;
        }

        // Create user directly with all data including googleId
        const alumni = new User(alumniData);
        await alumni.save();
        
        created++;
        
        if (alumni.isFeatured) {
          featured++;
          console.log(`⭐ Created & Featured: ${alumni.name} - ${alumni.currentPosition} @ ${alumni.company} (${alumni.location})`);
        } else {
          console.log(`✅ Created: ${alumni.name} - ${alumni.currentPosition} @ ${alumni.company} (${alumni.location})`);
        }
      } catch (error) {
        console.log(`❌ Failed to create ${alumniData.name}: ${error.message}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Sample data creation complete!`);
    console.log(`\n📊 Summary:`);
    console.log(`  - Created: ${created} new alumni`);
    console.log(`  - Featured: ${featured} alumni`);
    console.log(`  - Skipped: ${skipped} (already exist)`);
    console.log(`  - Total alumni: ${created + skipped}`);

    console.log('\n🌍 Global Distribution:');
    console.log('  - USA: 3 alumni (Seattle, San Francisco, New York)');
    console.log('  - India: 2 alumni (Mumbai, Bangalore)');
    console.log('  - UK: 1 alumni (London)');
    console.log('  - Singapore: 1 alumni');
    console.log('  - Ireland: 1 alumni (Dublin)');

    console.log('\n✨ Now refresh your dashboard at http://localhost:5173 to see:');
    console.log('  🗺️  Alumni World Map - Showing alumni across the globe!');
    console.log('  ⭐ Alumni Spotlight - 3 featured alumni with auto-rotation');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleAlumni();
