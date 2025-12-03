import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Normalize username
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    // Find or Create User
    let user = await User.findOne({ username: cleanUsername });

    if (!user) {
      // Create new user
      user = await User.create({
        username: cleanUsername,
        title: `@${cleanUsername}`,
        bio: 'Welcome to my InstaLink profile!',
        image: '', // Default or placeholder
        links: [],
        storeItems: [
           // Add some default store items for the demo
           { title: 'Minimalist Tee', price: '$35.00', image: '/store/tshirt.png', url: '#' },
           { title: 'Abstract Print', price: '$120.00', image: '/store/art.png', url: '#' },
           { title: 'Digital Asset Pack', price: '$49.00', image: '/store/pack.png', url: '#' }
        ]
      });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
