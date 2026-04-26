import { useEffect, useRef, useState } from 'react';
import { getPusherClient } from '@/lib/pusher';

export function useMultiplayer(roomCode, isEnabled) {
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

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [roomCode, isEnabled]);

  const broadcast = async (event, data) => {
    if (!roomCode) return;
    try {
      await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `presence-room-${roomCode}`,
          event,
          data,
        }),
      });
    } catch (err) {
      console.error('Multiplayer broadcast failed:', err);
    }
  };

  const on = (event, callback) => {
    useEffect(() => {
      if (!channelRef.current) return;
      channelRef.current.bind(event, callback);
      return () => channelRef.current.unbind(event, callback);
    }, [event, callback]);
  };

  return { members, isConnected, broadcast, on };
}
