import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/initials/svg?seed=User' },
  isVerified: { type: Boolean, default: true },
  banStatus: { type: String, default: 'active' },
  reportCount: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin' }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function createAccounts() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
    console.log('Connected to MongoDB');

    // Create a test student user
    const studentPassword = await bcrypt.hash('password123', 10);
    const student = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: studentPassword,
      role: 'student',
      isVerified: true
    });
    console.log('✅ Student created - Email: student@test.com, Password: password123');

    // Create a test alumni user
    const alumniPassword = await bcrypt.hash('password123', 10);
    const alumni = await User.create({
      name: 'Test Alumni',
      email: 'alumni@test.com',
      password: alumniPassword,
      role: 'alumni',
      isVerified: true,
      graduationYear: 2020,
      course: 'Computer Science',
      currentPosition: 'Software Engineer',
      company: 'Tech Corp'
    });
    console.log('✅ Alumni created - Email: alumni@test.com, Password: password123');

    // Create an admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('✅ Admin created - Email: admin@test.com, Password: admin123');

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Student: student@test.com / password123');
    console.log('Alumni: alumni@test.com / password123');
    console.log('Admin: admin@test.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAccounts();
