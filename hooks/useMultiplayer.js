import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/lib/pusher';

export function useMultiplayer(roomCode, isEnabled) {
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [forceRebind, setForceRebind] = useState(0);
  
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const listenersRef = useRef({});

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

  const on = (event, callback) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = new Set();
      // Trigger a re-bind if the channel is already active
      if (channelRef.current && isConnected) {
        setForceRebind(prev => prev + 1);
      }
    }
    listenersRef.current[event].add(callback);
    
    return () => {
      listenersRef.current[event].delete(callback);
    };
  };

  useEffect(() => {
    if (!channelRef.current || !isConnected) return;
    
    const channel = channelRef.current;
    const events = Object.keys(listenersRef.current);
    
    const dispatchers = {};
    events.forEach(event => {
      const dispatcher = (data) => {
        listenersRef.current[event].forEach(cb => cb(data));
      };
      channel.bind(event, dispatcher);
      dispatchers[event] = dispatcher;
    });

    return () => {
      events.forEach(event => {
        channel.unbind(event, dispatchers[event]);
      });
    };
  }, [isConnected, roomCode, forceRebind]);

  const me = members.find(m => m.user_id === session?.user?.id);

  return { members, isConnected, broadcast, on, me };
}
