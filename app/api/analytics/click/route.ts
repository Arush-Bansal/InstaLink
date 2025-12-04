import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { username, itemId, type } = await req.json();

    if (!username || !itemId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'link') {
      const result = await User.updateOne(
        { username: username.toLowerCase(), "links._id": itemId },
        { $inc: { "links.$.clicks": 1 } }
      );
      console.log(`Analytics: Link update result for ${itemId}:`, result);
    } else if (type === 'store') {
      const result = await User.updateOne(
        { username: username.toLowerCase(), "storeItems._id": itemId },
        { $inc: { "storeItems.$.clicks": 1 } }
      );
      console.log(`Analytics: Store item update result for ${itemId}:`, result);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
