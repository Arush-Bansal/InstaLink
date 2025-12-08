import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { DEFAULT_USER_DATA } from "@/lib/auth";

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
        bio: 'Welcome to my GrifiLinks profile!',
        image: '', // Default or placeholder
        links: DEFAULT_USER_DATA.links,
        trips: DEFAULT_USER_DATA.trips
      } as any) as any;
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
