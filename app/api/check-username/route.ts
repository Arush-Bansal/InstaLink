import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Normalize username
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    const reserved = ['admin', 'login', 'register', 'api', 'dashboard', 'settings', 'onboarding'];
    if (reserved.includes(cleanUsername)) {
        return NextResponse.json({ available: false, reason: 'Reserved' });
    }

    await dbConnect();

    // Check if username is taken
    const existingUser = await User.findOne({ username: cleanUsername });
    
    return NextResponse.json({ available: !existingUser });

  } catch (error) {
    console.error('Check Username Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
