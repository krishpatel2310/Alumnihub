import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/user.model.js';
import Event from './src/models/event.model.js';
import Jobs from './src/models/jobs.model.js';
import Donation from './src/models/donation.model.js';
import Post from './src/models/post.model.js';
import Comment from './src/models/comment.model.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
    console.log('MongoDB connected successfully✅');
  } catch (error) {
    console.error('MongoDB connection failed❌:', error);
    process.exit(1);
  }
};

// Sample data arrays
const firstNames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Arjun', 'Meera', 'Rohan', 'Ananya', 'Karan', 'Diya', 'Aditya', 'Ishita', 'Vikram', 'Neha', 'Siddharth'];
const lastNames = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Mehta', 'Joshi', 'Shah', 'Verma', 'Agarwal', 'Kapoor', 'Nair', 'Desai', 'Rao'];
const companies = ['Google', 'Microsoft', 'Amazon', 'Infosys', 'TCS', 'Wipro', 'Tech Mahindra', 'Cognizant', 'Accenture', 'IBM', 'Oracle', 'SAP', 'Adobe', 'Salesforce', 'Meta'];
const jobTitles = ['Software Engineer', 'Senior Developer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer', 'UI/UX Designer', 'Backend Developer', 'Frontend Developer', 'System Architect'];
const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
const skills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis', 'UI/UX', 'Project Management', 'Agile'];

// Generate random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate alumni users
const generateAlumni = async (count) => {
  const alumni = [];
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const graduationYear = 2015 + Math.floor(Math.random() * 8); // 2015-2022
    
    alumni.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@alumni.com`,
      password: hashedPassword,
      role: 'alumni',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}`,
      bio: `Experienced ${jobTitles[Math.floor(Math.random() * jobTitles.length)]} with ${Math.floor(Math.random() * 10) + 2} years of experience in the tech industry.`,
      graduationYear: graduationYear,
      department: departments[Math.floor(Math.random() * departments.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      location: cities[Math.floor(Math.random() * cities.length)],
      currentPosition: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      skills: Array.from({ length: 5 }, () => skills[Math.floor(Math.random() * skills.length)]),
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      github: Math.random() > 0.5 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
      isVerified: true,
      banStatus: 'active'
    });
  }
  
  return await User.insertMany(alumni);
};

// Generate students
const generateStudents = async (count) => {
  const students = [];
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    students.push({
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.com`,
      password: hashedPassword,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}`,
      bio: `${departments[Math.floor(Math.random() * departments.length)]} student passionate about technology and innovation.`,
      graduationYear: 2025 + Math.floor(Math.random() * 3), // 2025-2027
      department: departments[Math.floor(Math.random() * departments.length)],
      location: cities[Math.floor(Math.random() * cities.length)],
      skills: Array.from({ length: 3 }, () => skills[Math.floor(Math.random() * skills.length)]),
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      isVerified: true,
      banStatus: 'active'
    });
  }
  
  return await User.insertMany(students);
};

// Generate events
const generateEvents = async (alumni) => {
  const eventTitles = [
    'Tech Talk: Future of AI',
    'Alumni Networking Meetup',
    'Career Guidance Workshop',
    'Hackathon 2026',
    'Industry Expert Panel Discussion',
    'Alumni Reunion',
    'Startup Pitch Competition',
    'Web Development Bootcamp',
    'Data Science Masterclass',
    'Campus Placement Preparation',
    'Leadership and Soft Skills Workshop',
    'Annual Sports Day',
    'Cultural Festival',
    'Research Symposium',
    'Entrepreneurship Summit'
  ];
  
  const events = [];
  
  for (let i = 0; i < 15; i++) {
    const eventDate = randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // Next 90 days
    const eventTime = `${9 + Math.floor(Math.random() * 9)}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`;
    
    events.push({
      title: eventTitles[i],
      description: `Join us for an exciting ${eventTitles[i]}! This event will provide valuable insights and networking opportunities for students and alumni alike.`,
      date: eventDate,
      time: eventTime,
      location: Math.random() > 0.5 ? 'Zoom Meeting (Online)' : `${cities[Math.floor(Math.random() * cities.length)]} - Main Auditorium`,
      isactive: true,
      participants: []
    });
  }
  
  return await Event.insertMany(events);
};

// Generate jobs
const generateJobs = async (alumni) => {
  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const jobLocations = ['Remote', 'Hybrid', ...cities];
  const categories = ['Software Development', 'Data Science', 'Product Management', 'DevOps', 'UI/UX Design', 'Quality Assurance'];
  
  const jobs = [];
  
  for (let i = 0; i < 20; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const postedBy = alumni[Math.floor(Math.random() * alumni.length)];
    
    jobs.push({
      title: title,
      company: company,
      location: jobLocations[Math.floor(Math.random() * jobLocations.length)],
      jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      description: `We are looking for a talented ${title} to join our team at ${company}. You will work on cutting-edge projects and collaborate with industry experts.`,
      experienceRequired: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3) + 3} years`,
      salary: (500000 + Math.floor(Math.random() * 1500000)), // 5-20 LPA
      postedBy: postedBy._id,
      isVerified: Math.random() > 0.2, // 80% verified
      applicants: []
    });
  }
  
  return await Jobs.insertMany(jobs);
};

// Generate donations
const generateDonations = async () => {
  const donationNames = [
    'Support Student Scholarships',
    'Library Infrastructure Fund',
    'Tech Lab Equipment Upgrade',
    'Sports Complex Development',
    'Research Grant Fund',
    'Emergency Student Relief Fund',
    'Campus Green Initiative',
    'Cultural Events Sponsorship',
    'Innovation Lab Setup',
    'Alumni Association Activities'
  ];
  
  const donations = [];
  
  for (let i = 0; i < 10; i++) {
    const goalAmount = (50000 + Math.floor(Math.random() * 450000));
    const raisedAmount = Math.floor(goalAmount * (Math.random() * 0.8)); // 0-80% raised
    
    donations.push({
      name: donationNames[i],
      description: `Help us ${donationNames[i].toLowerCase()}. Your contribution will make a significant impact on student life and campus development.`,
      goal: goalAmount,
      raisedAmount: raisedAmount,
      donors: [],
      endDate: randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // Next 90 days
      category: ['Education', 'Infrastructure', 'Research', 'Student Welfare'][Math.floor(Math.random() * 4)]
    });
  }
  
  return await Donation.insertMany(donations);
};

// Generate posts (Community Chat)
const generatePosts = async (users) => {
  const postContents = [
    'Looking for career advice in tech. Just graduated and need guidance on choosing between product-based vs service-based companies.',
    'Anyone interested in starting a startup? I have an idea for an EdTech platform and looking for co-founders!',
    'Best resources for learning Data Science? Share your recommendations for courses, books, and projects.',
    'Share your interview experiences. What was the most challenging question you faced? How did you prepare?',
    'Campus memories - what do you miss most? I still remember the late-night study sessions and canteen food!',
    'Tips for final year students preparing for campus placements. What worked for you?',
    'Looking for team members for a web development project. Need React and Node.js developers!',
    'Alumni meet photo gallery coming soon! Comment if you attended the event last weekend.',
    'Placement season tips and tricks. How to crack technical interviews and group discussions?',
    'Need guidance on research paper publication. Anyone experienced in IEEE/Springer publications?',
    'Internship opportunities discussion. Share your experiences and tips for landing good internships.',
    'Tech stack recommendations for beginners starting web development.',
    'Freelancing vs Full-time job - which path did you choose and why? Share your experiences.',
    'Master\'s degree abroad - need advice on universities, GRE prep, and application process.',
    'Campus placements vs off-campus opportunities - what are the pros and cons?',
    'Work-life balance in tech industry. How do you manage it?',
    'Open source contribution guide for beginners. Where to start?',
    'Competitive programming resources and practice platforms recommendation.',
    'How to prepare for product-based companies like Google, Microsoft, Amazon?',
    'Remote work experiences and tips. How has your productivity been affected?'
  ];
  
  const categories = ["Mentorship", "Events", "Research", "Jobs", "Alumni Stories", "General"];
  
  const posts = [];
  
  for (let i = 0; i < 20; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    
    posts.push({
      author: author._id,
      content: postContents[i],
      category: categories[Math.floor(Math.random() * categories.length)],
      upvotes: Math.floor(Math.random() * 50),
      downvotes: Math.floor(Math.random() * 10),
      upvotedBy: [],
      downvotedBy: [],
      commentsCount: 0,
      images: [],
      isActive: true,
      isPinned: i < 2, // Pin first 2 posts
      createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    });
  }
  
  return await Post.insertMany(posts);
};

// Generate comments for posts
const generateComments = async (posts, users) => {
  const commentTexts = [
    'Great post! Really helpful information.',
    'I had a similar experience. Thanks for sharing!',
    'Could you elaborate more on this?',
    'This is exactly what I was looking for!',
    'I disagree, but I respect your perspective.',
    'Thanks for the detailed explanation!',
    'Can you share more resources on this?',
    'Very insightful! Keep posting such content.',
    'I would love to connect and discuss this further.',
    'This helped me a lot. Thank you!'
  ];
  
  const comments = [];
  
  for (const post of posts) {
    const commentCount = Math.floor(Math.random() * 8) + 2; // 2-10 comments per post
    
    for (let i = 0; i < commentCount; i++) {
      const author = users[Math.floor(Math.random() * users.length)];
      
      comments.push({
        post: post._id,
        author: author._id,
        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        upvotes: Math.floor(Math.random() * 20),
        downvotes: Math.floor(Math.random() * 5),
        upvotedBy: [],
        downvotedBy: [],
        isActive: true,
        createdAt: randomDate(post.createdAt, new Date())
      });
    }
    
    // Update post comment count
    await Post.findByIdAndUpdate(post._id, { commentsCount: commentCount });
  }
  
  return await Comment.insertMany(comments);
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (except admin and test users)
    console.log('🧹 Clearing existing dummy data...');
    await User.deleteMany({ email: { $regex: /@(alumni|student)\.com$/ } });
    await Event.deleteMany({});
    await Jobs.deleteMany({});
    await Donation.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Existing dummy data cleared\n');
    
    // Generate alumni (20)
    console.log('👨‍🎓 Generating 20 alumni users...');
    const alumni = await generateAlumni(20);
    console.log(`✅ Created ${alumni.length} alumni users\n`);
    
    // Generate students (15)
    console.log('👩‍🎓 Generating 15 student users...');
    const students = await generateStudents(15);
    console.log(`✅ Created ${students.length} student users\n`);
    
    // Combine all users
    const allUsers = [...alumni, ...students];
    
    // Generate events (15)
    console.log('🎉 Generating 15 events...');
    const events = await generateEvents(alumni);
    console.log(`✅ Created ${events.length} events\n`);
    
    // Generate jobs (20)
    console.log('💼 Generating 20 job postings...');
    const jobs = await generateJobs(alumni);
    console.log(`✅ Created ${jobs.length} job postings\n`);
    
    // Generate donations (10)
    console.log('💰 Generating 10 donation campaigns...');
    const donations = await generateDonations();
    console.log(`✅ Created ${donations.length} donation campaigns\n`);
    
    // Generate posts (20)
    console.log('💬 Generating 20 community posts...');
    const posts = await generatePosts(allUsers);
    console.log(`✅ Created ${posts.length} community posts\n`);
    
    // Generate comments
    console.log('💭 Generating comments for posts...');
    const comments = await generateComments(posts, allUsers);
    console.log(`✅ Created ${comments.length} comments\n`);
    
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${allUsers.length} (${alumni.length} alumni + ${students.length} students)`);
    console.log(`   🎉 Events: ${events.length}`);
    console.log(`   💼 Jobs: ${jobs.length}`);
    console.log(`   💰 Donations: ${donations.length}`);
    console.log(`   💬 Posts: ${posts.length}`);
    console.log(`   💭 Comments: ${comments.length}`);
    console.log('\n✅ All dummy data has been seeded successfully!');
    console.log('\n📝 Note: All generated users have password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
