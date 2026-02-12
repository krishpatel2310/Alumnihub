import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
console.log('Connected to MongoDB');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const email = 'raj.sharma0@alumni.com';
const password = 'password123';

const user = await User.findOne({ email });
console.log('\nUser found:', user ? 'YES' : 'NO');

if (user) {
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Has password:', !!user.password);
  
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);
}

await mongoose.disconnect();
