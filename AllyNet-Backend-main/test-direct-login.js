import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
console.log('Connected to MongoDB\n');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const email = 'raj.mehta0@alumni.com';
const password = 'password123';

const user = await User.findOne({ email });

if (user) {
  console.log('✅ User found');
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Password hash:', user.password?.substring(0, 30) + '...');
  
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('\n🔑 Password comparison result:', isMatch);
  
  if (isMatch) {
    console.log('✅ Login should work!');
  } else {
    console.log('❌ Password does not match');
  }
} else {
  console.log('❌ User not found');
}

await mongoose.disconnect();
