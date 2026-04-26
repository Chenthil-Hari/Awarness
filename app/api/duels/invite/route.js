import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opponentId, roomCode } = await req.json();

    if (!opponentId || !roomCode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Send invitation to the opponent's private channel
    await pusher.trigger(`private-user-${opponentId}`, 'incoming-duel', {
      challengerName: session.user.name || session.user.username,
      challengerId: session.user.id,
      roomCode: roomCode,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Duel Invite Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
