import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { pusherServer } from '@/lib/pusher';

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
    await pusherServer.trigger(`private-user-${opponentId}`, 'incoming-duel', {
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
