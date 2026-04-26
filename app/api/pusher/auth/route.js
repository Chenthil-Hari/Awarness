import { pusherServer } from '@/lib/pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await req.formData();
  const socketId = formData.get('socket_id');
  const channel = formData.get('channel_name');

  const presenceData = {
    user_id: session.user.email || session.user.id,
    user_info: {
      name: session.user.name,
      image: session.user.image,
      xp: session.user.xp || 0,
      league: session.user.league || 'Bronze',
      role: session.user.role || 'user'
    },
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData);

  return new Response(JSON.stringify(authResponse));
}
