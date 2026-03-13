import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
console.log('Connected to MongoDB\n');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const users = await User.find({ role: 'alumni' }).limit(10);
console.log(`Found ${users.length} alumni users:\n`);

users.forEach((user, i) => {
  console.log(`${i + 1}. ${user.email}`);
});

await mongoose.disconnect();
