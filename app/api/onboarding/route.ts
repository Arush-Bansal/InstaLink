import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions, DEFAULT_USER_DATA } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  console.log("Onboarding API Session Debug:", JSON.stringify(session, null, 2));

  if (!session || !session.user?.email) {
    console.log("Onboarding API: Unauthorized - No session or email");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
        return NextResponse.json({ error: 'Username is reserved' }, { status: 400 });
    }

    await dbConnect();

    // Check if username is taken
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Update current user
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        username: cleanUsername,
        title: `@${cleanUsername}`, // Set default title to handle
        // Add default store items if they don't exist? 
        // The previous logic did this on creation. 
        // Since we created the user on login without these, we should add them now if empty.

      },
      { new: true }
    );
    
    // If storeItems were empty (because we created user with just email), we might want to populate them.
    // But $setOnInsert only works on insert.
    // Let's just check and update.
    if (user) {
        let changed = false;
        if (!user.trips || user.trips.length === 0) {
            user.trips = DEFAULT_USER_DATA.trips as any;
            changed = true;
        }
        if (!user.links || user.links.length === 0) {
            user.links = DEFAULT_USER_DATA.links;
            changed = true;
        }
        
        if (changed) {
            await user.save();
        }
    }

    return NextResponse.json({ success: true, username: cleanUsername });

  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
