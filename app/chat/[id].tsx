import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { io, Socket } from 'socket.io-client';
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import Constants from "expo-constants";
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const groupId = id; // The group the user is chatting in
  const { token } = useAuth();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // 1) Establish the socket connection
  useEffect(() => {
    console.log("TOKENNNNNNNNNNNNN", token)
    const newSocket = io(API_BASE_URL, {
      transports: ["websocket"],
      query: { token },
    });
  
    console.log("Attempting socket connection with token:", token);
  
    setSocket(newSocket);
  
    return () => {
      newSocket.disconnect();
    };
  }, [groupId, token]);

  // 2) On socket connect, join the group and set up event listeners
  useEffect(() => {
    console.log("Socket: ", socket)
    if (!socket) return;

    // When the socket is fully connected:
    socket.on('connect', () => {
      console.log('Connected to socket server, socket ID:', socket.id);

      // Emit joinGroup with the groupId so the server knows which room to join
      socket.emit('joinGroup', { groupId });

      // Optionally, you can request initial chat messages after joining
      // but often the server just sends them automatically in response to joinGroup
    });

    // Receive the initial messages from the server (if your server sends them after joinGroup)
    socket.on('initialMessages', (msgs) => {
      const giftedMessages = msgs.map(serverMsgToGiftedMsg);
      setMessages(giftedMessages);
    });

    // Listen for any new messages
    socket.on('newMessage', (msg) => {
      setMessages((prev) => GiftedChat.append(prev, [serverMsgToGiftedMsg(msg)]));
    });

    // Handle any error messages from the server
    socket.on('errorMessage', (error) => {
      console.warn('Socket error:', error);
    });

    socket.on("connect_error", (err) => {
        console.log("Connection error:", err.message);
      });
      

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off('connect');
      socket.off('initialMessages');
      socket.off('newMessage');
      socket.off('errorMessage');
    };
  }, [socket, groupId]);

  // 3) Sending a message
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
        console.log(newMessages)
      if (!socket || newMessages.length === 0) return;

      const msg = newMessages[0];
      
      // Emit the message to the server
      socket.emit('sendMessage', {
        groupId,
        text: msg.text,
      });
      

      // We do *not* immediately append the message, because we'll rely on the
      // server’s 'newMessage' broadcast (and DB insertion time, etc.) to confirm.
    },
    [socket, groupId]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: token || 'guest', name: 'Demo User' }}
    />
  );
}

// Utility function to convert a server-side message object
// into GiftedChat's IMessage shape.
function serverMsgToGiftedMsg(serverMsg: any): IMessage {
  // Adjust field names according to how your server sends data.
  // Example server fields: { id, group_id, user_id, message_text, created_at, user_name }
  return {
    _id: serverMsg.id ?? Math.random().toString(36),
    text: serverMsg.message_text || serverMsg.text || '',
    createdAt: new Date(serverMsg.created_at || Date.now()),
    user: {
      _id: serverMsg.user_id || 'unknown-user',
      name: serverMsg.user_name || 'Unknown',
    },
  };
}
