import { pusherServer } from '@/lib/pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { channel, event, data } = await req.json();

  await pusherServer.trigger(channel, event, {
    ...data,
    sender: session.user.name,
    senderId: session.user.email || session.user.id
  });

  return new Response(JSON.stringify({ success: true }));
}
