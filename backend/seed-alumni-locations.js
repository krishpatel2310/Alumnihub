import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

// Sample alumni data with locations
const sampleAlumni = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2018,
    course: 'Computer Science',
    currentPosition: 'Senior Software Engineer',
    company: 'Google',
    city: 'Bangalore',
    country: 'India',
    location: 'Bangalore, India',
    coordinates: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    bio: 'Passionate about AI and machine learning. Leading a team of engineers building next-gen search algorithms.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Cloud Computing'],
    interests: ['AI', 'Open Source', 'Mentoring'],
    linkedin: 'https://linkedin.com/in/priyasharma',
    isFeatured: true,
    achievements: ['Google Cloud Innovator', 'Tech Speaker', 'Open Source Contributor'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
  },
  {
    name: 'Rahul Mehta',
    email: 'rahul.mehta@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2015,
    course: 'Information Technology',
    currentPosition: 'VP of Engineering',
    company: 'Microsoft',
    city: 'Seattle',
    country: 'USA',
    location: 'Seattle, USA',
    coordinates: {
      latitude: 47.6062,
      longitude: -122.3321
    },
    bio: 'Building cloud infrastructure at scale. Former startup founder, now helping Microsoft innovate in cloud computing.',
    skills: ['Azure', 'Distributed Systems', 'Leadership', 'Architecture'],
    interests: ['Cloud Computing', 'Startups', 'Basketball'],
    linkedin: 'https://linkedin.com/in/rahulmehta',
    github: 'https://github.com/rahulmehta',
    isFeatured: true,
    achievements: ['Microsoft MVP', 'TEDx Speaker', 'Startup Exit'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'
  },
  {
    name: 'Ananya Patel',
    email: 'ananya.patel@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2019,
    course: 'Data Science',
    currentPosition: 'Lead Data Scientist',
    company: 'Amazon',
    city: 'Mumbai',
    country: 'India',
    location: 'Mumbai, India',
    coordinates: {
      latitude: 19.0760,
      longitude: 72.8777
    },
    bio: 'Transforming business decisions with data. Specialized in recommendation systems and personalization.',
    skills: ['Python', 'R', 'Deep Learning', 'Big Data', 'Analytics'],
    interests: ['Data Science', 'Women in Tech', 'Teaching'],
    linkedin: 'https://linkedin.com/in/ananyapatel',
    isFeatured: true,
    achievements: ['Kaggle Master', 'Women in Tech Award', 'Published Researcher'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2017,
    course: 'Software Engineering',
    currentPosition: 'Principal Engineer',
    company: 'Meta',
    city: 'London',
    country: 'UK',
    location: 'London, UK',
    coordinates: {
      latitude: 51.5074,
      longitude: -0.1278
    },
    bio: 'Building the future of social connectivity. Expert in distributed systems and real-time communication.',
    skills: ['React', 'Node.js', 'GraphQL', 'System Design'],
    interests: ['Web Development', 'Travel', 'Photography'],
    linkedin: 'https://linkedin.com/in/vikramsingh',
    github: 'https://github.com/vikramsingh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2016,
    course: 'Computer Engineering',
    currentPosition: 'Engineering Manager',
    company: 'Apple',
    city: 'San Francisco',
    country: 'USA',
    location: 'San Francisco, USA',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    bio: 'Leading teams to build innovative products. Passionate about creating seamless user experiences.',
    skills: ['iOS Development', 'Swift', 'Team Leadership', 'Product Management'],
    interests: ['Mobile Development', 'Design', 'Fitness'],
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    name: 'Arjun Reddy',
    email: 'arjun.reddy@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2020,
    course: 'Artificial Intelligence',
    currentPosition: 'ML Research Scientist',
    company: 'DeepMind',
    city: 'Singapore',
    country: 'Singapore',
    location: 'Singapore',
    coordinates: {
      latitude: 1.3521,
      longitude: 103.8198
    },
    bio: 'Researching the frontiers of artificial intelligence. Published multiple papers on reinforcement learning.',
    skills: ['PyTorch', 'Research', 'Reinforcement Learning', 'Computer Vision'],
    interests: ['AI Research', 'Chess', 'Reading'],
    linkedin: 'https://linkedin.com/in/arjunreddy',
    github: 'https://github.com/arjunreddy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'
  },
  {
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2014,
    course: 'Computer Science',
    currentPosition: 'CTO',
    company: 'TechStartup Inc',
    city: 'Tokyo',
    country: 'Japan',
    location: 'Tokyo, Japan',
    coordinates: {
      latitude: 35.6762,
      longitude: 139.6503
    },
    bio: 'Serial entrepreneur and tech leader. Building innovative solutions for the future of work.',
    skills: ['Full Stack', 'Leadership', 'Product Strategy', 'DevOps'],
    interests: ['Startups', 'Innovation', 'Anime'],
    linkedin: 'https://linkedin.com/in/emilychen',
    github: 'https://github.com/emilychen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    password: 'password123',
    role: 'alumni',
    graduationYear: 2021,
    course: 'Cybersecurity',
    currentPosition: 'Security Engineer',
    company: 'Cisco',
    city: 'Hyderabad',
    country: 'India',
    location: 'Hyderabad, India',
    coordinates: {
      latitude: 17.3850,
      longitude: 78.4867
    },
    bio: 'Protecting digital infrastructure from emerging threats. Ethical hacker and security researcher.',
    skills: ['Network Security', 'Penetration Testing', 'Cryptography', 'Compliance'],
    interests: ['Cybersecurity', 'CTF Competitions', 'Gaming'],
    linkedin: 'https://linkedin.com/in/amitkumar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit'
  }
];

async function seedAlumni() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing alumni with these emails (optional - comment out to keep existing data)
    const emails = sampleAlumni.map(a => a.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('Cleared existing sample alumni');

    // Insert sample alumni one by one to avoid duplicate key issues
    const result = [];
    for (const alumniData of sampleAlumni) {
      try {
        // Remove googleId field to avoid duplicate key errors
        const { googleId, ...dataWithoutGoogleId } = alumniData;
        const alumni = await User.create(dataWithoutGoogleId);
        result.push(alumni);
        console.log(`✅ Created: ${alumni.name}`);
      } catch (error) {
        console.log(`⚠️  Skipped ${alumniData.name}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully seeded ${result.length} alumni profiles with locations!`);
    
    console.log('\n📍 Alumni locations:');
    result.forEach(alumni => {
      console.log(`  - ${alumni.name} in ${alumni.location} at ${alumni.company}`);
    });

    console.log('\n⭐ Featured alumni:');
    const featured = result.filter(a => a.isFeatured);
    featured.forEach(alumni => {
      console.log(`  - ${alumni.name} - ${alumni.currentPosition} @ ${alumni.company}`);
    });

    console.log('\n✨ You can now see these alumni on:');
    console.log('  - Alumni World Map');
    console.log('  - Alumni Spotlight (rotating featured profiles)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedAlumni();
