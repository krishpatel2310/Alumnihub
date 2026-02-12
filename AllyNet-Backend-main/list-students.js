import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
console.log('Connected to MongoDB\n');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const students = await User.find({ role: 'student' });
console.log(`Found ${students.length} student users:\n`);

students.forEach((student, i) => {
  console.log(`${i + 1}. ${student.email}`);
});

await mongoose.disconnect();
