import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/lib/pusher';

/**
 * A rebuilt, simplified Multiplayer Hook for 1v1 Duels.
 * Focuses on stability and reliable event dispatching.
 */
export function useMultiplayer(roomCode, isEnabled) {
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const handlersRef = useRef({});

  // 1. Core Connection and Presence
  useEffect(() => {
    if (!isEnabled || !roomCode) return;

    const pusher = getPusherClient();
    if (!pusher) return;
    pusherRef.current = pusher;

    const channelName = `presence-room-${roomCode}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', (members) => {
      setIsConnected(true);
      const list = [];
      members.each(m => list.push(m.info));
      setMembers(list);
    });

    channel.bind('pusher:member_added', (m) => {
      setMembers(prev => [...prev, m.info]);
    });

    channel.bind('pusher:member_removed', (m) => {
      setMembers(prev => prev.filter(item => item.user_id !== m.id));
    });

    channel.bind('kicked', (data) => {
      if (data.userId === (session?.user?.id)) {
        alert("You have been removed from the lobby by the host.");
        window.location.href = '/';
      }
    });

    // Cleanup
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      setIsConnected(false);
    };
  }, [roomCode, isEnabled]);

  // 2. High-Stability Event Dispatcher
  const on = (event, callback) => {
    // We use a Ref to store the latest callback to avoid re-binding to Pusher on every render
    if (!handlersRef.current[event]) {
      handlersRef.current[event] = new Set();
      
      // Bind to the channel ONLY once per event type
      if (channelRef.current) {
        channelRef.current.bind(event, (data) => {
          // When event hits, call ALL registered callbacks for this event
          handlersRef.current[event].forEach(cb => cb(data));
        });
      }
    }
    
    handlersRef.current[event].add(callback);
    return () => handlersRef.current[event].delete(callback);
  };

  // 3. Broadcast Function
  const broadcast = async (event, data) => {
    if (!roomCode || !isConnected) return;
    try {
      await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `presence-room-${roomCode}`,
          event,
          data
        }),
      });
    } catch (err) {
      console.error('Broadcast failure:', err);
    }
  };

  return { members, isConnected, broadcast, on };
}
