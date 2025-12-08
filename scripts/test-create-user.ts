
import mongoose from 'mongoose';
import User from '../models/User';
import dbConnect from '../lib/mongodb';

async function main() {
  await dbConnect();
  console.log('Connected to DB');

  const email = `test-${Date.now()}@example.com`;
  console.log('Attempting to create user with email:', email);

  try {
    const newUser = await User.create({
      email,
      title: 'Test User',
      image: 'https://example.com/image.png'
    });
    console.log('User created:', newUser._id);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
