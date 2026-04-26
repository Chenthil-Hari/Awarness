import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/lib/pusher';

export function useMultiplayer(roomCode, isEnabled) {
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!isEnabled || !roomCode) return;

    const pusher = getPusherClient();
    pusherRef.current = pusher;

    const channelName = `presence-room-${roomCode}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', (members) => {
      setIsConnected(true);
      const memberList = [];
      members.each((member) => memberList.push(member.info));
      setMembers(memberList);
    });

    channel.bind('pusher:member_added', (member) => {
      setMembers((prev) => [...prev, member.info]);
    });

    channel.bind('pusher:member_removed', (member) => {
      setMembers((prev) => prev.filter((m) => m.name !== member.info.name));
    });

    channel.bind('kicked', (data) => {
      if (data.userId === (session?.user?.email || session?.user?.id)) {
        alert("You have been removed from the lobby by the host.");
        window.location.href = '/';
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [roomCode, isEnabled, session]);

  const broadcast = async (event, data) => {
    if (!roomCode) return;
    try {
      await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `presence-room-${roomCode}`,
          event,
          data: { ...data, senderId: session?.user?.id },
        }),
      });
    } catch (err) {
      console.error('Multiplayer broadcast failed:', err);
    }
  };

  const listenersRef = useRef([]);
  listenersRef.current = []; // Clear on each render so children can re-register

  const on = (event, callback) => {
    // Just add to listeners ref, no hook call here
    listenersRef.current.push({ event, callback });
  };

  useEffect(() => {
    if (!channelRef.current || !isConnected) return;
    
    const channel = channelRef.current;
    const currentListeners = [...listenersRef.current];

    currentListeners.forEach(({ event, callback }) => {
      channel.bind(event, callback);
    });

    return () => {
      currentListeners.forEach(({ event, callback }) => {
        channel.unbind(event, callback);
      });
    };
  }, [isConnected, roomCode]); // Re-bind when connection status or room changes

  const me = members.find(m => m.user_id === session?.user?.id);

  return { members, isConnected, broadcast, on, me };
}
