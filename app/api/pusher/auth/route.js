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
      return new Response('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const socketId = formData.get('socket_id');
    const channel = formData.get('channel_name');

    // Only allow users to subscribe to their own private channel
    const expectedChannel = `private-user-${session.user.id}`;
    
    // We also allow presence channels for the duels themselves
    if (channel !== expectedChannel && !channel.startsWith('presence-')) {
      return new Response('Forbidden', { status: 403 });
    }

    const authResponse = pusher.authorizeChannel(socketId, channel, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        username: session.user.username,
      },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher Auth Error:', error);
    return new Response('Internal Error', { status: 500 });
  }
}
