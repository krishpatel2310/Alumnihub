import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

async function testPassword() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/Alumni-Project`);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'student@test.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('Stored password hash:', user.password);

    // Test the password
    const isValid = await user.isPasswordCorrect('password123');
    console.log('\nPassword "password123" is valid:', isValid ? '✅ YES' : '❌ NO');

    // Try manually
    const manualCheck = await bcrypt.compare('password123', user.password);
    console.log('Manual bcrypt check:', manualCheck ? '✅ YES' : '❌ NO');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPassword();
