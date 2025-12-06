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

    // Sanitize body: exclude _id and only allow specific fields to be updated
    const { _id, ...rest } = body;
    const updateFields = {
      title: rest.title,
      bio: rest.bio,
      image: rest.image,
      links: rest.links,
      storeItems: rest.storeItems,
      socialLinks: rest.socialLinks,
      themeColor: rest.themeColor,
      outfits: rest.outfits
    };

    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $set: updateFields },
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
