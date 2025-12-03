import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await dbConnect();
    const { username } = await params;
    
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await dbConnect();
    const { username } = await params;
    const body = await request.json();

    // In a real app, we would verify the session/token here.
    // For MVP, we trust the client knows the username.

    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $set: body },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
